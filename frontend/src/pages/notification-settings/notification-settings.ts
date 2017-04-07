import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'notification-settings',
  templateUrl: 'notification-settings.html'
})
export class NotificationSettings {
  constructor(private viewCtrl: ViewController) {}

  // close page
  closePage() {
    this.viewCtrl.dismiss();
  }
}
