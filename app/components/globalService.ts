
'use strict';

export var mainTabRef;
export var mainTabBarElement;
export var mainTabBarDefaultDisplayInfo;
export var tabBadgeInfo = {
	count: 	''
};

export var pushToken = '';

export var myRequests = {
	data: 	[]
};

export var avatarImage = 'http://www.kodeinfo.com/admin/assets/img/avatars/default-avatar.jpg';
export var serviceImage = 'http://www.isic.cz/wp-content/plugins/orchitech-dm/resources/alive-dm/img/empty-image.png';

export var categoryData = [];
export var myBoats:any;
export var boatStartFormIndex = 0;
export var boatInfoCount = 0;

export var isOnlineStatus = false;

export var isOnline = function() {
	return (typeof firebase !== 'undefined' && isOnlineStatus);
}

export var clearData = function() {
  this.myRequests = [];
  this.myBoats = {};
}

export var displayOfflineAlert = function(alertCtrl) {
    let alert = alertCtrl.create({
      title: 'No Internet Connection',
      message: 'To use Thumbtack, please connect to Wi-Fi or enable cellular data.',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    alert.present();
  }
