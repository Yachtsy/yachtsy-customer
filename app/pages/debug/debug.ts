
import {Component} from '@angular/core';
import {App, Modal, Platform, NavController, NavParams, ViewController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Requests} from '../requests/requests';
import GlobalService = require('../../components/globalService');

import {
    FormBuilder,
    Validators,
    Control,
    ControlGroup,
    FORM_DIRECTIVES
} from '@angular/common';

@Component({
    templateUrl: 'build/pages/debug/debug.html',
    directives: [FORM_DIRECTIVES]
})
export class DebugPage {

    user
    userId
    freeCreditsMode
    freeCreditsSubscription

    constructor(
        public platform: Platform,
        public nav: NavController,
        public params: NavParams,
        public viewCtrl: ViewController,
        public FBService: FirebaseService,
        private builder: FormBuilder
    ) {



    }



    ionViewLoaded() {

        console.log('ion view loaded....')

        this.FBService.getUserProfile()
            .subscribe((usr) => {
                console.log(usr);
                this.user = usr;
            });



        this.userId = firebase.auth().currentUser.uid

        this.freeCreditsSubscription = this.FBService.getFreeCreditsMode()
            .subscribe((val) => {
                console.log('free credits mode', val);
                this.freeCreditsMode = val;
            })
    }

    ionViewWillUnload(){
        this.freeCreditsSubscription.unsubscribe();
    }

    ngOnInit() {

    }


}