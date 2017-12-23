import { Inject, Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { ActivatedRoute } from '@angular/router';
import { MapDataService } from '../../services/map-data.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AreasStyleDialog } from './areas-style.dialog';

declare var ol: any;

@Component({
    selector: 'my-areas-menu',
    templateUrl: 'areas-menu.component.html',
    styleUrls: ['areas-menu.component.css']
})
export class AreasMenuComponent implements OnInit {
    public defaultFillColor = '#ffff9911';
    public defaultStrokeColor = '#9900ff99';
    public defaultStrokeWidth = 2;

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
    areaFeatures: any = {};

    constructor(private mapData: MapDataService, public dialog: MatDialog) {
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(AreasStyleDialog, {
            width: '250px',
            data: { fillColor: this.defaultFillColor, strokeColor: this.defaultStrokeColor, strokeWidth: this.defaultStrokeWidth }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.defaultFillColor = result.fillColor;
                this.defaultStrokeColor = result.strokeColor;
                this.defaultStrokeWidth = result.strokeWidth;

                this.mapData.areas.getSelected().then(areas => areas.forEach(area => {
                    area.strokeColor = this.defaultStrokeColor;
                    area.strokeWidth = this.defaultStrokeWidth;
                    area.fillColor = this.defaultFillColor;
                    this.saveItem(area);

                    this.areaFeatures[area.key].setStyle(new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: area.strokeColor,
                            width: area.strokeWidth
                        }),
                        fill: new ol.style.Fill({
                            color: area.fillColor
                        }),
                        text: new ol.style.Text({
                            text: area.text
                        })
                    }));
                }));
            }
        });
    }

    areaAdded(area: any): void {
        if (this.areaFeatures[area.key] == null) {
            const polygon = new ol.geom.Polygon(area.coords);

            polygon.transform('EPSG:4326', 'EPSG:32633');
            // Create feature with polygon.
            const feature = new ol.Feature({
                geometry: polygon
            });
            feature.setStyle(this.getAreaStyle(area));

            if (this.displaySource == null) {
                this.displaySource = new ol.source.Vector({ wrapX: false });
                this.displayLayer = new ol.layer.Vector({
                    source: this.displaySource,
                    zIndex: 99
                });
                this.map.addLayer(this.displayLayer);
            }
            this.displaySource.addFeature(feature);
            this.areaFeatures[area.key] = feature;
        }
    }

    areaUpdated(area: any): void {
        console.log('Area updated: ' + area.name);
        console.log(area);

        const feature = this.areaFeatures[area.key];
        if (feature) {
            const polygon = new ol.geom.Polygon(area.coords);
            polygon.transform('EPSG:4326', 'EPSG:32633');
            feature.setGeometry(polygon);
            feature.setStyle(this.getAreaStyle(area));
        }
    }

    private getAreaStyle(area: any): any {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: area.strokeColor,
                width: area.strokeWidth
            }),
            fill: new ol.style.Fill({
                color: area.fillColor
            }),
            text: new ol.style.Text({
                text: area.text
            })
        });
    }

    areaRemoved(area: any): void {
        if (this.areaFeatures[area.key] != null) {
            this.displaySource.removeFeature(this.areaFeatures[area.key]);
            this.areaFeatures[area.key] = null;
        }
    }

    public ngOnInit(): void {
        this.mapData.areas.itemAdded(area => this.areaAdded(area));
        this.mapData.areas.itemRemoved(area => this.areaRemoved(area));
        this.mapData.areas.itemUpdated(area => this.areaUpdated(area));

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
        const value = 'Polygon';
        this.draw = new ol.interaction.Draw({
            source: this.source,
            style: this.style,
            type: /** @type {ol.geom.GeometryType} */ (value),
            minPoints: 2
        });

        this.draw.on('drawend', (event) => {
            const sketch = event.feature;
            const area = sketch.getGeometry();
            area.transform('EPSG:32633', 'EPSG:4326');
            const coords = area.getCoordinates();

            this.mapData.areas.addItem({
                'name': 'area',
                'strokeColor': this.defaultStrokeColor,
                'strokeWidth': this.defaultStrokeWidth,
                'fillColor': this.defaultFillColor,
                'coords': coords
            });

            this.map.removeInteraction(this.draw);

        }, this);

        this.map.addInteraction(this.draw);
    }

    public editItem(area: any): void {
        if (this.edit) {
            this.map.removeInteraction(this.edit.interaction);
            this.map.removeLayer(this.edit.layer);

            if (this.edit.area === area.key) {
                this.edit = null;
                return;
            }
        }

        const feature = this.areaFeatures[area.key].clone();
        feature.setStyle(this.style);

        // Center map on area
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
            area.coords = coords;
            this.saveItem(area);
        }).bind(this));

        this.edit = {
            interaction: modifyInteraction,
            layer: layer,
            area: area.key
        };
    }

    deleteItem(item): void {
        this.mapData.areas.removeItem(item);
    }
    saveItem(area: any): void {
        this.mapData.areas.updateItem(area);
    }

    selectAll(): void {
        this.mapData.areas.selectAll(this.selectAllOption);
        this.selectAllOption = !this.selectAllOption;
    }
}
