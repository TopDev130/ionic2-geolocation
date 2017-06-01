/*
* @name: form-settings.ts
* @description: The Form Viewer typescript class which handles form settings, e.g. style etc
* @author: PSI Mobile Ltd
* @copyright: PSI Mobile Ltd
* @version: 1.0.0
*/

import {Component} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {FormsService} from '../../../../providers/forms-service';
//import {FormViewer} from '../../../formviewer/form-viewer';

@Component({
  templateUrl: 'form-settings.html'
})
export class ModalsFormSettingsPage {
  public formNavStyle;

  constructor(
      private viewCtrl: ViewController,
      private nav: NavController,
      public formsService: FormsService,
      private params: NavParams
  ) {
    switch (this.formsService.getFormNavStyle()) {
        case "navbar-left" :
            this.formNavStyle = "Toolbar - Left";
            break;
        case "navbar-right" :
            this.formNavStyle = "Toolbar - Right";
            break;             
        case "floating-top" :
            this.formNavStyle = "Floating - Top";
            break;
        case "floating-bottom" :
            this.formNavStyle = "Floating - Bottom";
            break;            
        default:
            this.formNavStyle = "Toolbar - Right";
            break;                  
    }
  }

  saveSettingsTapped() {          
    switch (this.formNavStyle) {
        case "Toolbar - Left" :
            this.formsService.setFormNavStyle("navbar-left");
            break;
        case "Toolbar - Right" :
            this.formsService.setFormNavStyle("navbar-right");
            break;             
        case "Floating - Top" :
            this.formsService.setFormNavStyle("floating-top");
            break;
        case "Floating - Bottom" :
            this.formsService.setFormNavStyle("floating-bottom");
            break;            
        default:
            this.formsService.setFormNavStyle("navbar-right");
            break;                  
    }
    
    this.dismiss(); 
  }

  closeSettingsTapped() {
     this.dismiss(); 
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}