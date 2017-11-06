import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '../models/location.model';
import { MapService } from '../services/map.service';
import { PaperSize } from '../models/paper-size.model';
import { ScaleAndTileSize } from '../models/scale-and-tile-size.model';
import { MapSource } from '../models/map-source.model';
import { PrintSettings } from '../models/print-settings.model';
import { Margins } from '../models/margins.model';

@Component({
    selector: 'my-print-menu',
    templateUrl: './print-menu.component.html',
    styleUrls: ['./print-menu.component.css']
})
export class PrintMenuComponent implements OnInit {
    paperSizes: Array<PaperSize>;
    scales: Array<ScaleAndTileSize>;
    mapSources: Array<MapSource>;
    downloading: boolean;

    showCrossHair: boolean;
    showUtmGrid: boolean;
    showLatLonGrid: boolean;
    
    @Input()
    location: Location;

    _mapSource: MapSource;
    _paperSize: PaperSize;
    _scale: ScaleAndTileSize;

    name: string;
    r25: number;
    r50: number;

    constructor(private _mapService: MapService) { }

    @Input()
    get paperSize(): PaperSize {
        return this._paperSize;
    }
    set paperSize(paperSize: PaperSize) {
        this._paperSize = paperSize;
    }

    @Input()
    get mapSource(): MapSource {
        return this._mapSource;
    }
    set mapSource(mapSource: MapSource) {
        this._mapSource = mapSource;

        if (this._mapSource) {
            this._mapService.getScales(this._mapSource.name)
                .then((result) => this.scales = result)
                .catch((error) => console.error(error));
        }
    }

    @Input()
    get scale(): ScaleAndTileSize {
        return this._scale;
    }
    set scale(scale: ScaleAndTileSize) {
        this._scale = scale;
    }


    ngOnInit() {
        this._mapService.getMapSources()
            .then((result) => this.mapSources = result)
            .catch((error) => console.error(error));

        this._mapService.getPaperSizes()
            .then((result) => this.paperSizes = result)
            .catch((error) => console.error(error));
    }

    print() {
        let margins : Margins = { 
            left: 10,
            top: 10,
            right: 10,
            bottom: 10
        };

        let settings : PrintSettings = {
            title: this.name,
            mapName: this._mapSource.name,
            scaleAndTileSize: this._scale,
            paperSize: this._paperSize,
            radiusR25: this.r25,
            radiusR50: this.r50,
            margins: margins,
            showCrossHair: this.showCrossHair,
            showLatLonGrid: this.showLatLonGrid,
            showUtmGrid: this.showUtmGrid,
            location: this.location
        };
        console.log("Requesting map: " + JSON.stringify(settings));
        this.downloading = true;
        this._mapService.downloadMap(settings)
            .then((result) => this.downloading = false)
            .catch((error) => console.error(error));
    }
}