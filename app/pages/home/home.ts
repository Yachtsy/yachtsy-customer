import {Component, NgZone, ViewChild} from '@angular/core';
import {ModalController, NavController, LoadingController, NavParams, Slides} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Requests} from '../requests/requests'
import {
    OnInit,
    OnDestroy
} from '@angular/core';
import {Form} from '../form/form';
import {ModalsContentPage} from '../form/modal'
import GlobalService = require('../../components/globalService');

declare var FirebasePlugin;

@Component({
    templateUrl: 'build/pages/home/home.html',
})
export class Home {

    public slides: any;
    auth: any = {};

    isLoggedIn = false;
    activeUser: String;
    goToRequestsPageIfLoggedIn = true;

    categoryGroup = [];
    categoryList = [];
    categorySpec = [];

    dateTimeOptions = [];
    boatInfos = [];
    myBoats: any;

    sliderOptions = {};

    curPopularIndex = 0;
    popularCategoryList = [];

    profile

    constructor(public FBService: FirebaseService,
        public navController: NavController,
        public navParams: NavParams,
        private ngZone: NgZone,
        private modalCtrl: ModalController,
        private loadingCtrl: LoadingController) {

        let self = this;
        this.sliderOptions = {
            initialSlide: 0,
            autoplay: 5000,
            speed: 300,
            pager: true,
            loop: true,
            onInit: function (slides) {
                self.slides = slides;
            }
        };

        this.profile = {
            image: GlobalService.serviceImage,
        };
    }

    ngOnInit() {
        console.log('home ngOnInit');
        if (typeof firebase !== 'undefined') {
            this.isLoggedIn = this.FBService.isAuthenticated();

            this.getCategoryInfo();
            this.getMyRequests();
        }
    }

    onPageWillEnter() {
        GlobalService.mainTabBarElement.style.display = GlobalService.mainTabBarDefaultDisplayInfo;
    }

    ionViewWillEnter() {
        if (typeof firebase !== 'undefined') {
            this.isLoggedIn = this.FBService.isAuthenticated();
        }
    }

    onPopularSlideChanged() {
        if (this.slides)
            this.curPopularIndex = this.slides.activeIndex;
    }

    getMyRequests() {
        if (!this.isLoggedIn)
            return;

        this.FBService.getMyRequests()
            .subscribe((data: any) => {
                var unreadTotalCount = 0;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].data.quotes) {
                        data[i].data.quotes = this.FBService.objectToArr(data[i].data.quotes);
                        data[i].data.quotesLength = data[i].data.quotes.length;

                        var unreadCount = 0;
                        var curTime = new Date().getTime();
                        for (var j = 0; j < data[i].data.quotes.length; j++) {
                            if (data[i].data.quotes[j].data.initialQuoteSeen !== true)
                                unreadCount++;
                            if (data[i].data.quotes[j].data.timestamp) {
                                var dur = curTime - data[i].data.quotes[j].data.timestamp;
                                data[i].data.quotes[j].data.pasttime = this.getPastTimeString(dur) + ' ago';
                                if (dur <= 24 * 3600 * 1000)
                                    data[i].data.quotes[j].data.isNew = true;
                                else
                                    data[i].data.quotes[j].data.isNew = false;
                            }
                            else {
                                data[i].data.quotes[j].data.isNew = false;
                            }
                        }
                        data[i].data.unreadCount = unreadCount;
                        unreadTotalCount += unreadCount;
                    }
                    else
                        data[i].data.quotesLength = 0;
                }

                for (var i = 0; i < data.length; i++) {
                    for (var j = i + 1; j < data.length; j++) {
                        if (data[i].data.date < data[j].data.date) {
                            var tmp = {};
                            Object.assign(tmp, data[i]);
                            data[i] = data[j];
                            data[j] = tmp;
                        }
                    }
                }

                if (unreadTotalCount === 0)
                    GlobalService.tabBadgeInfo.count = '';
                else
                    GlobalService.tabBadgeInfo.count = unreadTotalCount + '';

                if (typeof FirebasePlugin !== 'undefined')
                    FirebasePlugin.setBadgeNumber(unreadTotalCount);

                GlobalService.myRequests.data = data;
                console.log(data);
            });

    }

    getPastTimeString(duration) {
        var dur = (duration - duration % 1000) / 1000;
        var ss, mm, hh, dd, oo, yy;

        ss = dur % 60; dur = (dur - ss) / 60;
        mm = dur % 60; dur = (dur - mm) / 60;
        hh = dur % 24; dur = (dur - hh) / 24;
        dd = dur % 30; dur = (dur - dd) / 30;
        oo = dur % 12; yy = (dur - oo) / 12;

        if (yy > 0)
            return yy + 'y';
        else if (oo > 0)
            return oo + 'm';
        else if (dd > 0)
            return dd + 'd';
        else if (hh > 0)
            return hh + 'h';
        else if (mm > 0)
            return mm + 'm';
        else if (ss > 0)
            return ss + 's';
        else
            return 'now';
    };

    getCategoryInfo() {
        this.FBService.getCategories()
            .subscribe((data: Array<any>) => {

                this.ngZone.run(() => {
                    this.categoryList = data;
                    console.log('category data', data);
                    for (var i = 0; i < this.categoryList.length; i++)
                        this.FBService.getCategoryImage(this.categoryList[i], this.ngZone);
                });

            });

        this.FBService.getPopularCategories()
            .subscribe((data: Array<any>) => {

                this.ngZone.run(() => {
                    this.popularCategoryList = data;
                    var i, j;
                    for (i = 0; i < this.popularCategoryList.length; i++) {
                        for (j = 0; j < this.categoryList.length; j++) {
                            if (parseInt(this.popularCategoryList[i]) === parseInt(this.categoryList[j].id)) {
                                this.popularCategoryList[i] = j;
                                break;
                            }
                        }
                    }
                });

            });

        this.FBService.getCategoryGroup()
            .subscribe((data: Array<any>) => {

                this.ngZone.run(() => {
                    this.categoryGroup = [];
                    var i, j, k;
                    for (i = 0; i < data.length; i++) {
                        if (data[i].data.enabled === true)
                            this.categoryGroup.push(data[i]);
                    }
                    for (i = 0; i < this.categoryGroup.length; i++) {
                        var categories = this.categoryGroup[i].data.categories;
                        for (j = 0; j < categories.length; j++) {
                            for (k = 0; k < this.categoryList.length; k++) {
                                if (parseInt(categories[j].id) === parseInt(this.categoryList[k].id))
                                    break;
                            }
                            if (k < this.categoryList.length) {
                                categories[j].idx = k;
                            }
                        }
                    }
                    console.log('category group', this.categoryGroup);
                });

            });

        this.FBService.getCategorySpec()
            .then((data) => {
                this.categorySpec = data.val();
            });

        this.FBService.getDateTimeOptions()
            .subscribe((data: Array<any>) => {
                this.dateTimeOptions = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id === 'date')
                        this.dateTimeOptions[0] = [data[i].data];
                    else if (data[i].id === 'time')
                        this.dateTimeOptions[1] = [data[i].data];
                }
                console.log(this.dateTimeOptions);
            });

        this.FBService.getBoatInfo()
            .subscribe((data: Array<any>) => {
                this.boatInfos = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].data.required === true) {
                        this.boatInfos.push(data[i].data);
                    }
                }
                console.log(this.boatInfos);
            });

        if (this.isLoggedIn) {
            this.FBService.getMyBoats()
                .subscribe((data: Array<any>) => {
                    this.myBoats = {
                        data: data
                    };
                });
        }
    }

    itemTapped(item) {
        var categoryId = item.id;
        var categoryName = item.data.name;
        let categoryData = JSON.parse(JSON.stringify(this.categorySpec[categoryId]));

        var requiresBoatInfo = item.data.requiresBoatInfo;
        if (requiresBoatInfo === true) {
            if (this.boatInfos)
                categoryData.fields = this.boatInfos.concat(categoryData.fields);
        }

        var boatListField = [{
            allows_multiple_values: false,
            label: "Which boat is this request for?",
            name: "Boat Information",
            possible_values: [],
            required: true,
            type: "enumeration",
            isBoatInfo: true,
        }];
        var myBoatsLength = 0;

        if (this.myBoats) {
            var myBoats = this.myBoats.data;
            myBoatsLength = myBoats.length;
            
            for (var i = 0; i < myBoats.length; i++) {
                boatListField[0].possible_values.push({
                    can_describe: false,
                    label: myBoats[i].data.boatName,
                    value: (i + 1)
                });
            }
        }

        boatListField[0].possible_values.push({
            can_describe: true,
            label: 'New Boat',
            value: (myBoatsLength + 1)
        });

        categoryData.fields = boatListField.concat(categoryData.fields);

        GlobalService.boatStartFormIndex = 1;
        GlobalService.boatInfoCount = this.boatInfos.length;

        // dynamically add in the date/time question ;)
        var dateType = item.data.dateType;
        var timeType = item.data.timeType;

        if (timeType === 'general') {
            if (this.dateTimeOptions[1]) {
                this.dateTimeOptions[1][0].isTimeForm = true;
                categoryData.fields = this.dateTimeOptions[1].concat(categoryData.fields);
                GlobalService.boatStartFormIndex++;
            }
        }
        if (dateType === 'general') {
            if (this.dateTimeOptions[0]) {
                this.dateTimeOptions[0][0].isDateForm = true;
                categoryData.fields = this.dateTimeOptions[0].concat(categoryData.fields);
                GlobalService.boatStartFormIndex++;
            }
        }

        // dynamically add in the location question ;)
        var locationType = item.data.locationType;

        if (categoryData.fields[0].type !== 'location') {
            if (locationType === "single") {
                categoryData.fields = this.locationSingle().concat(categoryData.fields);

            } else if (locationType === "multi") {
                categoryData.fields = this.locationMulti().concat(categoryData.fields);
            }
            GlobalService.boatStartFormIndex++;
        }

        GlobalService.categoryData = categoryData;
        GlobalService.myBoats = this.myBoats;

        this.navController.push(Form, {
            categoryId: categoryId,
            categoryName: categoryName,
            locationType: locationType
        }).then(() => {
        });
    }

    locationSingle() {
        return [{
            "label": "In what location do you require this service?",
            "type": "location",
            "name": "Service location",
            "pro_category_preferences": false,
            "required": true,
            "allows_multiple_values": false,
            "render_as_tally": false,
            "possible_values": [
                {
                    "value": 1,
                    "label": "Port/marina (please specify)",
                    "can_describe": true,
                    "credit_price": null
                },
                {
                    "value": 2,
                    "label": "I'm not sure",
                    "can_describe": false,
                    "credit_price": null
                }
            ]
        }];
    }

    locationMulti() {
        return [
            {
                "label": "What is your approximate starting location?",
                "type": "location",
                "name": "Starting location",
                "pro_category_preferences": false,
                "required": true,
                "allows_multiple_values": false,
                "render_as_tally": false,
                "possible_values": [
                    {
                        "value": 1,
                        "label": "Port/marina (please specify)",
                        "can_describe": true,
                        "credit_price": null
                    },
                    {
                        "value": 2,
                        "label": "I'm not sure",
                        "can_describe": false,
                        "credit_price": null
                    }
                ]
            }];
    }

    loginClick() {
        let modal = this.modalCtrl.create(ModalsContentPage, { req: null });

        modal.present();
        modal.onDidDismiss((data) => {
        });
    }

}
