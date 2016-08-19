import {Component} from '@angular/core';
import {Modal, NavParams, NavController, ViewController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';

@Component({
  templateUrl: 'build/pages/completion/completion.html',
  providers: [FirebaseService]
})
export class CompletionModal {

  requestId
  supplierId
  request
  firstName
  lastName

  constructor(private viewCtrl: ViewController,
    public navParams: NavParams,
    public nav: NavController,
    public fbserv: FirebaseService) {
    console.log('nav params for completion modal', this.navParams);
    this.requestId = this.navParams.get('requestId');
    this.supplierId = this.navParams.get('supplierId');
    this.firstName = this.navParams.get('firstName');
    this.lastName = this.navParams.get('lastName');
  }

  ngOnInit() {

    this.fbserv.getRequest(this.requestId)
      .subscribe((res: any) => {
        this.request = res.data;
        console.log('the request is: ', this.request);
      });
  }

  close() {
    this.viewCtrl.dismiss();
  }

  yes() {
    this.fbserv.userConfirmComplete(this.requestId, this.supplierId, true)
      .then(() => {
        this.close();
      });
  }

  no() {
    this.close();

    this.fbserv.userConfirmComplete(this.requestId, this.supplierId, false)
      .then(() => {
        this.close();
      });
  }


}