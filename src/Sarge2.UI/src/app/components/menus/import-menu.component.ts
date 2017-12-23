import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FileUploader, FileSelectDirective, FileDropDirective, ParsedResponseHeaders, FileItem } from 'ng2-file-upload/ng2-file-upload';
import { environment } from '../../../environments/environment';
import { GeoData, Track, TimePoint, Position, Poi, Location } from '../../models';

declare var ol: any;

const UPLOAD_URL = '/api/parsegpx/upload';

@Component({
    selector: 'app-import-menu',
    templateUrl: 'import-menu.component.html',
    styleUrls: ['import-menu.component.css']
})
export class ImportMenuComponent implements OnInit {
    public uploader: FileUploader = new FileUploader({ url: environment.apiUrl + UPLOAD_URL, autoUpload: true });

    public hasBaseDropZoneOver = false;
    public hasAnotherDropZoneOver = false;
    public uploading = false;
    @Input()
    public geoData: GeoData;
    @Output()
    public geoDataChange = new EventEmitter<GeoData>();
    private _map: any;

    private poiSource: any;
    private poiLayer: any;
    private poiFeatures: any = [];

    private trackSource: any;
    private trackLayer: any;
    private trackFeatures: any = [];

    public maxDistance = 800; // 800 meters between points will split track
    public maxTime = 600; // 10 minutes between points will split track
    public minTrackPoints = 5; // skip tracks of less than 5 points

    @Input()
    set map(map: any) {
        this._map = map;
    }
    get map(): any {
        return this._map;
    }

    constructor() {
        this.uploader.onBeforeUploadItem = (file: FileItem) => {
            this.uploading = true;
            this.uploader.options.additionalParameter = {
                'maxDistance': this.maxDistance,
                'maxTime': this.secondsToTime(this.maxTime),
                'minTrackPoints': this.minTrackPoints
            };
        };

        this.uploader.onSuccessItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
            this.uploading = false;
            this.geoData = JSON.parse(response);
            this.geoDataChange.emit(this.geoData);
            this.clearMap();
            this.showAll();
        };

        this.uploader.onErrorItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
            this.uploading = false;
        };
    }

    secondsToTime(seconds: number): string {
        const hours = Math.floor(seconds / 60 / 60);
        const minutes = Math.floor(seconds / 60) % 60;
        seconds = seconds % 60;
        const pad = (i: number): string => i < 10 ? '0' + i : i.toFixed(0);
        return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
    }


    hideAll() {
        this.clearMap();
    }
    showAll() {
        this.geoData.tracks.forEach(track => this.showTrack(track, false));
        this.geoData.pois.forEach(poi => this.showPoi(poi, false));
    }

    initPoiSource() {
        const poiStyle = function (feature, resolution) {
            let image = new ol.style.Circle({
                radius: 5,
                snapToPixel: false,
                fill: new ol.style.Fill({ color: 'white' }),
                stroke: new ol.style.Stroke({
                    color: 'black', width: 1.5
                })
            });

            const poi = feature.getProperties().poi;
            if (poi.symbol) {
                image = new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    anchor: [0.5, 0.5],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    opacity: 0.75,
                    src: environment.apiUrl + '/api/symbols/' + poi.symbol
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
        };

        this.poiSource = new ol.source.Vector({ wrapX: false, features: [] });
        this.poiLayer = new ol.layer.Vector({
            source: this.poiSource,
            style: poiStyle
        });

        this.map.addLayer(this.poiLayer);
    }

    initTrackSource() {

        const map = this.map;

        const trackStyle = function (feature, resolution) {
            console.log('Resolution: ' + resolution);

            const center = ol.extent.getCenter(feature.getGeometry().getExtent());
            const first = feature.getGeometry().getLastCoordinate();
            const centerPixels = map.getPixelFromCoordinate(center);
            const firstPixels = map.getPixelFromCoordinate(first);

            const track = feature.getProperties().track;

            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    width: 3
                }),
                text: new ol.style.Text({
                    text: resolution < 10 ? track.name : '',
                    offsetX: (firstPixels[0] - centerPixels[0]) / 2,
                    offsetY: (firstPixels[1] - centerPixels[1]) / 2,
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
        };

        this.trackSource = new ol.source.Vector({ wrapX: false, features: [] });
        this.trackLayer = new ol.layer.Vector({
            source: this.trackSource,
            style: trackStyle
        });
        this.map.addLayer(this.trackLayer);
    }

    initMap() {
        this.initTrackSource();
        this.initPoiSource();
    }

    clearMap() {
        if (this.poiLayer) {
            this.map.removeLayer(this.poiLayer);
            this.poiSource = null;
            this.poiFeatures = [];
            this.poiLayer = null;
        }
        if (this.trackLayer) {
            this.map.removeLayer(this.trackLayer);
            this.trackSource = null;
            this.trackFeatures = [];
            this.trackLayer = null;
        }
    }

    ngOnInit(): void {

    }

    public fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    public fileOverAnother(e: any): void {
        this.hasAnotherDropZoneOver = e;
    }

    public showPoi(poi: Poi, centerMap: boolean) {
        const poiIndex = this.geoData.pois.indexOf(poi);

        if (!this.poiSource) {
            this.initMap();
        }
        if (poiIndex >= 0 && this.poiFeatures[poiIndex]) {
            this.poiSource.removeFeature(this.poiFeatures[poiIndex]);
            this.poiFeatures[poiIndex] = null;
        } else {
            const pos = new Location(0, poi.position.longitude, poi.position.latitude).getLocation(33);
            const poiOnMap = new ol.geom.Point([pos.easting, pos.northing]);
            const poiFeature = new ol.Feature({
                geometry: poiOnMap,
                poi: poi
            });

            this.poiSource.addFeature(poiFeature);
            this.poiFeatures[poiIndex] = poiFeature;

            if (centerMap) {
                this.map.getView().center(poiOnMap);
            }
        }
    }

    public showTrack(track: Track, centerMap: boolean) {
        const trackIndex = this.geoData.tracks.indexOf(track);

        if (!this.trackSource) {
            this.initMap();
        }
        if (trackIndex >= 0 && this.trackFeatures[trackIndex]) {
            this.trackSource.removeFeature(this.trackFeatures[trackIndex]);
            this.trackFeatures[trackIndex] = null;
        } else {
            const trackOnMap = new ol.geom.LineString([]);
            const trackFeature = new ol.Feature({
                geometry: trackOnMap,
                track: track
            });

            track.points.forEach((point: TimePoint) => {
                const pos = new Location(0, point.position.longitude, point.position.latitude).getLocation(33);
                trackOnMap.appendCoordinate([pos.easting, pos.northing]);
            });

            this.trackSource.addFeature(trackFeature);
            this.trackFeatures[trackIndex] = trackFeature;

            if (centerMap) {
                const center = ol.extent.getCenter(trackOnMap.getExtent());
                this.map.getView().setCenter(center);
            }
        }
    }
}
