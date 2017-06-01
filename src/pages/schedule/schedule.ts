import {Component, ViewChild} from '@angular/core';
import {App, ModalController, NavController, List, ToastController} from 'ionic-angular';
import {FormsService} from '../../providers/forms-service';
import {FormViewer} from '../../pages/formviewer/form-viewer';
import {ModalsFormDetailsPage} from '../modals/formviewer/formdetails/form-details';
// REMOVED DURING RC0 CONVERSION - PUT BACK LATER - import {OrderByPipe} from '../../pipes/order-by-pipe';

@Component({
  templateUrl: 'schedule.html'
})
export class SchedulePage {
  // the list is a child of the schedule page
  // @ViewChild('scheduleList') gets a reference to the list
  // with the variable #scheduleList, `read: List` tells it to return
  // the List and not a reference to the element
  @ViewChild('scheduleList', {read: List}) scheduleList: List;

  queryText = '';
  segment = 'all';
  lifecycleData = [];
  scheduleDate;
  numberSchedule = 0;

  constructor(
    private app: App,
    private nav: NavController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    public formsService: FormsService
  ) {
    this.scheduleDate = new Date().toISOString();
  }

  ionViewDidEnter() {
    this.app.setTitle('Schedule');
  }

  ngAfterViewInit() {
    this.updateSchedule();
  }

  updateSchedule() {
    if (this.segment == 'all') {
      this.lifecycleData = this.formsService.getScheduleForms(this.scheduleDate, this.queryText);
      this.numberSchedule = this.lifecycleData.length;
    } else {
      this.lifecycleData = [];
      this.numberSchedule = 0;
    }
  }

  itemTapped(event, form) {
    var cancontinue = true;
    var formtype = '';

    if (form.type == 'form') {
      formtype = 'form-template';
    } else {
      formtype = form.type;
    }

    if (formtype != "form-completed") {
      if (form.lifecycle != null)
      {
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
      this.formsService.setFormDetails(formtype, form);
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

  getTime(datestring) {
    var datetime = new Date(datestring);
    //return datetime.getTime();
    return ('0' + datetime.getHours()).slice(-2) + ":" + ('0' + datetime.getMinutes()).slice(-2) + ":" + ('0' + datetime.getSeconds()).slice(-2);
  }

  presentToast(toastText, toastDuration) {
    let toast = this.toastCtrl.create({
        message: toastText,
        duration: toastDuration
    }); 
    
    toast.present();
  }      
}
