
import {Component, ElementRef, ViewChild, NgZone} from '@angular/core';
import {ModalController, NavController, LoadingController, NavParams, Platform} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {PROGRESSBAR_DIRECTIVES} from '../../components/progressbar';
import {Requests} from '../requests/requests';
import {ModalsContentPage} from './modal'
import {GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarkerOptions} from 'ionic-native';

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
    maxStep = 0;
    answerObj;
    categoryName: string;
    locationType: string;
    locationValue: string;
    locationSteps: number;
    locationStep: number;

    @ViewChild('autocomplete') myElement: any;
    @ViewChild('autocomplete2') myElement2: any;


    constructor(public nav: NavController,
        public navParams: NavParams,
        public FBService: FirebaseService,
        private ngZone: NgZone,
        private platform: Platform,
        private modalCtrl: ModalController,
        private loadingCtrl: LoadingController) {

    }

    itemDescribed = false;

    onInputChangeKeyUp() {

        console.log('on key up');

        if (this.map) {
            this.map.setClickable(false);
        }



    }

    onKeyUp(item) {

        var descriptionIdentifier = 'Description: ';

        console.log('onKeyUp', item);
        console.log('answerObj', this.answerObj);
        console.log('current form answers:', this.formAnswers)

        var thisPageAnswers = this.formAnswers[this.formPageIndex]['ans'];

        if (this.answerObj[item.label]) {
            this.itemDescribed = true;
        } else {
            this.itemDescribed = false;
        }

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

    ngOnDestroy() {
        console.log('ngOnDestroy - form');
         
    }

    ionViewDidLeave() {
        console.log('ionViewDidLeave - form');

        // var els = document.getElementsByClassName("home show-page")
        // console.log('ELEMENTS:', els);
        // if (els) {
        //     if (els[0].classList.contains('hideme')) {
        //         console.log('going to remove..');
        //         els[0].classList.remove('hideme');
        //     }
        // }
    }

    ionViewWillLeave() {
        console.log('ionViewWillLeave - form');
       /// this.map.clear();
       // this.map.remove();
        //google.maps.event.clearListeners(this.autocomplete1, "place_changed")
        //google.maps.event.clearListeners(this.autocomplete2, "place_changed")

    }

    ionViewWillUnload() {
        console.log('ionViewWillUnload - form');
        // this.map.clear();
       // this.map.remove();
    }
    ionViewDidUnload() {
        console.log('ionViewDidUnload - form');
      //   this.map.clear();
      //  this.map.remove();

    }

    lng
    lat
    placeName
    private map: GoogleMap;


    createMap() {
        this.platform.ready().then(() => {
            try {
                this.map = new GoogleMap('map_canvas' /*, {'backgroundColor': 'red'}*/);

                return GoogleMap.isAvailable().then(() => {

                    return this.map.one(GoogleMapsEvent.MAP_READY).then((data: any) => {



                        this.map.getMyLocation().then((location) => {
                            console.log("latitude:" + location.latLng.lat, "longitude:" + location.latLng.lng);
                            let myPosition = new GoogleMapsLatLng(location.latLng.lat, location.latLng.lng);
                            //console.log("My position is", myPosition);
                            this.map.animateCamera({ target: myPosition, zoom: 10, duration: 1000 });
                            this.map.setClickable(false);
                            //loading.dismiss();
                        });
                        //alert("GoogleMap.onMapReady(): " + JSON.stringify(data));

                    });
                });
            } catch (error) {
                //loading.dismiss();
            }
        });
    }

    autocomplete1
    autocomplete2

    ionViewWillEnter() {

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

            setTimeout(() => {
                this.createMap();
            }, this.GOOGLE_MAP_TIMEOUT);

            //let input_location = document.getElementById('autocomplete').getElementsByTagName('input')[0];
            //console.log(this.myElement);

            let options = {
                types: [],
                //componentRestrictions: { country: 'uk' }
            };

            let input_location, input_location2;

            //console.log('elements: ', this.myElement, this.myElement2);

            input_location = this.myElement.nativeElement;
            this.autocomplete1 = new google.maps.places.Autocomplete(input_location, options);
            google.maps.event.addListener(this.autocomplete1, 'place_changed', () => {

                this.placeChanged(this.autocomplete1);

            });

            //console.log('second listener');
            input_location2 = this.myElement2.nativeElement;
            this.autocomplete2 = new google.maps.places.Autocomplete(input_location2, options);

            google.maps.event.addListener(this.autocomplete2, 'place_changed', () => {

                this.placeChanged(this.autocomplete2);

            });

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

            this.ngZone.run(() => {
                this.formAnswers[this.formPageIndex]['ans'].push(locationAnswer);
                this.formAnswersLength = this.formAnswers[this.formPageIndex]['ans'].length;
            });

            try {

                console.log(this.formAnswersLength);
                console.log('set the map answer', this.formAnswers);

                let myPosition = new GoogleMapsLatLng(this.lat, this.lng);
                console.log("My position is", myPosition);
                //this.map.animateCamera({ target: myPosition, zoom: 12, });
                this.map.setCenter(myPosition);
                this.map.addMarker({ position: myPosition });
                this.map.setClickable(true);

            } catch (error) {

            }
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

        if (this.field.type === "location" && (this.locationStep < this.locationSteps)) {

            this.ngZone.run(() => {
                this.locationStep = 2;
                console.log('incrementing the location step');
                console.log(this.locationStep);
            });

        } else {
            this.nav.push(Form, {
                index: this.formPageIndex + 1,
                categoryData: this.cd,
                categoryId: this.categoryId,
                formAnswers: this.formAnswers,
                categoryName: this.categoryName
            });
        }


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


                    this.nav.setRoot(Requests, {loading: loading}, {animate: true});
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
                this.nav.setRoot(Requests, {}, {animate: true});
            });

        }

    }

    cancelLocation() {
        this.fromValue = "";
    }
}