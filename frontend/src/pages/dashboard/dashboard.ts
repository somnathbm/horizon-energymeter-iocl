import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';


@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.html'
})
export class Dashboard {

  constructor(private navCtrl: NavController) {

  }

  // memeber variables
  private isUsageView: boolean = false;

  // switch view from grid to analytics and vice versa
  switchView() {
    this.isUsageView = !this.isUsageView;
  }
}
