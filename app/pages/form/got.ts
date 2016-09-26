import {Component} from '@angular/core';
import {NavController, ViewController} from 'ionic-angular';


@Component({
    templateUrl: 'build/pages/form/got.html'
})
export class GotContentPage {

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