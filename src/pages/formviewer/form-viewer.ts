/*
* @name: form-viewer.ts
* @description: The Form Viewer typescript class which builds the relevant forms from JSON data
* @author: PSI Mobile Ltd
* @copyright: PSI Mobile Ltd
* @version: 1.0.0
*/

import {Component, Directive, ElementRef, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {AlertController, NavController, ToastController, Platform, LoadingController} from 'ionic-angular';
import {Camera, BarcodeScanner, Network} from 'ionic-native';
import {SignaturePad} from 'angular2-signaturepad/signature-pad';
import {FormsService} from '../../providers/forms-service';
import {UserService} from '../../providers/user-service';
import {CommonDataService} from '../../providers/common-data-service';
import {ValidationService} from './validation-service';
import {LogicService} from './logic-service';

import {AuthHttp} from 'angular2-jwt';
import {Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

declare var google;

@Directive({
  selector: '[focusMe]'
})

export class FocusDirective {
  constructor(private el: ElementRef) {}
  ngAfterViewInit() {
    this.el.nativeElement.focus();
  }
}

@Component({
    template: `<ion-header (window:resize)="onResize($event)">
                    <ion-navbar>
                        <button ion-button menuToggle>
                        <ion-icon name="menu"></ion-icon>
                        </button>
                        <ion-title>{{formName}}</ion-title>

                        <ion-buttons *ngIf="formNavStyle == 'navbar-left'" start>
                            <button ion-button (click)="movePrevTapped()">
                                <ion-icon name='arrow-dropleft-circle' class='ion-nav-icon-size'></ion-icon>
                            </button>
                            <button ion-button (click)="moveNextTapped()">
                                <ion-icon name='arrow-dropright-circle' class='ion-nav-icon-size'></ion-icon>
                            </button>                        
                        </ion-buttons>
                        <ion-buttons *ngIf="formNavStyle == 'navbar-right'" end>
                            <button ion-button (click)="movePrevTapped()">
                                <ion-icon name='arrow-dropleft-circle' class='ion-nav-icon-size'></ion-icon>
                            </button>
                            <button ion-button (click)="moveNextTapped()">
                                <ion-icon name='arrow-dropright-circle' class='ion-nav-icon-size'></ion-icon>
                            </button> 
                        </ion-buttons>                                                       
                    </ion-navbar>                                    
                </ion-header>                                                               
                <ion-content>
                    <div class="progress-outer">
                        <div class="progress-inner" [style.width]="progressPercent + '%'">
                            {{progressPercent}}%
                        </div>
                    </div>
                    <h5 class="section-screen-header">{{activeForm.sections[activeSection].screens[activeScreen].name}}</h5>
                    <form #f="ngForm" (ngModelChange)="onResize($event)">  
                        <div *ngFor="let inp of activeForm.sections[activeSection].screens[activeScreen].fields" class="form-list">
                            <ion-item *ngIf="inp.supertype == 'input' && inp.subtype != 'date' && inp.subtype != 'time'" [hidden]="inp.hidden">
                                <ion-label *ngIf="inp.style == 'fixed'" fixed>{{inp.name}}</ion-label>
                                <ion-label *ngIf="inp.style == 'stacked'" stacked>{{inp.name}}</ion-label>
                                <ion-label *ngIf="inp.style == 'floating'" floating>{{inp.name}}</ion-label>
                                <ion-label *ngIf="inp.style != 'fixed' && inp.style != 'stacked' && inp.style != 'floating'" fixed>{{inp.name}}</ion-label>
                                <ion-input focusMe name={{inp.name}} type={{inp.subtype}} placeholder={{inp.placeholder}} [(ngModel)]=inp.value></ion-input>                           
                            </ion-item>
                            <ion-item *ngIf="inp.supertype == 'input' && inp.subtype == 'date'" [hidden]="inp.hidden">
                                <ion-label>{{inp.name}}</ion-label>
                                <ion-datetime name={{inp.name}} displayFormat={{inp.pickerformat}} pickerFormat={{inp.displayformat}} [(ngModel)]="inp.value"></ion-datetime>                        
                            </ion-item>
                            <ion-item *ngIf="inp.supertype == 'input' && inp.subtype == 'time'" [hidden]="inp.hidden">
                                <ion-label>{{inp.name}}</ion-label>
                                <ion-datetime name={{inp.name}} displayFormat="HH:mm" pickerFormat="HH:mm" [(ngModel)]="inp.value"></ion-datetime>                        
                            </ion-item>
                            <ion-item *ngIf="inp.supertype == 'text'" [hidden]="inp.hidden">
                                <ion-label *ngIf="inp.style == 'fixed'" fixed>{{inp.name}}</ion-label>
                                <ion-label *ngIf="inp.style == 'stacked'" stacked>{{inp.name}}</ion-label>
                                <ion-label *ngIf="inp.style == 'floating'" floating>{{inp.name}}</ion-label>
                                <ion-label *ngIf="inp.style != 'fixed' && inp.style != 'stacked' && inp.style != 'floating'" fixed>{{inp.name}}</ion-label>
                                <ion-textarea name={{inp.name}} [(ngModel)]=inp.value></ion-textarea>
                            </ion-item>                                             
                            <ion-item *ngIf="inp.supertype == 'select'" [hidden]="inp.hidden">
                                <ion-label>{{inp.name}}</ion-label>
                                <ion-select name={{inp.name}} [(ngModel)]="inp.value">
                                    <ion-option value={{opt.value}} *ngFor="let opt of inp.options">{{opt.name}}</ion-option>
                                </ion-select>
                            </ion-item>
                            <ion-list *ngIf="inp.supertype == 'checkbox'" [hidden]="inp.hidden">
                                <ion-list-header>
                                    {{inp.name}}
                                </ion-list-header>

                                <ion-item *ngFor="let opt of inp.options">
                                    <ion-label>{{opt.value}}</ion-label>
                                    <ion-toggle name={{opt.id}} [(ngModel)]="opt.checked" checked={{opt.checked}}></ion-toggle>                                    
                                </ion-item>
                            </ion-list>                                                      
                            <ion-card *ngIf="inp.supertype == 'information'" [hidden]="inp.hidden">
                                <ion-card-header>
                                    {{inp.header}}
                                </ion-card-header>

                                <ion-card-content>
                                    {{inp.text}}
                                </ion-card-content>
                            </ion-card>                            
                            <ion-list *ngIf="inp.supertype == 'radio'" name={{inp.name}} [(ngModel)]="inp.value" radio-group [hidden]="inp.hidden">
                                <ion-list-header>
                                    {{inp.name}}
                                </ion-list-header>

                                <ion-item *ngFor="let opt of inp.options">
                                    <ion-label>{{opt.value}}</ion-label>
                                    <ion-radio value={{opt.value}}></ion-radio>
                                </ion-item>
                            </ion-list>
                            <ion-card *ngIf="inp.supertype == 'image'" [hidden]="inp.hidden">
                                <ion-card-header>
                                    {{inp.name}}
                                </ion-card-header>                            
                            
                                <ion-card-content [hidden]="!onDevice">
                                    {{inp.description}} 
                                    
                                    <img src="{{inp.value}}"/>
                                    
                                    <ion-row responsive-sm [hidden]="inp.disabled">
                                        <ion-col>
                                            <button ion-button (click)="takePicture(inp)" type="submit" color="primary" block>
                                                <ion-icon name="camera"></ion-icon>
                                            </button>
                                        </ion-col>     
                                        <ion-col>
                                            <button ion-button (click)="getPicture(inp)" color="light" block>
                                                <ion-icon name="folder"></ion-icon>
                                            </button>
                                        </ion-col>
                                    </ion-row>
                                </ion-card-content>

                                <ion-card-content [hidden]="onDevice">
                                    {{inp.description}} 
                                    
                                    <img src="{{inp.value}}"/>
                                    
                                    <input type="file" accept="image/*;capture=camera">
                                </ion-card-content>                                
                            </ion-card>
                            <ion-card *ngIf="inp.supertype == 'map'" [hidden]="inp.hidden">
                                <ion-card-header>
                                    {{inp.name}}
                                </ion-card-header>                            

                                <ion-card-content>
                                    {{inp.description}}
                                    
                                    <div id="map{{inp.id}}" class="map-page-format"></div>

                                    <!--<ion-row responsive-sm>
                                        <ion-col>
                                            <button ion-button (click)="getCurrentLocation()" type="submit" color="primary" block>
                                                <ion-icon name="map"></ion-icon>
                                            </button>
                                        </ion-col>
                                    </ion-row>-->
                                </ion-card-content>                       
                            </ion-card>   
                            <ion-card *ngIf="inp.supertype == 'barcode'" [hidden]="inp.hidden">
                                <ion-card-header>
                                    {{inp.name}}
                                </ion-card-header>                            

                                <ion-card-content [hidden]="onDevice">
                                    <ion-item>
                                        <ion-label color="danger" stacked>No barcode scanner available</ion-label>
                                    </ion-item>
                                </ion-card-content>

                                <ion-card-content [hidden]="!onDevice">
                                    {{inp.description}}
                                    
                                    <ion-input focusMe name={{inp.name}} type="text" disabled="true" [(ngModel)]=inp.value placeholder="The result of the scan will appear here"></ion-input>  

                                    <ion-row responsive-sm [hidden]="inp.disabled">
                                        <ion-col>
                                            <button ion-button (click)="scanBarcode(inp)" type="submit" color="primary" block>
                                                <ion-icon name="barcode"></ion-icon>
                                            </button>
                                        </ion-col>
                                    </ion-row>
                                </ion-card-content>                       
                            </ion-card>                                                           
                            <ion-card *ngIf="inp.supertype == 'signature'" [hidden]="inp.hidden">
                                <ion-card-header>
                                    {{inp.name}}
                                </ion-card-header>   

                                <ion-card-content>
                                    <signature-pad [options]="signaturePadOptions" (onBeginEvent)="drawStart()" (onEndEvent)="drawComplete(inp)"></signature-pad>
                                </ion-card-content>
                            </ion-card>
                            <ion-card *ngIf="inp.supertype == 'onlinelookup'" [hidden]="inp.hidden">
                                <ion-card-header>
                                    {{inp.name}}

                                    <button ion-button fab-left (click)="doOnlineLookup(inp)">
                                        <ion-icon name='refresh' class='ion-nav-icon-size'></ion-icon>
                                    </button>                                    
                                </ion-card-header>

                                <ion-card-content>
                                    {{inp.description}} 
                                </ion-card-content>

                                <ion-list>
                                    <ion-item *ngFor="let filter of onlinefilters">
                                        <ion-label>{{filter.name}}</ion-label>
                                    </ion-item>                                    
                                </ion-list>                          
                            </ion-card>
                                                        
                            <ion-label *ngIf="inp.valid != null" [hidden]="inp.valid" color="danger" class="ion-label-required">{{inp.message}}</ion-label> 
                        </div>                     
                        <button ion-button *ngIf="formNavStyle == 'floating-bottom'" fab color="dark" fab-bottom fab-left style="z-index: 999;" (click)="movePrevTapped()">
                            <ion-icon name='arrow-back' is-active="false"></ion-icon>
                        </button>
                        <button ion-button *ngIf="formNavStyle == 'floating-bottom'" fab color="primary" fab-bottom fab-right style="z-index: 999;" (click)="moveNextTapped()">
                            <ion-icon name='arrow-forward' is-active="false"></ion-icon>
                        </button>                             
                        <button ion-button *ngIf="formNavStyle == 'floating-top'" fab color="dark" fab-top fab-left style="z-index: 999;" (click)="movePrevTapped()">
                            <ion-icon name='arrow-back' is-active="false"></ion-icon>
                        </button>
                        <button ion-button *ngIf="formNavStyle == 'floating-top'" fab color="primary" fab-top fab-right style="z-index: 999;" (click)="moveNextTapped()">
                            <ion-icon name='arrow-forward' is-active="false"></ion-icon>
                        </button>                        
                    </form>                  
               </ion-content>`
})

export class FormViewer {  
  public screenBreadcrumbs;
  public navForward;
  public formName;
  public activeForm; 
  public activeSection;
  public activeScreen;
  public activeSectionPrev;
  public activeScreenPrev;
  public formNavStyle;
  public formIsHandled;
  public useRearCamera;
  onDevice: boolean;
  public markers = [];
  public progressPercent = 0;
  public loading;
  public apiAddress = 'api.psi-fusion.com';
  public apiPort = '';  
  public devtest = false;  

  signature = '';
  isDrawing = false;

  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  signaturePadOptions: Object = { // Check out https://github.com/szimek/signature_pad
    'minWidth': 2,
    'canvasWidth': 400,
    'canvasHeight': 200,
    'backgroundColor': '#f6fbff',
    'penColor': '#666a73'
  };
  
  constructor(private platform: Platform,
    public formsService: FormsService,
    public userService: UserService,
    public commonDataService: CommonDataService,
    public logicService: LogicService,
    private fb: FormBuilder,
    private nav: NavController,
    private elementRef: ElementRef,
    private authHttp: AuthHttp,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController) {     
        this.onDevice = this.platform.is('ios') || this.platform.is('android');

        if (this.devtest == true) {
            this.apiAddress = '192.168.2.105';
            this.apiPort = ':20005';
        } else {
            this.apiAddress = 'api.psi-fusion.com';
            this.apiPort = '';
        }

        // If this is a form template, a deep copy of the object is created and will be added as a new document to database.
        // If this is a saved form, overwrite and replace exising in database.
        // If this is a completed form, do not allow changes (note we shouldn't enter here).
        if (this.formsService.getActiveFormType() == "form-template") {
            // angular.copy not supported in Angular 2 at time of writing - JSON stringify and parse works
            this.activeForm = JSON.parse(JSON.stringify(this.formsService.getActiveForm()));
        } else if ((this.formsService.getActiveFormType() == "form-saved") || (this.formsService.getActiveFormType() == "form-ready")) {
            this.activeForm = this.formsService.getActiveForm();
        } else if (this.formsService.getActiveFormType() == "form-completed") {
            this.presentToast("You cannot edit a completed form", 3000);
            this.nav.pop();
            return;
        }

        this.screenBreadcrumbs = [];
        this.navForward = true;
        this.formIsHandled = false;
        this.formName = this.activeForm.name;
        this.formNavStyle = this.formsService.getFormNavStyle();

        this.activeSection = 0;
        this.activeScreen = 0;
        this.activeSectionPrev = -999;
        this.activeScreenPrev = -999;
        
        this.useRearCamera = true; 
        
        this.moveScreen();
    }

    ionViewDidEnter() {
        if (this.signaturePad) {
            this.signaturePad.clear();
        }
    }

    drawComplete(forminput) {
        this.isDrawing = false;

        for(var i = 0; i < this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields.length; i++) { 
            if (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].id == forminput.id) {
                this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].value = this.signaturePad.toDataURL();
                return;
            }
        }        
    }
    
    onResize(event) {
        //TODO
    }

    drawStart() {
        this.isDrawing = true;
    } 
    
    clearPad() {
        if (this.signaturePad) {
            this.signaturePad.clear();
        }

        if (this.signature != "") {this.signaturePad.fromDataURL(this.signature);}
    }

    refreshProgress() {
        var totalScreenCount = 0;
        var currentScreenCount = 0;

        for(var i = 0; i < this.formsService.getActiveForm().sections.length; i++) {   
            totalScreenCount += this.formsService.getActiveForm().sections[i].screens.length;
        }

        for(var j = 0; j < this.formsService.getActiveForm().sections.length; j++) {   
            if (j == this.activeSection) {
                currentScreenCount += this.activeScreen + 1;
                break;
            } else {
                currentScreenCount += this.formsService.getActiveForm().sections[j].screens.length;
            }
        }

        var percnt = ((100 / (totalScreenCount)) * currentScreenCount);

        if (percnt > 100) {percnt = 100}
        if (percnt < 0) {percnt = 0}

        this.progressPercent = Math.round(percnt);
    }

    moveScreen() {
        if (this.activeSection < this.activeForm.sections.length)
        {
            if ((this.activeForm.sections.length > 0) && (this.activeForm.sections[this.activeSection].screens.length > 0))
            {
                if (this.navForward == true) {
                    if (this.activeForm.sections[this.activeSection].hidden == true) {
                        this.activeSection++;
                        this.activeScreen = 0;
                        this.moveScreen();
                    }
                }

                if (this.activeScreen < this.activeForm.sections[this.activeSection].screens.length)
                {      
                    if (this.navForward == true) {
                        if (this.activeForm.sections[this.activeSection].screens[this.activeScreen].hidden == true) {
                            this.activeScreen++;
                            this.moveScreen();
                        }

                        this.screenBreadcrumbs.push({
                            sectionindex: this.activeSection,
                            screenindex: this.activeScreen
                        } );

                        this.refreshProgress();
                    } else {
                        this.screenBreadcrumbs.splice(this.screenBreadcrumbs.length - 1, 1); 

                        this.refreshProgress();
                    }

                    // this defaults dates to todays date for DateTime picker
                    for(var i = 0; i < this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields.length; i++) { 
                        if ((this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].supertype == "input") &&
                            (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].subtype == "date")) { 
                            if ((this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].value == null) ||
                                (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].value == "")) {
                                this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].value = new Date().toISOString();
                            }
                        } else if (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].supertype == "image") {
                            //TODO
                        } else if (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].supertype == "signature") {
                            this.signature = "";

                            if ((this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].value != null) && 
                                (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].value != '')) {
                                this.signature = this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].value;
                            }

                            this.clearPad();              
                        } else if (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].supertype == "map") {
                            this.setupMap(this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i]);
                        } else if (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].supertype == "barcode") {
                            //TODO
                        }

                        if ((this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].logic != null) &&
                            (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].logic[0].condition != null)) {
                                switch (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].logic[0].action) {
                                    case "show" :
                                    case "hide" :
                                        this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i] = this.logicService.applyFormFieldLogic(
                                            this.activeForm,
                                            this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i],
                                            this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].logic[0].condition[0],
                                            this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].logic[0].action,
                                            this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[i].logic[0].destination);
                                        
                                        break;  
                                }
                        }
                    }
                }
                else
                {
                    if ((this.activeSection + 1) < this.activeForm.sections.length)
                    {
                        this.activeSection++;
                        this.activeScreen = 0;
                        this.moveScreen();
                    }
                    else
                    {
                        this.saveForm();
                    }                     
                }                
            }
            else
            {
                this.doAlert("No Section(s) Exist", "Form Error: No Sections exist");
            }            
        }
        else
        {
            this.saveForm();
        }                
    }

    movePrevTapped() {
        this.navForward = false;
        
        if (this.screenBreadcrumbs.length > 1) {
            this.activeSectionPrev = this.activeSection;
            this.activeScreenPrev = this.activeScreen;

            this.activeSection = this.screenBreadcrumbs[this.screenBreadcrumbs.length - 2].sectionindex;
            this.activeScreen = this.screenBreadcrumbs[this.screenBreadcrumbs.length - 2].screenindex;

            this.moveScreen();
        } else {
            this.presentToast("Reached start of form", 3000);
        }
    }           

    moveNextTapped() {   
        this.navForward = true;

        for(var k = 0; k < this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields.length; k++) { 
            if ((this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].supertype == "input") &&
                ((this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].hidden == null) || 
                (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].hidden == false))) {
                if (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].validate == true) {
                    var pattern = "";
                    var message = "";

                    if (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].pattern != null) {
                        pattern = this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].pattern;
                    }

                    if (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].message != null) {
                        message = this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].message;
                    }                    

                    var errorMessage = ValidationService.doValidationCheck(
                        this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].value,
                        this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].subtype,
                        pattern,
                        message);                 
                        
                    this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].message = errorMessage;
                        
                    if (errorMessage != '') {
                        this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].valid = false;
                        
                        return;
                    }
                    
                    this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].valid = true;
                }
            } else if ((this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].supertype == "image") &&
                ((this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].hidden == null) || 
                (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].hidden == false)))  {
                if (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].validate == true) {
                    var errorMessage = ValidationService.doValidationCheck(
                        this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].value,
                        this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].supertype,
                        "",
                        this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].message);                 
                        
                    this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].message = errorMessage;
                        
                    if (errorMessage != '') {
                        this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].valid = false;
                        
                        return;
                    }
                    
                    this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[k].valid = true;                    
                }
            }                 
        }

        this.activeSectionPrev = this.activeSection;
        this.activeScreenPrev = this.activeScreen;

        for(var m = 0; m < this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields.length; m++) {
            if ((this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[m].logic != null) &&
                (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[m].logic[0].condition != null)) {
                    switch (this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[m].logic[0].action) {                
                        case "goto-screen" :
                            if (this.logicService.applyFormSectionLogic(this.activeForm, 
                                this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[m].logic[0].condition[0]) == true) {
                                var screendetails = this.formsService.getScreenById(this.activeForm.sections[this.activeSection].screens[this.activeScreen].fields[m].logic[0].destination);
                                
                                if (screendetails.id != -999) {
                                    this.activeSection = screendetails.sectionindex;
                                    this.activeScreen = screendetails.screenindex;

                                    this.moveScreen();

                                    return;
                                }
                            }

                            break;        
                    }
            }               
        }
        
        this.activeScreen++;

        this.moveScreen();
    }    
    
    truncateString(truncString) {
        if (truncString.length > 20) {
            return truncString.substring(0, 17) + "...";
        }
        
        return truncString;
    }

    ionViewCanLeave() {
        return new Promise((resolve: Function, reject: Function) => {
            if (this.formIsHandled == false) {
                var setActiveForm = false;
                var originalTypeForm = '';
                var messageDisplay = '';

                if ((this.formsService.getActiveFormType() == "form-template") || (this.formsService.getActiveFormType() == "form-ready")){
                    originalTypeForm = this.formsService.getActiveFormType();
                    messageDisplay = 'Do wish to save this form?';
                } else if (this.formsService.getActiveFormType() == "form-saved") {
                    originalTypeForm = 'form-saved';
                    messageDisplay = 'Do wish to overwrite the existing saved form?';
                }

                if (originalTypeForm != '') {
                    if ((originalTypeForm == 'form-template') || (originalTypeForm == 'form-ready')) { // form template to first save
                        setActiveForm = true;
                    }

                    let confirm = this.alertCtrl.create({
                        title: 'Save Form?',
                        message: messageDisplay,
                        buttons: [      
                            {
                                text: 'Cancel',
                                handler: () => {
                                    reject();
                                }
                            },        
                            {
                                text: 'No',
                                handler: () => {
                                    resolve();
                                }
                            },
                            {
                                text: 'Yes',
                                handler: () => {
                                    if (setActiveForm == true) {
                                        this.formsService.setActiveForm(this.activeForm);
                                    }
                                    this.presentToast("Saving form...", 2000);
                                    this.formsService.syncForm(originalTypeForm, 'saved');
                                    this.processFormTasks();
                                    resolve();
                                }
                            }
                        ]
                    });
                    
                    confirm.present();
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        })
    }

    saveForm() {
        this.activeSection = this.screenBreadcrumbs[this.screenBreadcrumbs.length - 1].sectionindex;
        this.activeScreen = this.screenBreadcrumbs[this.screenBreadcrumbs.length - 1].screenindex;              
        
        if ((this.formsService.getActiveFormType() == "form-template") || (this.formsService.getActiveFormType() == "form-ready")) {
            this.processForm(this.formsService.getActiveFormType(), 'completed', 'Complete Form?', 'Do wish to save this completed form?', "Saving form...", true);
        } else if (this.formsService.getActiveFormType() == "form-saved") {  
            this.processForm('form-saved', 'completed', 'Complete Form?', 'Do wish to save this completed form?', "Saving form...", true);
        } else if (this.formsService.getActiveFormType() == "form-completed") {       
            this.presentToast("You cannot save a completed form", 3000);
            this.nav.pop();
            return;
        }
    }     
    
    processForm(originalTypeForm, typeForm, titleDisplay, messageDisplay, toastDisplay, popPage) {
        var setActiveForm = false;

        if (((originalTypeForm == 'form-template') || (originalTypeForm == 'form-ready')) && (typeForm == 'saved')) { // form template to first save
            setActiveForm = true;
        } else if (((originalTypeForm == 'form-template') || (originalTypeForm == 'form-ready')) && (typeForm == 'completed')) { // form template to completed
            setActiveForm = true;
        }

        let confirm = this.alertCtrl.create({
            title: titleDisplay,
            message: messageDisplay,
            buttons: [    
                {
                    text: 'Cancel',
                    handler: () => {
                    }
                },                          
                {
                    text: 'No',
                    handler: () => {
                        if (popPage == true) {
                            this.formIsHandled = true;
                            this.nav.pop();
                        }                        
                    }
                },
                {
                    text: 'Yes',
                    handler: () => {                       
                        if (popPage == true) {
                            this.formIsHandled = true;
                            this.nav.pop();
                        }

                        if (setActiveForm == true) {
                            this.formsService.setActiveForm(this.activeForm);
                        }
                        this.presentToast(toastDisplay, 2000);
                        this.formsService.syncForm(originalTypeForm, typeForm);
                        this.processFormTasks();
                    }
                }
            ]
        });
        
        confirm.present();          
    } 

    processFormTasks() {
        // Check for workflow process
        if ((this.activeForm.workflowid != null) && (this.activeForm.workflowid != '')) {
            if (this.isOnline() == true) {                  
                var result;

                let headers: Headers = new Headers
                headers.append('Content-type', 'application/json');
                headers.append('Authorization', 'Bearer ' + this.userService.getToken());     

                this.authHttp.get('https://' + this.apiAddress + this.apiPort + '/instance/user/' + this.userService.getUserId(), { headers: headers })
                .timeout(15000, new Error('Timeout encountered on processing form'))
                .map(res => res.json())
                .subscribe(
                    data => result = data,
                    err => {
                        this.presentToast("The following error occurred: " + err, 5000);
                    },
                    () => {
                        if (result.err) {
                            if ((result != null) && (result.err != null)) {
                                this.presentToast("The following error occurred: " + result.err.reason, 5000);
                            } else {
                                this.presentToast("An unknown error occurred", 5000);
                            }
                        } else {
                            //console.log("The form was submitted successfully");
                        }
                    }
                );            
            } else {
                this.presentToast("Could not send - are you sure you have a data connection?", 5000);
            }
        }
    }

    isOnline() {
        if(this.onDevice && Network.type){ 
            let networkState = Network.type;
        
            if (networkState != 'none') {
                return true;
            } else {
                return false;
            }
        } else {
            return navigator.onLine;      
        }
    }         

    setupMap(inp) {
        let options = {timeout: 10000, enableHighAccuracy: true};

        navigator.geolocation.getCurrentPosition(
            (position) => {
                var latLng; 

                if ((inp.value != null) && (inp.value != '')) {
                    var latlngString = inp.value.split(',');
                    latLng = new google.maps.LatLng(parseFloat(latlngString[0]), parseFloat(latlngString[1]));           
                } else {
                    // THIS IS TEMPORARY FOR TH DEMO - MOCK LOCATION LONDON
                    var lat = "51.52858";
                    var lng  = "-0.04779";           

                    latLng = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
                    //latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    // THIS IS TEMPORARY FOR TH DEMO - MOCK LOCATION LONDON
                }

                let mapOptions = {
                    center: latLng,
                    zoom: 17
                }

                let mapEle = document.getElementById('map' + inp.id);

                var map = new google.maps.Map(mapEle, mapOptions);

                if ((inp.value != null) && (inp.value != '')) {
                    this.clearOverlays(map);

                    var marker = new google.maps.Marker({
                        position: latLng, 
                        map: map
                    });   

                    this.markers.push({
                        map: map,
                        marker: marker
                    } );                    
                }

                var self = this;

                google.maps.event.addListener(map, 'click', function(event) {
                    if (inp.disabled == false) {
                        self.clearOverlays(map);

                        var marker = new google.maps.Marker({
                            position: event.latLng, 
                            map: map
                        });

                        self.markers.push({
                            map: map,
                            marker: marker
                        } );

                        inp.value = event.latLng.lat() + "," + event.latLng.lng();
                    }
                });

                google.maps.event.addListenerOnce(map, 'idle', () => {
                    mapEle.classList.add('show-map');
                });                  
            },  
            (error) => {
                this.presentToast("Map Rendering Error: " + error, 8000);
            }, options                
        );
    }

    clearOverlays(map) {
        for (var i = 0; i < this.markers.length; i++ ) {
            if (this.markers[i].map == map){
                this.markers[i].marker.setMap(null);
                this.markers.splice(i, 1); 
            }
        }       
    }

    scanBarcode(forminput) {
        BarcodeScanner.scan().then((barcodeData) => {
            if (forminput.subtype == barcodeData.format) {
                if ((forminput.expectedvalue != null) && (forminput.expectedvalue != '')) {
                    if (barcodeData.text == forminput.expectedvalue) {
                        forminput.value = barcodeData.text;
                    } else {
                        forminput.value = ''; 
                        this.presentToast("Scan Error: Barcode does not match expected value", 3000);
                    }
                } else {
                    forminput.value = barcodeData.text;
                }
            } else {
                this.presentToast("Scan Error: Barcode does not match expected type " + barcodeData.format, 3000);
            }
        }, (err) => {
            this.presentToast("Scan Error: " + err, 3000);
        });         
    }

    takePicture(forminput) {        
        var cameraDir = 0;
        
        if (this.useRearCamera == false)
        {
            cameraDir = 1;
        }
        
        if (forminput.encodingtype == "PNG") {
            Camera.getPicture({
                quality : forminput.quality,
                destinationType : Camera.DestinationType.DATA_URL,
                sourceType : Camera.PictureSourceType.CAMERA,
                allowEdit : forminput.allowedit,
                encodingType: Camera.EncodingType.PNG,
                targetWidth: forminput.targetwidth,
                targetHeight: forminput.targetheight,
                saveToPhotoAlbum: false,
                cameraDirection: cameraDir
            }).then(imageData => {
                forminput.value = "data:image/png;base64," + imageData;
            }, error => {
                alert("ERROR -> " + JSON.stringify(error));
            });
        } else {
            Camera.getPicture({
                quality : forminput.quality,
                destinationType : Camera.DestinationType.DATA_URL,
                sourceType : Camera.PictureSourceType.CAMERA,
                allowEdit : forminput.allowedit,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: forminput.targetwidth,
                targetHeight: forminput.targetheight,
                saveToPhotoAlbum: false,
                cameraDirection: cameraDir
            }).then(imageData => {
                forminput.value = "data:image/jpeg;base64," + imageData;
            }, error => {
                alert("ERROR -> " + JSON.stringify(error));
            });
        }            
    }  
    
    getPicture(forminput) {
        if (forminput.encodingtype == "PNG") {
            Camera.getPicture({
                quality : forminput.quality,
                destinationType : Camera.DestinationType.DATA_URL,
                sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit : forminput.allowedit,
                encodingType: Camera.EncodingType.PNG,
                targetWidth: forminput.targetwidth,
                targetHeight: forminput.targetheight,
                saveToPhotoAlbum: false
            }).then(imageData => {
                forminput.value = "data:image/png;base64," + imageData;
            }, error => {
                console.log("ERROR -> " + JSON.stringify(error));
            });
        } else {
            Camera.getPicture({
                quality : forminput.quality,
                destinationType : Camera.DestinationType.DATA_URL,
                sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit : forminput.allowedit,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: forminput.targetwidth,
                targetHeight: forminput.targetheight,
                saveToPhotoAlbum: false
            }).then(imageData => {
                forminput.value = "data:image/jpeg;base64," + imageData;
            }, error => {
                console.log("ERROR -> " + JSON.stringify(error));
            });            
        }
    }         
    
    doOnlineLookup(forminput, form) {
        if ((forminput.lookup != null) && (forminput.lookup[0].filters != null)) {
            //var returneddata = this.commonDataService.performLookup(forminput, this.activeForm);
        }
    }

    doAlert(titleText, subTitleText) {
        let alert = this.alertCtrl.create({
            title: titleText,
            subTitle: subTitleText,
            buttons: ['Ok']
        });
        alert.present();
    }
    
    presentToast(toastText, toastDuration) {
        let toast = this.toastCtrl.create({
            message: toastText,
            duration: toastDuration
        }); 
        
        toast.present();
    }  

    presentLoading() {
        if (this.loading == null) {
            this.loading = this.loadingCtrl.create({
                content: "Submitting..."
            });
        }
        
        this.loading.present();
    }        
}