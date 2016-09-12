
import {Component, ElementRef, ViewChild, NgZone} from '@angular/core';
import {ModalController, Slides, NavController, ViewController, LoadingController, ActionSheetController, NavParams, Platform} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {PROGRESSBAR_DIRECTIVES} from '../../components/progressbar';
import {Home} from '../home/home';
import {ModalsContentPage} from './modal'
import {Keyboard, GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarkerOptions} from 'ionic-native';
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

    curField = null
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
    contentsBottom = 0;
    footerBottom = 0;

    myBoats = [];
    boatIndex = 0;
    boatName = "";

    sliderOptions = {};
    slides: any;

    @ViewChild('autocomplete') myElement: any;
    @ViewChild('autocomplete2') myElement2: any;


    constructor(public nav: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public actionSheetCtrl: ActionSheetController,
        public FBService: FirebaseService,
        private ngZone: NgZone,
        private platform: Platform,
        private modalCtrl: ModalController,
        private loadingCtrl: LoadingController) {

        let self = this;
        this.sliderOptions = {
            initialSlide: 0,
            speed: 300,
            pager: false,
            loop: false,
            onInit: function (slides) {
                self.slides = slides;
                // self.slides.lockSwipes();
            }
        };
    }

    ngOnInit() {
        console.log('ngOnInit - form');

        this.maxStep = 1;
        this.categoryId = this.navParams.get('categoryId');

        console.log('the category id is ', this.categoryId);

        this.categoryData = GlobalService.categoryData;
        this.categoryName = this.navParams.get('categoryName');

        console.log('category data', this.categoryData)

        this.myBoats = GlobalService.myBoats;

        this.formPageIndex = 0;
        this.formAnswers = [];
        this.answerObj = {};
        this.maxStep = this.categoryData.fields.length + 1;
        this.dateTime = null;

        this.initFields();

        window.addEventListener('native.keyboardshow', (e) => {

            console.log('keyboard show')
            this.ngZone.run(() => {
                this.contentsBottom = e['keyboardHeight'] + 44;
                this.footerBottom = e['keyboardHeight'];
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

    initFields() {
        if (this.formPageIndex === this.categoryData.fields.length - 1) {
            this.lastPage = true;
        }

        this.curField = this.categoryData.fields[this.formPageIndex];
        if (!this.formAnswers[this.formPageIndex]) {
            this.formAnswers[this.formPageIndex] = {
                'qu':       this.curField.label,
                'ans':      []
            };

        }
        console.log('init form answers', this.formAnswers);

        this.formAnswersLength = this.formAnswers[this.formPageIndex]['ans'].length;        
    }

    touchSlide(event) {
        event.stopPropagation();
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
        var answerObj = this.answerObj[item.label + this.formPageIndex];

        if (this.curField.allows_multiple_values) {

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


            if (answerObj) {

                var desription = descriptionIdentifier + answerObj;

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

            if (answerObj) {
                console.log('pushing the item on', answerObj);
                this.formAnswers[this.formPageIndex]['ans'] = [];
                this.formAnswers[this.formPageIndex]['ans'].push(descriptionIdentifier + answerObj);
                if (this.curField.isBoatInfo === true) {
                    this.boatName = answerObj;
                    this.boatIndex = -1;
                }
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

    locationTimer
    isResultHidden

    onPageWillEnter() {
        GlobalService.mainTabBarElement.style.display = 'none';
    }

    ionViewWillEnter() {
        console.log('form - ionViewWillEnter');

        if (this.curField.type === 'location') {

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

            this.isResultHidden = true;

            this.locationTimer = setInterval(()=>{
                var i = 0;
                var popup_list = document.getElementsByClassName('pac-container');

                if (!popup_list)
                    this.isResultHidden = true;
                else {
                    for (i = 0; i < popup_list.length; i++) {
                        var popup:any;
                        popup = popup_list[i];
                        if (popup && popup.style.display !== 'none') {
                            this.isResultHidden = false;
                            break;
                        }
                    }
                    if (i >= popup_list.length)
                        this.isResultHidden = true;
                }
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

            this.ngZone.run(() => {
                this.formAnswers[this.formPageIndex]['ans'][this.locationStep - 1] = locationAnswer;
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

    clicked(item) {

        if (item.can_describe) {
            //this.formAnswers[this.formPageIndex] = {};
            return;
        }

        if (this.curField.allows_multiple_values) {

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

        if (this.curField.isBoatInfo === true) {
            this.boatIndex = item.value - 1;
        }
    }

    next() {

        if (this.curField.type === "location" && (this.locationStep < this.locationSteps)) {
            this.ngZone.run(() => {
                this.locationStep = 2;
            });
        }
        else {
            if (this.locationStep === 2) {
                if (this.locationTimer)
                    clearInterval(this.locationTimer);

                if (this.userStartLocation)
                    this.formAnswers[this.formPageIndex]['ans'][1] = this.formAnswers[this.formPageIndex]['ans'][0];
            }

            if (this.curField.isBoatInfo === true && this.boatIndex >= 0) {
                var boatData = GlobalService.myBoats.data[this.boatIndex].data.data;
                for (var i = 0; i < boatData.length; i++)
                    this.formAnswers.push(boatData[i]);

                this.formPageIndex += (GlobalService.boatInfoCount + 1);
                this.initFields();
                this.slides.slideTo(GlobalService.boatStartFormIndex + GlobalService.boatInfoCount, 300, true);
            }
            else {
                this.formPageIndex++;
                this.initFields();
                this.slides.slideNext(true, 300);
            }
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

            if (this.boatIndex < 0) {
                var boatInfo = {
                    boatName:   this.boatName,
                    data:       []
                };

                for (var i = 0; i < GlobalService.boatInfoCount; i++) {
                    boatInfo.data.push(this.formAnswers[GlobalService.boatStartFormIndex + i]);
                }
                this.FBService.addMyBoat(boatInfo);
            }

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
        if (this.locationStep === 1) {
            this.fromValue = "";
            this.formAnswers[this.formPageIndex]['ans'][0] = null;
            this.formAnswersLength = 0;
        }
        else {
            this.toValue = "";
            this.formAnswers[this.formPageIndex]['ans'][1] = null;
        }
    }

    clickBack() {
        if (this.formPageIndex > 0) {
            if (this.boatIndex >= 0 && this.formPageIndex === GlobalService.boatStartFormIndex + GlobalService.boatInfoCount) {
                this.formPageIndex = GlobalService.boatStartFormIndex - 1;
                this.initFields();
                this.slides.slideTo(GlobalService.boatStartFormIndex - 1, 300, true);
            }
            else {
                this.formPageIndex--;
                this.initFields();
                this.slides.slidePrev(true, 300);
            }
        }
        else {
            this.nav.setRoot(Home, {}, {animate: false});
        }
    }

    clickClose() {
        let actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Cancel Project',
                    role: 'destructive',
                    handler: () => {
                        this.nav.setRoot(Home, {}, {animate: false});
                    }
                }, {
                    text: 'Continue Project',
                    role: 'cancel',
                    handler: () => {
                    }
                }
            ]
        });
        actionSheet.present();
    }
}