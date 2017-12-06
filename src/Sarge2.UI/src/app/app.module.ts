import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MapService } from './services/map.service';

import { MenuModule } from './components/menus/menu.module';
import { MaterialModule } from './material.module';

import { AppComponent } from './app.component';
import { MapComponent } from './components/map.component';
import { UserComponent } from './components/user.component';
import { LoginBoxComponent } from "./components/login-box.component";

import { AngularFireModule, FirebaseAppConfig } from 'angularfire2/angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireDatabaseModule } from 'angularfire2/database';

  // Initialize Firebase
  var fireBaseConfig : FirebaseAppConfig = {
    apiKey: "AIzaSyClG4XsgFDTcrDhBlSAtGy9RkrS2dCUDc4",
    authDomain: "sarge2-41ef7.firebaseapp.com",
    databaseURL: "https://sarge2-41ef7.firebaseio.com",
    projectId: "sarge2-41ef7",
    storageBucket: "",
    messagingSenderId: "1091128158107"
  };

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    UserComponent,
    LoginBoxComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MenuModule,
    MaterialModule,
    HttpModule,
    AngularFireModule.initializeApp(fireBaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  providers: [
    MapService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    LoginBoxComponent
  ]
})
export class AppModule { }
