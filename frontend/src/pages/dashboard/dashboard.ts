import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { SupplyLine } from '../supply/supply';
import { Usage } from '../usage/usage';

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.html',
  providers: [Usage]
})
export class Dashboard {

  constructor(private navCtrl: NavController, private usage: Usage) {

  }

}
