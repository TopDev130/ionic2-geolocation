import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {SessionDetailPage} from '../session-detail/session-detail';


@Component({
  templateUrl: 'asset-detail.html'
})
export class AssetDetailPage {
  asset: any;

  constructor(private nav: NavController, private navParams: NavParams) {
    this.asset = this.navParams.data;
  }

  goToSessionDetail(session) {
    this.nav.push(SessionDetailPage, session);
  }
}
