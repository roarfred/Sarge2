import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { ColorPickerModule } from 'ngx-color-picker';

import { LocationComponent } from '../../components/location.component';
import { UtmLocationPipe } from '../../pipes/utm-location.pipe';
import { DirectionPipe } from '../../pipes/direction.pipe';
import { DistancePipe } from '../../pipes/distance.pipe';
import { AreaPipe } from '../../pipes/area.pipe';
import { TimespanPipe } from '../../pipes/timespan.pipe';

import { MenuButtonsComponent } from './menu-buttons.component';

import { MeasureMenuComponent } from './measure-menu.component';
import { PrintMenuComponent } from './print-menu.component';
import { TracksMenuComponent } from './tracks-menu.component';
import { AreasMenuComponent } from './areas-menu.component';
import { AreasStyleDialog } from './areas-style.dialog';
import { PoisMenuComponent } from './pois-menu.component';
import { ImportMenuComponent } from './import-menu.component';

import { MeasureLineComponent } from './measure/measure-line.component';
import { MeasureAreaComponent } from './measure/measure-area.component';
import { MeasureTrackComponent } from './measure/measure-track.component';
import { MeasureCircleComponent } from './measure/measure-circle.component';


@NgModule({
    declarations: [
        MenuButtonsComponent,

        PrintMenuComponent, 
        MeasureMenuComponent,
        TracksMenuComponent, 
        AreasMenuComponent, 
        AreasStyleDialog,
        PoisMenuComponent,
        LocationComponent,
        ImportMenuComponent,

        MeasureLineComponent,
        MeasureAreaComponent,
        MeasureTrackComponent,
        MeasureCircleComponent,

        UtmLocationPipe,
        DistancePipe,
        DirectionPipe,
        AreaPipe,
        TimespanPipe
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        FlexLayoutModule,
        FileUploadModule,
        ColorPickerModule
    ],
    entryComponents: [
        AreasStyleDialog
    ],
    exports: [ 
        MenuButtonsComponent, 
        MeasureMenuComponent, 
        PrintMenuComponent, 
        TracksMenuComponent, 
        AreasMenuComponent, 
        PoisMenuComponent, 
        LocationComponent,
        ImportMenuComponent
    ]
})
export class MenuModule { };