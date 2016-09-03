import {Component, ViewChild, NgZone} from '@angular/core';
import {Platform, ionicBootstrap, ModalController, NavController, App } from 'ionic-angular';
import {StatusBar, Keyboard} from 'ionic-native';
import {Home} from './pages/home/home';
import {FirebaseService} from './components/firebaseService';
import {Requests} from './pages/requests/requests'
import {CompletionModal} from './pages/completion/completion'
import {ReviewModal} from './pages/review/review'
import {Tabs} from './pages/tabs/tabs'
import GlobalService = require('./components/globalService');

declare var FCMPlugin;

@Component({
  template: '<ion-nav [root]="rootPage" swipeBackEnabled="false"></ion-nav>'
})
export class MyApp {
  rootPage: any;
  //@ViewChild(Nav) nav: Nav;

  constructor(platform: Platform, private app: App, public ngZone: NgZone, public modalCtrl: ModalController) {

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      Keyboard.hideKeyboardAccessoryBar(true);
      Keyboard.disableScroll(true);
      StatusBar.styleDefault();

      firebase.auth().onAuthStateChanged((authData) => {
        console.log('auth state changed', authData);
        this.start();
      });

      if (typeof FCMPlugin !== 'undefined') {
        FCMPlugin.getToken(
          function(token){
            console.log('Push Token = ' + token);
            GlobalService.pushToken = token;
          },
          function(err){
            console.log('error retrieving token: ' + err);
          }
        );

        FCMPlugin.onNotification(
            function(data){
                if(data.wasTapped){
                    //Notification was received on device tray and tapped by the user.
                    console.log( JSON.stringify(data) );
                }else{
                    //Notification was received in foreground. Maybe the user needs to be notified.
                    console.log( JSON.stringify(data) );
                }
            },
            function(msg){
                console.log('onNotification callback successfully registered: ' + msg);
            },
            function(err){
                console.log('Error registering onNotification callback: ' + err);
            }
        );
      }
    });
  }

  start() {
    console.log('checking if user is logged in');
    let user = firebase.auth().currentUser;
    if (user) {
      console.log('user is logged in');
      // check if the user has a user area - if not - logout
      var userRef = firebase.database().ref().child('users').child(user.uid);
      userRef.once('value', (snapshot) => {
        if (!snapshot.exists()) {
          console.log('user profile does not exist - logging out ' + user.uid);
          // this.ngZone.run(() => {
          //   firebase.auth().signOut();
          // });
          // this.rootPage = Home;
        } else {
          console.log('going to the requets page');
          // this.ngZone.run(() => {
          //   this.rootPage = Requests;
          // });
        }
      });

    } else {
      console.log('user not logged in. going to home page');
      // this.rootPage = Home;
    }

    this.ngZone.run(() => {
      this.rootPage = Tabs;
    });

    firebase.auth().onAuthStateChanged(
      (user) => {
        if (user) {
          firebase.database().ref().child('users').child(user.uid).child('completionRequests')
            .on('value', (snapshot) => {

              var nav: NavController = this.app.getActiveNav();

              if (snapshot.exists()) {
                console.log('COMPLETION REQUESTS:', snapshot.val());

                var completionRequests = snapshot.val();
                var completionRequestKeys = Object.keys(completionRequests);

                completionRequestKeys.map((key) => {
                  var completionRequest = completionRequests[key];

                  var params = {
                    requestId: key,
                    supplierId: completionRequest.supplierId,
                    firstName: completionRequest.supplierFirstName,
                    lastName: completionRequest.supplierLastName
                  };

                  let modal;
                  if (completionRequest.confirmed === undefined) {
                    console.log('presenting modal: ' + key);
                    let modal = this.modalCtrl.create(CompletionModal, params);
                    modal.present();
                  } else if (completionRequest.confirmed === true && !completionRequest.reviewed) {
                    let modal = this.modalCtrl.create(ReviewModal, params);
                    modal.present();
                  }

                });
              }
            })
        }
      });
  }
}

// Pass the main app component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument:
// http://ionicframework.com/docs/v2/api/config/Config/

let config = {
  prodMode: false, 
  statusbarPadding: true, 
  // tabsHideOnSubPages: true,
  backButtonText: '',
};

ionicBootstrap(MyApp, [FirebaseService], config); 