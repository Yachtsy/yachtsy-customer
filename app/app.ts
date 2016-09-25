import {Component, ViewChild, NgZone, provide, PLATFORM_PIPES} from '@angular/core';
import {Platform, ionicBootstrap, ModalController, NavController, App, AlertController, Alert} from 'ionic-angular';
import {StatusBar, Keyboard, Network, InAppPurchase} from 'ionic-native';
import {Home} from './pages/home/home';
import {FirebaseService} from './components/firebaseService';
import {Requests} from './pages/requests/requests'
import {CompletionModal} from './pages/completion/completion'
import {ReviewModal} from './pages/review/review'
import {Tabs} from './pages/tabs/tabs'
import {Messages} from './pages/requests/messages'
import {SafeURL} from './components/pipe';
import {OfflinePage} from './pages/offline/offline'
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import GlobalService = require('./components/globalService');

declare var FirebasePlugin;


@Component({
  template: '<ion-nav [root]="rootPage" swipeBackEnabled="false"></ion-nav>',
  pipes: [SafeURL]
})
export class MyApp {
  rootPage: any;
  isInitFB = false;
  //@ViewChild(Nav) nav: Nav;

  constructor(platform: Platform, private app: App, public ngZone: NgZone, public modalCtrl: ModalController, private alertCtrl: AlertController, public FBService: FirebaseService) {

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      Keyboard.hideKeyboardAccessoryBar(true);
      Keyboard.disableScroll(true);
      StatusBar.styleDefault();

      if (platform.is('ios')) {
        GlobalService.mainTabBarDefaultDisplayInfo = '-webkit-flex';
      }
      else {
        GlobalService.mainTabBarDefaultDisplayInfo = 'flex';
      }
      console.log('set GlobalService.mainTabBarDefaultDisplayInfo: ', GlobalService.mainTabBarDefaultDisplayInfo)

      var offline = Observable.fromEvent(document, "offline");
      var online = Observable.fromEvent(document, "online");
      var networkState = Network.connection;

      // console.log('network state: ', networkState);
      if (networkState === 'none') {
        this.ngZone.run(() => {
          this.rootPage = OfflinePage;
        });
      }
      else {
        console.log('online and ready')
        this.app.getActiveNav().setRoot(Tabs).then(() => {
          this.initFB();
        });
      }

      offline.subscribe(() => {
        console.log('offline update');
        // this.online = false;

        this.ngZone.run(() => {
          this.rootPage = OfflinePage
        });
      });

      online.subscribe(() => {
        console.log('online update')
        if (!this.isInitFB) {
          console.log('doing init FB');
          this.initFB();
          var element = document.createElement("script");
          element.src = "http://maps.google.com/maps/api/js?libraries=places&key=AIzaSyB2-pd_C9vShNuBpWzTBHzTtY6cinsYWM0";
          document.body.appendChild(element);
        }
        this.ngZone.run(() => {
          this.rootPage = Tabs;
        });

      });

      var nav: NavController = this.app.getActiveNav();

      if (typeof FirebasePlugin !== 'undefined') {
        FirebasePlugin.grantPermission();

        this.pushTokenCallCount = 0;
        this.getPushToken();

        FirebasePlugin.onNotificationOpen((notification) => {
          console.log(notification);
          var requestId = '';
          var supplierId = '';
          if (notification.aps) {
            requestId = notification.aps.requestId;
            supplierId = notification.aps.supplierId;
          }

          let alert = this.alertCtrl.create({
            title: 'Yachtsy',
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

        }, function (error) {
          console.log(error);
        });
      } else {
        console.log('FIREBASE PLUGIN NOT DEFINED');
      }

    });
  }

  getMyRequests() {


    console.log('getting requests...');

    this.FBService.getMyRequests()
      .subscribe((data: any) => {
        var unreadTotalCount = 0;
        for (var i = 0; i < data.length; i++) {
          if (data[i].data.quotes) {
            data[i].data.quotes = this.FBService.objectToArr(data[i].data.quotes);
            data[i].data.quotesLength = data[i].data.quotes.length;

            var unreadCount = 0;
            var curTime = new Date().getTime();
            for (var j = 0; j < data[i].data.quotes.length; j++) {
              if (data[i].data.quotes[j].data.initialQuoteSeen !== true)
                unreadCount++;
              if (data[i].data.quotes[j].data.timestamp) {
                var dur = curTime - data[i].data.quotes[j].data.timestamp;
                data[i].data.quotes[j].data.pasttime = this.getPastTimeString(dur) + ' ago';
                if (dur <= 24 * 3600 * 1000)
                  data[i].data.quotes[j].data.isNew = true;
                else
                  data[i].data.quotes[j].data.isNew = false;
              }
              else {
                data[i].data.quotes[j].data.isNew = false;
              }
            }
            data[i].data.unreadCount = unreadCount;
            unreadTotalCount += unreadCount;
          }
          else
            data[i].data.quotesLength = 0;
        }

        for (var i = 0; i < data.length; i++) {
          for (var j = i + 1; j < data.length; j++) {
            if (data[i].data.date < data[j].data.date) {
              var tmp = {};
              Object.assign(tmp, data[i]);
              data[i] = data[j];
              data[j] = tmp;
            }
          }
        }

        if (unreadTotalCount === 0) {
          GlobalService.tabBadgeInfo.count = '';
        } else {
          GlobalService.tabBadgeInfo.count = unreadTotalCount + '';
        }

        if (typeof FirebasePlugin !== 'undefined') {
          FirebasePlugin.setBadgeNumber(unreadTotalCount);
        }
        console.log('setting global requests length');
        GlobalService.myRequests.data = data;
      });

  }


  initCompletionRequests = false;

  initFB() {

    this.isInitFB = true;

    console.log('initFB - setting up firebase auth state changed handler');

    firebase.auth().onAuthStateChanged(

      (user) => {
        if (user) {

          console.log('auth state changd --- USER EXISTS', user);
          console.log('getting requests');

          this.getMyRequests();

          if (!this.initCompletionRequests) {

            console.log('completion requests not initialising');

            this.initCompletionRequests = true;

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
              });
          }


          this.ngZone.run(() => {

            try {
              console.log('BEFORE: Auth state changed in APP - SHOWING TAB BAR');
              GlobalService.mainTabBarElement.style.display = GlobalService.mainTabBarDefaultDisplayInfo;
              console.log('AFTER: Auth state changed in APP - style.display', GlobalService.mainTabBarElement.style.display);
            } catch (error) {
              console.log('ERROR trying to set GlobalService.mainTabBarElement.style.display')
              console.error(error);
            }

          });

        } else {

          console.log('APP auth state changed handler - NO USER');
          this.initCompletionRequests = false;

          this.ngZone.run(() => {

            try {
              console.log('HIDING TAB BAR');
              GlobalService.mainTabBarElement.style.display = 'none';
            } catch (error) {
              console.log('ERROR trying to hide the mainTabBarElement');
              console.log(error);
            }

          });

        }
      });
  }

  pushTokenCallCount = 0;
  getPushToken() {
    let self = this;
    FirebasePlugin.getInstanceId(function (token) {
      // save this server-side and use it to push notifications to this device
      console.log('THE PUSH TOKEN IS', token);
      GlobalService.pushToken = token;
    }, function (error) {
      console.log((self.pushTokenCallCount + 1) + 'th trying error: ' + error);
      setTimeout(() => {
        self.pushTokenCallCount++;
        if (self.pushTokenCallCount < 30)
          self.getPushToken();
      }, 2000);
    });
  }

  // start() {
  //   console.log('starting app');
  //   console.log('root page');
  //   this.ngZone.run(() => {
  //     this.rootPage = Tabs;
  //   });
  // }

  getPastTimeString(duration) {
    var dur = (duration - duration % 1000) / 1000;
    var ss, mm, hh, dd, oo, yy;

    ss = dur % 60; dur = (dur - ss) / 60;
    mm = dur % 60; dur = (dur - mm) / 60;
    hh = dur % 24; dur = (dur - hh) / 24;
    dd = dur % 30; dur = (dur - dd) / 30;
    oo = dur % 12; yy = (dur - oo) / 12;

    if (yy > 0)
      return yy + 'y';
    else if (oo > 0)
      return oo + 'm';
    else if (dd > 0)
      return dd + 'd';
    else if (hh > 0)
      return hh + 'h';
    else if (mm > 0)
      return mm + 'm';
    else if (ss > 0)
      return ss + 's';
    else
      return 'now';
  };


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

ionicBootstrap(MyApp, [
    FirebaseService,
    provide(PLATFORM_PIPES, { useValue: [SafeURL], multi: true })
  ], config); 
