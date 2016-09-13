import {Component, NgZone, ViewChild} from '@angular/core';
import {AlertController, Page, Content, NavController, NavParams} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Home} from '../home/home';
import {ChatBubble} from '../../components/chat-bubble/chat-bubble';
import {ElasticTextarea} from '../../components/elastic-textarea';
import {RatingComponentUpdateable} from '../../components/ratingsComponent';
import {Keyboard, InAppPurchase} from 'ionic-native';

import GlobalService = require('../../components/globalService');


@Page({
    templateUrl: 'build/pages/requests/messages.html',
    directives: [ChatBubble, ElasticTextarea, RatingComponentUpdateable]
})
export class Messages {

    request: any;
    messages: any;
    supplierId: any;
    message: any;
    userId: any;
    requestId: any;
    nickName: any;
    price: any;
    alreadyHiredSupplier;
    contentsBottom = 0;
    footerBottom = 0;
    pageElement: any;
    profile;
    tabBarDisplayStatus = '';
    curTab = 0;
    freeCreditsMode = false;
    creditsRequiredForCategory = 100;

    @ViewChild(Content) content: Content;

    constructor(public nav: NavController,
        public navParams: NavParams,
        public FBService: FirebaseService,
        private ngZone: NgZone,
        private alertCtrl: AlertController) {

        this.requestId = this.navParams.get('requestId');
        console.log('the request id is', this.requestId);
        this.supplierId = this.navParams.get('supplierId');
        console.log('supplierId passed: ', this.supplierId);

        this.message = "";

        this.profile = {
            image: GlobalService.avatarImage,
        };

        firebase.database().ref().child('config')
            .on('value', (snapshot) => {

                if (snapshot.exists()) {
                    let config = snapshot.val();
                    console.log('config is', config)
                    this.freeCreditsMode = config.freeCreditsMode;
                    this.creditsRequiredForCategory = config.creditsRequiredForCategory;
                } else {
                    throw new Error('Config snapshot missing');
                }
                
            });

    }

    @ViewChild('chat_input') input: any;

    ngOnDestroy() {

        console.log('ngOnDestroy - messages');
    }

    ngOnInit() {
        console.log('ngOnInit - messages reqid = ', this.request);
        console.log('--------');

        if (this.FBService.getAuthData()) {
            this.userId = this.FBService.getAuthData().uid;
            console.log('user id is: ' + this.userId)
        }
        else
            this.userId = '';

        if (this.requestId !== '' && typeof this.requestId !== 'undefined' &&
            this.supplierId !== '' && typeof this.supplierId !== 'undefined') {
            this.FBService.getMyMessages(this.requestId, this.supplierId)
                .subscribe((msgData: any) => {

                    console.log(' my messages for supplier ' + this.supplierId + 'are:');
                    console.log(msgData);

                    this.ngZone.run(() => {
                        this.messages = Object.keys(msgData)
                            .map((key) => {
                                msgData[key].data.img = this.profile.image;
                                msgData[key].data.position = 'right';
                                if (this.userId === msgData[key].data.uid) {
                                    msgData[key].data.position = 'left';
                                }
                                return msgData[key].data;
                            });
                    });

                    setTimeout(() => {
                        this.content.scrollToBottom(300);
                    }, 0);
                });

            this.FBService.getRequest(this.requestId)
                .subscribe((res: any) => {
                    console.log('the request is');
                    this.request = res.data;

                    this.nickName = this.request.quotes[this.supplierId].supplierNickName
                    this.price = this.request.quotes[this.supplierId].price;
                    this.alreadyHiredSupplier = false;

                    if (this.request.hiring.suppliers && this.request.hiring.suppliers[this.supplierId]) {

                        console.log('setting already hired to true');
                        this.alreadyHiredSupplier = true;
                    }
                });
        }

        this.ngZone.run(() => {
            console.log('init positions')
            this.contentsBottom = 88;
            this.footerBottom = 0;
        });

        window.addEventListener('native.keyboardshow', (e) => {

            console.log('keyboard show')
            this.ngZone.run(() => {
                this.contentsBottom = e['keyboardHeight'] + 88;
                this.footerBottom = e['keyboardHeight'];

                setTimeout(() => {
                    this.content.scrollToBottom(300);
                }, 100);
            });

        });

        window.addEventListener('native.keyboardhide', (e) => {

            console.log('keyboard hide')
            this.ngZone.run(() => {
                console.log('initialising postions')
                this.contentsBottom = 88;
                this.footerBottom = 0;
            });
        });
    }

    onPageWillEnter() {
        this.tabBarDisplayStatus = GlobalService.mainTabBarElement.style.display;
        GlobalService.mainTabBarElement.style.display = 'none';
    }

    onPageWillLeave() {
        GlobalService.mainTabBarElement.style.display = this.tabBarDisplayStatus;
    }

    ionViewWillEnter() {
        this.pageElement = document.getElementsByClassName('messages')[0];
        this.pageElement.style.background = 'white';
    }

    ionViewWillLeave() {
        this.pageElement.style.background = 'none';
    }

    clickToggle(idx) {
        this.curTab = idx;
        if (idx === 0) {
            this.contentsBottom = 88;
            this.footerBottom = 0;
        }
        else if (idx === 1) {
            this.contentsBottom = 0;
            this.footerBottom = 0;
        }

        if (typeof Keyboard !== 'undefined')
            Keyboard.close();
    }

    sendMessage($event) {

        if (!this.message) {
            return;
        }
        console.log('about to send message: ' + this.message);
        this.FBService.sendMessage(this.requestId, this.supplierId, this.message);
        this.message = "";
    }

    attachMessage($event) {

    }

    


    confirm = this.alertCtrl.create({
        title: 'Please buy some credits.',
        message: 'You need to buy some credits in order to be able to contact',
        buttons: [
            {
                text: 'Cancel',
                handler: () => {
                    console.log('cancelled contact');
                }
            },
            {
                text: 'Buy Credits',
                handler: () => {
                    console.log('want to buy credits');

                    //credits
                    let prod1 = "com.yachtsy.yachtsy.1credit";
                    let prod3 = "com.yachtsy.yachtsy.3credits";
                    let prod5 = "com.yachtsy.yachtsy.5credits";

                    let products = InAppPurchase.getProducts([prod1, prod3, prod5])
                        .then((prods) => {
                            console.log(prods);

                            InAppPurchase.buy(prod1)

                                .then((data: any) => {
                                    console.log(JSON.stringify(data));
                                    console.log('consuming transactionId: ' + data.transactionId);

                                    this.FBService.validateReceipt(data.receipt)
                                        .then(() => {

                                            console.log('receipt was validated');
                                            this.FBService.getCreditBalance()
                                                .then((balance) => {
                                                    console.log('New credit balance is: ' + balance);
                                                });

                                        }).catch((error) => {
                                            console.error('error validating receipt');
                                            console.error(error);
                                        });

                                    return InAppPurchase.consume(data.type, data.receipt, data.signature);

                                }).then(function () {
                                    console.log('consume done!');
                                }).catch(function (err) {
                                    console.log(err);
                                });
                        })
                }
            }
        ]
    });


    promptCredits() {

        console.log('prompt for credits...');
        this.confirm.present();

    }

    contact() {
        this.alreadyHiredSupplier = true;
        this.FBService.hire(this.requestId, this.supplierId)
            .subscribe(() => {
                console.log(this.supplierId + ' has been requested for hire');
            });

    }

    prepareContact() {

        console.log('contact requested');
        let confirm = this.alertCtrl.create({
            title: 'Contact ' + this.nickName + '?',
            message: '',
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {
                        console.log('cancelled contact');
                    }
                },
                {
                    text: 'Contact',
                    handler: () => {
                        console.log('confirmed contact');

                        if (this.freeCreditsMode) {
                            this.contact();
                        } else {
                            this.FBService.getCreditBalance()
                                .then((balance) => {

                                    console.log('got credits balance: ' + balance);

                                    if (balance < this.creditsRequiredForCategory) {
                                        console.log('insufficient credits');
                                        this.promptCredits();
                                    } else {
                                        this.contact();
                                    }
                                });
                        }



                    }
                }
            ]
        });

        confirm.present();

    }
}