import {Component, NgZone} from '@angular/core';
import {NavController, LoadingController, NavParams} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {
    OnInit,
    OnDestroy
} from '@angular/core';
import {Form} from '../form/form';
import {Messages} from '../requests/messages'
import GlobalService = require('../../components/globalService');

@Component({
    templateUrl: 'build/pages/notifications/notifications.html',
})
export class Notifications {

    auth: any = {};
    items: any = {};

    constructor(public FBService: FirebaseService,
        public nav: NavController,
        public navController: NavController,
        public navParams: NavParams,
        private ngZone: NgZone,
        private loadingCtrl: LoadingController) {
    }

    ngOnDestroy() {
    }

    ngOnInit() {
        this.items = GlobalService.myRequests;
    }

    ionViewWillEnter() {
        GlobalService.mainTabBarElement.style.display = 'flex';
    }

    quoteClick(item, quote) {
        let loading = this.loadingCtrl.create({
            content: 'Waiting...'
        });

        loading.present();

        this.FBService.markRequestRead(item.id, quote.id)
            .then((data) => {
                console.log(data);
                loading.dismiss();
                this.nav.push(Messages, { req: item, supplierId: quote.id });
            });
    }
}
