import {Component, NgZone, ViewChild} from '@angular/core';
import {AlertController, Page, Content, NavController, NavParams} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Home} from '../home/home';
import {Keyboard} from 'ionic-native';
import {ChatBubble} from '../../components/chat-bubble/chat-bubble';
import {ElasticTextarea} from '../../components/elastic-textarea';
import GlobalService = require('../../components/globalService');

@Page({
    templateUrl: 'build/pages/requests/messages.html',
    directives: [ChatBubble, ElasticTextarea]
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

    @ViewChild(Content) content: Content;

    constructor(public nav: NavController,
        public navParams: NavParams,
        public FBService: FirebaseService,
        private ngZone: NgZone,
        private alertCtrl: AlertController) {

        this.requestId = this.navParams.get('req').id;

        console.log('the request id is', this.requestId);
        this.supplierId = this.navParams.get('supplierId');
        console.log('supplierId passed: ', this.supplierId);

        this.message = "";

        this.profile = {
            image: "http://www.kodeinfo.com/admin/assets/img/avatars/default-avatar.jpg",
        };
    }

    @ViewChild('chat_input') input: any;

    ngOnDestroy() {

        console.log('ngOnDestroy - messages');
    }

    ngOnInit() {
        console.log('ngOnInit - messages reqid = ', this.request);
        console.log('--------');
        this.userId = this.FBService.getAuthData().uid;
        console.log('user id is: ' + this.userId)

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


        this.ngZone.run(() => {
            console.log('init positions')
            this.contentsBottom = 44;
            this.footerBottom = 0;
        });

        window.addEventListener('native.keyboardshow', (e) => {

            console.log('keyboard show')
            this.ngZone.run(() => {
                this.contentsBottom = e['keyboardHeight'] + 44;
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
                this.contentsBottom = 44;
                this.footerBottom = 0;
            });
        });
    }

    onPageWillEnter() {
        GlobalService.mainTabBarElement.style.display = 'none';
    }

    ionViewWillEnter() {
        this.pageElement = document.getElementsByClassName('messages')[0];
        this.pageElement.style.background = 'white';
    }

    ionViewWillLeave() {
        this.pageElement.style.background = 'none';
    }

    sendMessage($event) {

        if (!this.message) {
            return;
        }
        console.log('about to send message: ' + this.message);
        this.FBService.sendMessage(this.requestId, this.supplierId, this.message);
        this.message = "";
    }

    hire() {

        console.log('hire requested');
        let confirm = this.alertCtrl.create({
            title: 'Hire ' + this.nickName + '?',
            message: '',
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {
                        console.log('cancelled hire');
                    }
                },
                {
                    text: 'Hire',
                    handler: () => {
                        console.log('confirmed hire');
                        this.alreadyHiredSupplier = true;
                        this.FBService.hire(this.requestId, this.supplierId)
                            .subscribe(() => {
                                console.log(this.supplierId + ' has been requested for hire');
                            });
                    }
                }
            ]
        });

        confirm.present();

    }
}