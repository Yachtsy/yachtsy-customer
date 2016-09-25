import {Component, NgZone, ViewChild} from '@angular/core';
import {AlertController, Page, Content, NavController, NavParams, LoadingController, ModalController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Home} from '../home/home';
import {ChatBubble} from '../../components/chat-bubble/chat-bubble';
import {ElasticTextarea} from '../../components/elastic-textarea';
import {RatingComponentUpdateable} from '../../components/ratingsComponent';
import {Keyboard, InAppPurchase} from 'ionic-native';
import {ViewReviewsPage} from '../view-reviews/view-reviews';
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
    reviews: any;
    userId: any;
    requestId: any;
    nickName: any;
    profile: any;
    price: any;
    alreadyHiredSupplier;
    contentsBottom = 0;
    footerBottom = 0;
    pageElement: any;
    tabBarDisplayStatus = '';
    curTab = 0;
    freeCreditsMode = false;
    businessName = "";
    creditsRequiredForCategory = 100;
    profileImage = {};

    reviewRating: number;
    totalReviews: number;

    @ViewChild(Content) content: Content;

    constructor(public nav: NavController,
        public navParams: NavParams,
        public FBService: FirebaseService,
        private ngZone: NgZone,
        private modalCtrl: ModalController,
        private alertCtrl: AlertController,
        private loadingCtrl: LoadingController) {

        this.requestId = this.navParams.get('requestId');
        console.log('the request id is', this.requestId);
        this.supplierId = this.navParams.get('supplierId');
        console.log('supplierId passed: ', this.supplierId);

        this.message = "";

        firebase.database().ref().child('config')
            .on('value', (snapshot) => {

                if (snapshot.exists()) {
                    let config = snapshot.val();

                    this.freeCreditsMode = config.freeCreditsMode;
                    console.log('freeCreditsMode', config.freeCreditsMode)

                    this.creditsRequiredForCategory = config.creditsRequiredForCategory;
                    console.log('creditsRequiredForCategory', config.creditsRequiredForCategory)

                } else {
                    throw new Error('Config snapshot missing');
                }

            });
    }

    @ViewChild('chat_input') input: any;

    ngOnDestroy() {

        console.log('ngOnDestroy - messages');
    }

    quoteMinHeight = 0
    profileMinHeight = 0
    blueHeight = 300;
    ngOnInit() {
        console.log('ngOnInit - messages reqid = ', this.request);
        console.log('--------');

        this.quoteMinHeight = window.innerHeight - 64 - 88 - 160;
        this.profileMinHeight = window.innerHeight - 64 - 160;

        this.profileImage = {
            url: "img/default_avatar.png"
        };

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
                                if (this.userId === msgData[key].data.uid) {
                                    msgData[key].data.position = 'left';
                                    msgData[key].data.img = {
                                        url: 'img/default-photo.png'
                                    };
                                }
                                else {
                                    msgData[key].data.img = this.profileImage;
                                    msgData[key].data.position = 'right';
                                }
                                return msgData[key].data;
                            });
                    });

                    // setTimeout(() => {
                    //     if (this.content)
                    //         this.content.scrollToBottom(300);
                    // }, 0);
                });

            this.FBService.getRequest(this.requestId)
                .subscribe((res: any) => {
                    console.log('the request is', res.data);
                    this.request = res.data;

                    this.nickName = this.request.quotes[this.supplierId].supplierName
                    this.price = this.request.quotes[this.supplierId].price;

                    let reviews = this.request.quotes[this.supplierId].supplierReviews;
                    this.reviews = reviews;

                    let supplierProfile = this.request.quotes[this.supplierId].supplierProfile;

                    this.profile = [];

                    Object.keys(supplierProfile).map((key) => {

                        if (key.startsWith('business_description')) {
                            let info = supplierProfile[key];

                            if (info) {

                                var field = Object.keys(info)[0];

                                if (field === 'business_name') {
                                    this.businessName = info[field]
                                } else {
                                    var data = {
                                        label: this.mapProfileTitles(field),
                                        data: info[field]
                                    };
                                    this.profile.push(data);
                                }
                            }
                        }

                    });

                    this.profileImage = {
                        url: supplierProfile.photo
                    };
                    console.log('PROFILE:', this.profile);

                    let rating = 0;
                    if (reviews !== 0) {

                        Object.keys(reviews).map((key) => {
                            let thisRating = reviews[key].rating
                            console.log('rating: ', rating);
                            rating += thisRating;
                        })
                    }

                    this.reviewRating = rating;
                    if (rating > 0) {
                        this.reviewRating /= Object.keys(reviews).length;
                    }

                    this.totalReviews = Object.keys(reviews).length;

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
                this.blueHeight = 100;

                setTimeout(() => {
                    if (this.content)
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
                this.blueHeight = 300;
            });
        });
    }

    mapProfileTitles(title) {

        if (title === "business_stand_out") return "How does your business stand out?"
        if (title === "business_enjoy") return "What do you enjoy about the work that you do?"
        if (title === "business_name") return "How does your business stand out?"

    }


    onPageWillEnter() {
        this.tabBarDisplayStatus = GlobalService.mainTabBarElement.style.display;
        GlobalService.mainTabBarElement.style.display = 'none';
    }

    onPageWillLeave() {
        GlobalService.mainTabBarElement.style.display = this.tabBarDisplayStatus;
    }

    blueElement
    ionViewWillEnter() {
        this.pageElement = document.getElementsByClassName('messages')[0];
        this.pageElement.style.background = 'white';

        this.blueElement = document.getElementsByClassName('blue-background')[0];
        this.blueElement.style.display = 'block';
    }

    ionViewWillLeave() {
        this.pageElement.style.background = 'none';
        this.blueElement.style.display = 'none';
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
                                                .then((balanceSnap) => {
                                                    let balance = balanceSnap.val();
                                                    console.log('New credit balance is: ' + balance);

                                                    if (balance >= this.creditsRequiredForCategory){
                                                        this.contact();
                                                    }

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

        let loading = this.loadingCtrl.create({
            content: 'Contacting Pro'
        });

        loading.present();

        this.FBService.contact(this.requestId, this.supplierId, this.request.categoryId)
            .then((result) => {
                loading.dismiss().then(() => {

                    console.log('contact result: ', result);
                    console.log(this.supplierId + ' has been requested for hire');

                    if (result.operationSuccess === true && result.message === "success") {
                        this.doAlert("Success", "You can now contact the Pro", 'OK')
                        this.alreadyHiredSupplier = true;
                    } else {
                        this.doAlert("Error", result.message, 'OK')
                    }
                });
            });
    }

    viewReviews() {
        let modal = this.modalCtrl.create(ViewReviewsPage, { reviews: this.reviews });
        modal.present();
    }

    doAlert(title, message, buttonText) {

        let alert = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: [
                {
                    text: buttonText,
                    handler: () => {

                    }
                }
            ]
        });
        alert.present();
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
                            console.log('freeCreditsMode', this.freeCreditsMode);
                            this.contact();
                        } else {
                            this.FBService.getCreditBalance()
                                .then((balanceSnap) => {

                                    let balance = balanceSnap.val();

                                    console.log('got credits balance: ' + balance);
                                    console.log('credits required for category:', this.creditsRequiredForCategory);

                                    if (balance < this.creditsRequiredForCategory) {
                                        console.log('insufficient credits');

                                        setTimeout(() => {
                                            this.promptCredits();
                                        }, 200);

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