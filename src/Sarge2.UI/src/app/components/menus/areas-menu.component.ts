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
    public defaultFillColor: string = "#ffff9911";
    public defaultStrokeColor: string = "#9900ff99";
    public defaultStrokeWidth: number = 2;

    private drawingLayer: any;
    private displayLayer: any;
    private displaySource: any;
    private draw: any;
    private style: any;
    private source: any;

    @Input()
    public map: any;
    areaFeatures: any = {};

    constructor(private mapData: MapDataService, public dialog: MatDialog) {
        mapData.areaAdded(area => this.areaAdded(area));
        mapData.areaRemoved(area => this.areaRemoved(area));
    }

    openDialog(): void {
        let dialogRef = this.dialog.open(AreasStyleDialog, {
            width: '250px',
            data: { fillColor: this.defaultFillColor, strokeColor: this.defaultStrokeColor, strokeWidth: this.defaultStrokeWidth }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.defaultFillColor = result.fillColor;
                this.defaultStrokeColor = result.strokeColor;
                this.defaultStrokeWidth = result.strokeWidth;
            }
        });
    }

    areaAdded(area: any): void {
        if (this.areaFeatures[area.key] == null) {
            let polygon = new ol.geom.Polygon(area.coords);

            polygon.transform("EPSG:4326", "EPSG:32633");
            // Create feature with polygon.
            var feature = new ol.Feature({
                geometry: polygon
            });
            feature.setStyle(new ol.style.Style({
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
    areaRemoved(area: any): void {
        if (this.areaFeatures[area.key] != null) {
            this.displaySource.removeFeature(this.areaFeatures[area.key]);
            this.areaFeatures[area.key] = null;
        }
    }

    public ngOnInit(): void {
        this.style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "red",
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
        var value = 'Polygon';
        this.draw = new ol.interaction.Draw({
            source: this.source,
            style: this.style,
            type: /** @type {ol.geom.GeometryType} */ (value),
            minPoints: 2
        });

        this.draw.on('drawend', (event) => {
            let sketch = event.feature;
            let area = sketch.getGeometry();
            area.transform("EPSG:32633", "EPSG:4326");
            let coords = area.getCoordinates();

            this.mapData.addArea({
                "name": "area",
                "strokeColor": this.defaultStrokeColor,
                "strokeWidth": this.defaultStrokeWidth,
                "fillColor": this.defaultFillColor,
                "coords": coords
            });

            this.map.removeInteraction(this.draw);

        }, this);

        this.map.addInteraction(this.draw);
    }

    deleteItem(item): void {
        this.mapData.removeArea(item);
    }
} 