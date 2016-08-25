import {Component} from '@angular/core';
import {Home} from '../home/home';
import {Requests} from '../requests/requests';
import {Notifications} from '../notifications/notifications';
import {Profile} from '../profile/profile';

@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})

export class Tabs {

  private tab1Root: any;
  private tab2Root: any;
  private tab3Root: any;
  private tab4Root: any;

  constructor() {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.tab1Root = Home;
    this.tab2Root = Requests;
    this.tab3Root = Notifications;
    this.tab4Root = Profile;
  }
}
