
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
    templateUrl: 'build/pages/form/modal.html',
    directives: [FORM_DIRECTIVES]
})
export class ModalsContentPage {

    req

    form: ControlGroup

    name: Control
    email: Control

    constructor(
        public platform: Platform,
        public nav: NavController,
        public params: NavParams,
        public viewCtrl: ViewController,
        public FBService: FirebaseService,
        private builder: FormBuilder
    ) {
        this.req = this.params.get('req')

        this.name = new Control("", Validators.required)
        this.email = new Control("", Validators.required)

        this.form = builder.group({
            name: this.name,
            email: this.email
        })
    }

    setName(name) {
        console.log(name)
        this.name = name;
    }

    submitRequest() {

        //console.log("submit from modal")
        //console.log(this.req)

        //console.log('User Form info:')
        //console.log(this.form.value)


        if (this.FBService.isAuthenticated()) {

            var authData = this.FBService.getAuthData();
            this.createUser(authData)

        } else {

            this.FBService.loginAnon()
                .subscribe((authdata: any) => {
                    console.log(' auth done will now try to create user - auth data:')
                    //console.log(authdata)
                    this.createUser(authdata);
                });
        }
    }

    createUser(authData) {
        
        var user = {
            email:      this.form.value.email,
            name:       this.form.value.name,
            pushToken:  GlobalService.pushToken
        }

        console.log('the auth data is as follows:');
        console.log(authData);

        this.FBService.createUser(authData.uid, user)
            .subscribe(() => {

                console.log('user created');
                
                //console.log('the user AUTH DATA is ');
                //console.log(authData);

                if (this.req) {
                    console.log('sumbitting request');

                    this.FBService.submitRequest(this.req)
                        .subscribe((requestId) => {
                            console.log('after submit request')
                            console.log(requestId)
                            this.viewCtrl.dismiss({
                                cancel: false
                            });
                        })
                }
                else {
                    this.viewCtrl.dismiss({
                        cancel: false
                    });
                }
            })
    }


    dismiss() {
        this.viewCtrl.dismiss({
            cancel: true
        });
    }
}