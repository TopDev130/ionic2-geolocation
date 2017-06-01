import {Component} from '@angular/core';
import {NavController, MenuController} from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';

export interface Slide {
  title: string;
  description: string;
  image: string;
}

@Component({
  templateUrl: 'tutorial.html'
})
export class TutorialPage {
  slides: Slide[];
  showSkip = true;

  constructor(private nav: NavController, private menu: MenuController) {
    this.slides = [
      {
        title: 'Welcome to <b>Fusion</b>',
        description: 'The <b>PSI Fusion App</b> orem ipsum dolor sit amet, ne legere noster sea. Ea sed summo aliquid definitiones, velit euismod lucilius ut nam, ea inani saperet mel. Vidisse theophrastus ea mel.',
        image: 'assets/images/ica-slidebox-img-1.png',
      },
      {
        title: 'What is Fusion?',
        description: '<b>Fusion</b> eum nominati deterruisset ne, id theophrastus consectetuer signiferumque mea.',
        image: 'assets/images/ica-slidebox-img-2.png',
      },
      {
        title: 'How to use?',
        description: 'The <b>Fusion</b> quo id viderer persecuti, ad vis suscipiantur concludaturque. Usu te quaeque constituam consectetuer, pro ancillae nominavi dignissim at. In vim legere electram, nam sale liber cu. Pri ut veri dolor tibique, nec justo simul ea. Ubique cetero eos ad, usu te graecis ceteros torquatos.',
        image: 'assets/images/ica-slidebox-img-3.png',
      }
    ];
  }

  startApp() {
    this.nav.push(TabsPage);
  }

  onSlideChangeStart(slider) {
    this.showSkip = !slider.isEnd;
  }

  ionViewDidEnter() {
    // the root left menu should be disabled on the tutorial page
    //this.menu.enable(false);
  }

  ionViewWillLeave() {
    // enable the root left menu when leaving the tutorial page
    //this.menu.enable(true);
  }

}
