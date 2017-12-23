import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { Location } from '../models/location.model';

declare var proj4: any;

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent  {
    _location: Location;
    editEasting: string;
    editNorthing: string;

    @Input()
    get location(): Location {
        return this._location;
    }
    set location(location: Location) {
        this._location = location;
        this.locationChange.emit(this._location);
    }
    @Output()
    locationChange = new EventEmitter();

    @Input()
    public editMode = false;
    @Input()
    public editable = false;
    edit(): void {
        this.editMode = !this.editMode;
        if (this.editMode) {
            this.editEasting = this.location.getLocalLocation().easting.toFixed(0);
            this.editNorthing = this.location.getLocalLocation().northing.toFixed(0);
        } else {
            this.location = new Location(
                this.location.getLocalLocation().zone,
                parseFloat(this.editEasting),
                parseFloat(this.editNorthing)
            ).getLocation(this.location.zone);
        }
    }
}
