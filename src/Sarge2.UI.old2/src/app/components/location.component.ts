import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '../models/location.model';

declare var proj4:any;

@Component({
  selector: 'my-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent  { 
    _location : Location;

    @Input() 
    get location() : Location {
        return this._location;
    }
    set location(location:Location) {
        this._location = location;
        this.locationChange.emit(this._location);
    }
    @Output()
    locationChange = new EventEmitter();
}