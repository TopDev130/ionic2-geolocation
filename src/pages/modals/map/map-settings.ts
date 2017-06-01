import {Component} from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';
import {TempFusionData} from '../../../providers/temp-fusion-data';

@Component({
  templateUrl: 'map-settings.html'
})
export class MapSettingsPage {
  public accuracy;
  public mapStyle;
  public travelMode;
  public showMarkets;
  public showLitter;
  public doDirections;

  constructor(
    private tempFusionData: TempFusionData,
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    this.mapStyle = "ROADMAP";
    this.travelMode = "DRIVING";
    this.showMarkets = true;
    this.showLitter = true;
    this.doDirections = true;
    this.accuracy = "";

    let options = {timeout: 10000, enableHighAccuracy: true};

    navigator.geolocation.getCurrentPosition(
        (position) => {
            this.accuracy = position.coords.accuracy;
        },
  
        (error) => {
            alert(error);
        }, options
    );                  
  }

  applySettings() {
    /*var settings = '{"mapstyle": "' + this.mapStyle + 
      '", "travelmode": "' + this.travelMode + 
      '", "showmarkets": "' + this.showMarkets + 
      '", "showlitter": "' + this.showLitter +
      '", "dodirections": "' + this.doDirections +  
      '", "accuracy": "' + this.accuracy + '"}';*/
        
    this.dismiss();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
