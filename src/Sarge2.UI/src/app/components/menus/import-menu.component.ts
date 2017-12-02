import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
//import { FileUploader } from 'ng2-file-upload';
import { FileUploader, FileSelectDirective, FileDropDirective, ParsedResponseHeaders, FileItem } from 'ng2-file-upload/ng2-file-upload';
import { environment } from '../../../environments/environment';
import { GeoData, Track, TimePoint, Position, Location } from '../../models';

declare var ol: any;

const UPLOAD_URL = '/api/parsegpx/upload';
//const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';

@Component({
    selector: 'my-import-menu',
    templateUrl: 'import-menu.component.html',
    styleUrls: ['import-menu.component.css']
})
export class ImportMenuComponent implements OnInit {
    public uploader: FileUploader = new FileUploader({ url: environment.apiUrl + UPLOAD_URL, autoUpload: true });
    //    public uploader:FileUploader = new FileUploader({url: URL, autoUpload: true});

    public hasBaseDropZoneOver: boolean = false;
    public hasAnotherDropZoneOver: boolean = false;
    public uploading: boolean = false;
    @Input()
    public geoData: GeoData;
    @Output()
    public geoDataChange = new EventEmitter<GeoData>();
    private _map: any;
    private source: any;
    private layer: any;
    private trackFeatures: any = [];

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
            this.uploader.options.additionalParameter = { "myParam": "Hello" };
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
        }
    }
    hideAll() {
        this.clearMap();
    }
    showAll() {
        this.geoData.tracks.forEach(track => this.showTrack(track));
    }
    initMap() {
        var style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "blue",
                width: 3
            })
        });

        this.source = new ol.source.Vector({ wrapX: false, features: [] });
        this.layer = new ol.layer.Vector({
            source: this.source,
            style: style
        });

        this.map.addLayer(this.layer);
    }

    clearMap() {
        if (this.layer) {
            this.map.removeLayer(this.layer);
            this.source = null;
            this.layer = null;
            this.trackFeatures = [];
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

    public showTrack(track: Track) {

        var trackIndex = this.geoData.tracks.indexOf(track);


        if (!this.source)
            this.initMap();

        if (this.trackFeatures[trackIndex]) {
            this.source.removeFeature(this.trackFeatures[trackIndex]);
            this.trackFeatures[trackIndex] = null;
        }
        else {

            var trackOnMap = new ol.geom.LineString([]);
            var trackFeature = new ol.Feature({
                geometry: trackOnMap
            });

            track.points.forEach((point: TimePoint) => {
                var pos = new Location(0, point.position.longitude, point.position.latitude).getLocation(33);
                trackOnMap.appendCoordinate([pos.easting, pos.northing]);
            });

            this.source.addFeature(trackFeature);
            this.trackFeatures[trackIndex] = trackFeature;
        }
    }
}
