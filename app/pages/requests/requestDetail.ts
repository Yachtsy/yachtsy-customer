import {Component} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Home} from '../home/home';

@Component({
    templateUrl: 'build/pages/requests/requestDetail.html',
})
export class RequestDetail {

    requestId: any;
    request: any;
    requestBody: any;

    constructor(
        public nav: NavController,
        public navParams: NavParams,
        public FBService: FirebaseService,
        public viewCtrl: ViewController
    ) {

        this.requestId = navParams.get('reqId');
        console.log('the request id is ' + this.requestId);

        this.FBService.getRequest(this.requestId)
            .subscribe((res: any) => {

                this.request = res.data;
                console.log('the request is: ', this.request);
                this.requestBody = JSON.parse(this.request.body);
            });
    }

    ngOnDestroy() {
        console.log('ngOnDestroy - requestDetail');
    }

    ngOnInit() {
        console.log('ngOnInit - requestDetail');
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

}