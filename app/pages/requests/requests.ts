import {Component, NgZone} from '@angular/core';
import {NavController, AlertController, NavParams} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Home} from '../home/home';
import {RequestResponses} from './requestResponses'
import GlobalService = require('../../components/globalService');

@Component({
    templateUrl: 'build/pages/requests/requests.html',
})
export class Requests {

    items: any = {};
    profile;

    constructor(public nav: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public FBService: FirebaseService,
        private ngZone: NgZone) {

    }

    ngOnDestroy() {
        console.log('ngOnDestroy - request');
    }

    ngOnInit() {
        console.log('ngOnInit - request');

        this.profile = {
            image: GlobalService.avatarImage,
        };

    }

    ionViewWillEnter() {

        console.log('ionViewWillEnter - request');
        GlobalService.mainTabBarElement.style.display = GlobalService.mainTabBarDefaultDisplayInfo;

        this.ngZone.run(() => {
            this.items = GlobalService.myRequests;
            console.log('REQUESTS len:', this.items.length)
        });

        var loading = this.navParams.get('loading');
        if (loading) {
            loading.dismiss();
        }
    }

    //ionViewDidEnter() {
        //this.ngZone.run(() => {
       //     console.log('SHOWING TAB BAR',  GlobalService.mainTabBarDefaultDisplayInfo);
            // GlobalService.mainTabBarElement.style.display = GlobalService.mainTabBarDefaultDisplayInfo;
        //});
    //}

    newRequestClick() {
        // this.nav.push(Home, { goToRequestsPageIfLoggedIn: false })
        GlobalService.mainTabRef.select(0);
    }

    requestClick(item) {
        console.log(item);

        // if (!GlobalService.isOnline()) {
        //     GlobalService.displayOfflineAlert(this.alertCtrl);
        //     return;
        // }
        //if (item.data.quotes && Object.keys(item.data.quotes).length > 0) {
        //console.log('the item is ');
        //console.log(item);
        this.nav.push(RequestResponses, { req: item });
        //}
    }

}