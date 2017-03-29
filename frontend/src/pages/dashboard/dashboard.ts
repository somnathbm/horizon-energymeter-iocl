import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { SupplyLine } from '../supply/supply';

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.html',
  providers: [SupplyLine]
})
export class Dashboard {

  constructor(private navCtrl: NavController, private supply: SupplyLine) {

  }

}
