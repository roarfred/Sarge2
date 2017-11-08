import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LocationComponent } from '../../components/location.component';
import { UtmLocationPipe } from '../../pipes/utm-location.pipe';
import { DirectionPipe } from '../../pipes/direction.pipe';
import { DistancePipe } from '../../pipes/distance.pipe';

import { MeasureMenuComponent } from './measure-menu.component';
import { PrintMenuComponent } from './print-menu.component';
import { TracksMenuComponent } from './tracks-menu.component';
import { AreasMenuComponent } from './areas-menu.component';
import { PoiMenuComponent } from './poi-menu.component';
import { MaterialModule } from '../../material.module';

@NgModule({
    declarations: [
        PrintMenuComponent, 
        MeasureMenuComponent,
        TracksMenuComponent, 
        AreasMenuComponent, 
        PoiMenuComponent,
        LocationComponent,
        UtmLocationPipe,
        DistancePipe,
        DirectionPipe
    ],
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule      
    ],
    exports: [ MeasureMenuComponent, PrintMenuComponent, TracksMenuComponent, AreasMenuComponent, PoiMenuComponent, LocationComponent ]
})
export class MenuModule { };