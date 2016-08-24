import {Component, NgZone, ViewChild} from '@angular/core';
import {AlertController, Page, Content, NavController, NavParams} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Home} from '../home/home';

@Page({
    templateUrl: 'build/pages/requests/messages.html',
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
    }

    ngOnDestroy() {
        console.log('ngOnDestroy - messages');
    }

    ngOnInit() {
        console.log('ngOnInit - messages reqid = ', this.request);
        console.log('--------');
        this.userId = this.FBService.getAuthData().uid;
        console.log('user id is: ' + this.userId)

        this.FBService.getMyMessages(this.requestId, this.supplierId)
            .subscribe((data: any) => {
                console.log(' my messages for supplier ' + this.supplierId + 'are:');
                console.log(data);

                this.ngZone.run(() => {
                    this.messages = data;
                });
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

        this.contentsBottom = 44;
        this.footerBottom   = 0;
        window.addEventListener('native.keyboardshow', (e) => {
            this.ngZone.run(() => {
                this.contentsBottom = e['keyboardHeight'] + 44;
                this.footerBottom   = e['keyboardHeight'];
                setTimeout(() => {
                    this.content.scrollToBottom(300);
                });
            });
        });
        window.addEventListener('native.keyboardhide', (e) => {
            this.ngZone.run(() => {
                this.contentsBottom = 44;
                this.footerBottom   = 0;
            });
        });
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
        // the most important function ofthe app!   
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