import { Inject, Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';

import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { ActivatedRoute } from '@angular/router';
import { MapDataService } from '../../services/map-data.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../environments/environment';
import { MapService } from '../../services/map.service';
import { FormControl } from '@angular/forms';

declare var ol: any;

@Component({
    selector: 'app-poi-menu',
    templateUrl: './pois-menu.component.html',
    styles: ['./pois-menu.component.css']
})
export class PoisMenuComponent implements OnInit {
    public defaultSymbol = 'Flag';

    private drawingLayer: any;
    private displayLayer: any;
    private displaySource: any;
    private draw: any;
    private style: any;
    private source: any;
    private edit: any = null;

    public selectAllOption = true;
    public poiSymbols: Array<string>;

    @Input()
    public map: any;
    poiFeatures: any = {};

    symbolCtrl: FormControl;
    filteredSymbols: Observable<any[]>;

    constructor(private mapData: MapDataService, private mapService: MapService, public dialog: MatDialog) {
        this.symbolCtrl = new FormControl();
        this.filteredSymbols = this.symbolCtrl.valueChanges
            .pipe(
                startWith(''),
                map(symbol => symbol ? this.filterSymbols(symbol) : this.poiSymbols)
            );

        this.symbolCtrl.valueChanges.subscribe(value => {
            this.mapData.pois.getSelected().then(pois => pois.forEach(poi => {
                poi.symbol = this.defaultSymbol;
                this.saveItem(poi);
            }));
        });
    }

    filterSymbols(name: string) {
        return this.poiSymbols.filter(symbol =>
            symbol.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }

    public getSymbolUrl(symbol: string) {
        return environment.apiUrl + '/api/symbols/' + symbol;
    }

    poiAdded(poi: any): void {
        if (this.poiFeatures[poi.key] == null) {
            const point = new ol.geom.Point(poi.coords);

            point.transform('EPSG:4326', 'EPSG:32633');
            // Create feature with point.
            const feature = new ol.Feature({
                geometry: point
            });
            feature.setStyle(this.getPoiStyle(poi));

            if (this.displaySource == null) {
                this.displaySource = new ol.source.Vector({ wrapX: false });
                this.displayLayer = new ol.layer.Vector({
                    source: this.displaySource,
                    zIndex: 99
                });
                this.map.addLayer(this.displayLayer);
            }
            this.displaySource.addFeature(feature);
            this.poiFeatures[poi.key] = feature;
        }
    }

    poiUpdated(poi: any): void {
        const feature = this.poiFeatures[poi.key];
        if (feature) {
            const point = new ol.geom.Point(poi.coords);
            point.transform('EPSG:4326', 'EPSG:32633');
            feature.setGeometry(point);
            feature.setStyle(this.getPoiStyle(poi));
        }
    }

    private getPoiStyle(poi: any): any {
        const poiStyle = (function (feature, resolution) {
            let image = new ol.style.Circle({
                radius: 5,
                snapToPixel: false,
                fill: new ol.style.Fill({ color: 'white' }),
                stroke: new ol.style.Stroke({
                    color: 'black', width: 1.5
                })
            });

            if (poi.symbol) {
                image = new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    anchor: [0.5, 0.5],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    opacity: 0.75,
                    src: this.getSymbolUrl(poi.symbol)
                }));
            }

            return new ol.style.Style({
                image: image,
                text: new ol.style.Text({
                    text: resolution < 20 ? poi.name : '',
                    offsetY: -20,
                    scale: 1.5,
                    fill: new ol.style.Fill({
                        color: '#003399'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#FFFFFF',
                        width: 2.0
                    })
                })
            });
        }).bind(this);
        return poiStyle;
    }

    poiRemoved(poi: any): void {
        if (this.poiFeatures[poi.key] != null) {
            this.displaySource.removeFeature(this.poiFeatures[poi.key]);
            this.poiFeatures[poi.key] = null;
        }
    }

    public ngOnInit(): void {
        this.mapData.pois.itemAdded(poi => this.poiAdded(poi));
        this.mapData.pois.itemRemoved(poi => this.poiRemoved(poi));
        this.mapData.pois.itemUpdated(poi => this.poiUpdated(poi));

        this.mapService.getPoiSymbolNames().then(names => {
            this.poiSymbols = names;
        });

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
        const value = 'Point';
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

            this.mapData.pois.addItem({
                'name': 'poi',
                'symbol': this.defaultSymbol,
                'coords': coords
            });

            this.map.removeInteraction(this.draw);

        }, this);

        this.map.addInteraction(this.draw);
    }

    public editItem(poi: any): void {
        if (this.edit) {
            this.map.removeInteraction(this.edit.interaction);
            this.map.removeLayer(this.edit.layer);

            if (this.edit.poi === poi.key) {
                this.edit = null;
                return;
            }
        }

        const feature = this.poiFeatures[poi.key].clone();
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
            poi.coords = coords;
            this.saveItem(poi);
        }).bind(this));

        this.edit = {
            interaction: modifyInteraction,
            layer: layer,
            poi: poi.key
        };
    }

    deleteItem(item): void {
        this.mapData.pois.removeItem(item);
    }
    saveItem(area: any): void {
        this.mapData.pois.updateItem(area);
    }

    selectAll(): void {
        this.mapData.pois.selectAll(this.selectAllOption);
        this.selectAllOption = !this.selectAllOption;
    }
}
