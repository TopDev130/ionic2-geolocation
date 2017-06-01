import {Component} from '@angular/core';
import {NavController, LoadingController, ToastController, Platform, AlertController} from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';
import {SignupPage} from '../signup/signup';
import {FormsService} from '../../providers/forms-service';
import {UserService} from '../../providers/user-service';
import {NgZone} from '@angular/core'; 
import {Network, SecureStorage} from 'ionic-native';
import {Http, Headers} from '@angular/http';
import {Storage} from '@ionic/storage';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

let storage = new Storage();

@Component({
  templateUrl: 'login.html'
})
export class LoginPage {
  login: {username?: string, password?: string} = {};
  submitted = false;
  onDevice: boolean;
  loginMessage = '';
  public apiAddress = 'api.psi-fusion.com';
  public apiPort = '';  
  // CONFIG SETTINGS 
  // These are to be imagined as settings that are set at Fusion Admin level and synced to the device but
  // for now they are hardcoded
  public devTest = false;
  public secureStorageRequired = true;
  // CONFIG SETTINGS  

  constructor(private zone: NgZone,
    private nav: NavController, 
    private http:Http,
    public formsService: FormsService,
    private userService: UserService,
    private platform: Platform,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController) {
      this.onDevice = this.platform.is('ios') || this.platform.is('android');

      if (this.devTest == true) {
          this.apiAddress = '192.168.2.105';
          this.apiPort = ':20005';
      } else {
          this.apiAddress = 'api.psi-fusion.com';
          this.apiPort = '';
      }

      // CONFIG SETTINGS 
      // These are to be imagined as settings that are set at Fusion Admin level and synced to the device but
      // for now they are hardcoded until that layer is built
      this.secureStorageRequired = false;
      // CONFIG SETTINGS
  }

  // TEMP
  ionViewDidEnter() {
    this.login.username = "";
    this.login.password = "";
  }
  // TEMP  

  loginUser(form) {
    this.loginMessage = '';

    if (form.valid) {
      if (this.isOnline() == true) {
        let loading = this.loadingCtrl.create({
          content: "Logging In..."
        });
        
        loading.present();
     
        var result;

        var headers:any = new Headers();
        headers.append('Content-Type', 'application/json');
        
        var user:any = {
            email: this.login.username,
            password: this.login.password
        };

        this.http.post('https://' + this.apiAddress + this.apiPort + '/user/login', JSON.stringify(user), {headers: headers})
          .timeout(15000, new Error('Timeout encountered on login'))
          .map(res => res.json())
          .subscribe(
            data => result = data,
            err => {
              loading.dismiss();
              console.log(err);
              this.loginMessage = err;
            },
            () => {
              if (result.err) {
                if ((result != null) && (result.err != null)) {
                  this.loginMessage = result.err.reason;
                } else {
                  this.loginMessage = 'Unknown error';
                }

                loading.dismiss();
              } else {
                this.confirmLogin(true, result);

                if ((this.secureStorageRequired == true) && (this.onDevice == true)) {
                  this.setSecureStorageCredentials();
                }

                loading.dismiss();
              }
            }
          );
      } else {
        // Do offline login
        if ((this.secureStorageRequired == true) && (this.onDevice == true)) {
          this.loginSecureStorageCredentials();
        } else {
          this.presentToast("Offline login is not permitted", 5000);
        }
      }
    }
  }

  loginSecureStorageCredentials() {
    let secureStorage: SecureStorage = new SecureStorage();

    secureStorage.create('fusion_store')
    .then(
      () => {
      secureStorage.get('fusionusername')
      .then(
        data => {     
          this.login.username = data;

          secureStorage.get('fusionpassword')
          .then(
            data => {
              this.login.password = data;

              this.confirmLogin(false, null);
            },
            error => {
              this.presentToast("An error occurred trying to retrieve the password from secure storage: " + error, 5000);
            }
          );
        },
        error => {
          // Suggestion: add https://github.com/selahssea/Cordova-open-native-settings later to open
          // security settings dialog to prompt for setting screen lock
          this.presentToast("There must be a minimum of one online login and sufficient security settings on the lock screen to use secure offline credential storage", 5000);
        }
      ); 
    },
    error => {
      // Suggestion: add https://github.com/selahssea/Cordova-open-native-settings later to open
      // security settings dialog to prompt for setting screen lock
      this.presentToast("There must be sufficient security settings on the lock screen to use secure offline credential storage", 5000);
    });               
  }

  setSecureStorageCredentials() {
    let secureStorage: SecureStorage = new SecureStorage();

    secureStorage.get('fusionusername')
    .then(
      data => {
        secureStorage.remove('fusionusername')
        .then(
          data => {
            secureStorage.set('fusionusername', this.login.username)
            .then(
              data => {
              },
              error => {
                this.presentToast("An error occurred trying to set the username in secure storage for offline authentication: " + error, 5000);
              }
            );
          },
          error => {
            this.presentToast("An error occurred trying to remove the username from secure storage for offline authentication: " + error, 5000);
          }
        );

        secureStorage.remove('fusionpassword')
        .then(
          data => {
            secureStorage.set('fusionpassword', this.login.password)
            .then(
              data => {
              },
              error => {
                this.presentToast("An error occurred trying to set the password in secure storage for offline authentication: " + error, 5000);
              }
            );  
          },
          error => {
            this.presentToast("An error occurred trying to remove the password from secure storage for offline authentication: " + error, 5000);
          }
        );          
      },
      error => {
        secureStorage.create('fusion_store')
        .then(
          () => {
            secureStorage.set('fusionusername', this.login.username)
            .then(
              data => {          
              },
              error => {
                this.presentToast("An error occurred trying to set the username in secure storage for offline authentication: " + error, 5000);
              }
            );

            secureStorage.set('fusionpassword', this.login.password)
            .then(
              data => {                           
              },
              error => {
                this.presentToast("An error occurred trying to set the password in secure storage for offline authentication: " + error, 5000);
              }
            );
          },
          error => {
            // Suggestion: add https://github.com/selahssea/Cordova-open-native-settings later to open
            // security settings dialog to prompt for setting screen lock
            this.presentToast("There must be sufficient security settings on the lock screen to use secure offline credential storage", 5000);
          }
        );        
      }
    );    
  }

  confirmLogin(online, result) {
    // NOTE: This code is not secure or good:
    // 1. The userService is being used incorrectly - this auth should probably be within
    // 2. We are storing the username, password, userid and token simply on user-service, no use of storage, encryption, etc
    var userid;
    var usertoken;

    if (online == true) {
      userid = result.result.user._id;
      usertoken = result.result.user.token;
    } else {
      userid = "OFFLINEUSERID";
      usertoken = "OFFLINETOKEN";
    }

    this.userService.login(
      this.login.username,
      this.login.password,
      userid,
      usertoken);

    storage.set("username", this.login.username);
    storage.set("password", this.login.password);
    storage.set("user_id", userid);

    storage.set("id_token", usertoken);

    if (this.onDevice == true) {
      this.formsService.getForms(true);
    } else if ((this.onDevice == false) && (online == true)) {
      this.formsService.getForms(false);
    }

    this.nav.push(TabsPage);    
  }  

  onSignup() {
    this.nav.push(SignupPage);
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
 
  isOffline(){
    if(this.onDevice && Network.type){
 
      let networkState = Network.type;

      if (networkState == 'none') {
        return true;
      } else {
        return false;
      }
    } else {
      return !navigator.onLine;     
    }
  }

  presentToast(toastText, toastDuration) {
    let toast = this.toastCtrl.create({
        message: toastText,
        duration: toastDuration
    }); 
    
    toast.present();
  }

  doAlert(titleAlert, subTitleAlert) {
    let alert = this.alertCtrl.create({
      title: titleAlert,
      subTitle: subTitleAlert,
      buttons: ['OK']
    });
    alert.present();
  }  
}
