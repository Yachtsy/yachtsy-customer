import {Component} from '@angular/core';
import {Modal, NavParams, NavController, ViewController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {RatingComponentUpdateable} from '../../components/ratingsComponent';
import GlobalService = require('../../components/globalService');

@Component({
    templateUrl: 'build/pages/view-reviews/view-reviews.html',
    providers: [FirebaseService],
    directives: [RatingComponentUpdateable]
})
export class ViewReviewsPage {

    reviews;
    profile;
    totalReviews;

    constructor(private viewCtrl: ViewController, public navParams: NavParams, public nav: NavController, public fbserv: FirebaseService) {
        console.log('nav params for REVIEWS modal', this.navParams);
        this.reviews = this.navParams.get('reviews');

        this.profile = {
            image: GlobalService.avatarImage,
        };

        this.reviews = Object.keys(this.reviews).map((key) => {
            let item = this.reviews[key];
            return {
                rating: item.rating,
                comments: item.comments
            };
        });

        this.totalReviews = this.reviews.length;
    }

    close() {
        this.viewCtrl.dismiss();
    }

}