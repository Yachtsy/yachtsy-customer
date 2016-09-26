
import {Component, ElementRef, ViewChild, NgZone} from '@angular/core';
import {ModalController, Content, Slides, NavController, ViewController, AlertController, LoadingController, ActionSheetController, NavParams, Platform} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {PROGRESSBAR_DIRECTIVES} from '../../components/progressbar';
import {Home} from '../home/home';
import {ModalsContentPage} from './modal'
import {NextContentPage} from './next'
import {GotContentPage} from './got'
import {Keyboard} from 'ionic-native';
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

    initLoading: any;

    @ViewChild('autocomplete') myElement: any;
    @ViewChild('autocomplete2') myElement2: any;

    @ViewChild(Content) content: Content;


    constructor(public nav: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public actionSheetCtrl: ActionSheetController,
        public alertCtrl: AlertController,
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
            }
        };
    }

    showNextButton = true;

    ngOnInit() {
        console.log('ngOnInit - form');

        this.maxStep = 1;
        this.formPageIndex = 0;
        this.formAnswers = [];
        this.answerObj = {};
        this.dateTime = null;

        console.log('init positions')
        this.contentsBottom = 44;
        this.footerBottom = 0;

        window.addEventListener('native.keyboardshow', (e) => {
            console.log('keyboard show')

            this.ngZone.run(() => {
                this.contentsBottom = e['keyboardHeight'];
                this.footerBottom = 0;
                // this.footerBottom = e['keyboardHeight'];
                this.showNextButton = false;

                setTimeout(() => {
                    //     this.content.scrollToBottom(300);
                    this.adjustScroll(false);
                }, 100);
            });
        });

        window.addEventListener('native.keyboardhide', (e) => {
            console.log('keyboard hide')

            this.ngZone.run(() => {
                this.contentsBottom = 0;
                this.footerBottom = 0;

                setTimeout(() => {
                    this.ngZone.run(() => {
                        this.showNextButton = true;
                    });
                }, 500)
            });
        });

        this.categoryData = GlobalService.categoryData;
        this.categoryDataFields = this.categoryData.fields;
        console.log('category data', this.categoryData)
        this.initFields();

        if (this.curField.type === 'location') {

            this.locationValue = ""
            this.locationStep = 1;
            this.locationSteps = 1;
            if (this.locationType === "multi") {
                this.locationSteps = 2;
            }
        }

        this.maxStep = this.categoryData.fields.length + 1;
    }

    adjustScroll(isTop) {
        this.content.scrollToTop();

        var scrolls = document.getElementsByClassName('swiper-slide');
        for (var i = 0; i < scrolls.length; i++) {
            var scroll_ele = scrolls[i];
            if (isTop)
                scroll_ele.scrollTop = 0;
            else
                scroll_ele.scrollTop = scroll_ele.scrollHeight;
        }
    }

    initFields() {
        if (this.formPageIndex === this.categoryData.fields.length - 1) {
            this.lastPage = true;
        }

        this.curField = this.categoryData.fields[this.formPageIndex];
        if (!this.formAnswers[this.formPageIndex]) {
            this.formAnswers[this.formPageIndex] = {
                'qu': this.curField.label,
                'ans': []
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


    back() {
        this.nav.pop();
    }


    lng
    lat
    placeName

    autocomplete1
    autocomplete2

    locationTimer
    isResultHidden

    categoryDataFields

    onPageWillEnter() {
        //GlobalService.mainTabBarElement.style.display = 'none';
    }

    pageElement
    ionViewWillEnter() {
        this.pageElement = document.getElementsByClassName('form')[0];
        this.pageElement.style.background = 'white';
    }

    ionViewWillLeave() {
        this.pageElement.style.background = 'none';
    }

    ionViewDidEnter() {
        console.log('form - ionViewWillEnter');

        this.adjustScroll(true);

        this.categoryId = this.navParams.get('categoryId');
        this.categoryName = this.navParams.get('categoryName');
        this.locationType = this.navParams.get('locationType');

        console.log('the category id is ', this.categoryId);


        this.myBoats = GlobalService.myBoats;

        console.log('about to init fields')

        // this.initLoading = this.loadingCtrl.create({
        //     content: 'Waiting...'
        // });
        // this.initLoading.present();

        if (this.curField.type === 'location') {

            this.locationValue = ""
            this.locationStep = 1;
            this.locationSteps = 1;
            if (this.locationType === "multi") {
                this.locationSteps = 2;
            }

            // let loading = this.loadingCtrl.create({
            //     content: "Loading map"
            // });

            // loading.present(loading)

            //let input_location = document.getElementById('autocomplete').getElementsByTagName('input')[0];
            //console.log(this.myElement);

            let options = {
                types: [],
                //componentRestrictions: { country: 'uk' }
            };

            setTimeout(() => {
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

                this.locationTimer = setInterval(() => {
                    var i = 0;
                    var popup_list = document.getElementsByClassName('pac-container');

                    if (!popup_list)
                        this.isResultHidden = true;
                    else {
                        for (i = 0; i < popup_list.length; i++) {
                            var popup: any;
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

                document.getElementById('autocomplete_1').focus();

                // this.initLoading.dismiss();
            }, 0);
        }
        // else
        //     this.initLoading.dismiss();
    }

    onSubmit(theForm) {
        console.log('form submitted');
        Keyboard.close();

        setTimeout(() => {
            this.next();
        }, 500)
    }


    place

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
            this.place = place;

            var locationAnswer = {
                lat: this.lat,
                lng: this.lng,
                placeName: this.placeName
            }

            this.ngZone.run(() => {
                this.formAnswers[this.formPageIndex]['ans'][this.locationStep - 1] = locationAnswer;
                this.formAnswersLength = this.formAnswers[this.formPageIndex]['ans'].length;
            });

        }

    }

    clicked(item) {
        console.log('clicked');

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
                this.adjustScroll(true);
            }
            else {
                this.formPageIndex++;
                this.initFields();
                this.slides.slideNext(true, 300);
                this.adjustScroll(true);
            }
            Keyboard.close();
        }
    }

    alert(title, subtitle, handler) {
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: subtitle,
            buttons: [{
                text: 'OK',
                handler: () => {
                    if (handler)
                        handler();
                }
            }]
        });
        alert.present();
    }

    submitRequest() {
        console.log('request submitted');
        //console.log(this.formAnswers);

        // if (!GlobalService.isOnline()) {
        //     GlobalService.displayOfflineAlert(this.alertCtrl);
        //     return;
        // }

        var request = { body: JSON.stringify(this.formAnswers) };
        request['categoryId'] = this.categoryId;

        request['locationName'] = this.place.formatted_address;
        request['googlePlaceInfo'] = {
            placeName: this.place.name,
            address: this.place.formatted_address,
            id: this.place.place_id,
            vicinity: this.place.vicinity ? this.place.vicinity : '',
            address_components: this.place.address_components,
            location: {
                latitude: this.place.geometry.location.lat(),
                longitude: this.place.geometry.location.lng()
            } 
        };

        // here we should check that the users is authenticated AND
        // that the user's account exists - trying to submit a request when you 
        // do not have an account will fail anyway.

        var boatInfo = null;
        if (this.boatIndex < 0) {
            boatInfo = {
                boatName: this.boatName,
                data: []
            };

            for (var i = 0; i < GlobalService.boatInfoCount; i++) {
                boatInfo.data.push(this.formAnswers[GlobalService.boatStartFormIndex + i]);
            }
        }

        if (this.FBService.isAuthenticated()) {

            console.log('requests is authenticated');

            let loading = this.loadingCtrl.create({
                content: 'Sending Request'
            });

            loading.present();

            this.FBService.addMyBoat(boatInfo);

            this.FBService.submitRequest(request)
                .subscribe((requestId) => {

                    console.log('after submit request');
                    console.log(requestId);

                    setTimeout(() => {
                        loading.dismiss().then(() => {
                            
                            let nextModal = this.modalCtrl.create(NextContentPage);

                            nextModal.present();
                            nextModal.onDidDismiss((data) => {

                                let gotModal = this.modalCtrl.create(GotContentPage);

                                gotModal.present();
                                gotModal.onDidDismiss((data) => {
                                    this.viewCtrl.dismiss({
                                        toRequest: true
                                    });
                                });

                            });
                        });

                    }, 1000);

                }, (error) => {
                    console.log('error submitting request')
                    console.log(error);
                    setTimeout(() => {
                        loading.dismiss().then(() => {
                            this.alert("Error submitting request:", error.message, null);
                        });
                    }, 1000);
                });

        } else {

            console.log('request not authenticaed - presenting modal');
            let modal = this.modalCtrl.create(ModalsContentPage, { req: request, boat: boatInfo });
            modal.present();

            modal.onDidDismiss((data) => {
                if (data.cancel !== true) {
                    setTimeout(() => {
                        this.viewCtrl.dismiss({
                            toRequest: true
                        });
                    }, 500);
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
                this.adjustScroll(true);
            }
            else {
                this.formPageIndex--;
                this.initFields();
                this.slides.slidePrev(true, 300);
                this.adjustScroll(true);
            }
            Keyboard.close();
        }
        else {
            this.viewCtrl.dismiss();
        }
    }

    clickClose() {
        let actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Cancel Project',
                    role: 'destructive',
                    handler: () => {
                        // this.nav.setRoot(Home, {}, {animate: false});
                        this.viewCtrl.dismiss();
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