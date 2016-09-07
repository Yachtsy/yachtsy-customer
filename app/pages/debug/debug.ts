
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

    constructor(
        public platform: Platform,
        public nav: NavController,
        public params: NavParams,
        public viewCtrl: ViewController,
        public FBService: FirebaseService,
        private builder: FormBuilder
    ) {
       
        this.FBService.getUserProfile()
        .subscribe((usr)=>{
            console.log(usr);
            this.user = usr;
        });

    }

    dismiss() {
        this.viewCtrl.dismiss({
            cancel: true
        });
    }
}