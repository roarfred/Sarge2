import { Component, OnInit } from '@angular/core';
import { MapComponent } from './components/map.component';
import { Location } from './models/location.model';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html'
})
export class AppComponent  { 
  lock: boolean;
  ipp: Location;
  mapLocation: Location;
  clickedLocation: Location;

  setMapClickedLocation(location:Location):void {
    this.clickedLocation = location;
  }
}
