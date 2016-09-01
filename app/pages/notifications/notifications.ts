import {Component, NgZone} from '@angular/core';
import {NavController, LoadingController, NavParams} from 'ionic-angular';
import {FirebaseService} from '../../components/firebaseService'
import {
    OnInit,
    OnDestroy
} from '@angular/core';
import {Form} from '../form/form';


@Component({
    templateUrl: 'build/pages/notifications/notifications.html',
})
export class Notifications {

    auth: any = {};
    items = [];

    constructor(public FBService: FirebaseService,
        public navController: NavController,
        public navParams: NavParams,
        private ngZone: NgZone,
        private loadingCtrl: LoadingController) {
    }

    ngOnDestroy() {
    }

    ngOnInit() {
        this.FBService.getMyRequests()
            .subscribe((data: any) => {

                for (var i = 0; i < data.length; i++) {
                    if (data[i].data.quotes) {
                        data[i].data.quotes = this.FBService.objectToArr(data[i].data.quotes);
                        var unreadCount = 0;
                        for (var j = 0; j < data[i].data.quotes.length; j++) {
                            if (!data[i].data.quotes[j].data.read)
                                unreadCount++;
                        }
                        data[i].data.unreadCount = unreadCount;
                    }
                }
                this.items = data;
                console.log(this.items);
            });
    }

    quoteClick(item, quote) {
        console.log(item); console.log(quote);
        this.FBService.markRequestRead(item.id, quote.id)
            .then((data) => {
                console.log(data);
            });
    }
}
