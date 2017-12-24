import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireList, AngularFireAction } from 'angularfire2/database';
import * as firebase from 'firebase/app';

import { ActivatedRoute } from '@angular/router';
import { Action } from 'rxjs/scheduler/Action';

export class MapDataItems {
    private user: string;
    private itemsRef: AngularFireList<any>;
    private itemKeys: Array<string> = [];
    private selectedItemKeys: Array<string> = [];
    private itemRemovedCallbacks: Array<(any) => void> = [];
    private itemAddedCallbacks: Array<(any) => void> = [];
    private itemUpdatedCallbacks: Array<(any) => void> = [];

    public items: Observable<any[]>;
    public count = 0;

    constructor(private db: AngularFireDatabase, private actionToItem: (action: AngularFireAction<firebase.database.DataSnapshot>) => any) {
    }

    public loadData(map: string, collection: string, user: string) {
        this.user = user;
        this.itemsRef = this.db.list(`maps/${map}/${collection}`);
        const mapData = this;

        // Use snapshotChanges().map() to store the key
        this.items = this.itemsRef.snapshotChanges().map(changes => {
            return changes.map(c => ({
                key: c.payload.key,
                ...c.payload.val()
            }));
        });

        this.items.subscribe(items => {
            this.count = items.length;
        });

        this.itemsRef.auditTrail().subscribe(actions => {
            actions.forEach(action => {
                const item = this.actionToItem(action);
                if (action.type === 'child_added') {
                    if (this.itemKeys.indexOf(action.key) < 0) {
                        this.itemKeys.push(action.key);
                        this.itemAddedCallbacks.forEach(callback => {
                            callback(item);
                        });
                    }
                } else if (action.type === 'child_changed') {
                    this.itemUpdatedCallbacks.forEach(callback => {
                        callback(item);
                    });
                } else if (action.type === 'child_removed') {
                    if (this.itemKeys.indexOf(action.key) >= 0) {
                        this.itemKeys.splice(this.itemKeys.indexOf(action.key), 1);
                        this.itemRemovedCallbacks.forEach(callback => {
                            callback(item);
                        });
                    }
                }
            });
        });
    }

    public itemAdded(callback: (any) => void) {
        this.itemAddedCallbacks.push(callback);
    }

    public itemUpdated(callback: (any) => void) {
        this.itemUpdatedCallbacks.push(callback);
    }

    public itemRemoved(callback: (any) => void) {
        this.itemRemovedCallbacks.push(callback);
    }

    public addItem(item: any): void {
        this.itemsRef.push(item);
    }
    public removeItem(item: any): void {
        this.itemsRef.remove(item.key);
    }
    public updateItem(item: any): void {
        this.itemsRef.update(item.key, item);
    }

    public async getSelected(): Promise<any[]> {
        const selected: any[] = [];
        const p = new Promise<any[]>(resolve => {
            if (this.items) {
                const sub = this.items.subscribe(next => {
                    next.forEach(item => {
                        if (this.selectedItemKeys.indexOf(item.key) >= 0) {
                            selected.push(item);
                        }
                    });
                    sub.unsubscribe();
                    resolve(selected);
                });
            } else {
                resolve([]);
            }
        });

        return p;
    }

    public setSelected(item: any, selected: boolean = true) {
        if (selected && this.selectedItemKeys.indexOf(item.key) < 0) {
            this.selectedItemKeys.push(item.key);
        } else if (!selected && this.selectedItemKeys.indexOf(item.key) >= 0) {
            this.selectedItemKeys.splice(this.selectedItemKeys.indexOf(item.key), 1);
        }
    }
    public isSelected(item: any): boolean {
        return this.selectedItemKeys.indexOf(item.key) >= 0;
    }

    public selectAll(selected = true): void {
        this.selectedItemKeys = [];
        if (selected) {
            const sub = this.items.subscribe(items => {
                items.forEach(item => {
                    this.selectedItemKeys.push(item.key);
                });
                sub.unsubscribe();
            });
        }
    }
}
