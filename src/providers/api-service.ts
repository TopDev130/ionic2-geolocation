import { Injectable } from '@angular/core';

import { UserService } from '../providers/user-service';

import { Headers } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
//import { tokenNotExpired } from 'angular2-jwt';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

let storage = new Storage();

@Injectable()
export class ApiService {
  public apiAddress = 'api.psi-fusion.com';
  public apiPort = '';      
  public headers;

  public _forms;

  // CONFIG SETTINGS 
  // These are to be imagined as settings that are set at Fusion Admin level and synced to the device but
  // for now they are hardcoded  
  public devtest = false;
  // CONFIG SETTINGS

  constructor(private authHttp: AuthHttp, private userService: UserService) {
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

  getForms() {
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
                    this.addToFormsObject(result.result.forms);

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
                                this.addToFormsObject(result.result.instances);

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
                                            this.addToFormsObject(result.result.instances);

                                            this.saveFormObjects();
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

  addToFormsObject(fobjects) {
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

  saveFormObjects() {     
    /*if (this._forms != null) {
        for(var i = 0; i < this._forms.length; i++) {
            if (this._forms[i].status != null) {
                if (this._forms[i].status.id == '1') {
                    if ((this._forms[i].type == 'form') || (this._forms[i].type == 'form-ready')) {
                        //this.formsTemplate.push(this._forms[i]);
                    } else if (this._forms[i].type == 'form-saved') {
                        //this.formsSaved.push(this._forms[i]);
                    } else if (this._forms[i].type == 'form-completed') {
                        //this.formsCompleted.push(this._forms[i]);
                    }
                }
            }
        }
    }*/
  }    
}
