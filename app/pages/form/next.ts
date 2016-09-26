import {Component} from '@angular/core';
import {NavController, ViewController} from 'ionic-angular';


@Component({
    templateUrl: 'build/pages/form/next.html'
})
export class NextContentPage {

    constructor(
        public nav: NavController,
        public viewCtrl: ViewController
    ) {
    }

    next() {
        this.viewCtrl.dismiss({
        });
    }
}