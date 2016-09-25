import {Component} from '@angular/core';
import {Modal, NavParams, NavController, ViewController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {RatingComponentUpdateable} from '../../components/ratingsComponent';

@Component({
  templateUrl: 'build/pages/view-reviews/view-reviews.html',
  providers: [FirebaseService],
  directives: [RatingComponentUpdateable]
})
export class ViewReviewsPage {

  reviews;
  constructor(private viewCtrl: ViewController, public navParams: NavParams, public nav: NavController, public fbserv: FirebaseService) {
    console.log('nav params for REVIEWS modal', this.navParams);
    this.reviews = this.navParams.get('reviews');
  }

  close() {
    this.viewCtrl.dismiss();
  }

}