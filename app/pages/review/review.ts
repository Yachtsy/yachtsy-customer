import {Component} from '@angular/core';
import {Modal, NavParams, NavController, ViewController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {RatingComponentUpdateable} from '../../components/ratingsComponent';
import GlobalService = require('../../components/globalService');

@Component({
  templateUrl: 'build/pages/review/review.html',
  providers: [FirebaseService],
  directives: [RatingComponentUpdateable]
})
export class ReviewModal {

  requestId
  supplierId
  comments
  rating: number

  constructor(private viewCtrl: ViewController, public navParams: NavParams, public nav: NavController, public fbserv: FirebaseService) {
    console.log('nav params for completion modal', this.navParams);
    this.requestId = this.navParams.get('requestId');
    this.supplierId = this.navParams.get('supplierId');
  }

  close() {
    return this.viewCtrl.dismiss();
  }

  onRatingChange(event) {
    this.rating = event;
  }

  submitReview() {

    var reviewObj = {
      requestId: this.requestId,
      supplierId: this.supplierId,
      review: {
        reviewer: GlobalService.userProfile.firstName + ' ' + GlobalService.userProfile.lastName.substr(0, 1).toUpperCase() + '.',
        rating: this.rating,
        comments: this.comments
      }
    }

    this.close()
      .then(() => {
        this.fbserv.submitReview(reviewObj)
      });
  }

}