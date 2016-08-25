import {Component, NgZone} from '@angular/core';
import {NavController, LoadingController, NavParams} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {
    OnInit,
    OnDestroy
} from '@angular/core';
import {Form} from '../form/form';


@Component({
    templateUrl: 'build/pages/notifications/notifications.html',
})
export class Notifications {

    auth: any = {};

    constructor(public FBService: FirebaseService,
        public navController: NavController,
        public navParams: NavParams,
        private ngZone: NgZone,
        private loadingCtrl: LoadingController) {
    }

    ngOnDestroy() {
        console.log('ngOnDestroy - home');
    }

    ngOnInit() {
        console.log('ngOnInit');
    }
}
