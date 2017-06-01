import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';

import { FusionApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { PopoverPage } from '../pages/about-popover/about-popover';
import { AccountPage } from '../pages/account/account';
import { AssetDetailPage } from '../pages/asset-detail/asset-detail';
import { AssetListPage } from '../pages/asset-list/asset-list';
import { ContactPage } from '../pages/contact/contact';
import { DeveloperSettingsPage } from '../pages/developer/developer-settings';
import { FormViewerTabsPage } from '../pages/formviewer/tabs/forms-viewer-tabs';
import { FormViewer } from '../pages/formviewer/form-viewer';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/google/nonnative/map';
import { ModalsFormDetailsPage } from '../pages/modals/formviewer/formdetails/form-details';
import { ModalsFormSettingsPage } from '../pages/modals/formviewer/settings/form-settings';
import { MapSettingsPage } from '../pages/modals/map/map-settings';
import { SchedulePage } from '../pages/schedule/schedule';
import { ScheduleFilterPage } from '../pages/schedule-filter/schedule-filter';
import { SessionDetailPage } from '../pages/session-detail/session-detail';
import { SignupPage } from '../pages/signup/signup';
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';

import { SignaturePadModule } from 'angular2-signaturepad';

// Providers
import { 
  TempFusionData,
  FormsService,
  CommonDataService,
  UserService,
  ApiService,
  SyncService,
  DalService,
  SqliteService,
  BarcodeService
}  from '../providers/index';

import { LogicService } from '../pages/formviewer/logic-service';
import { ValidationService } from '../pages/formviewer/validation-service';

// added for auth0
import { AuthConfig, AuthHttp } from 'angular2-jwt';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';

let storage = new Storage();

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': '16059fee',
  },
  'push': {
    'sender_id': '973052483919',
    'pluginConfig': {
      'ios': {
        'badge': true,
        'sound': true
      },
      'android': {
        'iconColor': '#343434'
      }
    }
  }
};

export function getAuthHttp(http) {
  return new AuthHttp(new AuthConfig({
    headerPrefix: 'JWT',
    noJwtError: true,
    globalHeaders: [{'Accept': 'application/json'}],
    tokenGetter: (() => storage.get('id_token')),
  }), http);
}

@NgModule({
  declarations: [
    FusionApp,
    AboutPage,
    PopoverPage,
    AccountPage,
    AssetDetailPage,
    AssetListPage,
    ContactPage,
    DeveloperSettingsPage,
    FormViewerTabsPage,
    FormViewer,
    LoginPage,
    MapPage,
    ModalsFormDetailsPage,
    ModalsFormSettingsPage,
    MapSettingsPage,
    SchedulePage,
    ScheduleFilterPage,
    SessionDetailPage,            
    SignupPage,
    TabsPage,
    TutorialPage
  ],
  imports: [
    IonicModule.forRoot(FusionApp),
    CloudModule.forRoot(cloudSettings),
    SignaturePadModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    FusionApp,
    AboutPage,
    PopoverPage,
    AccountPage,
    AssetDetailPage,
    AssetListPage,
    ContactPage,
    DeveloperSettingsPage,
    FormViewerTabsPage,
    FormViewer,
    LoginPage,
    MapPage,
    ModalsFormDetailsPage,
    ModalsFormSettingsPage,
    MapSettingsPage,
    SchedulePage,
    ScheduleFilterPage,
    SessionDetailPage,            
    SignupPage,
    TabsPage,
    TutorialPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    TempFusionData,
    FormsService,
    CommonDataService,
    UserService,
    ApiService,
    SyncService,
    DalService,
    SqliteService,
    LogicService,
    ValidationService,
    BarcodeService,
    AuthHttp,
    {
      provide: AuthHttp,
      useFactory: getAuthHttp,
      deps: [Http]
    }
  ]
})
export class AppModule {}
