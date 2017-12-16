import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireList, AngularFireAction } from 'angularfire2/database';
import * as firebase from 'firebase/app';

import { ActivatedRoute } from '@angular/router';
import { Action } from 'rxjs/scheduler/Action';

@Injectable()
export class MapDataService {
    private areasRef: AngularFireList<any>;
    private areaKeys: Array<string> = [];
    private selectedAreaKeys: Array<string> = [];
    private areaRemovedCallbacks: Array<(any) => void> = [];
    private areaAddedCallbacks: Array<(any) => void> = [];
    private areaUpdatedCallbacks: Array<(any) => void> = [];

    public areas: Observable<any[]>;

    constructor(private db: AngularFireDatabase, private route: ActivatedRoute) {
        this.route.params.subscribe(params => {
            let map = params["id"] || "demo";
            console.log("MapData: Loading map '" + map + "'");
            this.loadMapData(map);
        });
    }

    private loadMapData(map: string) {
        this.areasRef = this.db.list('maps/' + map + "/areas");
        var mapData = this;
        // Use snapshotChanges().map() to store the key
        this.areas = this.areasRef.snapshotChanges().map(changes => {
            return changes.map(c => ({
                key: c.payload.key,
                get selected(): boolean { return mapData.selectedAreaKeys.indexOf(this.key) >= 0 },
                set selected(value: boolean) {
                    if (value && mapData.selectedAreaKeys.indexOf(this.key) < 0)
                        mapData.selectedAreaKeys.push(this.key)
                    else if (!value && mapData.selectedAreaKeys.indexOf(this.key) >= 0)
                        mapData.selectedAreaKeys.splice(mapData.selectedAreaKeys.indexOf(this.key), 1);
                },
                ...c.payload.val()
            }));
        });

        this.areasRef.auditTrail().subscribe(actions => {
            actions.forEach(action => {
                //console.log("MapData: Firebase ACTION: " + action.type + ", key: " + action.key);
                //console.log(action.payload.val());
                let area = this.getAreaFromAction(action);
                if (action.type == "child_added") {
                    if (this.areaKeys.indexOf(action.key) < 0) {
                        this.areaKeys.push(action.key);
                        this.areaAddedCallbacks.forEach(callback => {
                            callback(area);
                        });
                    }
                }
                else if (action.type == "child_changed") {
                    this.areaUpdatedCallbacks.forEach(callback => {
                        callback(area);
                    });
                }
                else if (action.type == "child_removed") {
                    if (this.areaKeys.indexOf(action.key) >= 0) {
                        this.areaKeys.splice(this.areaKeys.indexOf(action.key), 1);
                        this.areaRemovedCallbacks.forEach(callback => {
                            callback(area);
                        });
                    }
                }
            });
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

    public areaAdded(callback: (any) => void) {
        this.areaAddedCallbacks.push(callback);
    }

    public areaUpdated(callback: (any) => void) {
        this.areaUpdatedCallbacks.push(callback);
    }

    public areaRemoved(callback: (any) => void) {
        this.areaRemovedCallbacks.push(callback);
    }

    public addArea(area: any): void {
        this.areasRef.push(area);
    }
    public removeArea(area: any): void {
        this.areasRef.remove(area.key);
    }
    public updateArea(area: any): void {
        this.areasRef.update(area.key, area);
    }

    public getSelectedAreas(): Observable<any> {
        return Observable.create(observer => {
            this.areas.subscribe(areas => {
                areas.forEach(area => {
                    if (this.selectedAreaKeys.indexOf(area.key) >= 0)
                        observer.next(area);
                });
            });
        });
    }

    public selectAllAreas(selected = true): void {
        this.selectedAreaKeys = [];
        if (selected) {
            this.areas.subscribe(areas => {
                areas.forEach(area => {
                    this.selectedAreaKeys.push(area.key);
                });
            });
        }
    }
}