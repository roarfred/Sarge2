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

    constructor(private db: AngularFireDatabase, private route: ActivatedRoute, private auth: AuthService) {
        this.areas = new MapDataItems(db, this.getAreaFromAction);

        this.route.params.subscribe(params => {
            let map = params["id"] || "demo";
            console.log("MapData: Loading map '" + map + "'");
            this.areas.loadData(map, "areas", auth.userName);
        });
    }

    private getAreaFromAction(action: AngularFireAction<firebase.database.DataSnapshot>) {
        return {
            key: action.key,
            coords: action.payload.child("coords").val(),
            strokeColor: action.payload.child("strokeColor").val() || "blue",
            strokeWidth: action.payload.child("strokeWidth").val() || 2,
            fillColor: action.payload.child("fillColor").val() || "#ffff0011",
            name: action.payload.child("name").val()
        };
    }
}