import { Inject, Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { ActivatedRoute } from '@angular/router';
import { MapDataService } from '../../services/map-data.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TracksStyleDialogComponent } from './tracks-style-dialog.component';
import { TimePoint } from '../../models';

declare var ol: any;

@Component({
    selector: 'app-tracks-menu',
    templateUrl: 'tracks-menu.component.html',
    styleUrls: ['tracks-menu.component.css']
})
export class TracksMenuComponent implements OnInit {
    public defaultStrokeColor = '#1a80009e';
    public defaultStrokeWidth = 5;

    private drawingLayer: any;
    private displayLayer: any;
    private displaySource: any;
    private draw: any;
    private style: any;
    private source: any;
    private edit: any = null;

    public selectAllOption = true;

    @Input()
    public map: any;
    trackFeatures: any = {};

    constructor(private mapData: MapDataService, public dialog: MatDialog) {
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(TracksStyleDialogComponent, {
            width: '250px',
            data: { strokeColor: this.defaultStrokeColor, strokeWidth: this.defaultStrokeWidth }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.defaultStrokeColor = result.strokeColor;
                this.defaultStrokeWidth = result.strokeWidth;

                this.mapData.tracks.getSelected().then(tracks => tracks.forEach(track => {
                    track.strokeColor = this.defaultStrokeColor;
                    track.strokeWidth = this.defaultStrokeWidth;
                    this.saveItem(track);

                    this.trackFeatures[track.key].setStyle(new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: track.strokeColor,
                            width: track.strokeWidth
                        }),
                        text: new ol.style.Text({
                            text: track.text
                        })
                    }));
                }));
            }
        });
    }

    trackAdded(track: any): void {
        if (this.trackFeatures[track.key] == null) {
            const coords = track.points.map(trackPoint => {
                return [trackPoint.position.longitude, trackPoint.position.latitude];
            });
            const line = new ol.geom.LineString(coords);

            line.transform('EPSG:4326', 'EPSG:32633');
            // Create feature with polygon.
            const feature = new ol.Feature({
                geometry: line
            });
            feature.setStyle(this.getTrackStyle(track));

            if (this.displaySource == null) {
                this.displaySource = new ol.source.Vector({ wrapX: false });
                this.displayLayer = new ol.layer.Vector({
                    source: this.displaySource,
                    zIndex: 99
                });
                this.map.addLayer(this.displayLayer);
            }
            this.displaySource.addFeature(feature);
            this.trackFeatures[track.key] = feature;
        }
    }

    trackUpdated(track: any): void {
        console.log('Track updated: ' + track.name);
        console.log(track);

        const feature = this.trackFeatures[track.key];
        if (feature) {
            const coords = track.points.map(trackPoint => {
                return [trackPoint.position.longitude, trackPoint.position.latitude];
            });
            const line = new ol.geom.LineString(coords);
            line.transform('EPSG:4326', 'EPSG:32633');
            feature.setGeometry(line);
            feature.setStyle(this.getTrackStyle(track));
        }
    }

    private getTrackStyle(track: any): any {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: track.strokeColor,
                width: track.strokeWidth
            }),
            text: new ol.style.Text({
                text: track.text
            })
        });
    }

    trackRemoved(track: any): void {
        if (this.trackFeatures[track.key] != null) {
            this.displaySource.removeFeature(this.trackFeatures[track.key]);
            this.trackFeatures[track.key] = null;
        }
    }

    public ngOnInit(): void {
        this.mapData.tracks.itemAdded(track => this.trackAdded(track));
        this.mapData.tracks.itemRemoved(track => this.trackRemoved(track));
        this.mapData.tracks.itemUpdated(track => this.trackUpdated(track));

        this.style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 4
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#33ccff'
                })
            })
        });

        this.source = new ol.source.Vector({ wrapX: false });
        this.drawingLayer = new ol.layer.Vector({
            source: this.source,
            style: this.style,
            zIndex: 100
        });

        this.map.addLayer(this.drawingLayer);
    }

    public startDrawing(): void {
        const value = 'LineString';
        this.draw = new ol.interaction.Draw({
            source: this.source,
            style: this.style,
            type: /** @type {ol.geom.GeometryType} */ (value),
            minPoints: 2
        });

        this.draw.on('drawend', (event) => {
            const sketch = event.feature;
            const track = sketch.getGeometry();
            track.transform('EPSG:32633', 'EPSG:4326');
            const coords = track.getCoordinates();

            this.mapData.tracks.addItem({
                'name': 'track',
                'strokeColor': this.defaultStrokeColor,
                'strokeWidth': this.defaultStrokeWidth,
                'points': coords.map(coord => ({ position: {longitude: coord[0], latitude: coord[1] }}))
            });

            this.map.removeInteraction(this.draw);

        }, this);

        this.map.addInteraction(this.draw);
    }

    public editItem(track: any): void {
        if (this.edit) {
            this.map.removeInteraction(this.edit.interaction);
            this.map.removeLayer(this.edit.layer);

            if (this.edit.track === track.key) {
                this.edit = null;
                return;
            }
        }

        const feature = this.trackFeatures[track.key].clone();
        feature.setStyle(this.style);

        // Center map on track
        const center = ol.extent.getCenter(feature.getGeometry().getExtent());
        this.map.getView().setCenter(center);

        const source = new ol.source.Vector({ wrapX: false });
        source.addFeature(feature);
        const modifyInteraction = new ol.interaction.Modify({
            source: source,
            style: this.style
        });
        const layer = new ol.layer.Vector({
            source: source,
            style: this.style,
            zIndex: 150
        });
        this.map.addLayer(layer);
        this.map.addInteraction(modifyInteraction);

        modifyInteraction.on('modifyend', (function (evt) {
            const modifiedFeature = evt.features.item(0).clone();
            const geometry = modifiedFeature.getGeometry();
            geometry.transform('EPSG:32633', 'EPSG:4326');
            const coords = geometry.getCoordinates();
            track.points = coords.map(coord => ({ position: {longitude: coord[0], latitude: coord[1] }}));
            this.saveItem(track);
        }).bind(this));

        this.edit = {
            interaction: modifyInteraction,
            layer: layer,
            track: track.key
        };
    }

    deleteItem(item): void {
        this.mapData.tracks.removeItem(item);
    }
    saveItem(item: any): void {
        this.mapData.tracks.updateItem(item);
    }

    selectAll(): void {
        this.mapData.tracks.selectAll(this.selectAllOption);
        this.selectAllOption = !this.selectAllOption;
    }
}
