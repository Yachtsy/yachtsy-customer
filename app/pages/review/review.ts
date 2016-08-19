import {Component} from '@angular/core';
import {Modal, NavParams, NavController, ViewController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {RatingComponentUpdateable} from '../../components/ratingsComponent';

@Component({
  templateUrl: 'build/pages/review/review.html',
  providers: [FirebaseService],
  directives: [RatingComponentUpdateable]
})
export class ReviewModal {

  requestId
  supplierId
  rating: number

  constructor(private viewCtrl: ViewController, public navParams: NavParams, public nav: NavController, public fbserv: FirebaseService) {
    console.log('nav params for completion modal', this.navParams);
    this.requestId = this.navParams.get('requestId');
    this.supplierId = this.navParams.get('supplierId');
  }

  close() {
    this.viewCtrl.dismiss();
  }

  onRatingChange(event) {
    this.rating = event;
  }

  submitReview() {
    var reviewObj = {
      requestId: this.requestId,
      supplierId: this.supplierId,
      review: {
        rating: this.rating,
        comments: "he is great"
      }
    }
    this.fbserv.submitReview(reviewObj)
      .then(() => {
        this.close();
      })
  }


}