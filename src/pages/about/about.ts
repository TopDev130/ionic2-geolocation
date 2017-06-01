import {Component} from '@angular/core';
import {PopoverController} from 'ionic-angular';
import {PopoverPage} from '../about-popover/about-popover';

@Component({
  templateUrl: 'about.html'
})

export class AboutPage {
  fusionReleaseDate = '2016-12-01';

  constructor(private popoverCtrl: PopoverController) {
  }

  presentPopover(event) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({ ev: event });
  }
}
