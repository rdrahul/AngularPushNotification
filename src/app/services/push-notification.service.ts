import { Injectable } from '@angular/core';
import {Http} from '@angular/http';

const URL = 'http://localhost:3000/subscription/';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor( private _httpService : Http) { }

  SendSubsriptionToService( subscription : PushSubscription){
    return this._httpService.post( URL , subscription  );
  }
}
