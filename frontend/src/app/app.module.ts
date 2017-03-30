import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { ChartsModule, BaseChartDirective } from 'ng2-charts';

import { MyApp } from './app.component';
import { Dashboard } from '../pages/dashboard/dashboard';
import { SupplyLine } from '../pages/supply/supply';
import { Usage } from '../pages/usage/usage';

@NgModule({
  declarations: [
    MyApp,
    Dashboard,
    SupplyLine,
    Usage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    ChartsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Dashboard,
    SupplyLine,
    Usage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
