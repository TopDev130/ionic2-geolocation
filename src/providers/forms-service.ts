/*
* @name: forms-service.ts
* @description: The Forms data service module
* @author: PSI Mobile Ltd
* @copyright: PSI Mobile Ltd
* @version: 1.0.0
*/
import {Injectable} from '@angular/core';
import { AlertController } from 'ionic-angular';

import {UserService} from '../providers/user-service';

import {Headers} from '@angular/http';
import {AuthHttp} from 'angular2-jwt';
//import {tokenNotExpired} from 'angular2-jwt';
import {Storage} from '@ionic/storage';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

import {DalService} from '../providers/dal/dal-service';

let storage = new Storage();

@Injectable()
export class FormsService {
    public apiAddress = 'api.psi-fusion.com';
    public apiPort = '';      
    public headers;
    public _forms;
    public activeFormType;
    public activeForm;
    public formsTemplate = [];
    public formsSaved = [];
    public formsCompleted = [];
    public formsTemplateBackup = [];
    public formsSavedBackup = [];
    public formsCompletedBackup = [];         
    public formTemplatesNo;
    public formSavedNo;
    public formCompletedNo;
    public formNavStyle = "navbar-right";  
    public devtest = false;

    constructor(private authHttp: AuthHttp, 
        private userService: UserService,
        private dalService: DalService,
        private alertCtrl: AlertController) {
        this.headers = new Headers;
        this.headers.append('Content-type', 'application/json');
        this.headers.append('Authorization', 'Bearer ' + this.userService.getToken());

        if (this.devtest == true) {
            this.apiAddress = '192.168.2.105';
            this.apiPort = ':20005';
        } else {
            this.apiAddress = 'api.psi-fusion.com';
            this.apiPort = '';
        }              
    }

    // THIS IS BEING REWRITTEN 20/12/2016 THIS IS BEING REWRITTEN 20/12/2016 THIS IS BEING REWRITTEN 20/12/2016 THIS IS BEING REWRITTEN 20/12/2016
    getFormsTESTER2() {
        //this.dalService.setDatabaseName('data-test');
        //return this.dalService.saveForms(this.getFormObjects());        

        /*var dbTesterName = "data-test";

        this.db = new SQLite();

        return this.db.openDatabase({
            name: dbTesterName,
            location: 'default' // the location field is required
        }).then(() => {
            return "SUCCESSFUL!";
        }, (err) => {
            //this.doAlert("Unable to initialise database", err);
            return "ERROR!";
        });*/ 

        //return 'hello';

        /*return this.db.executeSql('SELECT * FROM ' + 'formstemplates', {}).then((resp) => {
            // REMOVE THIS
            // REMOVE THIS

            return 'hello';

            var forms = [];

            if (resp.rows.length > 0) {
                for (var i = 0; i < resp.rows.length; i++) {
                    let item = resp.rows.item(i);
                    //forms.push(JSON.parse(item['formjson']));
                    forms.push(item['formjson']);
                }
            }

            //return forms;

            //return 'hello';

            //this.addToFormObject(forms);
            //this._forms = forms;
            //this.doAlert("Form(s) Found!", JSON.stringify(this.formsService._forms[0]));  
            //this.setupFormsObjects(); 

            //return forms;
        }, (err) => {
            return 'error';
            //this.doAlert("Unable to execute select sql", err);
        });*/
    }

    /*getFormsTESTER() {
        var dbTesterName = "data-test";

        var db = new SQLite();

        db.openDatabase({
        name: dbTesterName,
        location: 'default' // the location field is required
        }).then(() => {
            db.executeSql('SELECT * FROM ' + 'formstemplates', {}).then((resp) => {

                var forms = [];

                if (resp.rows.length > 0) {
                    for (var i = 0; i < resp.rows.length; i++) {
                        let item = resp.rows.item(i);
                        //forms.push(JSON.parse(item['formjson']));
                        forms.push(item['formjson']);
                    }
                }

                this.addToFormObject(forms);
                //this._forms = forms;
                //this.doAlert("Form(s) Found!", JSON.stringify(this.formsService._forms[0]));  
                this.setupFormsObjects(); 

                //return forms;
            }, (err) => {
                //this.doAlert("Unable to execute select sql", err);
            });      
        }, (err) => {
            //this.doAlert("Unable to initialise database", err);
        });            
    }*/

    // THIS IS BEING REWRITTEN 20/12/2016 THIS IS BEING REWRITTEN 20/12/2016 THIS IS BEING REWRITTEN 20/12/2016 THIS IS BEING REWRITTEN 20/12/2016

    doAlert(titleAlert, subTitleAlert) {
        let alert = this.alertCtrl.create({
        title: titleAlert,
        subTitle: subTitleAlert,
        buttons: ['OK']
        });
        alert.present();
    }   

    getForms(isDevice) {
        storage.get('id_token').then(token => {
            // NOTE: The token isn't being used here, instead it is passed from user-service. This is bad - need to check why storage.set didn't work.
            // Also, much of this code may not be needed, but leaving for now. Clean this up and rewrite to make more secure at a later point.
            //console.log(tokenNotExpired(null, token)); // Returns true/false
            //console.log("token: ", token); // Returns true/false

            var result;
            this._forms = null;

            // NOTE: There must be a better way than nesting these - use promises? No time to figure out.
            // get the published forms by user
            this.authHttp.get('https://' + this.apiAddress + this.apiPort + '/form/user/' + this.userService.getUserId() + "/published", { headers: this.headers })
            .timeout(15000, new Error('Timeout encountered on forms get'))
            .map(res => res.json())
            .subscribe(
                data => result = data,
                err => {
                    console.log(err);
                },
                () => {
                    if (result.err) {
                        if ((result != null) && (result.err != null)) {
                            console.log(result.err.reason);
                        } else {
                            console.log('Unknown error');
                        }
                    } else {
                        //console.log(JSON.stringify(result.result.forms));

                        this.addToFormObject(result.result.forms);
                        //console.log("result.result.forms");
                        //console.log(this.userService.getUserId());

                        // TEST TEST TEST 
                        // TEST TEST TEST 
                        // TEST TEST TEST 
                        if (isDevice == true) {
                            //this.dalService.setDatabaseName('data-test');

                            //this.dalService.saveForms(this._forms).then((data) => {
                            //    this.doAlert("RESPONSE", data);
                            //});
                        }
                        // TEST TEST TEST 
                        // TEST TEST TEST 
                        // TEST TEST TEST 

                        // get the saved instances by user
                        this.authHttp.get('https://' + this.apiAddress + this.apiPort + '/instance/user/' + this.userService.getUserId() + "/saved", { headers: this.headers })
                        .timeout(15000, new Error('Timeout encountered on instances get'))
                        .map(res => res.json())
                        .subscribe(
                            data => result = data,
                            err => {
                                console.log(err);
                            },
                            () => {
                                if (result.err) {
                                    if ((result != null) && (result.err != null)) {
                                        console.log(result.err.reason);
                                    } else {
                                        console.log('Unknown error');
                                    }
                                } else {
                                    this.addToFormObject(result.result.instances);
                                    //console.log("result.result.instances");
                                    //console.log(result.result.instances);

                                    // get the ready instances by user
                                    this.authHttp.get('https://' + this.apiAddress + this.apiPort + '/instance/user/' + this.userService.getUserId() + "/ready", { headers: this.headers })
                                    .timeout(15000, new Error('Timeout encountered on ready instances get'))
                                    .map(res => res.json())
                                    .subscribe(
                                        data => result = data,
                                        err => {
                                            console.log(err);
                                        },
                                        () => {
                                            if (result.err) {
                                                if ((result != null) && (result.err != null)) {
                                                    console.log(result.err.reason);
                                                } else {
                                                    console.log('Unknown error');
                                                }
                                            } else {
                                                this.addToFormObject(result.result.instances);
                                                //console.log(result.result.instances);

                                                this.setupFormsObjects();
                                            }
                                        }
                                    );  
                                }
                            }
                        );                         
                    }
                }
            );            
        });
    }
    
    addToFormObject(fobjects) {
        if (this._forms == null) {
            this._forms = fobjects;
        } else {
            var postiontoinsert = 0;

            if (this._forms.length > 0) {
                postiontoinsert = this._forms.length - 1;
            }                            

            for(var i = 0; i < fobjects.length; i++) {
                this._forms.splice(postiontoinsert + i, 0, fobjects[i]);
            }
        }        
    }

    setupFormsObjects() {
        this.formTemplatesNo = 0;
        this.formSavedNo = 0;
        this.formCompletedNo = 0;
        this.formsTemplate = [];
        this.formsSaved = [];
        this.formsCompleted = [];
        this.formsTemplateBackup = [];
        this.formsSavedBackup = [];
        this.formsCompletedBackup = [];        
        
        if (this._forms != null) {
            for(var i = 0; i < this._forms.length; i++) {
                if (this._forms[i].status != null) {
                    if (this._forms[i].status.id == '1') {
                        if ((this._forms[i].type == 'form') || (this._forms[i].type == 'form-ready')) {
                            this.formsTemplate.push(this._forms[i]);
                            this.formTemplatesNo++;
                        } else if (this._forms[i].type == 'form-saved') {
                            this.formsSaved.push(this._forms[i]);
                            this.formSavedNo++;
                        } else if (this._forms[i].type == 'form-completed') {
                            this.formsCompleted.push(this._forms[i]);
                            this.formCompletedNo++;
                        }
                    }
                }
            }
        }
        
        this.formsTemplateBackup = this.formsTemplate;   
        this.formsSavedBackup = this.formsSaved;  
        this.formsCompletedBackup = this.formsCompleted;
    }  
    
    syncForm(originalTypeForm, typeForm) {       
        if (((originalTypeForm == 'form-template') && (typeForm == 'saved')) ||
            ((originalTypeForm == 'form-template') && (typeForm == 'completed'))) { 
            // Relevant to: 
            // 1). form template to first save - use post to create a new instance
            // 2). form template to completed - use post to create a new instance

            if (typeForm == 'saved') {
                this.activeForm.type = "form-saved";
                this.activeForm.status.description = "Saved";
            } else if (typeForm == 'completed') {
                var completetimestamp = new Date().toISOString();
                this.activeForm.name += " " + completetimestamp;                
                this.activeForm.type = "form-completed";
                this.activeForm.status.description = "Completed";
            }

            storage.get('id_token').then(token => {
                // NOTE: The token isn't being used here, instead it is passed from user-service. This is bad - need to check why storage.set didn't work.
                // Also, much of this code may not be needed, but leaving for now. Clean this up and rewrite to make more secure at a later point.
                var result; 

                this.authHttp.post('https://' + this.apiAddress + this.apiPort + '/instance', JSON.stringify(this.activeForm), { headers: this.headers })
                .timeout(15000, new Error('Timeout encountered on forms post'))
                .map(res => res.json())
                .subscribe(
                    data => result = data,
                    err => {
                        console.log(err);
                    },
                    () => {
                        if (result.err) {
                            if ((result != null) && (result.err != null)) {
                                console.log(result.err.reason);
                            } else {
                                console.log('Unknown error');
                            }
                        } else {
                            this.updateForms(originalTypeForm);

                            // call workflow
                            this.processWorkflow(result.result.instance);                      
                        }
                    }
                );       
            });
        } else if (((originalTypeForm == 'form-saved') && (typeForm == 'saved')) ||
            ((originalTypeForm == 'form-saved') && (typeForm == 'completed')) ||
            ((originalTypeForm == 'form-ready') && (typeForm == 'saved')) ||
            ((originalTypeForm == 'form-ready') && (typeForm == 'completed'))) { 
            // Relevant to: 
            // 1). form saved to another save - use put to update an instance
            // 2). form saved to completed - use put to update an instance
            
            if (typeForm == 'saved') {
                this.activeForm.type = "form-saved";
                this.activeForm.status.description = "Saved";
            } else if (typeForm == 'completed') {
                var completetimestamp = new Date().toISOString();
                this.activeForm.name += " " + completetimestamp;
                this.activeForm.type = "form-completed";
                this.activeForm.status.description = "Completed";
            }

            storage.get('id_token').then(token => {
                // NOTE: The token isn't being used here, instead it is passed from user-service. This is bad - need to check why storage.set didn't work.
                // Also, much of this code may not be needed, but leaving for now. Clean this up and rewrite to make more secure at a later point.
                var result; 

                this.authHttp.put('https://' + this.apiAddress + this.apiPort + '/instance', JSON.stringify(this.activeForm), { headers: this.headers })
                .timeout(15000, new Error('Timeout encountered on forms put'))
                .map(res => res.json())
                .subscribe(
                    data => result = data,
                    err => {
                        console.log(err);
                    },
                    () => {
                        if (result.err) {
                            if ((result != null) && (result.err != null)) {
                                console.log(result.err.reason);
                            } else {
                                console.log('Unknown error');
                            }
                        } else {
                            this.updateForms(originalTypeForm);

                            // call workflow
                            this.processWorkflow(result.result.instance);                          
                        }
                    }
                );       
            });            
        }
    }

    updateForms(originalTypeForm) {
        var index = this.findIndex(this._forms, this.activeForm._id);

        if (((originalTypeForm == 'form-template') && (this.activeForm.type == "form-saved")) ||
            ((originalTypeForm == 'form-template') && (this.activeForm.type == "form-completed"))) {
            this._forms.splice(index, 0, this.activeForm); // insert saved or completed form
        } else if (((originalTypeForm == 'form-saved') && (this.activeForm.type == "form-saved")) ||
            ((originalTypeForm == 'form-saved') && (this.activeForm.type == "form-completed"))) {
            this._forms[index] = this.activeForm; // update saved or completed form
        }

        this.setupFormsObjects();
    }

    processWorkflow(forminstance) {
        if (forminstance.workflow != null) {
            var result;

            var data = {
                workflow: forminstance.workflow,
                formInstance: forminstance._id
            }

            this.authHttp.post('https://' + this.apiAddress + this.apiPort + '/workflowinstance/filter', JSON.stringify(data), { headers: this.headers })
            .timeout(15000, new Error('Timeout encountered on workflowinstance filter post'))
            .map(res => res.json())
            .subscribe(
                data => result = data,
                err => {
                    console.log(err);
                },
                () => {
                    if (result.err) {
                        if ((result != null) && (result.err != null)) {
                            console.log(result.err.reason);
                        } else {
                            console.log('Unknown error');
                        }
                    } else {
                        var workflowinstances = result.result.workflowInstances;

                        if ((workflowinstances == null) || (workflowinstances == [])) {
                            this.doWorkflowCreateAndRun(forminstance);
                        } else {
                            // note an event being passed is optional
                            this.doWorkflowRun(forminstance, workflowinstances, "");
                        }
                    }
                }
            );            
        }
    }

    doWorkflowCreateAndRun(forminstance) {
        var event = 'start';

        if (forminstance.workflowevent != null) {
            event = forminstance.workflowevent;
        }

        var result;

        var data = {
            workflow: forminstance.workflow,
            formInstance: forminstance._id,
            event: event            
        }   

        this.authHttp.post('https://' + this.apiAddress + this.apiPort + '/workflowinstance/createandrun', JSON.stringify(data), { headers: this.headers })
        .timeout(15000, new Error('Timeout encountered on workflowinstance createandrun post'))
        .map(res => res.json())
        .subscribe(
            data => result = data,
            err => {
                console.log(err);
            },
            () => {
                if (result.err) {
                    if ((result != null) && (result.err != null)) {
                        console.log(result.err.reason);
                    } else {
                        console.log('Unknown error');
                    }
                } else {
                    //console.log("createandrun instance creation success");
                    //this.workflowInstance = result.result.workflowInstance;
                }
            }
        );           
    }

    doWorkflowRun(forminstance, workflowinstances, event) {
        var result;

        var eventURL = '';

        if (event != "") {
            eventURL = '/' + event;
        }

        var data = { 
            workflow: workflowinstances[0]._id,
            formInstance: forminstance._id,
            event: event                   
        }

        this.authHttp.post('https://' + this.apiAddress + this.apiPort + '/workflowinstance/run/' + workflowinstances[0]._id + eventURL, JSON.stringify(data), { headers: this.headers })
        .timeout(15000, new Error('Timeout encountered on workflowinstance run post'))
        .map(res => res.json())
        .subscribe(
            data => result = data,
            err => {
                console.log(err);
            },
            () => {
                if (result.err) {
                    if ((result != null) && (result.err != null)) {
                        console.log(result.err.reason);
                    } else {
                        console.log('Unknown error');
                    }
                } else {
                    //console.log("run instance creation success");
                    //this.workflowInstance = result.result.workflowInstance;
                }
            }
        );   
    }      

    // Binary search, the array is by default sorted by _id.
    private findIndex(array, id) {
        var low = 0, high = array.length, mid;
        while (low < high) {
            mid = (low + high) >>> 1;
            array[mid]._id < id ? low = mid + 1 : high = mid
        }
        return low;
    }    
    
    setFormDetails(formtype, form) {
        this.activeFormType = formtype;
        this.activeForm = form; 
        
        for(var i = 0; i < this.activeForm.sections.length; i++) {
            for(var j = 0; j < this.activeForm.sections[i].screens.length; j++) {
               for(var k = 0; k < this.activeForm.sections[i].screens[j].fields.length; k++) { 
                   if(!this.activeForm.sections[i].screens[j].fields[k].hasOwnProperty('value')) {
                        this.activeForm.sections[i].screens[j].fields[k].value = '';
                   }
               }
            }
        }
    } 
    
    getLocationForms() {
        var locationForms = [];

        if (this._forms != null) {
            for(var i = 0; i < this._forms.length; i++) {
                if (this._forms[i].location != null) {
                    var isactivated = true;
                    var hasexpired = false;

                    if (this._forms[i].lifecycle != null) {
                        if (this._forms[i].lifecycle.activationdate != null) {
                            isactivated = this.isActivated(this._forms[i].lifecycle.activationdate);
                        }    

                        if (this._forms[i].lifecycle.expirydate != null) {
                            hasexpired = this.hasExpired(this._forms[i].lifecycle.expirydate);
                        }                    
                    }

                    if ((hasexpired == false) && (isactivated == true )) {
                        if (this._forms[i].status != null) {
                            if (this._forms[i].status.id == '1') {
                                if ((this._forms[i].type == 'form') || (this._forms[i].type == 'form-ready')) {
                                    locationForms.push(this._forms[i]);
                                } else if (this._forms[i].type == 'form-saved') {
                                    locationForms.push(this._forms[i]);
                                } else if (this._forms[i].type == 'form-completed') {
                                    locationForms.push(this._forms[i]);
                                }
                            }
                        }
                    }
                }
            }
        }

        return locationForms;
    }

    getScheduleForms(scheduleDate, queryText) {
        var scheduleForms = [];

        if (this._forms != null) {
            for(var i = 0; i < this._forms.length; i++) {
                if ((this._forms[i].lifecycle != null) &&
                    (this._forms[i].name.toLowerCase().indexOf(queryText.toLowerCase()) > -1)){
                    var hasexpired = false;

                    if (this._forms[i].lifecycle.expirydate != null) {
                        hasexpired = this.hasExpired(this._forms[i].lifecycle.expirydate);
                    }

                    if ((this._forms[i].lifecycle.activationdate != null) && (hasexpired == false)) {
                        // we don't want to compare times
                        var sdate = new Date(scheduleDate);
                        sdate.setHours(0,0,0,0);
                        var formatdate = new Date(this._forms[i].lifecycle.activationdate);
                        formatdate.setHours(0,0,0,0);
                        
                        if (formatdate.getTime() == sdate.getTime()) {
                            if (this._forms[i].status != null) {
                                if (this._forms[i].status.id == '1') {
                                    if ((this._forms[i].type == 'form') || (this._forms[i].type == 'form-ready')) {
                                        scheduleForms.push(this._forms[i]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return scheduleForms;
    }    

    hasExpired(expiryDate) {
        var todaysdate = new Date();
        var formatexpdate = new Date(expiryDate);

        if (todaysdate.getTime() > formatexpdate.getTime()) {
            return true;
        } else {
            return false;
        }
    }

    isActivated(activationdate) {
        var todaysdate = new Date();
        var formatactdate = new Date(activationdate);

        if (todaysdate.getTime() >= formatactdate.getTime()) {
            return true;
        } else {
            return false;
        }        
    }

    getFormObjects() {
        return this._forms;
    }

    getFormById(formId){
        for(var i = 0; i < this._forms.length; i++) {
            if (this._forms[i]._id == formId) {
                return this._forms[i];
            }
        }

        return null;
    } 

    getScreenById(screenId) {
        for(var i = 0; i < this.activeForm.sections.length; i++) {
            for(var j = 0; j < this.activeForm.sections[i].screens.length; j++) {
                if (this.activeForm.sections[i].screens[j].id == screenId) {
                    return {
                        id: this.activeForm.sections[i].screens[j].id,
                        sectionindex: i,
                        screenindex: j
                    }                      
                }
            }
        }

        return {
            id: -999,
            sectionindex: -999,
            screenindex: -999
        }
    }

    getActiveForm(){
        return this.activeForm;
    }
    
    getActiveFormType(){
        return this.activeFormType;
    }
    
    setActiveForm(form){
        this.activeForm = form;
    }
    
    getFormsTemplate(){
        return this.formsTemplate;
    }  
    
    setFormsTemplate(frmsTemplate){
        this.formsTemplate = frmsTemplate;
    }      
    
    getFormsSaved(){
        return this.formsSaved;
    }  
    
    setFormsSaved(frmsSaved){
        this.formsSaved = frmsSaved;
    }     
    
    getFormsCompleted(){
        return this.formsCompleted;
    } 
    
    setFormsCompleted(frmsCompleted){
        this.formsCompleted = frmsCompleted;
    }      
    
    getFormsTemplateBackup(){
        return this.formsTemplateBackup;
    }      
    
    getFormsSavedBackup(){
        return this.formsSavedBackup;
    }  
    
    getFormsCompletedBackup(){
        return this.formsCompletedBackup;
    }     
    
    getFormTemplatesNo(){
        return this.formTemplatesNo;
    }
    
    getFormSavedNo(){
        return this.formSavedNo;
    }
    
    getFormCompletedNo(){
        return this.formCompletedNo;
    }  
    
    getFormNavStyle(){
        return this.formNavStyle;
    }
    
    setFormNavStyle(navStyle){
        this.formNavStyle = navStyle;
    }   
}