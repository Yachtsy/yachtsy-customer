import {Injectable} from '@angular/core';
import 'rxjs/Rx';
import {Observable} from "rxjs/Observable";

// declare var firebase: any;

@Injectable()
export class FirebaseService {

    constructor() {
        //console.log('*****8 FIREBASE CONSTRUCTOR');
    }

    logout() {
        return new Promise((resolve, reject) => {
            firebase.auth().signOut().then((data: any) => {
                resolve(data);
            });
        });
    }

    isAuthenticated() {
        return firebase.auth().currentUser !== null;
    }

    getAuthData() {
        return firebase.auth().currentUser;
    }

    getRandom() {
        return Math.floor(Math.random() * 1000000000) + '';
    }

    submitReview(review) {
        return this.doOperation('addReview', review);
    }

    userConfirmComplete(requestId, supplierId, confirmed) {

        var payload = {
            requestId: requestId,
            supplierId: supplierId,
            confirmed: confirmed
        };

        return this.doOperation('userConfirmComplete', payload);
    }

    doOperation(operation, payload) {

        var clientId = this.getRandom();

        var uid = firebase.auth().currentUser.uid;
        var op = {
            userId: uid,
            operationType: operation,
            payload: payload,
            clientOpId: clientId
        };

        return firebase.database().ref('queue/tasks').push(op)
            .then((data: any) => {

                var ref = firebase.database().ref().child('users').child(uid)
                    .child('notifications').child(clientId);

                return new Promise((resolve, reject) => {

                    ref.on('value', (notificationSnap) => {

                        if (notificationSnap.exists()) {

                            ref.off();
                            var notification = notificationSnap.val();
                            //console.log('GOT NOTIFICATION: ', notification);
                            if (!notification.error) {
                                data['clientId'] = clientId;
                                resolve(data);
                            } else {
                                console.log(notification.message);
                                reject(new Error(notification.stack));
                            }
                        } /*else {
                        console.log('NOTIFICATION **** does not exist');
                    }*/
                    });

                });
            });
    }

    createUser(userId, userdata) {

        let clientOpId = this.getRandom();

        let operation = {
            operationType: 'createUser',
            payload: userdata,
            clientOpId: clientOpId,
            userId: userId
        };

        var ref = firebase.database().ref().child('queue').child('tasks');

        return new Observable(observer => {
            ref.push(operation, (errorOrNull) => {
                if (errorOrNull) {
                    console.log('error saving user data:')
                    console.log(errorOrNull)
                    observer.error(errorOrNull)
                } else {
                    console.log('Requst to create user sent...');

                    var notificationRef = firebase.database().ref().child('users').child(userId).child('notifications').child(clientOpId);

                    notificationRef.on('value', (snapshot) => {
                        if (snapshot.exists()) {
                            notificationRef.off();
                            observer.next(snapshot.val());
                        }
                    });
                }
            });
        })
    }


    snapToArr(snapshot) {
        var arr = []
        if (snapshot.exists()) {
            var keys = Object.keys(snapshot.val());
            keys.map((key) => {
                arr.push({
                    id: key,
                    data: snapshot.val()[key]
                });
            });
        }
        return arr;
    }

    getMyRequests() {

        var authData = firebase.auth().currentUser
        var userRequestsRef = firebase.database().ref().child('users').child(authData.uid).child('requests');

        return new Observable(observer => {

            userRequestsRef.orderByChild("cancelled").equalTo(false).on('value',
                (snapshot) => {

                    console.log('requests: ', snapshot.val())
                    var arr = this.snapToArr(snapshot);
                    observer.next(arr);
                },
                (error) => {
                    console.log("ERROR:", error)
                    observer.error(error)
                });
        });
    }

    getRequest(requestId) {

        var authData = firebase.auth().currentUser
        var userRequestsRef = firebase.database().ref().child('users').child(authData.uid).child('requests').child(requestId);

        return new Observable(observer => {
            userRequestsRef.on('value',
                (snapshot) => {
                    var ret = {
                        id: snapshot.key,
                        data: snapshot.val()
                    }
                    observer.next(ret);
                },
                (error) => {
                    console.log("ERROR:", error)
                    observer.error(error)
                });
        });
    }


    getMyResponses(requestId) {

        var authData = firebase.auth().currentUser
        var userRequestsRef = firebase.database().ref().child('users').child(authData.uid).child('requests').child(requestId).child('quotes');

        return new Observable(observer => {
            userRequestsRef.on('value',
                (snapshot) => {
                    var arr = this.snapToArr(snapshot);
                    observer.next(arr);
                },
                (error) => {
                    console.log("ERROR:", error)
                    observer.error(error)
                });
        });
    }


    sendMessage(requestId, supplierId, message) {
        var authData = firebase.auth().currentUser
        var messagesRef = firebase.database().ref().child('messages').child(requestId).child(authData.uid).child(supplierId);

        var timestamp = {};
        timestamp['.sv'] = 'timestamp';

        var msgObj = {
            timestamp: timestamp,
            body: message,
            uid: authData.uid
        };

        messagesRef.push(msgObj, (error) => {

            if (!error) {
                console.log('pushed new message: ' + message);
            } else {
                console.log('error pushing message');
            }

        });
    }

    hire(requestId, supplierId) {

        var authData = firebase.auth().currentUser
        var userId = authData.uid;

        var hiresRef = firebase.database().ref().child('queue').child('tasks');

        let obj = {
            requestId: requestId,
            supplierId: supplierId
        };

        let operation = {
            userId: userId,
            operationType: 'hire',
            payload: obj,
            clientOpId: this.getRandom()
        }

        return new Observable(observer => {
            hiresRef.push(operation, (error) => {

                if (error) {
                    observer.error(error)
                } else {
                    observer.next();
                }
            });
        });
    }


    getMyMessages(requestId, supplierId) {

        var authData = firebase.auth().currentUser
        var msgRef = firebase.database().ref().child('messages').child(requestId).child(authData.uid).child(supplierId);

        return new Observable(observer => {
            msgRef.limitToLast(5).on('value',
                (snapshot) => {
                    var arr = this.snapToArr(snapshot);
                    observer.next(arr);
                },
                (error) => {
                    console.log("ERROR:", error)
                    observer.error(error)
                });
        });
    }

    getMyMessagesForAllSuppliers(requestId) {

        var authData = firebase.auth().currentUser;
        var userRequestsRef = firebase.database().ref().child('messages/' + requestId + '/' + authData.uid);

        return new Observable(observer => {
            userRequestsRef.on('value',
                (snapshot) => {
                    var arr = this.snapToArr(snapshot);
                    observer.next(arr);
                },
                (error) => {
                    console.log("ERROR:", error)
                    observer.error(error)
                });
        });
    }

    loginAnon() {
        return new Observable(observer => {
            firebase.auth().signInAnonymously().then(function (authData) {
                if (!authData) {
                    console.log('error logging in anonymously')
                    observer.error(null)
                } else {
                    console.log('user authenticated ANONYMOUSLY with payload', authData)
                    observer.next(authData)
                }
            })
        })
    }

    login(_username, password) {

        return new Observable(observer => {
            firebase.auth().signInWithEmailAndPassword(_username, password).then(function (authData) {
                observer.next(authData)
            });
        });
    }

    getCategoryGroup() {
        var ref = firebase.database().ref().child('groups')

        return new Observable(observer => {
            ref.on('value',
                (snapshot) => {
                    var arr = this.snapToArr(snapshot);
                    observer.next(arr)
                },
                (error) => {
                    console.log("ERROR:", error)
                    observer.error(error)
                });
        });
    }

    getCategories() {
        var ref = firebase.database().ref().child('categories')
        var that = this

        return new Observable(observer => {
            ref.on('value',
                (snapshot) => {
                    var arr = this.snapToArr(snapshot);
                    observer.next(arr)
                },
                (error) => {
                    console.log("ERROR:", error)
                    observer.error(error)
                });
        });
    }

    getPopularCategories() {
        var ref = firebase.database().ref().child('popularCategories')
        var that = this

        return new Observable(observer => {
            ref.on('value',
                (snapshot) => {
                    var data = snapshot.val();
                    var arr = data.split(',');
                    observer.next(arr)
                },
                (error) => {
                    console.log("ERROR:", error)
                    observer.error(error)
                });
        });        
    }

    getCategoryData(name) {
        return firebase.database().ref().child('categorySpec').child(name).once('value');
    }

    getCategorySpec() {
        return firebase.database().ref().child('categorySpec').once('value');
    }

    getCategoryName(categoryId) {

        var ref = firebase.database().ref().child('categories/' + categoryId);

        return new Observable(observer => {
            ref.on('value',
                (snapshot) => {
                    observer.next({
                        key: snapshot.key,
                        val: snapshot.val()
                    })
                },
                (error) => {
                    console.log("ERROR:", error)
                    observer.error(error)
                });
        });
    }

    getCategoryImage(item, zone) {
        var storageRef = firebase.storage().ref();
        storageRef.child('categories/' + item.id + '.jpg').getDownloadURL().then(function(url) {
            if (zone) {
                zone.run(() => {
                    item.image = url;
                });
            }
            else
                item.image = url;
        }).catch(function(error) {
            console.log(error);
        });
    }

    submitRequest(request) {

        //console.log('request to submit is: ');
        //console.log(request);

        var uid = this.getAuthData().uid;
        if (!uid) {
            throw new Error('Can not submit request without being authenticated');
        } else {
            // stamp userid on request
            request['uid'] = uid;
            request['date'] = this.firebaseServerTimestamp();

            let operation = {
                userId: uid,
                payload: request,
                operationType: 'newRequest',
                clientOpId: this.getRandom()
            }

            //console.log('operation is:', JSON.stringify(operation));

            var ref = firebase.database().ref().child('queue/tasks');

            return new Observable(observer => {
                var newRequestRef = ref.push(
                    operation
                    , (errorOrNull) => {

                        if (errorOrNull) {
                            console.log('error new request', errorOrNull)
                            observer.error(errorOrNull)
                        } else {
                            observer.next(newRequestRef.key);
                        }

                    });
            });
        }
    }

    firebaseServerTimestamp() {
        var timestamp = {};
        timestamp['.sv'] = 'timestamp';
        return timestamp;
    }

    cancelRequest(requestId) {

        var payload = {
            requestId: requestId
        };

        return this.doOperation('cancelRequest', payload);
    }

}
