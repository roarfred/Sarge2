import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, Injectable } from '@angular/core';
import { MapComponent } from './components/map.component';
import { Location } from './models/location.model';
import { MatSidenav } from '@angular/material';

import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { GeoData } from './models/index';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { MapDataService } from './services/map-data.service';

@Component({
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, AfterViewInit {
  @ViewChild('myMap') myMap: MapComponent;
  @ViewChild('menu') menu: MatSidenav;

  public name: string;
  title = 'SARGE2';
  lock: boolean;
  ipp: Location;
  clickedLocation: Location;
  _mapLocation: Location;
  zoom: number;
  _saveTimeout = 0;
  menuName: string;
  menuNameChange = new EventEmitter<string>();
  maps: any;
  pois: any;

  constructor(private route: ActivatedRoute, mapData: MapDataService) {
    this.route.params.subscribe(params => {
      console.log('MainComponent: ', params, params['id']);
      mapData.loadMap(params['id']);
    });
  }

  @Output() mapLocationChange = new EventEmitter();

  @Input()
  get mapLocation(): Location {
    return this._mapLocation;
  }
  set mapLocation(location: Location) {
    this._mapLocation = location;
    this.mapLocationChange.emit(this._mapLocation);
    if (this._saveTimeout) {
      window.clearTimeout(this._saveTimeout);
      this._saveTimeout = 0;
    }
    this._saveTimeout = window.setTimeout(() => { this.saveSettings(); }, 1000);
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  ngAfterViewInit(): void {
  }

  saveSettings(): void {
    const settings = {
      location: this._mapLocation,
      zoom: this.myMap.zoom
    };
    console.log('Saving settings: ' + JSON.stringify(settings));
    localStorage.setItem('mapSettings', JSON.stringify(settings));
  }

  loadSettings(): void {
    const temp = localStorage.getItem('mapSettings');
    if (temp) {
      console.log('Read settings: ' + temp);
      const settings = JSON.parse(temp);
      this.mapLocation = new Location(settings.location.zone, settings.location.easting, settings.location.northing);
      this.myMap.zoom = settings.zoom;
    }
  }

  toggleMenu(name: string) {
    if (this.menu.opened && (this.menuName === name || !name)) {
      this.menu.close();
    } else if (name) {
      this.menuName = name;
      this.menuNameChange.emit(this.menuName);
      this.menu.open();
    }
  }

  setMapClickedLocation(location: Location): void {
    this.clickedLocation = location;
  }
}
