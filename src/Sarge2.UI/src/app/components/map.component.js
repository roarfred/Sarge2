"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var location_model_1 = require("../models/location.model");
var paper_size_model_1 = require("../models/paper-size.model");
var scale_and_tile_size_model_1 = require("../models/scale-and-tile-size.model");
var MapComponent = (function () {
    function MapComponent() {
        this.name = "Map";
        this.paperSize = new paper_size_model_1.PaperSize("A4", 0.30, 0.20);
        this.scale = new scale_and_tile_size_model_1.ScaleAndTileSize("1:50000", 50000, 0);
        this.radiusR25Change = new core_1.EventEmitter();
        this.radiusR50Change = new core_1.EventEmitter();
        this.lockIppChange = new core_1.EventEmitter();
        this.ippChange = new core_1.EventEmitter();
        this.mapLocationChange = new core_1.EventEmitter();
        this.mapClicked = new core_1.EventEmitter();
    }
    Object.defineProperty(MapComponent.prototype, "radiusR25", {
        get: function () {
            return this._radiusR25;
        },
        set: function (value) {
            this._radiusR25 = value;
            this.radiusR25Change.emit(this._radiusR25);
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(MapComponent.prototype, "radiusR50", {
        get: function () {
            return this._radiusR50;
        },
        set: function (value) {
            this._radiusR50 = value;
            this.radiusR50Change.emit(this._radiusR50);
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(MapComponent.prototype, "lockIpp", {
        get: function () {
            return this.ipp != null;
        },
        set: function (value) {
            if (value)
                this.setIpp(null);
            else
                this.resetIpp();
            this.lockIppChange.emit(value);
        },
        enumerable: true,
        configurable: true
    });
    ;
    ;
    Object.defineProperty(MapComponent.prototype, "ipp", {
        get: function () {
            return this._ipp;
        },
        set: function (location) {
            this._ipp = location;
            this.ippChange.emit(this._ipp);
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(MapComponent.prototype, "mapLocation", {
        get: function () {
            return this._mapLocation;
        },
        set: function (location) {
            this._mapLocation = location;
            if (location) {
                var utm33 = location.getLocation(33);
                // this causes a problem with slice()
                //if (this.map) this.map.getView().setCenter(utm33);
            }
            this.mapLocationChange.emit(this._mapLocation);
        },
        enumerable: true,
        configurable: true
    });
    ;
    MapComponent.prototype.ngOnInit = function () {
        this.createMap();
    };
    ;
    MapComponent.prototype.startDrawing = function () {
        console.log("Starting drawing...");
    };
    ;
    MapComponent.prototype.createMap = function () {
        var _this = this;
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
        var view = new ol.View({
            projection: projection,
            center: [300000, 6550000],
            zoom: 5
        });
        var layerGroup = new ol.layer.Group({
            layers: [
                this.createMapTile({ name: 'topo2' })
            ]
        });
        this.map = new ol.Map({
            target: 'map',
            view: view
        });
        this.map.setLayerGroup(layerGroup);
        this.map.addControl(new ol.control.Zoom({
            className: 'custom-zoom'
        }));
        this.map.on('postrender', function (event) {
            _this.drawPaper();
            _this.drawCrossHair();
            _this.drawRadius();
            _this.mapLocation = _this.getLocation();
        });
        this.map.on('click', function (event) { _this.mapClick(event, _this); });
    };
    ;
    MapComponent.prototype.mapClick = function (event, map) {
        // extract the spatial coordinate of the click event in map projection units
        var coord = event.coordinate;
        var local = new location_model_1.Location(33, coord[0], coord[1]).getLocalLocation();
        this.mapClicked.emit(local);
    };
    ;
    MapComponent.prototype.createMapTile = function (map) {
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
    ;
    MapComponent.prototype.getLocation = function () {
        if (this.map) {
            var center = this.map.getView().getCenter();
            if (center)
                return new location_model_1.Location(33, center[0], center[1]);
        }
        return this._mapLocation;
    };
    ;
    MapComponent.prototype.getZoom = function () {
        if (this.map)
            return this.map.getView().getZoom();
    };
    ;
    MapComponent.prototype.setZoom = function (zoom) {
        this.map.getView().setZoom(zoom);
    };
    ;
    MapComponent.prototype.resetIpp = function () {
        this.ipp = null;
    };
    ;
    MapComponent.prototype.setIpp = function (position) {
        if (position)
            this.ipp = position;
        else {
            var center = this.map.getView().getCenter();
            this.ipp = new location_model_1.Location(33, center[0], center[1]);
        }
    };
    ;
    MapComponent.prototype.getIpp = function () {
        if (this.ipp)
            return this.ipp;
        else {
            return this.getLocation();
        }
    };
    ;
    MapComponent.prototype.drawRadius = function () {
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
    ;
    MapComponent.prototype.drawCrossHair = function () {
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
        vLines.push([
            [center.easting, center.northing + size],
            [center.easting, center.northing + opening]
        ]);
        vLines.push([
            [center.easting, center.northing - size],
            [center.easting, center.northing - opening]
        ]);
        vLines.push([
            [center.easting - size, center.northing],
            [center.easting - opening, center.northing]
        ]);
        vLines.push([
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
    ;
    MapComponent.prototype.drawPaper = function () {
        if (!this.paperSize || !this.scale)
            return;
        if (!this.paperFeature) {
            var feature = new ol.Feature({});
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
    ;
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], MapComponent.prototype, "radiusR25Change", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], MapComponent.prototype, "radiusR50Change", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], MapComponent.prototype, "lockIppChange", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], MapComponent.prototype, "ippChange", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], MapComponent.prototype, "mapLocationChange", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], MapComponent.prototype, "mapClicked", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], MapComponent.prototype, "radiusR25", null);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], MapComponent.prototype, "radiusR50", null);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], MapComponent.prototype, "lockIpp", null);
    __decorate([
        core_1.Input(),
        __metadata("design:type", location_model_1.Location),
        __metadata("design:paramtypes", [location_model_1.Location])
    ], MapComponent.prototype, "ipp", null);
    __decorate([
        core_1.Input(),
        __metadata("design:type", location_model_1.Location),
        __metadata("design:paramtypes", [location_model_1.Location])
    ], MapComponent.prototype, "mapLocation", null);
    MapComponent = __decorate([
        core_1.Component({
            selector: 'my-map',
            templateUrl: './map.component.html',
            styleUrls: ['./map.component.css']
        })
    ], MapComponent);
    return MapComponent;
}());
exports.MapComponent = MapComponent;
//# sourceMappingURL=map.component.js.map