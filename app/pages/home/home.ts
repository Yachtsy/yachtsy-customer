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
    isInitCategory = false;
    isInitRequests = false;

    isInit = false;

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
        console.log('HOME ngOnInit');
        this.getCategoryInfo();
        if (!firebase.auth().currentUser){
            console.log('NO USER SO clearing boats');
            this.myBoats = null;
        }
    }

    onPageWillEnter() {
        this.isLoggedIn = this.FBService.isAuthenticated();
        console.log('HOME - onPageWillEnter: ' + this.isLoggedIn);

        //if (this.isLoggedIn) {
        //    console.log('HOME - onPageWillEnter - logged in so setting TAB BAR DISPLAY');
        //    GlobalService.mainTabBarElement.style.display = GlobalService.mainTabBarDefaultDisplayInfo;
       // }
        //else {
        //    console.log('HOME - onPageWillEnter - NOT logged in so setting TAB BAR DISPLAY to NONE');
            
        //    GlobalService.mainTabBarElement.style.display = 'none';
        //}
    }

    onPopularSlideChanged() {
        if (this.slides) {
            this.curPopularIndex = this.slides.activeIndex;
        }
    }


    getCategoryInfo() {
        if (this.isInitCategory)
            return;

        this.isInitCategory = true;

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
                    //console.log('category group', this.categoryGroup);
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
                //console.log(this.dateTimeOptions);
            });

        this.FBService.getBoatInfo()
            .subscribe((data: Array<any>) => {
                this.boatInfos = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].data.required === true) {
                        this.boatInfos.push(data[i].data);
                    }
                }
                //console.log(this.boatInfos);
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
        console.log('item tapped');

        var categoryId = item.id;
        var categoryName = item.data.name;
        let categoryData = JSON.parse(JSON.stringify(this.categorySpec[categoryId]));
        var myBoats;

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
            myBoats = this.myBoats.data;
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

        console.log('nav -> form');
        let navParams = {
            categoryData: categoryData,
            myBoats: myBoats,
            categoryId: categoryId,
            categoryName: categoryName,
            locationType: locationType
        };

        this.formModal = this.modalCtrl.create(Form, navParams);
        this.formModal.present();
        this.formModal.onDidDismiss((data) => {
            console.log('modal dismiss');
            if (data && data.toRequest === true)
                GlobalService.mainTabRef.select(1);
        });

        //this.navController.push(Form, navParams);
    }

    formModal;

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
