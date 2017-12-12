import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, Injectable } from '@angular/core';
import { MapComponent } from './components/map.component';
import { Location } from './models/location.model';
import { MatSidenav } from '@angular/material';

import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { GeoData } from './models/index';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, AfterViewInit {
  @ViewChild('myMap') myMap: MapComponent;
  @ViewChild('menu') menu: MatSidenav;

  public mapData: Observable<{}>;
  public name: string;
  title = 'SARGE2';
  lock: boolean;
  ipp: Location;
  clickedLocation: Location;
  _mapLocation: Location;
  zoom: number;
  _saveTimeout: number = 0;
  menuName: string;
  menuNameChange = new EventEmitter<string>();
  maps: any;
  pois: any;

  constructor(
    private db: AngularFireDatabase,
    private route: ActivatedRoute
  ) {
    this.mapData = db.object('data').valueChanges();
  }

  @Output() mapLocationChange = new EventEmitter();

  @Input()
  get mapLocation(): Location {
    return this._mapLocation;
  };
  set mapLocation(location: Location) {
    this._mapLocation = location;
    this.mapLocationChange.emit(this._mapLocation);
    if (this._saveTimeout) {
      window.clearTimeout(this._saveTimeout);
      this._saveTimeout = 0;
    }
    this._saveTimeout = window.setTimeout(() => { this.saveSettings(); }, 1000);
  };

  ngOnInit(): void {
    this.loadSettings();
    this.route.params.subscribe(params => {
      console.log("Entered map: " + params["id"]);
    });
  };

  ngAfterViewInit(): void {
  };

  saveSettings(): void {
    let settings = {
      location: this._mapLocation,
      zoom: this.myMap.zoom
    };
    console.log("Saving settings: " + JSON.stringify(settings));
    localStorage.setItem("mapSettings", JSON.stringify(settings));
  };

  loadSettings(): void {
    let temp = localStorage.getItem("mapSettings");
    if (temp) {
      console.log("Read settings: " + temp);
      var settings = JSON.parse(temp);
      this.mapLocation = new Location(settings.location.zone, settings.location.easting, settings.location.northing);
      this.myMap.zoom = settings.zoom;
    }
  }

  toggleMenu(name: string) {
    if (this.menu.opened && (this.menuName == name || !name)) {
      this.menu.close();
    }
    else if (name) {
      this.menuName = name;
      this.menuNameChange.emit(this.menuName);
      this.menu.open();
    }
  };

  setMapClickedLocation(location: Location): void {
    this.clickedLocation = location;
  };
}
