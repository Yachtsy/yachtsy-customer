import {Page, ModalController, LoadingController, NavController, ActionSheetController, NavParams} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {Home} from '../home/home';
import {Messages} from './messages'
import {RequestDetail} from './requestDetail'
import {RatingComponentUpdateable} from '../../components/ratingsComponent';
import GlobalService = require('../../components/globalService');

@Page({
    templateUrl: 'build/pages/requests/requestResponses.html',
    directives: [RatingComponentUpdateable]
})
export class RequestResponses {

    request: any;
    requestResponses: any;
    responses: any = [];
    lastMessages: any;
    totalReviews: number;

    constructor(public nav: NavController,
        public navParams: NavParams,
        public FBService: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        public loadingCtrl: LoadingController,
        public modalCtrl: ModalController) {
        this.request = this.navParams.get('req');
        console.log('req is:', this.request);
    }

    onPageWillEnter() {
        GlobalService.mainTabBarElement.style.display = 'none';
    }

    ngOnDestroy() {
        console.log('ngOnDestroy - requestDetail');
    }

    roundHalf(num) {
        return Math.round(num * 2) / 2;
    }


    profile;

    ngOnInit() {

        this.profile = {
            image: GlobalService.avatarImage,
        };

        console.log('ngOnInit - requestDetail = ', this.request);

        this.FBService.getMyResponses(this.request.id)
            .subscribe((data: any) => {
                console.log('my responses are', data);
                this.responses = data;
            });

        this.responses.map((response) => {
            let reviews = response.data.supplierReviews;

            let rating = 0;
            if (reviews !== 0) {

                Object.keys(reviews).map((key) => {
                    let thisRating = reviews[key].rating
                    console.log('rating: ', rating);
                    rating += thisRating;
                })
            }


            response.data.reviewRating = rating;
            if (rating > 0) {
                response.data.reviewRating /= Object.keys(reviews).length;
            }

            this.totalReviews = Object.keys(reviews).length;

        });

    }

    gotoMessages(item) {
        console.log('going to message for item: ');
        console.log(item);
        
        if (item.data.initialQuoteSeen != true)
            this.FBService.markRequestRead(this.request.id, item.id)
                .then((data) => {
                    console.log(data);
                });
        this.nav.push(Messages, { requestId: this.request.id, supplierId: item.id });
    }

    showRequestOptions() {

        let actionSheet = this.actionSheetCtrl.create({
            // title: 'Modify your album',
            buttons: [
                {
                    text: 'View Request Details',
                    handler: () => {
                        let modal = this.modalCtrl.create(RequestDetail, { reqId: this.request.id });
                        modal.present();
                    }
                }, {
                    text: 'Cancel Request',
                    role: 'destructive',
                    handler: () => {

                        let loading = this.loadingCtrl.create({
                            content: 'Canceling request',
                            dismissOnPageChange: true
                        });

                        loading.present().then(() => {
                            this.FBService.cancelRequest(this.request.id)
                                .then(() => {
                                    this.nav.pop();
                                });
                        });

                    }
                }, {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();

    }

}