import {Component} from '@angular/core';
import {NavController, ViewController, AlertController, LoadingController, Platform, ToastController} from 'ionic-angular';
import {Network, AndroidFingerprintAuth, Diagnostic, BatteryStatus, LocalNotifications, BarcodeScanner, CardIO, Device} from 'ionic-native';

import {DalService} from '../../providers/dal/dal-service';

@Component({
  templateUrl: 'developer-settings.html',
})
export class DeveloperSettingsPage {
  username: string;
  randomformgen: number;
  private loading;
  onDevice: boolean;
  fusionConnStatus = '';
  batteryStatus;
  batterySubscription;
  cameraAvailable;
  locationAvailable;
  bluetoothAvailable;
  fusionUUID = 'UNKNOWN';
  fusionModel = 'UNKNOWN';
  fusionPlatform = 'UNKNOWN';
  fusionVersion = 'UNKNOWN';
  fusionManufacturer = 'UNKNOWN';
  fusionSerial = 'UNKNOWN';
  dbTesterType = 'SQLite';
  dbTesterName = "data-test";
  dbTesterTable = "table1";
  dbTesterFieldName = "field1";
  dbTesterFieldValue = "hello";

  constructor(private nav: NavController,
    private viewCtrl: ViewController, 
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private platform: Platform,
    private dalService: DalService) {
      LocalNotifications.on("click", (notification, state) => {
          let alert = this.alertCtrl.create({
              title: "Notification Clicked",
              subTitle: "You just clicked the test notification",
              buttons: ["OK"]
          });
          alert.present();
      });

      this.onDevice = this.platform.is('ios') || this.platform.is('android');

      platform.ready().then(() => {
        if(this.onDevice){
          var networkState = Network.type;
          this.fusionConnStatus = networkState.toUpperCase();
        }
        else {
          if (navigator.onLine == true) {
            this.fusionConnStatus = 'ONLINE';
          }
          else if (navigator.onLine == false) {
            this.fusionConnStatus = 'OFFLINE';
          }
        }  

        this.batteryStatus = "UNKNOWN";

        this.batterySubscription = BatteryStatus.onChange().subscribe(
          status => {
            var pluggedin = status.isPlugged ? ' (CHARGING)' : '';
            this.batteryStatus = status.level + "%" + pluggedin;
          }
        );

        Diagnostic.isCameraAvailable().then((res) => {
          this.cameraAvailable = res ? 'YES' : 'NO';
        }).catch((err) =>  {
          if (err = 'cordova_not_available') {
            this.cameraAvailable = 'UNKNOWN';
          } else {
            this.cameraAvailable = err;
          }
        });

        Diagnostic.isLocationAvailable().then((res) => {
          this.locationAvailable = res ? 'YES' : 'NO';
        }).catch((err) =>  {
          if (err = 'cordova_not_available') {
            this.locationAvailable = 'UNKNOWN';
          } else {
            this.locationAvailable = err;
          }
        });   

        Diagnostic.isBluetoothAvailable().then((res) => {
          this.bluetoothAvailable = res ? 'YES' : 'NO';
        }).catch((err) =>  {
          if (err = 'cordova_not_available') {
            this.bluetoothAvailable = 'UNKNOWN';
          } else {
            this.bluetoothAvailable = err;
          }
        });

        if (Device.uuid != null) this.fusionUUID = Device.uuid;
        if (Device.model != null) this.fusionModel = Device.model;
        if (Device.platform != null) this.fusionPlatform = Device.platform;
        if (Device.version != null) this.fusionVersion = Device.version;
        if (Device.manufacturer != null) this.fusionManufacturer = Device.manufacturer;
        if (Device.serial != null) this.fusionSerial = Device.serial;
      });          
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    //this.batterySubscription.unsubscribe(); 
  } 

  startFingerprintAuth() {
    this.validateFingerPrint();
  }

  validateFingerPrint() {
    if (this.platform.is('android')) {
      AndroidFingerprintAuth.isAvailable()
        .then((result)=> {
          if(result.isAvailable){
            // it is available

            AndroidFingerprintAuth.encrypt({ clientId: "Fusion", username: "TEMPORARY_TEST", password: "TEMPORARY_TEST" })
              .then(result => {
                if(result.withFingerprint) {
                  this.presentToast('Successfully authenticated with fingerprint', 3000);      
                } else if(result.withBackup) {
                  this.presentToast('Successfully authenticated with backup password', 3000);
                } else {
                  this.presentToast('Didn\'t authenticate', 3000);
                }
              })
              .catch(error => console.error(error));

          } else {
            // fingerprint auth isn't available
            this.presentToast('Fingerprint authentication isn\'t available', 3000);
          }
        })
        .catch(error => this.presentToast(error, 3000));
    } else {
      this.presentToast('Fingerprint authentication is only available on Android currently', 3000);
    }
  }

  startNotificationsTest() {
    // NOTE: The icon files are in platforms\android\res\drawable dir and mp3 in www dir
    LocalNotifications.schedule({
        title: "Fusion Notification",
        text: "This is a test notification. Click me",
        at: new Date(new Date().getTime() + 5 * 1000),
        sound: this.platform.is('android') ? 'file://sound-1.mp3': 'file://sound-1.mp3',
        icon: 'file://fusionicon.png',
        smallIcon: 'file://fusionicon.png',
    });    
  }

  startBarcodeTest() {
    BarcodeScanner.scan().then((barcodeData) => {
      let alert = this.alertCtrl.create({
          title: 'Scan Results',
          subTitle: "We got a barcode\n" +
                "Result: " + barcodeData.text + "\n" +
                "Format: " + barcodeData.format + "\n" +
                "Cancelled: " + barcodeData.cancelled,
          buttons: ["Close"]
      });

      alert.present();
    }, (err) => {
      let alert = this.alertCtrl.create({
          title: "Attention!",
          subTitle: err,
          buttons: ["Close"]
      });

      alert.present();
    });           
  }  

  startCardIOTest() {
    CardIO.canScan()
      .then(
        (res: boolean) => {
          if(res){
            let options = {
              requireExpiry: true,
              requireCCV: true,
              requirePostalCode: false,
              scanExpiry: true
            };

            var cardIOResponseFields = [
              "cardType",
              "redactedCardNumber",
              "cardNumber",
              "expiryMonth",
              "expiryYear",
              "cvv",
              "postalCode"
            ];     

            var outputmsg = "";       

            CardIO.scan(options).then((cardioData) => {
              for (var i = 0, len = cardIOResponseFields.length; i < len; i++) {
                var field = cardIOResponseFields[i];
                outputmsg += (field + ": " + cardioData[field]);
              }

              let alert = this.alertCtrl.create({
                  title: "Scan Results",
                  subTitle: outputmsg,
                  buttons: ["Close"]
              });

              alert.present();              
            }, (err) => {
              let alert = this.alertCtrl.create({
                  title: "Attention!",
                  subTitle: err,
                  buttons: ["Close"]
              });

              alert.present();
            });    

          }
        }
      );    
  }

  startDBInitializeTest(){
    this.dalService.initialiseDatabase(this.dbTesterName);
  }

  startDBCloseTest(){
    this.dalService.closeDatabase();
  }

  startDBDeletionTest(){
    this.dalService.deleteDatabase(this.dbTesterName);
  }

  startDBTableCreateTest(){
    var fields = [];

    var field = {
      "name" : this.dbTesterFieldName,
      "type" : "VARCHAR(32)"
    };

    fields.push(field);

    this.dalService.createCollection(this.dbTesterTable, fields);
  }  

  startDBTableDeleteTest(){
    this.dalService.deleteCollection(this.dbTesterTable);
  }

  startDBTableGetDataTest(){
    this.dalService.getData(this.dbTesterTable, this.dbTesterFieldName, this.dbTesterFieldValue);
  }

  startDBTableAddDataTest(){
    this.dalService.addData(this.dbTesterTable, this.dbTesterFieldValue);
  }

  startDBTableUpdateDataTest(){
    this.dalService.updateData(this.dbTesterTable, this.dbTesterFieldName, this.dbTesterFieldValue);
  }

  startDBTableDeleteDataTest(){
    this.dalService.deleteData(this.dbTesterTable, this.dbTesterFieldName, this.dbTesterFieldValue);
  }              

  saveDeveloperSettings(event) {
    this.dismiss(false);
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }  

  generateRandomString(strLength) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < strLength; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;  
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      content: "Please wait...",
      duration: 3000
    });
    
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
