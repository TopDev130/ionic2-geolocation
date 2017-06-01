import {Component, ViewChild} from '@angular/core';
import {Push, PushToken} from '@ionic/cloud-angular';
// import { CloudSettings, CloudModule } from '@ionic/cloud-angular';

import {Events, Platform, Nav, MenuController, AlertController} from 'ionic-angular';
import {StatusBar, Splashscreen} from 'ionic-native';

import {AccountPage} from '../pages/account/account';
import {TabsPage} from '../pages/tabs/tabs';
import {LoginPage} from '../pages/login/login';
import {SignupPage} from '../pages/signup/signup';
import {TutorialPage} from '../pages/tutorial/tutorial';
import {AboutPage} from '../pages/about/about';
import {DeveloperSettingsPage} from '../pages/developer/developer-settings';

import {TempFusionData} from '../providers/temp-fusion-data';
import {UserService} from '../providers/user-service';
import {FormsService} from '../providers/forms-service';

import {Storage} from '@ionic/storage';
import {Network} from 'ionic-native';
let storage = new Storage();

// const cloudSettings: CloudSettings = {
//   'core': {
//     'app_id': '16059fee',
//   },
//   'push': {
//     'sender_id': '973052483919',
//     'pluginConfig': {
//       'ios': {
//         'badge': true,
//         'sound': true
//       },
//       'android': {
//         'iconColor': '#343434'
//       }
//     }
//   }
// };

export interface PageObj {
  title: string;
  component: any;
  icon: string;
  index?: number;
}

@Component({
  templateUrl: 'app.component.html'
})
export class FusionApp {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu
  appPages: PageObj[] = [
    { title: 'Forms', component: TabsPage, icon: 'document' },
    { title: 'Schedule', component: TabsPage, index: 1, icon: 'calendar' },
    { title: 'Map', component: TabsPage, index: 2, icon: 'map' }
  ];
  loggedInPages: PageObj[] = [
    { title: 'Account', component: AccountPage, icon: 'person' },
    { title: 'About', component: AboutPage, icon: 'information-circle' },
    { title: 'Tutorial', component: TutorialPage, icon: 'school' },
    { title: 'PSI Admin', component: DeveloperSettingsPage, icon: 'code' },
    { title: 'Logout', component: TabsPage, icon: 'log-out' }
  ];
  loggedInDeveloperPages: PageObj[] = [
    { title: 'Account', component: AccountPage, icon: 'person' },
    { title: 'About', component: AboutPage, icon: 'information-circle' },
    { title: 'Tutorial', component: TutorialPage, icon: 'school' },
    { title: 'PSI Admin', component: DeveloperSettingsPage, icon: 'code' },
    { title: 'Logout', component: TabsPage, icon: 'log-out' }
  ];  
  loggedOutPages: PageObj[] = [
    { title: 'Login', component: LoginPage, icon: 'log-in' },
    { title: 'Signup', component: SignupPage, icon: 'person-add' }
  ];
  // rootPage: any = LoginPage;
  rootPage: any;
  onDevice: boolean = false;

  constructor(
    public events: Events,
    public userService: UserService,
    public menu: MenuController,
    platform: Platform,
    public tempFusionData: TempFusionData,
    public push: Push,
    private alertController: AlertController,
    public formsService: FormsService,
  ) {
    // Call any initial plugins when ready
    platform.ready().then(() => {
        StatusBar.styleDefault();
        Splashscreen.hide();
        this.onDevice = platform.is('ios') || platform.is('android');

        if (this.onDevice == true) {
          storage.get("pushflag").then((pushflag) => {
            if(pushflag == 'confirmed'){
              this.push.register().then((t: PushToken) => {
                return this.push.saveToken(t);
              }).then((t: PushToken) => {
                storage.set("devicetoken", t.token);
              })
              .catch(err => alert('Error: ' + err));

              this.push.rx.notification()
              .subscribe((msg) => {
                  let alert = this.alertController.create({
                    title: msg.title,
                    subTitle: msg.text,
                    buttons: ['Cancel',
                      {
                        text: 'Ok',
                        handler: () => {
                          this.gotomap(msg);
                        }
                      }
                    ]
                  });

                  alert.present();
              },
                err => {
                  alert('Error: ' + err);
              });
            }
          });
        }
    });

    // load the Fusion data
    tempFusionData.load();

    // decide which menu items should be hidden by current login status stored in local storage
    if (this.userService.getLoggedIn() == true) {
      this.enableMenu(true);
    } else {
      this.enableMenu(false);
    }

    this.listenToLoginEvents();
    
    this.rootPage = LoginPage;
  }

  gotomap(msg:any){
    try {
      storage.get("username").then((username) => {
        if(username != null){
          this.autologin(username);

          if(msg.payload.lat && msg.payload.lng){
            storage.set("lat", msg.payload.lat);
            storage.set("lng", msg.payload.lng);
          }
        } else {
          console.log("Could not autologin and navigate to map");
        }
      });
    }
    catch(err) {
        console.log(err);
    }
    
    setTimeout(() => {
      this.nav.setRoot(TabsPage, {tabIndex: 2});       
    }, 300);
    
  }

  autologin(username: string){
    var userpassword, userid, usertoken;
    storage.get("password").then((password) => {
      userpassword = password;

      storage.get("user_id").then((id) => {
        userid = id;
        storage.get("id_token").then((id_token) => {
          usertoken = id_token;
          this.userService.login(
            username,
            userpassword,
            userid,
            usertoken);

          if(this.isOnline() == true){
            this.formsService.getForms(true);
          }
          this.rootPage = TabsPage;
        });
        
      });
    });   
  }

  isOnline() {
    if(this.onDevice && Network.type){
 
      let networkState = Network.type;
 
      if ((networkState != 'none')) {
        return true;
      } else {
        return false;
      }
    } else {
      return navigator.onLine;      
    }
  }

  openPage(page: PageObj) {
    // the nav component was found using @ViewChild(Nav)
    // reset the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      this.nav.setRoot(page.component, {tabIndex: page.index});

    } else {
      this.nav.setRoot(page.component);
    }

    if (page.title === 'Logout') {
      // Give the menu time to close before changing to logged out

      storage.get("devicetoken").then((devicetoken) => {
        if(devicetoken !=null){
          let token = devicetoken;
          storage.clear();
          storage.set('devicetoken', token);
          setTimeout(() => {
            this.userService.logout();
            this.nav.setRoot(LoginPage);        
          }, 1000);
        }
      });
      // storage.remove('username').then(() => {
      
      // });

      // storage.remove('password').then(() => {
      
      // });

      // storage.remove('user_id').then(() => {
      
      // });
      // storage.remove('id_token').then(() => {
      
      // });
    }
  }

  listenToLoginEvents() {
    this.events.subscribe('user:login', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:signup', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:logout', () => {
      this.enableMenu(false);
    });
  }

  enableMenu(loggedIn) {
    this.menu.enable(loggedIn, 'loggedInDeveloperMenu');
    //this.userService.getUsernameDB().then((username) => {
    //  var userName = username;

      /*if (userName.toLowerCase() == "psiadmin")
      {
        this.menu.enable(loggedIn, 'loggedInDeveloperMenu');
      } else {
        this.menu.enable(loggedIn, 'loggedInMenu');
      }*/

      //this.menu.enable(true, 'loggedInDeveloperMenu');
    //});
    //this.menu.enable(loggedIn, 'loggedInMenu');
    //this.menu.enable(!loggedIn, 'loggedOutMenu');
    //this.menu.enable(true, 'loggedInDeveloperMenu');
  }
}

