import {Component, NgZone, ViewChild, ElementRef} from '@angular/core';
import {Modal, NavController, NavParams, AlertController, ModalController, LoadingController, ViewController, Platform} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import GlobalService = require('../../components/globalService');

@Component({
    templateUrl: 'build/pages/requests/requestDetail.html',
    providers: [FirebaseService],
})
export class RequestDetail {

    @ViewChild('map') mapElement: ElementRef;

    requestId
    requestBody
    request
    db
    userName = ""
    placeInfo
    map: any;

    constructor(
    public nav: NavController,
    public navParams: NavParams,
    public FBService: FirebaseService,
    private viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private platform: Platform,
    private zone: NgZone,
    public fbserv: FirebaseService) {

        this.requestId = navParams.get('reqId');
        console.log('the request id is ' + this.requestId);

        // if (GlobalService.isOnline()) {
            this.FBService.getRequest(this.requestId)
                .subscribe((res: any) => {

                    this.request = res.data;
                    console.log('the request is: ', this.request);
                    this.requestBody = JSON.parse(this.request.body);
                });
        // }
    }


    ngOnInit() {

        console.log('ngOnInit - request details');

        this.FBService.getRequest(this.requestId)
            .subscribe((res: any) => {

            if (res) {
                this.request = res.data;
                this.request['id'] = res.id;
                this.requestBody = JSON.parse(this.request.body);

                if (typeof this.requestBody[0].ans[0].lat !== 'undefined') {
                    this.placeInfo = {
                        lat:    this.requestBody[0].ans[0].lat,
                        lng:    this.requestBody[0].ans[0].lng,
                        place:  this.requestBody[0].ans[0].placeName
                    };
                    this.requestBody.splice(0, 1);

                    var jobType = [{
                        qu:   'Job Type',
                        ans:  [this.request.categoryName]
                    }];
                    this.requestBody = jobType.concat(this.requestBody);
                }
                else {
                    this.placeInfo = {
                        lat:    38.9072,
                        lng:    -77.0369,
                        place:  'Washington'
                    };
                }

                if (this.request.expiryDate) {
                    var cur_date = new Date().getTime();
                    this.request.pastExpiry = GlobalService.getDurationString(this.request.expiryDate - cur_date);
                }
                if (typeof this.request.pastExpiry === 'undefined' || this.request.pastExpiry === '')
                    this.request.pastExpiry = '0s';

                console.log("the request body is", this.requestBody);
            }

        });

        this.createMap();
    }

    ionViewDidEnter() {
        console.log('ionViewDidEnter - createMap');
    }

    createMap() {
        console.log("position = " + this.placeInfo.lat + " : " + this.placeInfo.lng);
        let latLng = new google.maps.LatLng(this.placeInfo.lat, this.placeInfo.lng);

        let mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true
        }

        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);    
    }

    back() {
        this.viewCtrl.dismiss();
    }

}