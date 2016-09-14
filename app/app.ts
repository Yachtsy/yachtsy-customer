import {Component, ViewChild, NgZone} from '@angular/core';
import {Platform, ionicBootstrap, ModalController, NavController, App, AlertController} from 'ionic-angular';
import {StatusBar, Keyboard, Network, InAppPurchase} from 'ionic-native';
import {Home} from './pages/home/home';
import {FirebaseService} from './components/firebaseService';
import {Requests} from './pages/requests/requests'
import {CompletionModal} from './pages/completion/completion'
import {ReviewModal} from './pages/review/review'
import {Tabs} from './pages/tabs/tabs'
import {Messages} from './pages/requests/messages'
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import GlobalService = require('./components/globalService');

declare var FirebasePlugin;

@Component({
  template: '<ion-nav [root]="rootPage" swipeBackEnabled="false"></ion-nav>'
})
export class MyApp {
  rootPage: any;
  isInitFB = false;
  //@ViewChild(Nav) nav: Nav;

  constructor(platform: Platform, private app: App, public ngZone: NgZone, public modalCtrl: ModalController, private alertCtrl: AlertController, public fbService: FirebaseService) {

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      Keyboard.hideKeyboardAccessoryBar(true);
      Keyboard.disableScroll(true);
      StatusBar.styleDefault();

      if (platform.is('ios'))
        GlobalService.mainTabBarDefaultDisplayInfo = '-webkit-flex';
      else
        GlobalService.mainTabBarDefaultDisplayInfo = 'flex';

      var offline = Observable.fromEvent(document, "offline");
      var online = Observable.fromEvent(document, "online");
      var networkState = Network.connection;

      console.log('state: ' + networkState);
      if (networkState === 'none') {
        GlobalService.isOnlineStatus = false;
        GlobalService.displayOfflineAlert(this.alertCtrl);
      }
      else
        GlobalService.isOnlineStatus = true;

      offline.subscribe(() => {
        GlobalService.isOnlineStatus = false;
        GlobalService.displayOfflineAlert(this.alertCtrl);
      });

      online.subscribe(()=>{
        GlobalService.isOnlineStatus = true;
        if (!this.isInitFB)
          this.initFB();
      });

      this.initFB();
      this.start();

      var nav: NavController = this.app.getActiveNav();

      if (typeof FirebasePlugin !== 'undefined') {
        FirebasePlugin.grantPermission();

        this.pushTokenCallCount = 0;
        this.getPushToken();

        let self = this;
        FirebasePlugin.onNotificationOpen(function(notification) {
          console.log(notification);
          var requestId = '';
          var supplierId = '';
          if (notification.aps) {
            requestId   = notification.aps.requestId;
            supplierId  = notification.aps.supplierId;
          }

          let alert = self.alertCtrl.create({
            title: 'Thumbtack',
            message: '',
            buttons: [
              {
                text: 'Ignore',
                role: 'cancel',
                handler: () => {
                }
              },
              {
                text: 'View Quote',
                handler: () => {
                  nav.push(Messages, { requestId: requestId, supplierId: supplierId });
                }
              }
            ]
          });
          alert.present();

        }, function(error) {
          console.log(error);
        });
      } else {
        console.log('FIREBASE PLUGIN NOT DEFINED');
      }

    });
  }

  initFB() {
    if (GlobalService.isOnline()) {
      this.isInitFB = true;

      firebase.auth().onAuthStateChanged((authData) => {
        console.log('auth state changed', authData);
      });

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

  pushTokenCallCount = 0;
  getPushToken() {
    let self = this;
    FirebasePlugin.getInstanceId(function(token) {
      // save this server-side and use it to push notifications to this device
      console.log('THE PUSH TOKEN IS', token);
      GlobalService.pushToken = token;
    }, function(error) {
      console.log((self.pushTokenCallCount + 1) + 'th trying error: ' + error);
      setTimeout(() => {
        self.pushTokenCallCount++;
        if (self.pushTokenCallCount < 30)
          self.getPushToken();
      }, 2000);
    });
  }

  start() {
    console.log('root page');
    this.ngZone.run(() => {
      this.rootPage = Tabs;
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
  // backButtonText: '',
};

ionicBootstrap(MyApp, [FirebaseService], config); 