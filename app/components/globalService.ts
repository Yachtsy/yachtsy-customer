
'use strict';

export var mainTabRef;
export var mainTabBarElement;
export var mainTabBarDefaultDisplayInfo;
export var tabBadgeInfo = {
  count: ''
};

export var pushToken = '';

export var myRequests = {
  data: []
};

export var avatarImage = 'img/default-photo.png';
export var serviceImage = 'img/default-service.png';

export var descriptionIdentifier = 'Description: ';

export var categoryData = [];
export var myBoats: any;
export var boatInfos: any;
export var boatStartFormIndex = 0;
export var boatInfoCount = 0;

export var userProfile = null;

// export var isOnlineStatus = false;

// export var isOnline = function () {
//   return (typeof firebase !== 'undefined' && isOnlineStatus);
// }

export var clearData = function () {
  this.myRequests = [];
  this.myBoats = {};
}

export var getPastTimeString = function (duration) {
    var dur = (duration - duration % 1000) / 1000;
    var ss, mm, hh, dd, oo, yy;

    ss = dur % 60; dur = (dur - ss) / 60;
    mm = dur % 60; dur = (dur - mm) / 60;
    hh = dur % 24; dur = (dur - hh) / 24;
    dd = dur % 30; dur = (dur - dd) / 30;
    oo = dur % 12; yy = (dur - oo) / 12;

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
      	return '1s';
}

export var getDurationString = function (duration) {
    if (duration < 0)
      return '';

    var dur = (duration - duration % 1000) / 1000;
    var ss, mm, hh, dd, oo, yy;

    ss = dur % 60; dur = (dur - ss) / 60;
    mm = dur % 60; dur = (dur - mm) / 60;
    hh = dur % 24; dur = (dur - hh) / 24;
    dd = dur % 30; dur = (dur - dd) / 30;
    oo = dur % 12; yy = (dur - oo) / 12;

    if (yy > 0)
        return yy + 'y ' + oo + 'm';
    else if (oo > 0)
        return oo + 'm ' + dd + 'd';
    else if (dd > 0)
        return dd + 'd ' + hh + 'h';
    else if (hh > 0)
        return hh + 'h ' + mm + 'm';
    else if (mm > 0)
        return mm + 'm ' + ss + 's';
    else if (ss > 0)
        return ss + 's';
    else
        return '1s';
}

export var doAlert = function(message, alertCtrl) {
	let alert = alertCtrl.create({
		title: 'Yachtsy',
		message: message,
		buttons: [
		  	{
			    text: 'OK',
			    role: 'cancel'
		  	}
		]
	});
	alert.present();
}

export var hideLocationList = function(isHide) {
  var list = document.getElementsByClassName('pac-container');
  if (list) {
    for (var i = 0; i < list.length; i++)
      if (isHide) {
        (<HTMLInputElement>list[i]).className = (<HTMLInputElement>list[i]).className.replace(' hide', '');
        (<HTMLInputElement>list[i]).className += ' hide';
      }
      else
        (<HTMLInputElement>list[i]).className = (<HTMLInputElement>list[i]).className.replace(' hide', '');
  }
}
