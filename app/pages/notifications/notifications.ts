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
                        var curTime = new Date().getTime();
                        for (var j = 0; j < data[i].data.quotes.length; j++) {
                            if (data[i].data.quotes[j].data.initialQuoteSeen !== true)
                                unreadCount++;
                            if (data[i].data.quotes[j].data.timestamp) {
                                var dur = curTime - data[i].data.quotes[j].data.timestamp;
                                data[i].data.quotes[j].data.pasttime = this.getPastTimeString(dur) + ' ago';
                                if (dur <= 24 * 3600 * 1000)
                                    data[i].data.quotes[j].data.isNew = true;
                                else
                                    data[i].data.quotes[j].data.isNew = false;
                            }
                            else {
                                data[i].data.quotes[j].data.isNew = false;
                            }
                        }
                        data[i].data.unreadCount = unreadCount;
                    }
                }
                this.items = data;
                console.log(this.items);
            });
    }

    getPastTimeString(duration) {
        var dur = (duration - duration % 1000) / 1000;
        var ss, mm, hh, dd, oo, yy;

        ss = dur % 60; dur = (dur - ss) / 60;
        mm = dur % 60; dur = (dur - mm) / 60;
        hh = dur % 24; dur = (dur - hh) / 24;
        dd = dur % 30; dur = (dur - dd) / 30;
        oo = dur % 12; yy  = (dur - oo) / 12;

        if (yy > 0)
            return yy + 'y';
        else if (oo > 0)
            return oo + 'm';
        else if (dd > 0)
            return dd + 'd';
        else if (hh > 0)
            return hh + 'h';
        else if (mm > 0)
            return mm + 'm';
        else if (ss > 0)
            return ss + 's';
        else
            return 'now';
    };

    quoteClick(item, quote) {
        this.FBService.markRequestRead(item.id, quote.id)
            .then((data) => {
                console.log(data);
            });
    }
}
