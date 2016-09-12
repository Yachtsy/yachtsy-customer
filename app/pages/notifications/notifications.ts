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
        GlobalService.mainTabBarElement.style.display = GlobalService.mainTabBarDefaultDisplayInfo;
    }

    quoteClick(item, quote) {
        this.FBService.markRequestRead(item.id, quote.id)
            .then((data) => {
                console.log(data);
            });
        this.nav.push(Messages, { requestId: item.id, supplierId: quote.id });
    }
}
