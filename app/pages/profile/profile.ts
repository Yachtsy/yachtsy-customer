import {Component, NgZone} from '@angular/core';
import {ModalController, NavController, LoadingController, AlertController, NavParams, ActionSheetController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Requests} from '../requests/requests'
import {Camera} from 'ionic-native';
import {
    OnInit,
    OnDestroy
} from '@angular/core';
import {Boats} from '../boats/boats';
import GlobalService = require('../../components/globalService');
import {DebugPage} from '../debug/debug';

@Component({
    templateUrl: 'build/pages/profile/profile.html',
})
export class Profile {

    profile: any = {};
    profileUpdated
    activeUser

    constructor(public FBService: FirebaseService,
        public navController: NavController,
        public alertCtrl: AlertController,
        private modalCtrl: ModalController,
        public navParams: NavParams,
        private ngZone: NgZone,
        public actionSheetCtrl: ActionSheetController,
        private loadingCtrl: LoadingController) {

    }

    ngOnDestroy() {
    }

    onPageWillEnter() {
        GlobalService.mainTabBarElement.style.display = GlobalService.mainTabBarDefaultDisplayInfo;
        this.profileUpdated = false;
        this.profile = GlobalService.userProfile;
        if (this.FBService.isAuthenticated() && !this.profile) {
            this.getProfileCount = 0;
            this.getProfile();
        }
    }

    getProfileCount
    getProfile() {
        setTimeout(() => {
            this.profile = GlobalService.userProfile;
            if (!this.profile) {
                this.getProfileCount++;
                if (this.getProfileCount > 10)
                    return;
                else
                    this.getProfile();
            }
        }, 1000);
    }

    ngOnInit() {
    }

    itemTapped(idx) {
        if (idx === 2) {
            this.FBService.logout().then((data: any) => {
                GlobalService.clearData();
                GlobalService.mainTabBarElement.style.display = 'none';
                GlobalService.mainTabRef.select(0);
            });
        }
        else if (idx === 3) {
            this.navController.push(DebugPage);
        }
        else if (idx === 4) {
            let boatsModal = this.modalCtrl.create(Boats);
            boatsModal.present();
        }
    }
    
    updateClick() {
        if (this.profileUpdated) {
            this.FBService.updateProfileImage(this.profile.photo);
            this.profileUpdated = false;
        }
    }

    takePicture() {
        if (typeof Camera === 'undefined') {
            console.log('Camera plugin is not available.');
            return;
        }

        let actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Take a Photo',
                    role: 'destructive',
                    handler: () => {
                      this.getPicture(Camera.PictureSourceType.CAMERA);
                    }
                }, {
                    text: 'Choose from Library',
                    role: 'cancel',
                    handler: () => {
                      this.getPicture(Camera.PictureSourceType.PHOTOLIBRARY);
                    }
                }
            ]
        });
        actionSheet.present();
    }

    getPicture(sourceType) {
        Camera.getPicture({
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            encodingType: Camera.EncodingType.JPEG,
            sourceType: sourceType,
            targetWidth: 256,
            targetHeight: 256,
            correctOrientation: true
        }).then((imageData) => {
            // imageData is a base64 encoded string
            console.log('image taken');
            var base64Image = "data:image/jpeg;base64," + imageData;
            base64Image = base64Image.replace(/\r?\n|\r/g, '');
            this.profile.photo = base64Image;
            GlobalService.userProfile.photo = base64Image;
            this.profileUpdated = true;
        }, (err) => {
            console.log(err);
        });
    }
}
