
import {Component, ElementRef, ViewChild, NgZone} from '@angular/core';
import {ModalController, NavController, ViewController, LoadingController, NavParams, Platform} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {PROGRESSBAR_DIRECTIVES} from '../../components/progressbar';
import {Home} from '../home/home';
import {ModalsContentPage} from './modal'
import {GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarkerOptions} from 'ionic-native';
import GlobalService = require('../../components/globalService');

@Component({
    templateUrl: 'build/pages/form/form.html',
    directives: [PROGRESSBAR_DIRECTIVES]
})

export class Form {

    formPageIndex = -1
    categoryData = null
    categoryId = ""

    GOOGLE_MAP_TIMEOUT = 1000;

    field = null
    cd = null
    label = ""
    formAnswers = null
    formAnswersLength = 0
    lastPage = false;
    fromValue = "";
    toValue = "";
    maxStep = 0;
    answerObj;
    dateTime;
    categoryName: string;
    locationType: string;
    locationValue: string;
    locationSteps: number;
    locationStep: number;
    userStartLocation = true;

    @ViewChild('autocomplete') myElement: any;
    @ViewChild('autocomplete2') myElement2: any;


    constructor(public nav: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public FBService: FirebaseService,
        private ngZone: NgZone,
        private platform: Platform,
        private modalCtrl: ModalController,
        private loadingCtrl: LoadingController) {

    }

    // onInputChangeKeyUp() {
    //     console.log('on key up');

    //     if (this.map) {
    //         this.map.setClickable(false);
    //     }
    // }

    onKeyUp(item) {

        var descriptionIdentifier = 'Description: ';

        console.log('onKeyUp', item);
        console.log('answerObj', this.answerObj);
        console.log('current form answers:', this.formAnswers)

        var thisPageAnswers = this.formAnswers[this.formPageIndex]['ans'];

        if (this.field.allows_multiple_values) {

            // search through to see if a can describe item has already been entered
            // by looking for Description: in the results

            var descIndex = -1;
            for (var i = 0; i < thisPageAnswers.length; i++) {
                if (thisPageAnswers[i].startsWith(descriptionIdentifier)) {
                    descIndex = i;
                    break;
                }
            }

            // var description;

            // let answerObjLabels = Object.keys(this.answerObj);
            // for (var i = 0; i < answerObjLabels.length; i++) {

            //     var label = answerObjLabels[i];
            //     var answer = this.answerObj[label];
            // }


            if (this.answerObj[item.label]) {

                var desription = descriptionIdentifier + this.answerObj[item.label];

                if (descIndex === -1) {
                    thisPageAnswers.push(desription);
                } else {
                    thisPageAnswers[descIndex] = desription;
                }
            } else {
                // if the new answer has been deleted
                thisPageAnswers.splice(descIndex, 1);
            }
        } else {

            if (this.answerObj[item.label]) {
                console.log('pushing the item on', this.answerObj[item.label]);
                this.formAnswers[this.formPageIndex]['ans'] = [];
                this.formAnswers[this.formPageIndex]['ans'].push(descriptionIdentifier + this.answerObj[item.label]);
            } else {
                this.formAnswers[this.formPageIndex]['ans'] = [];
            }

        }

        this.formAnswersLength = this.formAnswers[this.formPageIndex]['ans'].length;
        console.log('after entry:', this.formAnswers);
    }

    onDateTimeChange(event) {
        this.dateTime = event.target.value;
        if (this.dateTime != null) {
            this.formAnswers[this.formPageIndex]['ans'] = [];
            this.formAnswers[this.formPageIndex]['ans'].push(this.dateTime);
        }        
        this.formAnswersLength = this.formAnswers[this.formPageIndex]['ans'].length;
    }


    back(){
        this.nav.pop();
    }

    
    lng
    lat
    placeName
    //private map: GoogleMap;


    // createMap() {
    //     this.platform.ready().then(() => {
    //         try {
    //             this.map = new GoogleMap('map_canvas' /*, {'backgroundColor': 'red'}*/);

    //             return GoogleMap.isAvailable().then(() => {

    //                 return this.map.one(GoogleMapsEvent.MAP_READY).then((data: any) => {



    //                     this.map.getMyLocation().then((location) => {
    //                         console.log("latitude:" + location.latLng.lat, "longitude:" + location.latLng.lng);
    //                         let myPosition = new GoogleMapsLatLng(location.latLng.lat, location.latLng.lng);
    //                         //console.log("My position is", myPosition);
    //                         this.map.animateCamera({ target: myPosition, zoom: 10, duration: 1000 });
    //                         this.map.setClickable(false);
    //                         //loading.dismiss();
    //                     });
    //                     //alert("GoogleMap.onMapReady(): " + JSON.stringify(data));

    //                 });
    //             });
    //         } catch (error) {
    //             //loading.dismiss();
    //         }
    //     });
    // }

    autocomplete1
    autocomplete2

    locationPopup1:any
    locationPopup2:any
    locationTimer
    isResultHidden1
    isResultHidden2

    onPageWillEnter() {
        GlobalService.mainTabBarElement.style.display = 'none';
    }

    ionViewWillEnter() {
        console.log('form - ionViewWillEnter');
        
        if (this.field.type === 'location') {

            this.locationValue = ""
            this.locationType = this.navParams.get('locationType');
            this.locationStep = 1;
            this.locationSteps = 1;
            if (this.locationType === "multi") {
                this.locationSteps = 2;
            }


            // let loading = this.loadingCtrl.create({
            //     content: "Loading map"
            // });

            // loading.present(loading)

            // setTimeout(() => {
            //     this.createMap();
            // }, this.GOOGLE_MAP_TIMEOUT);

            //let input_location = document.getElementById('autocomplete').getElementsByTagName('input')[0];
            //console.log(this.myElement);

            let options = {
                types: [],
                //componentRestrictions: { country: 'uk' }
            };

            let input_location, input_location2;

            input_location = this.myElement.nativeElement;
            this.autocomplete1 = new google.maps.places.Autocomplete(input_location, options);

            input_location2 = this.myElement2.nativeElement;
            this.autocomplete2 = new google.maps.places.Autocomplete(input_location2, options);


            google.maps.event.addListener(this.autocomplete1, 'place_changed', () => {
                this.placeChanged(this.autocomplete1);
            });          

            google.maps.event.addListener(this.autocomplete2, 'place_changed', () => {
                this.placeChanged(this.autocomplete2);
            });

            this.isResultHidden1 = true;
            this.isResultHidden2 = true;

            this.locationTimer = setInterval(()=>{
                this.locationPopup1 = document.getElementsByClassName('pac-container')[0];
                if (this.locationPopup1 && this.locationPopup1.style.display !== 'none')
                    this.isResultHidden1 = false;
                else
                    this.isResultHidden1 = true;

                this.locationPopup2 = document.getElementsByClassName('pac-container')[1];
                if (this.locationPopup2 && this.locationPopup2.style.display !== 'none')
                    this.isResultHidden2 = false;
                else
                    this.isResultHidden2 = true;
            }, 100);
        }
    }

    placeChanged(autoComplete) {

        console.log('place changed callback');
        let place = autoComplete.getPlace();
        let geometry = place.geometry;
        if ((geometry) !== undefined) {

            console.log(place.name);
            console.log(geometry.location.lng());

            this.lng = geometry.location.lng();
            this.lat = geometry.location.lat();
            this.placeName = place.name;

            var locationAnswer = {
                lat: this.lat,
                lng: this.lng,
                placeName: this.placeName
            }

            var idx = 0;
            if (autoComplete === this.autocomplete1)
                idx = 0;
            else
                idx = 1;
            this.ngZone.run(() => {
                this.formAnswers[this.formPageIndex]['ans'][idx] = locationAnswer;
                this.formAnswersLength = this.formAnswers[this.formPageIndex]['ans'].length;
            });

            // try {

            //     console.log(this.formAnswersLength);
            //     console.log('set the map answer', this.formAnswers);
            //     let myPosition = new GoogleMapsLatLng(this.lat, this.lng);
            //     console.log("My position is", myPosition);
            //     //this.map.animateCamera({ target: myPosition, zoom: 12, });
            //     this.map.setCenter(myPosition);
            //     this.map.addMarker({ position: myPosition });
            //     this.map.setClickable(true);
            // } catch (error) {

            // }
        }

    }


    ngOnInit() {
        console.log('ngOnInit - form');

        this.maxStep = 1;
        this.formPageIndex = this.navParams.get('index');
        this.cd = this.navParams.get('categoryData');
        this.categoryId = this.navParams.get('categoryId');

        console.log('the category id is ', this.categoryId);

        this.categoryData = this.cd
        this.categoryName = this.navParams.get('categoryName');

        console.log('category data', this.categoryData)

        this.field = this.categoryData.fields[this.formPageIndex];
        this.label = this.categoryData.fields[this.formPageIndex].label;
        this.formAnswers = this.navParams.get('formAnswers');

        if (!this.formAnswers) {
            this.formAnswers = [];
        }

        if (this.formPageIndex === this.categoryData.fields.length - 1) {
            this.lastPage = true;
        }
        this.maxStep = this.categoryData.fields.length + 1;

        if (!this.answerObj) {
            this.answerObj = {};
        }

        if (!this.formAnswers[this.formPageIndex]) {
            var thisPageObj = {};
            thisPageObj['qu'] = this.label;
            thisPageObj['ans'] = [];
            this.formAnswers[this.formPageIndex] = thisPageObj;

        }
        console.log('init form answers', this.formAnswers);

        this.formAnswersLength = this.formAnswers[this.formPageIndex]['ans'].length;

        this.dateTime = null;
    }

    clicked(item) {

        if (item.can_describe) {
            //this.formAnswers[this.formPageIndex] = {};
            return;
        }

        if (this.field.allows_multiple_values) {

            // if already present and tapped again remove it
            var alreadyPresent
            var currentAnswers = this.formAnswers[this.formPageIndex]['ans'];

            var idx = currentAnswers.indexOf(item.label);
            if (idx !== -1) {
                this.formAnswers[this.formPageIndex]['ans'].splice(idx, 1);
            } else {
                this.formAnswers[this.formPageIndex]['ans'].push(item.label);
            }

        } else {

            this.formAnswers[this.formPageIndex]['ans'] = [];
            this.formAnswers[this.formPageIndex]['ans'].push(item.label);
            if (!this.lastPage) {
                 this.next();
            }
        }

        this.formAnswersLength = this.formAnswers[this.formPageIndex]['ans'].length;
        //console.log(this.formAnswers);
        //console.log('form ans len: ' + this.formAnswersLength);
    }

    next() {

        if (this.field.type === "location") {
            if (this.locationTimer)
                clearInterval(this.locationTimer);

            if (this.userStartLocation) {
                this.formAnswers[this.formPageIndex]['ans'][1] = this.formAnswers[this.formPageIndex]['ans'][0];
            }
        }

        this.nav.push(Form, {
            index: this.formPageIndex + 1,
            categoryData: this.cd,
            categoryId: this.categoryId,
            formAnswers: this.formAnswers,
            categoryName: this.categoryName
        });
    }

    submitRequest() {
        console.log('request submitted');
        //console.log(this.formAnswers);

        var request = { body: JSON.stringify(this.formAnswers) };
        request['categoryId'] = this.categoryId;

        // here we should check that the users is authenticated AND
        // that the user's account exists - trying to submit a request when you 
        // do not have an account will fail anyway.

        if (this.FBService.isAuthenticated()) {

            console.log('requests is authenticated');

            let loading = this.loadingCtrl.create({
                content: 'Sending Request...'
            });

            loading.present();

            this.FBService.submitRequest(request)
                .subscribe((requestId) => {
                    console.log('after submit request');
                    console.log(requestId);
                    loading.dismiss();

                    GlobalService.mainTabRef.select(1);
                    this.nav.setRoot(Home, {}, {animate: false});
                }, (error) => {
                    console.log(error.message);
                    console.log(error);
                    loading.dismiss();
                    if (error.message === "PERMISSION_DENIED: Permission denied"){
                        this.FBService.logout();
                        this.submitRequest();
                    }
                });

        } else {

            console.log('request not authenticaed - presenting modal');
            let modal = this.modalCtrl.create(ModalsContentPage, { req: request });
            modal.present();

            modal.onDidDismiss((data)=>{
                if (data.cancel !== true) {
                    GlobalService.mainTabRef.select(1);
                    this.nav.setRoot(Home, {}, {animate: false});
                }
            });

        }

    }

    cancelLocation(idx) {
        if (idx === 0) {
            this.fromValue = "";
            this.formAnswers[this.formPageIndex]['ans'][0] = null;
            this.formAnswersLength = 0;
        }
        else {
            this.toValue = "";
            this.formAnswers[this.formPageIndex]['ans'][1] = null;
        }
    }
}