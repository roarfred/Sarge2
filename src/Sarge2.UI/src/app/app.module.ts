import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Material Design
import { 
  MatButtonModule, MatCheckboxModule, MatSlideToggleModule, MatToolbarModule, 
  MatIconModule, MatSidenavModule, MatOptionModule, MatSelectModule, 
  MatGridListModule, MatInputModule, MatProgressSpinnerModule, MatProgressBarModule,
  MatCardModule
} from '@angular/material';

import { MapService } from './services/map.service';

import { AppComponent } from './app.component';
import { MapComponent } from './components/map.component';
import { LocationComponent } from './components/location.component';
import { UtmLocationPipe } from './pipes/utm-location.pipe';
import { PrintMenuComponent } from './components/print-menu.component';
import { TracksMenuComponent } from './components/tracks-menu.component';
import { AreasMenuComponent } from './components/areas-menu.component';
import { PoiMenuComponent } from './components/poi-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    LocationComponent,
    PrintMenuComponent,
    TracksMenuComponent,
    AreasMenuComponent,
    PoiMenuComponent,
    UtmLocationPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    
    // Material Design
    MatButtonModule, MatCheckboxModule, MatSlideToggleModule, MatToolbarModule, 
    MatIconModule, MatSidenavModule, MatOptionModule, MatSelectModule, 
    MatGridListModule, MatInputModule, MatProgressSpinnerModule, MatProgressBarModule,
    MatCardModule,

    FormsModule,
    HttpModule
  ],
  providers: [
    MapService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
