import {Component, NgZone, ViewChild} from '@angular/core';
import {NavController, LoadingController, NavParams, Slides} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Requests} from '../requests/requests'
import {
    OnInit,
    OnDestroy
} from '@angular/core';
import {Form} from '../form/form';


@Component({
    templateUrl: 'build/pages/home/home.html',
})
export class Home {

    public slides: any;
    auth: any = {};

    activeUser: String;
    goToRequestsPageIfLoggedIn = true;

    categoryGroup   = [];
    categoryList    = [];
    categorySpec    = [];

    sliderOptions   = {};

    curPopularIndex = 0;
    popularCategoryList = [];

    constructor(public FBService: FirebaseService,
        public navController: NavController,
        public navParams: NavParams,
        private ngZone: NgZone,
        private loadingCtrl: LoadingController) {

        let self = this;
        this.sliderOptions = {
            initialSlide:   0,
            pager:          true,
            loop:           false,
            onInit: function(slides) {
                self.slides = slides;
            }
        };
    }

    doLogout() {

    }

    ngOnDestroy() {
        console.log('ngOnDestroy - home');
    }


    ionViewWillEnter() {
        // var els = document.getElementsByClassName("home show-page")
        // console.log('ELEMENTS:', els);
        // if (els) {
        //     if (els[0].classList.contains('hideme')) {
        //         console.log('going to remove..');
        //         els[0].classList.remove('hideme');
        //     }
        // }
    }

    ngOnInit() {
        console.log('ngOnInit');

        // let loading = this.loadingCtrl.create({
        //     content: ''
        // });

        // loading.present();

        this.getCategoryInfo();
    }

    onPopularSlideChanged() {
        if (this.slides)
            // this.curPopularIndex = (this.slides.activeIndex - 1 + this.popularCategoryList.length) % this.popularCategoryList.length;
            this.curPopularIndex = this.slides.activeIndex;
    }

    getCategoryInfo() {
        this.FBService.getCategories()
            .subscribe((data: Array<any>) => {

                this.ngZone.run(() => {
                    this.categoryList = data;
                    console.log('category data', data);
                    for (var i = 0; i < this.categoryList.length; i++)
                        this.FBService.getCategoryImage(this.categoryList[i]);
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
                //loading.dismiss();
            });
    }

    itemTapped(item) {

        // var loading = this.loadingCtrl.create({
        //     content: "Loading...",
        //     dismissOnPageChange: true
        // });

        // loading.present(loading)

        var categoryId = item.id;

        console.log(item);

        var categoryName = item.data.name;
        var locationType = item.data.locationType;

        // dynamically add in the location question ;)
        let categoryData = this.categorySpec[categoryId];

        if (categoryData.fields[0].type !== 'location') {
            if (locationType === "single") {
                categoryData.fields = this.locationSingle().concat(categoryData.fields);

            } else if (locationType === "multi") {
                categoryData.fields = this.locationMulti().concat(categoryData.fields);
            }
        }

        this.navController.push(Form, {
            index: 0,
            categoryData: categoryData,
            categoryId: categoryId,
            categoryName: categoryName,
            locationType: locationType
        }).then(() => {

            // if (locationType === "single" || locationType === "multi") {
            //     //var els = document.getElementsByTagName('ion-page');
            //     var els = document.getElementsByClassName("home show-page")
            //     //console.log('ELEMENTS:', els);
            //     if (els) {
            //         els[0].classList.add('hideme');
            //     }
            // }

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
        
    }

}
