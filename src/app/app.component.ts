import { Component } from '@angular/core';
import { SwPush } from "@angular/service-worker";
import { PushNotificationService } from './services/push-notification.service';

const VAPID_PUBLIC  = "BEgFkR4Fqp3wUzG3kM-oEaROGV22s00RTBDW3UZTgycdV0PLh0-N71WNIKjdFxd3m_NL-15BY_OCQASFpXrZPOs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'pushnotifications';

  /**
   * Thorugh dependecy injection we provide our app component the SwPush service to interact with Push Api.
   * @param SwPush Service provided by the angular service worker module. It is required for pushing notifications
   */
  constructor( private SwPush : SwPush , private pushNotification : PushNotificationService ){


    //check if the browser supports service workers
    if( SwPush.isEnabled){

      SwPush.requestSubscription({
        serverPublicKey :  VAPID_PUBLIC
      })
      .then( subscription => {
        
        //send subsription to server
        this.pushNotification.SendSubsriptionToService(subscription).subscribe() ;

      })
      .catch(console.error);
    
    }
  }
}
