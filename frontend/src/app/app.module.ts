import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { ChartsModule, BaseChartDirective } from 'ng2-charts';

/* custom service */
import { MobileBackendTransportService } from 'services/mobile-backend.service';

/* app root component */
import { MyApp } from './app.component';

/* view classes (components, directives, pipes) */
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
    Dashboard
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, MobileBackendTransportService]
})
export class AppModule {}
