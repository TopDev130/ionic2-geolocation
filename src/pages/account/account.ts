import {Component} from '@angular/core';
import {NavController, AlertController} from 'ionic-angular';
import {UserService} from '../../providers/user-service';
import {LoginPage} from '../login/login';
import {Storage} from '@ionic/storage';

let storage = new Storage();

@Component({
  templateUrl: 'account.html'
})
export class AccountPage {
  username: string;

  constructor(private nav: NavController, 
    private userService: UserService,
    private alertCtrl: AlertController) {

  }

  ngAfterViewInit() {
    this.getUsername();
  }

  updatePicture() {
    console.log('Clicked to update picture');
  }

  // Present an alert with the current username populated
  // clicking OK will update the username and display it
  // clicking Cancel will close the alert and do nothing
  changeUsername() {
    let alert = this.alertCtrl.create({
      title: 'Change Username',
      buttons: [
        'Cancel'
      ]
    });
    alert.addInput({
      name: 'username',
      value: this.username,
      placeholder: 'username'
    });
    alert.addButton({
      text: 'Ok',
      handler: data => {
        this.userService.setUsername(data.username);
        this.getUsername();
      }
    });

    alert.present();
  }

  getUsername() {
    this.username = this.userService.getUsername();
  }

  changePassword() {
    console.log('Clicked to change password');
  }

  logout() {

    storage.get("devicetoken").then((devicetoken) => {
        if(devicetoken !=null){
          let token = devicetoken;
          storage.clear();
          storage.set('devicetoken', token);
        }
        this.userService.logout();
        this.nav.setRoot(LoginPage);
      });
    
  }
}
