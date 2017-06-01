import {Component} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {SchedulePage} from '../schedule/schedule';
import {MapPage} from '../map/google/nonnative/map';
import {FormViewerTabsPage} from '../formviewer/tabs/forms-viewer-tabs';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // set the root pages for each tab
  tab1Root: any = FormViewerTabsPage;
  tab2Root: any = SchedulePage;
  tab3Root: any = MapPage;
  mySelectedIndex: number;

  constructor(navParams: NavParams) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;
  }
}
