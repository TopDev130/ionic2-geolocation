import {Component} from '@angular/core';
import {NavController, ActionSheet, ActionSheetController} from 'ionic-angular';
import {TempFusionData} from '../../providers/temp-fusion-data';
import {AssetDetailPage} from '../asset-detail/asset-detail';
import {SessionDetailPage} from '../session-detail/session-detail';

@Component({
  templateUrl: 'asset-list.html'
})
export class AssetListPage {
  actionSheet: ActionSheet;
  assets = [];

  constructor(private nav: NavController, 
    private actionSheetCtrl: ActionSheetController,
    tempFusionData: TempFusionData) {
    tempFusionData.getAssets().then(assets => {
      this.assets = assets;
    });
  }

  goToSessionDetail(session) {
    this.nav.push(SessionDetailPage, session);
  }

  goToAssetDetail(assetName: string) {
    this.nav.push(AssetDetailPage, assetName);
  }

  goToAssetTwitter(asset) {
    //window.open(`https://twitter.com/${asset.twitter}`);
  }

  openAssetShare(asset) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Actions for ' + asset.name,
      buttons: [
        {
          text: 'Copy Asset Name',
          handler: () => {
            console.log('Copy asset name' + asset.name);
            if (window['cordova'] && window['cordova'].plugins.clipboard) {
              window['cordova'].plugins.clipboard.copy(asset.name);
            }
          }
        },
        {
          text: 'Open Forms',
          handler: () => {
            console.log('Share via clicked');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    actionSheet.present();
  }
}
