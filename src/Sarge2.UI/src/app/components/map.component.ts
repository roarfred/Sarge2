import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '../models/location.model';
import { PaperSize } from '../models/paper-size.model';
import { ScaleAndTileSize } from '../models/scale-and-tile-size.model';

declare var ol: any;

@Component({
    selector: 'my-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent {
    name: string = "Map";
    map: any;

    radiusFeature: any;
    paperFeature: any;
    crossHairFeature: any;

    paperSize: PaperSize = new PaperSize("A4", 0.30, 0.20);
    scale: ScaleAndTileSize = new ScaleAndTileSize("1:50000", 50000, 0);
    
    _mapLocation = new Location(33, 300000, 6550000);
    _ipp: Location;
    _radiusR25: number;
    _radiusR50: number;
    _zoom: number = 5;

    @Output() zoomChange = new EventEmitter<number>(); 
    @Output() radiusR25Change = new EventEmitter<number>();
    @Output() radiusR50Change = new EventEmitter<number>();
    @Output() lockIppChange = new EventEmitter<boolean>();
    @Output() ippChange = new EventEmitter<Location>();
    @Output() mapLocationChange = new EventEmitter<Location>();
    @Output() mapClicked = new EventEmitter<Location>();
    
    @Input()
    get zoom(): number {
        return this._zoom;
    }
    set zoom(zoom: number) {
        if (this.map)
            this.map.getView().setZoom(zoom);

        this._zoom = zoom;
        this.zoomChange.emit(zoom);
    }
    @Input()
    get radiusR25(): number {
        return this._radiusR25;
    };
    set radiusR25(value:number) {
        this._radiusR25 = value;
        this.radiusR25Change.emit(this._radiusR25);
    }
    @Input()
    get radiusR50(): number {
        return this._radiusR50;
    };
    set radiusR50(value:number) {
        this._radiusR50 = value;
        this.radiusR50Change.emit(this._radiusR50);
    }

    @Input()
    get lockIpp(): boolean {
        return this.ipp != null;
    };
    set lockIpp(value: boolean) {
        if (value)
            this.setIpp(null);
        else
            this.resetIpp();
        this.lockIppChange.emit(value);
    };

    @Input()
    get ipp(): Location {
        return this._ipp;
    };
    set ipp(location: Location) {
        this._ipp = location;
        this.ippChange.emit(this._ipp);
    }

    @Input()
    get mapLocation(): Location {
        return this._mapLocation;
    };
    set mapLocation(location: Location) {
        if (location != null && location.equals(this._mapLocation))
            return;

        this._mapLocation = location;
        if (location) {
            var utm33 = location.getLocation(33);
            if (this.map) this.map.getView().setCenter([utm33.easting, utm33.northing]);
        }
        this.mapLocationChange.emit(this._mapLocation);
    }

    ngOnInit(): void {
        this.createMap();
    };

    startDrawing(): void {
        console.log("Starting drawing...");
    };

    createMap(): void {
        var projectionName = 'EPSG:32633';
        var extent = {
            'EPSG:32633': [-2500000, 3500000, 3045984, 9045984]
        };

        var projection = new ol.proj.Projection({
            code: projectionName,
            extent: extent[projectionName]
        });

        ol.proj.addProjection(projection);

        ol.proj.addProjection(new ol.proj.Projection({
            code: 'EPSG:4326',
            extent: [-180, -90, 180, 90]
        }));

        let center = [300000, 6550000];
        if (this._mapLocation)
            center = [this._mapLocation.easting, this._mapLocation.northing];

        var view = new ol.View({
            projection: projection,
            center: center,
            zoom: this._zoom
        });
        var layerGroup = new ol.layer.Group({
            layers: [
                this.createMapTile({ name: 'topo2' })
            ]
        })
        this.map = new ol.Map({
            target: 'map',
            view: view
        });

        this.map.setLayerGroup(layerGroup);

        this.map.addControl(new ol.control.Zoom({
            className: 'custom-zoom'
        }));

        this.map.on('postrender', (event: any) => {
            this.drawPaper();
            this.drawCrossHair();
            this.drawRadius();
        });

        this.map.on('moveend', (event: any) => {
            this._mapLocation = this.getLocation();
            this.mapLocationChange.emit(this._mapLocation);

            this._zoom = this.getZoom();
            this.zoomChange.emit(this._zoom);
        });

        this.map.on('click', (event: any) => { this.mapClick(event, this) });
    };

    mapClick(event: any, map: MapComponent): void {
        // extract the spatial coordinate of the click event in map projection units
        var coord = event.coordinate;
        var local = new Location(33, coord[0], coord[1]).getLocalLocation();
        this.mapClicked.emit(local);
    };

    createMapTile(map: any): any {
        return new ol.layer.Tile({
            title: map.name,
            source: new ol.source.TileWMS({
                url: 'http://opencache.statkart.no/gatekeeper/gk/gk.open?',
                params: {
                    'LAYERS': map.name,
                    'VERSION': '1.1.1',
                    'FORMAT': 'image/png',
                    'TILED': true
                }
            })
        });
    };

    getLocation(): Location {
        if (this.map) {
            var center = this.map.getView().getCenter();
            if (center)
                return new Location(33, center[0], center[1]);
        }
        return this._mapLocation;
    };

    getZoom(): number {
        if (this.map)
            return this.map.getView().getZoom();
    };

    resetIpp(): void {
        this.ipp = null;
    };

    setIpp(position: Location): void {
        if (position)
            this.ipp = position;
        else {
            var center = this.map.getView().getCenter();
            this.ipp = new Location(33, center[0], center[1]);
        }
    };

    getIpp(): Location {
        if (this.ipp)
            return this.ipp;
        else {
            return this.getLocation();
        }
    };

    drawRadius(): void {

        if (!this.radiusFeature) {
            var lineStyle = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#3399ff',
                    width: 2
                })
            });

            var layerRadius = new ol.layer.Vector({
                name: 'radius',
                style: lineStyle,
                source: new ol.source.Vector({
                    features: vFeatures
                }),
                updateWhileInteracting: true,
                updateWhileAnimating: true,
                renderBuffer: 200
            });

            this.map.addLayer(layerRadius);
            this.radiusFeature = layerRadius;
        }

        var center = this.getIpp();

        if (this.radiusR25 || this.radiusR50) {

            var vFeatures = [];

            if (this.radiusR25)
                vFeatures.push(new ol.Feature({
                    geometry: new ol.geom.Circle([center.easting, center.northing], this.radiusR25)
                }));
            if (this.radiusR50)
                vFeatures.push(new ol.Feature({
                    geometry: new ol.geom.Circle([center.easting, center.northing], this.radiusR50)
                }));

            this.radiusFeature.setSource(new ol.source.Vector({
                features: vFeatures
            }));
        }
    };

    drawCrossHair(): void {
        if (!this.paperSize || !this.scale)
            return;

        if (!this.crossHairFeature) {
            var layerLines = new ol.layer.Vector({
                name: 'crossHair',
                style: lineStyle,
                source: vSource,
                updateWhileInteracting: true,
                updateWhileAnimating: true,
                renderBuffer: 200
            });
            this.map.addLayer(layerLines);
            this.crossHairFeature = layerLines;
        }

        var center = this.getIpp();

        var size = (this.paperSize && this.scale) ? (this.paperSize.width * this.scale.scale) / 4.0 : 10000;
        //var opening = 100 * Math.pow(2, (15 - this.getZoom())) - 500; // 10 * Math.pow((25 - this.getZoom()) / 10, 3);
        var opening = 100 * Math.sqrt(this.map.getView().getResolution() / 2);

        var vLines = [];

        vLines.push([ // North
            [center.easting, center.northing + size],
            [center.easting, center.northing + opening]
        ]);
        vLines.push([ // South
            [center.easting, center.northing - size],
            [center.easting, center.northing - opening]
        ]);
        vLines.push([ // West
            [center.easting - size, center.northing],
            [center.easting - opening, center.northing]
        ]);
        vLines.push([ // East
            [center.easting + size, center.northing],
            [center.easting + opening, center.northing]
        ]);

        var vFeatures = [];
        for (var i = 0; i < vLines.length; i++) {
            var vline = new ol.geom.LineString(vLines[i]);
            var vFeature = new ol.Feature({ geometry: vline });
            vFeatures.push(vFeature);
        }

        var lineStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#999999',
                width: 4
            })
        });
        var vSource = new ol.source.Vector({
            features: vFeatures
        });

        this.crossHairFeature.setSource(vSource);
    };

    drawPaper(): void {
        if (!this.paperSize || !this.scale)
            return;

        if (!this.paperFeature) {
            var feature = new ol.Feature({
                //geometry: new ol.geom.Polygon([polyCoords])
            });

            var layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [feature],
                }),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#00cc00',
                        width: 4
                    })
                }),
                updateWhileInteracting: true,
                updateWhileAnimating: true
            });

            this.map.addLayer(layer);
            this.paperFeature = feature;
        }

        var center = this.getIpp();
        var halfWidth = this.paperSize.width * this.scale.scale / 2.0;
        var halfHeight = this.paperSize.height * this.scale.scale / 2.0;

        var polyCoords = [
            [center.easting - halfWidth, center.northing + halfHeight],
            [center.easting + halfWidth, center.northing + halfHeight],
            [center.easting + halfWidth, center.northing - halfHeight],
            [center.easting - halfWidth, center.northing - halfHeight]
        ];

        this.paperFeature.setGeometry(new ol.geom.Polygon([polyCoords]));
    };
}
