import {Component, NgZone} from '@angular/core';
import {NavController, LoadingController, NavParams} from 'ionic-angular';
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

    auth: any = {};
    items = [];
    activeUser: String;
    goToRequestsPageIfLoggedIn = true;

    constructor(public FBService: FirebaseService,
        public navController: NavController,
        public navParams: NavParams,
        private ngZone: NgZone,
        private loadingCtrl: LoadingController) {

    }

    doLogout() {

    }

    ngOnDestroy() {
        console.log('ngOnDestroy - home');
    }

    categorySpec

    ionViewWillEnter() {
        var els = document.getElementsByClassName("home show-page")
        console.log('ELEMENTS:', els);
        if (els) {
            if (els[0].classList.contains('hideme')) {
                console.log('going to remove..');
                els[0].classList.remove('hideme');
            }
        }
    }

    ngOnInit() {
        console.log('ngOnInit');

        // let loading = this.loadingCtrl.create({
        //     content: ''
        // });

        // loading.present();

        this.getCategories();

        this.FBService.getCategorySpec()
            .then((data) => {
                this.categorySpec = data.val();
                //loading.dismiss();
            });
    }

    getCategories() {
        this.FBService.getCategories()
            .subscribe((data: Array<any>) => {

                this.ngZone.run(() => {
                    this.items = data
                    //console.log('category data', data);
                });

            })
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

            if (locationType === "single" || locationType === "multi") {
                //var els = document.getElementsByTagName('ion-page');
                var els = document.getElementsByClassName("home show-page")
                //console.log('ELEMENTS:', els);
                if (els) {
                    els[0].classList.add('hideme');
                }
            }

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

}
