import {Component, NgZone} from '@angular/core';
import {NavController, LoadingController, NavParams} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Requests} from '../requests/requests'
import {
    OnInit,
    OnDestroy
} from '@angular/core';
import {Form} from '../form/form';
import GlobalService = require('../../components/globalService');
import {DebugPage} from '../debug/debug';

@Component({
    templateUrl: 'build/pages/profile/profile.html',
})
export class Profile {

    profile: any = {};
    activeUser

    constructor(public FBService: FirebaseService,
        public navController: NavController,
        public navParams: NavParams,
        private ngZone: NgZone,
        private loadingCtrl: LoadingController) {

    }

    ngOnDestroy() {
    }

    onPageWillEnter() {
        GlobalService.mainTabBarElement.style.display = GlobalService.mainTabBarDefaultDisplayInfo;
        if (typeof firebase !== 'undefined') {
            this.getProfile();
        }
    }

    ngOnInit() {
        this.profile = {
            name:       '',
            image:      GlobalService.avatarImage
        };
    }

    getProfile() {
        if (!this.FBService.isAuthenticated()) {
            this.profile = {
                name:       '',
                image:      GlobalService.avatarImage
            };
            return;
        }

        this.FBService.getUserProfile()
        .subscribe((data)=>{
            console.log('Profile: ' + data);
            this.ngZone.run(() => {
                this.profile = data;
                this.profile.image = GlobalService.avatarImage;
            });
        });
    }

    itemTapped(idx) {
        if (idx === 2) {
            if (typeof firebase !== 'undefined') {
                this.FBService.logout().then((data: any) => {
                    GlobalService.mainTabRef.select(0);
                });
            }
        }

        if (idx === 3) {
            this.navController.push(DebugPage);
        }

    }
}
