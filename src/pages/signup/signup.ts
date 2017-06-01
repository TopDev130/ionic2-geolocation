import {Component} from '@angular/core';
import {NavController, LoadingController, ToastController, ViewController} from 'ionic-angular';
import {UserService} from '../../providers/user-service';

@Component({
  templateUrl: 'signup.html'
})
export class SignupPage {
  signup: {username?: string, password?: string} = {};
  submitted = false;
  private loading;
  signupMessage = '';

  constructor(private nav: NavController, 
    private userService: UserService,
    private viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController) {
    }

  onSignup(form) {
    this.signupMessage = '';

    if (form.valid) {
      this.viewCtrl.dismiss(); 
    }
  }

  presentLoading() {
    if (this.loading == null) {
      this.loading = this.loadingCtrl.create({
        content: "Signing Up..."
      });
    }
    
    this.loading.present();
  } 

  presentToast(toastText, toastDuration) {
    let toast = this.toastCtrl.create({
        message: toastText,
        duration: toastDuration
    }); 
    
    toast.present();
  }      
}
