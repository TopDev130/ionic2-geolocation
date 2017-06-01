/*
* @name: formviewer.ts
* @description: The Form Viewer typescript class which builds the relevant forms from JSON data
* @author: PSI Mobile Ltd
* @copyright: PSI Mobile Ltd
* @version: 1.0.0
*/

import {Component} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {FormsService} from '../../../../providers/forms-service';

@Component({
  templateUrl: 'form-details.html'
})
export class ModalsFormDetailsPage {
  public formName;
  public formAvatar;
  public locationDetails;
  public activationDetails;
  public expiryDetails;
  public formDescription;
  public formSectionsNo;
  public formScreensNo;
  public formFieldsNo;

  constructor(
      private viewCtrl: ViewController,
      private nav: NavController,
      public formsService: FormsService,
      private params: NavParams
  ) {
      this.formName = this.formsService.getActiveForm().name;
      this.formAvatar = this.convertAvatarType(this.formsService.getActiveForm().avatar);
      this.formDescription = this.formsService.getActiveForm().description;

      this.locationDetails = "";
      this.activationDetails = "";
      this.expiryDetails = "";

      if ((this.formsService.getActiveForm().location != null) && (this.formsService.getActiveForm().location.lat != null)) {
          this.locationDetails = this.formsService.getActiveForm().location.lat + ", " + this.formsService.getActiveForm().location.lng;
      }

      if (this.formsService.getActiveForm().lifecycle != null) {
          if (this.formsService.getActiveForm().lifecycle.activationdate != null) {
            this.activationDetails = this.formsService.getActiveForm().lifecycle.activationdate;
          }            

          if (this.formsService.getActiveForm().lifecycle.expirydate != null) {
            this.expiryDetails = this.formsService.getActiveForm().lifecycle.expirydate;
          }

          if (this.activationDetails == '') { this.activationDetails = "N/A"; }
          if (this.expiryDetails == '') { this.expiryDetails = "N/A"; }
      }      

      this.formSectionsNo = this.formsService.getActiveForm().sections.length;
      this.formScreensNo = 0;
      this.formFieldsNo = 0;

      for(var i = 0; i < this.formSectionsNo; i++) {   
        this.formScreensNo = this.formScreensNo + this.formsService.getActiveForm().sections[i].screens.length;  
        for(var j = 0; j < this.formsService.getActiveForm().sections[i].screens.length; j++) {
          this.formFieldsNo = this.formFieldsNo + this.formsService.getActiveForm().sections[i].screens[j].fields.length;
        }
      }
  }

  startFormTapped() {
      this.viewCtrl.dismiss(true);
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

  closeFormTapped() {
     this.viewCtrl.dismiss(false); 
  }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }
}