import {Component, NgZone} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
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
        public FBService: FirebaseService,
        private ngZone: NgZone) {

    }

    ngOnDestroy() {
        console.log('ngOnDestroy - request');
    }

    ngOnInit() {
        console.log('ngOnInit - request');
        this.items = GlobalService.myRequests;

        this.profile = {
            image: GlobalService.avatarImage,
        };
    }

    ionViewWillEnter() {
        var loading = this.navParams.get('loading');
        if (loading) {
            loading.dismiss();
        }
    }

    onPageWillEnter() {
        GlobalService.mainTabBarElement.style.display = GlobalService.mainTabBarDefaultDisplayInfo;
    }

    newRequestClick() {
        // this.nav.push(Home, { goToRequestsPageIfLoggedIn: false })
        GlobalService.mainTabRef.select(0);
    }

    requestClick(item) {
        console.log(item);
        //if (item.data.quotes && Object.keys(item.data.quotes).length > 0) {
        //console.log('the item is ');
        //console.log(item);
        this.nav.push(RequestResponses, { req: item });
        //}
    }

}