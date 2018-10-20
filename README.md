# Push Notifications

This project demonstrates how we can push notifications to the browser. 

## Explanation

The __Push API__ and __Notifications API__ provides a complete notifications experience to the end user. In Angular we do this by leveraging the SwPush Service which handles the push notifications. An important requisite for having push notifications enabled is to make an active service worker for our app.
The following gives and overview about the API's we are talking about
1. __Push API__ : The Push Api gives ability to show notifications that are pushed from the web server.The Push API handles the subscription logic even when the app is not running in the Foreground.
2. __Notifications API__ : The Notifications API is responsive for actually displaying the notification with is _Notification_ _Interface_ 


## Getting Started

##### Setting Up
- Create a new Project with angular cli 

```
ng new AngularPushNotifications
```

- cd into AngularPushNotificatinos and Install Pwa and specify the project name that you just created

```
npm install --save @angular/pwa --project AngularPushNotifications
```

##### VAPID Key-Pair

In Order for Push Api to uniquely Identify the server and allow us to show notification we need to have a _VAPID Key Pair_. 
__VAPID__ Stands for _Voluntary Application Server Identification. A VAPID Key pair consist for two keys, A Public and A Private Key.
The public key is provided at frontend so is publicly available but the private key should be kept secret. 
- Whenever we send the notification from our server we will Sign it with this pair. 
- At the frontend the Push API should be able to validate our request on the basis of public key.

To Generate a VAPID Key Pair we need to install the web-push npm module. Using web-push we can generate the valid _VAPID_ Key Pair.

```
npm install -g web-push 
web-push generate-vapid-keys --json
```
Save the Key Pair generated we will be using it soon.

##### Allowing the Push Notifications

- We need to prompt for the permission to push the web notification. For this we will be using SwPush Service.
Open App.component.ts and edit the file with following Content.
```typescript
import { SwPush } from "@angular/service-worker";

const VAPID_PUBLIC = <public-key-generated-though-web-pus>
...

  constructor( private SwPush : SwPush ){
    if( SwPush.isEnabled){

      SwPush.requestSubscription({
        serverPublicKey :  VAPID_PUBLIC
      })
      .then( subscription => {
        
        //send subsription to server

      })
      .catch(console.error);
    
    }


```
We first import the SwPush Service and then inject in our AppComponent. We then check if the Push Notifications are enabled on the device or not. If it is enabled user will be given a permission popup for showing notifications. Once user allows our subscription 
request we recieve a subscription object that we can send to our server and whenever we want to push our notifications we will use this subscription object to do so.


- To Send it to Server we will be creating an additional service and injecting it with http to make call to our server. So , let generate a new service.

```
ng generate service services/PushNotification
```

This will create a new service in Services folder
Populate the file with following content

```typescript

import { Injectable } from '@angular/core';
import {Http} from '@angular/http';

const URL = 'http://localhost:3000/subscription/';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor( private _httpService : Http) { }

  SendSubsriptionToServer( subscription : PushSubscription){
    return this._httpService.post( URL , subscription  );
  }
}

```
Here we import the http service from http module for our ajax calls. We then inject it in our service and create a public function _SendSubscriptionToServer_ which takes 
  - subscription :  The Push Subscription object we get when user allows the request for push notifications
We then make a post http call to our server for future use.

- Modifying the AppComponent. Lets now just call our SendSubscriptionToServer by providing it in constructor and ther calling it when user approves the request.

  ```typescript
  ...
    import { PushNotificationService } from './services/push-notification.service';
    
  
    constructor( private SwPush : SwPush , private pushNotification : PushNotificationService )
    ...
  
  ...
      //send subscription to server
      this.pushNotification.SendSubsriptionToServer(subscription).subscribe() ;
  ...
  ```
Also Put this service in providers in app.module

```
import {PushNotificationService} from './services/push-notification.service';
...
  providers : [PushNotificationService]
...
```
with this we are set with our frontend. You can now just build it : ng build --prod and then launch it with http-server

```
ng build --prod
http-server dist/AngularPushNotifications
```



##### Setting Up Server

Install following packages
```
  npm install --save express web-push cors body-parser
```

Let's set up backend for this create a file called server.js in root of the project. 


```javascript

  const express = require('express');
  const webpush = require('web-push');
  const cors = require('cors');
  const bodyParser = require('body-parser');
  
  //your generated key pairs, 
  const PUBLIC_VAPID = '<your public key>';
  const PRIVATE_VAPID = '<your private key>';

  //use your database , this is for tutorial only.
  const fakeDatabase = [];

  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  webpush.setVapidDetails('mailto:yourname@domain.com', PUBLIC_VAPID, PRIVATE_VAPID);

  app.post('/subscription', (req, res) => {

    const subscription = req.body;
    fakeDatabase.push(subscription);
    return  res.sendStatus(200);
  });
  
  
  //sends push notifications ,  call it thorugh postman
  app.post('/sendNotification', (req, res) => {

    const notificationPayload = {
      notification: {
        title: 'New Notification',
        body: 'This is the body of the notification',
        icon: 'assets/icons/icon-512x512.png'
      }
    };

    const promises = [];
    fakeDatabase.forEach(subscription => {
      promises.push(webpush.sendNotification(subscription, JSON.stringify(notificationPayload)));
    });
    Promise.all(promises).then(() => res.sendStatus(200));
  });

  app.listen(3000, () => {
    console.log('Server started on port 3000');
  });

```

Run this server with 
```
node server.js
```

now you have a running backend. open your angular app that you ran with http-server command and allow the push notifications when prompted. this should send a post request to the backend and save it in our fake database. Then you can use postman to trigger push notifications by making a Post Rest Api call on /sendNotification 


**PS : Since you might be running you app multiple times to reset the permission for push notification just go to chrome://settings/content/notifications and remove localhost from there.**



#Resources

1. [Google Web - Introduction to Web Notifications](https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications)
2. [ Push API ](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
3. [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
