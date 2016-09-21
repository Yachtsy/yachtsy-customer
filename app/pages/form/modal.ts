
import {Component, ViewChild} from '@angular/core';
import {Content, App, Modal, Platform, NavController, NavParams, ViewController, AlertController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Requests} from '../requests/requests';
import GlobalService = require('../../components/globalService');
import { REACTIVE_FORM_DIRECTIVES, FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
    templateUrl: 'build/pages/form/modal.html'
})
export class ModalsContentPage {

    @ViewChild(Content) content: Content;

    req
    boatInfo

    public form: FormGroup

    firstName
    lastName
    password
    email

    constructor(
        public platform: Platform,
        public nav: NavController,
        public alertCtrl: AlertController,
        public params: NavParams,
        public viewCtrl: ViewController,
        public FBService: FirebaseService,
        private builder: FormBuilder
    ) {
        this.req = this.params.get('req')
        this.boatInfo = this.params.get('boat')

        this.firstName = ["", Validators.required];
        this.lastName = ["", Validators.required];
        this.password = ["", Validators.required];
        this.email = ["", Validators.compose([Validators.required])];

        this.form = this.builder.group({
            firstName: this.firstName,
            lastName: this.lastName,
            password: this.password,
            email: this.email
        })
    }

    ionViewWillEnter() {
        this.content.scrollToTop();
    }

    submitRequest() {

        //console.log("submit from modal")
        //console.log(this.req)

        //console.log('User Form info:')
        //console.log(this.form.value)

        // if (GlobalService.isOnline()) {

        // we need this - alex.
        if (this.FBService.isAuthenticated()) {

            var authData = this.FBService.getAuthData();
            this.createUser(authData)

        } else {

            this.FBService.createAccount(this.form.value.email, this.form.value.password)
                .then((authdata: any) => {
                    console.log(' auth done will now try to create user - auth data:')
                    //console.log(authdata)
                    this.createUser(authdata);
                }).catch((error: any) => {

                    this.alert('Error creating account', error.message);

                    console.log(' create account error', error);
                });
        }
        // }
        // else
        // GlobalService.displayOfflineAlert(this.alertCtrl);
    }


    alert(title, subtitle) {
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: subtitle,
            buttons: ['OK']
        });
        alert.present();
    }


    createUser(authData) {

        var user = {
            email: this.form.value.email,
            lastName: this.form.value.lastName,
            firstName: this.form.value.firstName,
            pushToken: GlobalService.pushToken
        };

        console.log('the auth data is as follows:');
        console.log(authData);



        this.FBService.createUser(authData.uid, user)
            .subscribe(() => {

                console.log('user created');

                //console.log('the user AUTH DATA is ');
                //console.log(authData);

                if (this.req) {
                    console.log('sumbitting request');

                    if (this.boatInfo)
                        this.FBService.addMyBoat(this.boatInfo);

                    this.FBService.submitRequest(this.req)
                        .subscribe((requestId) => {
                            console.log('after submit request')
                            console.log(requestId)
                        });

                    this.viewCtrl.dismiss({
                        cancel: false
                    });
                }
                else {
                    this.viewCtrl.dismiss({
                        cancel: false
                    });
                }
            }, () => {

                let alert = this.alertCtrl.create({
                    title: 'Error!',
                    subTitle: 'Erorr creating user account. Please contact support@yachtsy.com',
                    buttons: ['OK']
                });
                alert.present();
            })
    }

    dismiss() {
        this.viewCtrl.dismiss({
            cancel: true
        });
    }
}