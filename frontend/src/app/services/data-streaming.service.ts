import { Injectable } from '@angular/core';

/* PubNub DSN library */
import { PubNubAngular } from 'pubnub-angular2';

@Injectable()
export class DataStreamingService {

  // PubNub production keyset
  private pubnubKeyProd = {
    publishKey: 'pub-c-86dc092f-1d14-4e82-84f0-c013e37af449',
    subscribeKey: 'sub-c-2960f386-1cf6-11e7-962a-02ee2ddab7fe'
  };

  // PubNub development keyset
  private pubnubKeyDev = {
    publishKey: 'pub-c-6373cc45-06e6-4b95-a759-1c04350b3f58',
    subscribeKey: 'sub-c-fbefaf14-1cf5-11e7-bc52-02ee2ddab7fe'
  };

  constructor(private pubnub: PubNubAngular) {}

  /* initialize PubNub SDK */
  initPubNubSDK() {
    this.pubnub.init(this.pubnubKeyDev);
  }


}
