import {Component} from '@angular/core';
import {Modal, NavParams, NavController, ViewController} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService';
import {SecurityContext, DomSanitizationService} from '@angular/platform-browser';

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
    private sanitizer: DomSanitizationService,
    public fbserv: FirebaseService) {
    console.log('nav params for completion modal', this.navParams);
    this.requestId = this.navParams.get('requestId');
    this.supplierId = this.navParams.get('supplierId');
    this.firstName = this.navParams.get('firstName');
    this.lastName = this.navParams.get('lastName');
  }

  profileImage

  getSafeURL(url) {
    var safe_url = this.sanitizer.bypassSecurityTrustStyle('url(' + url + ')');
    return safe_url;
  }

  ngOnInit() {

    this.fbserv.getRequest(this.requestId)
      .subscribe((res: any) => {
        this.request = res.data;
        console.log('the request is: ', this.request);

        let profile = this.request.quotes[this.supplierId].supplierProfile;

        if (typeof profile.photo === 'string' && profile.photo.length > 0) {
          var profileImage = profile.photo;
          profileImage = profileImage.replace(/\r?\n|\r/g, '');
          this.profileImage = this.getSafeURL(profileImage);
        }

      });
  }

  close() {
    return this.viewCtrl.dismiss()
  }

  yes() {
    this.close().then(() => {
      this.fbserv.userConfirmComplete(this.requestId, this.supplierId, true);
    });
  }

  no() {
    this.close().then(() => {
      this.fbserv.userConfirmComplete(this.requestId, this.supplierId, false);
    });
  }

}