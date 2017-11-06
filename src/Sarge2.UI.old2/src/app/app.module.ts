import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


// Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCheckboxModule } from '@angular/material';

import { AppComponent }  from './app.component';
import { MapComponent } from './components/map.component';
import { LocationComponent } from './components/location.component';
import { UtmLocationPipe } from './pipes/utm-location.pipe';

@NgModule({
  imports:      [ 
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule, MatCheckboxModule
  ],
  declarations: [ 
    AppComponent, 
    MapComponent,
    LocationComponent,
    UtmLocationPipe
  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
