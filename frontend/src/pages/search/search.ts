import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'search',
  templateUrl: 'search.html'
})
export class SearchServo {
  constructor(private viewCtrl: ViewController) {}

  // dismiss search page
  closePage() {
    this.viewCtrl.dismiss();
  }
}
