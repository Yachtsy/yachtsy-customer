import {Component, NgZone} from '@angular/core';
import {NavController, LoadingController, NavParams} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Requests} from '../requests/requests'
import {
    OnInit,
    OnDestroy
} from '@angular/core';
import {Form} from '../form/form';


@Component({
    templateUrl: 'build/pages/profile/profile.html',
})
export class Profile {

    profile = {};
    activeUser

    constructor(public FBService: FirebaseService,
        public navController: NavController,
        public navParams: NavParams,
        private ngZone: NgZone,
        private loadingCtrl: LoadingController) {

    }

    ngOnDestroy() {
    }

    ionViewWillEnter() {
    }

    ngOnInit() {
        this.profile = {
            image:  "http://www.kodeinfo.com/admin/assets/img/avatars/default-avatar.jpg",
            name:   "Al Grata"
        };

        this.activeUser = firebase.auth().currentUser;
        // if (this.activeUser) {
        //     this.profile.name = this.activeUser.name;
        // }
    }

    itemTapped(idx) {
        if (idx === 2) {
            if (this.activeUser)
                firebase.auth().signOut();
        }
    }
}
