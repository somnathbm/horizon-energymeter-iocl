import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { ChartsModule, BaseChartDirective } from 'ng2-charts';

/* custom service */
import { MobileBackendTransportService } from './services/mobile-backend.service';
import { DataStreamingService } from './services/data-streaming.service';

/* app root component */
import { MyApp } from './app.component';

/* view classes (components, directives, pipes) */
import { Dashboard } from '../pages/dashboard/dashboard';
import { SupplyLine } from '../pages/supply/supply';
import { Usage } from '../pages/usage/usage';
import { SearchServo } from '../pages/search/search';
import { NotificationSettings } from '../pages/notification-settings/notification-settings';

@NgModule({
  declarations: [
    MyApp,
    Dashboard,
    SupplyLine,
    Usage,
    SearchServo,
    NotificationSettings
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    ChartsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Dashboard,
    SearchServo,
    NotificationSettings
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, MobileBackendTransportService, DataStreamingService]
})
export class AppModule {}
