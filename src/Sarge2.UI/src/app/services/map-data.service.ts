import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireList, AngularFireAction } from 'angularfire2/database';
import * as firebase from 'firebase/app';

import { ActivatedRoute } from '@angular/router';
import { Action } from 'rxjs/scheduler/Action';
import { MapDataItems } from '../models/map-data-items';
import { AuthService } from './auth.service';

@Injectable()
export class MapDataService {

    public areas: MapDataItems;
    public pois: MapDataItems;
    public tracks: MapDataItems;

    constructor(private db: AngularFireDatabase, private route: ActivatedRoute, private auth: AuthService) {
        this.areas = new MapDataItems(db, this.getAreaFromAction);
        this.pois = new MapDataItems(db, this.getPoiFromAction);
        this.tracks = new MapDataItems(db, this.getTrackFromAction);
    }

    public loadMap(mapName: string) {
        const map = mapName || 'demo';
        console.log('MapData: Loading map [' + map + ']');
        this.areas.loadData(map, 'areas', this.auth.userName);
        this.pois.loadData(map, 'pois', this.auth.userName);
        this.tracks.loadData(map, 'tracks', this.auth.userName);
    }
    private getTrackFromAction(action: AngularFireAction<firebase.database.DataSnapshot>) {
        return {
            key: action.key,
            points: action.payload.child('points').val(),
            strokeColor: action.payload.child('strokeColor').val() || 'green',
            strokeWidth: action.payload.child('strokeWidth').val() || 5,
            name: action.payload.child('name').val()
        };
    }
    private getAreaFromAction(action: AngularFireAction<firebase.database.DataSnapshot>) {
        return {
            key: action.key,
            coords: action.payload.child('coords').val(),
            strokeColor: action.payload.child('strokeColor').val() || 'blue',
            strokeWidth: action.payload.child('strokeWidth').val() || 2,
            fillColor: action.payload.child('fillColor').val() || '#ffff0011',
            name: action.payload.child('name').val()
        };
    }
    private getPoiFromAction(action: AngularFireAction<firebase.database.DataSnapshot>) {
        return {
            key: action.key,
            coords: action.payload.child('coords').val(),
            symbol: action.payload.child('symbol').val() || 'flag',
            name: action.payload.child('name').val()
        };
    }
}
