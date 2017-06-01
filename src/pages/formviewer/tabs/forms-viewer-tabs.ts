/*
* @name: forms-viewer-tabs.ts
* @description: The Form Viewer main Tabs typescript class
* @author: PSI Mobile Ltd
* @copyright: PSI Mobile Ltd
* @version: 1.0.0
*/

import {App, Platform, ModalController, NavController, ToastController, AlertController} from 'ionic-angular';
import {Component, NgZone} from '@angular/core'; 
import {Push, PushToken} from '@ionic/cloud-angular';
import {FormsService} from '../../../providers/forms-service';
import {FormViewer} from '../../formviewer/form-viewer';
import {ModalsFormDetailsPage} from '../../modals/formviewer/formdetails/form-details';
import {ModalsFormSettingsPage} from '../../modals/formviewer/settings/form-settings';

import {Storage} from '@ionic/storage';
let storage = new Storage();

@Component({
  templateUrl: 'forms-viewer-tabs.html'
})

export class FormViewerTabsPage{  
  public formTemplatesNo;
  public formSavedNo;
  public formCompletedNo;
  public searchQuery;
  formtype = 'form-template';
  onDevice: boolean = false;
  
  constructor(private app: App,
    public push: Push,
    public formsService: FormsService,
    private platform: Platform,
    private zone: NgZone,
    private nav: NavController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private alertController: AlertController,) {
    this.searchQuery = '';
  }  
  
  ionViewDidLoad() {
    this.platform.ready().then(() => {
        this.onDevice = this.platform.is('ios') || this.platform.is('android');

        if (this.onDevice == true) {
            storage.get("pushflag").then((pushflag) => {
                if(pushflag == null) {
                    storage.set("pushflag", 'unknown');
                    pushflag = 'unknown';
                }

                if(pushflag == 'unknown'){
                    let alert = this.alertController.create({
                        title: "Push",
                        subTitle: "Do you want to receive push notifications?",
                        buttons: [
                            {
                                text: 'No',
                                handler: () => {
                                    this.onAllowPush('blocked');
                                }
                            },                        
                            {
                                text: 'Yes',
                                handler: () => {
                                    this.onAllowPush('confirmed');
                                }
                            }
                        ]
                    });

                    alert.present();
                }
            });
        }
    });
  }

  onAllowPush(pushflag:string){
    storage.set("pushflag", pushflag);

    if (pushflag == 'confirmed') {
        this.push.register().then((t: PushToken) => {
            return this.push.saveToken(t);
        }).then((t: PushToken) => {
            storage.set("devicetoken", t.token);
        })
        .catch(err => alert('Error: ' + err));        
    }
  }  

  ionViewDidEnter() {
    this.app.setTitle('Forms');
  }  
  
  updateForms() {
    if (this.formtype == "form-template") {
      return this.formsService.getFormsTemplate()
    } else if (this.formtype == "form-saved") {
      return this.formsService.getFormsSaved()
    } else if (this.formtype == "form-completed") {
      return this.formsService.getFormsCompleted()
    }

    return [];
  }

  itemTapped(event, form) {
    var cancontinue = true;

    if (this.formtype != "form-completed") {
        // check for a form that was added with no sections, screens or fields
        if ((form.sections != null) &&
            (form.sections.length > 0)) {
            for(var i = 0; i < form.sections.length ; i++) {
                if ((form.sections[i].screens != null) &&
                    (form.sections[i].screens.length > 0)) {  
                    for(var j = 0; j < form.sections[i].screens.length; j++) {
                        if ((form.sections[i].screens[j].fields == null) ||
                            (form.sections[i].screens[j].fields.length == 0)) {            
                            this.presentToast("You cannot edit a form where a screen has no fields", 3000);
                            cancontinue = false;
                            break;
                        }
                    }

                    if (cancontinue == false) {
                        break;
                    }
                } else {
                    this.presentToast("You cannot edit a form where a section has no screens", 3000);
                    cancontinue = false;
                    break;
                }
            }
        } else {
            this.presentToast("You cannot edit a form that has no sections", 3000);
            cancontinue = false;                 
        } 

        // check if form active
        if ((cancontinue == true) && (form.lifecycle != null)) {
            if ((form.lifecycle.activationdate != null) && (this.formsService.isActivated(form.lifecycle.activationdate) == false)) {
                this.presentToast("You cannot edit an inactive form", 2000);
                cancontinue = false;
            }

            if ((cancontinue == true) && (form.lifecycle.expirydate != null) && (this.formsService.hasExpired(form.lifecycle.expirydate) == true)) {
                this.presentToast("You cannot edit an expired form", 2000);
                cancontinue = false;
            }            
        }    
    } else {
        this.presentToast("You cannot edit a completed form", 2000);
        cancontinue = false;
    }

    if (cancontinue == true) {
        this.formsService.setFormDetails(this.formtype, form)
        let modal = this.modalCtrl.create(ModalsFormDetailsPage);
        modal.present();

        modal.onDidDismiss((data: any[]) => {
            if (data) {
                this.nav.push(FormViewer, {
                    form: this.formsService.getActiveForm()
                });
            }
        });  
    }
  } 

  getForms(searchbar) {
      // Reset items back to all of the items
      if (this.formtype == "form-template") {
        this.formsService.setFormsTemplate(this.formsService.getFormsTemplateBackup());
      } else if (this.formtype == "form-saved") {
        this.formsService.setFormsSaved(this.formsService.getFormsSavedBackup());
      } else if (this.formtype == "form-completed") {
        this.formsService.setFormsCompleted(this.formsService.getFormsCompletedBackup());
      }

      // set q to the value of the searchbar
      var q = searchbar.target.value;

      // if the value is an empty string don't filter the items
      if (q.trim() == '') {
          return;
      }
      
      if (this.formtype == "form-template") {
        this.formsService.setFormsTemplate(this.formsService.getFormsTemplate().filter((v) => {
            if (v.name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
                return true;
            }
            return false;
        }))
      } else if (this.formtype == "form-saved") {
        this.formsService.setFormsSaved(this.formsService.getFormsSaved().filter((v) => {
            if (v.name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
                return true;
            }
            return false;
        })) 
      } else if (this.formtype == "form-completed") {
        this.formsService.setFormsCompleted(this.formsService.getFormsCompleted().filter((v) => {
            if (v.name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
                return true;
            }
            return false;
        }))
      }           
  }

  isActivated(activationdate) {
    return this.formsService.isActivated(activationdate);
  }

  hasExpired(expirydate) {
    return this.formsService.hasExpired(expirydate);
  }  

  /* Note this method is temporary/needs refining */
  convertAvatarType(avatar) {      
      switch (avatar) {
          case "fa-file" :
              return "paper";
          case "fa-list" :
              return "list";                    
          case "fa-pie-chart" :
              return "pie";
          default:
              return "document"                   
      }        
  }

  settingsTapped(event) {
      let modal = this.modalCtrl.create(ModalsFormSettingsPage);
      modal.present();       
  }  

  refreshTapped(event) {
      //this.formsService.getForms();
      // TOFIX
  }  

  presentToast(toastText, toastDuration) {
    let toast = this.toastCtrl.create({
        message: toastText,
        duration: toastDuration
    }); 
    
    toast.present();
  }   
}