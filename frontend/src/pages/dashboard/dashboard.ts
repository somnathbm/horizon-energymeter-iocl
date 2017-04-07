/* import core module first */
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/* import view classes */
import { SearchServo } from '../search/search';
import { NotificationSettings } from '../notification-settings/notification-settings';

/* import external library / modules */
import * as jsPDF from 'jspdf';

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

  // search servo
  searchServo() {
    this.navCtrl.push(SearchServo);
  }

  // configure notification configuration
  notifySettings() {
    this.navCtrl.push(NotificationSettings);
  }

  // export and download data
  downloadData() {

  }
}
