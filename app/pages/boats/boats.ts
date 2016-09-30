
import {Component, ElementRef, ViewChild, NgZone} from '@angular/core';
import {ModalController, Content, Slides, NavController, ViewController, AlertController, LoadingController, ActionSheetController, NavParams, Platform} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {PROGRESSBAR_DIRECTIVES} from '../../components/progressbar';
import {Home} from '../home/home';
import {Keyboard} from 'ionic-native';
import GlobalService = require('../../components/globalService');

@Component({
    templateUrl: 'build/pages/boats/boats.html',
    directives: [PROGRESSBAR_DIRECTIVES]
})

export class Boats {

    formPageIndex = -1
    categoryData = null

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

    contentsBottom = 0;
    footerBottom = 0;

    boatIndex = -1;

    sliderOptions = {};
    slides: any;

    initLoading: any;

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
        console.log('ngOnInit - boats');

        this.maxStep = 1;
        this.formPageIndex = 0;
        this.formAnswers = [];
        this.answerObj = {};
        this.dateTime = null;

        this.boatIndex = -1;

        console.log('init positions')
        this.contentsBottom = 44;
        this.footerBottom = 0;

        if (this.platform.is('ios')) {
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
        }

        var categoryData = {
            fields:     []
        };

        if (GlobalService.boatInfos)
            categoryData.fields = GlobalService.boatInfos.concat(categoryData.fields);

        var boatListField = [{
            allows_multiple_values: false,
            label: "Which boat is this request for?",
            name: "Boat Information",
            possible_values: [],
            required: true,
            type: "enumeration",
            isBoatInfo: true,
        }];

        if (GlobalService.myBoats && GlobalService.myBoats.data) {
            for (var i = 0; i < GlobalService.myBoats.data.length; i++) {
                boatListField[0].possible_values.push({
                    can_describe: false,
                    label: GlobalService.myBoats.data[i].data.boatName,
                    value: (i + 1)
                });
            }
        }

        categoryData.fields = boatListField.concat(categoryData.fields);

        this.categoryData = categoryData;
        console.log('category data', this.categoryData)
        this.initFields();

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
            if (this.boatIndex >= 0) {
                var ans = [];
                var qalist = GlobalService.myBoats.data[this.boatIndex].data.data;
                for (var i = 0; i < qalist.length; i++) {
                    if (qalist[i].qu === this.curField.label) {
                        ans = qalist[i].ans;
                        break;
                    }
                }
                this.formAnswers[this.formPageIndex] = {
                    'qu': this.curField.label,
                    'ans': ans
                };

                if (ans.length > 0) {
                    if (ans[0].startsWith(GlobalService.descriptionIdentifier)) {
                        var label = ans[0].substr(GlobalService.descriptionIdentifier.length);
                        var field_label = '';
                        for (var i = 0; i < this.curField.possible_values.length; i++) {
                            if (this.curField.possible_values[i].can_describe === true) {
                                field_label = this.curField.possible_values[i].label;
                                break;
                            }
                        }

                        if (field_label !== '')
                            this.answerObj[field_label + this.formPageIndex] = label;
                    }
                }
            }
            else
                this.formAnswers[this.formPageIndex] = {};
        }
        console.log('init form answers', this.formAnswers);

        if (this.formAnswers[this.formPageIndex] && this.formAnswers[this.formPageIndex]['ans'])
            this.formAnswersLength = this.formAnswers[this.formPageIndex]['ans'].length;
        else
            this.formAnswersLength = 0;
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
                if (thisPageAnswers[i].startsWith(GlobalService.descriptionIdentifier)) {
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

                var desription = GlobalService.descriptionIdentifier + answerObj;

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
                this.formAnswers[this.formPageIndex]['ans'].push(GlobalService.descriptionIdentifier + answerObj);
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
        console.log('boats - ionViewWillEnter');

        this.adjustScroll(true);
    }

    onSubmit(theForm) {
        console.log('form submitted');
        if (Keyboard)
            Keyboard.close();

        setTimeout(() => {
            this.next();
        }, 500)
    }


    clicked(item) {
        console.log('clicked');

        if (item.can_describe) {
            //this.formAnswers[this.formPageIndex] = {};
            return;
        }

        if (this.formPageIndex === 0) {
            this.boatIndex = item.value - 1;
            this.next();
        }
        else {
            if (this.formAnswers[this.formPageIndex] && this.formAnswers[this.formPageIndex]['ans']) {
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
            }
        }
    }

    next() {
        this.formPageIndex++;
        this.initFields();
        this.slides.slideNext(true, 300);
        this.adjustScroll(true);

        if (Keyboard)
            Keyboard.close();
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

        if (this.boatIndex < 0)
            return;

        var boatId = GlobalService.myBoats.data[this.boatIndex].id;
        var boatInfo = {
            boatName: GlobalService.myBoats.data[this.boatIndex].data.boatName,
            data: []
        };

        for (var i = 0; i < GlobalService.boatInfos.length; i++) {
            boatInfo.data.push(this.formAnswers[i + 1]);
        }

        if (this.FBService.isAuthenticated()) {

            console.log('requests is authenticated');

            this.FBService.updateMyBoat(boatId, boatInfo);

            this.viewCtrl.dismiss();
        }
    }

    clickBack() {
        if (this.formPageIndex > 0) {
            this.formPageIndex--;
            this.initFields();
            this.slides.slidePrev(true, 300);
            this.adjustScroll(true);

            if (Keyboard)
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
                    text: 'Cancel Boat',
                    role: 'destructive',
                    handler: () => {
                        this.viewCtrl.dismiss();
                    }
                }, {
                    text: 'Continue Boat',
                    role: 'cancel',
                    handler: () => {
                    }
                }
            ]
        });
        actionSheet.present();
    }
}