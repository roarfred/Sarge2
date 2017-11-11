import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location, PaperSize, ScaleAndTileSize, MapSource, Margins, PrintSettings } from '../../models';
import { MapService } from '../../services/map.service';

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

    margins: Margins = {
        left: 10,
        top: 10,
        right: 10,
        bottom: 10
    };

    @Input()
    location: Location;

    r25Change = new EventEmitter<number>();
    r50Change = new EventEmitter<number>();

    _mapSource: MapSource;
    _paperSize: PaperSize;
    _scale: ScaleAndTileSize;
    _r25: number;
    _r50: number;

    name: string;

    @Input()
    get r25(): number {
        return this._r25;
    }
    set r25(radius: number) {
        this._r25 = radius;
        this.r25Change.emit(this._r25);
    }

    @Input()
    get r50(): number {
        return this._r50;
    }
    set r50(radius: number) {
        this._r50 = radius;
        this.r50Change.emit(this._r50);
    }

    savedSettings: PrintSettings;

    constructor(private _mapService: MapService) { }

    @Input()
    get paperSize(): PaperSize {
        return this._paperSize;
    }
    set paperSize(paperSize: PaperSize) {
        this._paperSize = paperSize;
        this.saveSettings();
    }

    @Input()
    get mapSource(): MapSource {
        return this._mapSource;
    }
    set mapSource(mapSource: MapSource) {
        this._mapSource = mapSource;

        if (this._mapSource) {
            this._mapService.getScales(this._mapSource.name)
                .then((result) => {
                    this.scales = result;
                    if (this.savedSettings && result)
                        this.scale = result.find(v => v.name == this.savedSettings.scaleAndTileSize.name);
                })
                .catch((error) => console.error(error));
        }
    }

    @Input()
    get scale(): ScaleAndTileSize {
        return this._scale;
    }
    set scale(scale: ScaleAndTileSize) {
        this._scale = scale;
        this.saveSettings();
    }


    ngOnInit() {
        this.loadSettings();

        this._mapService.getMapSources()
            .then((result) => {
                this.mapSources = result;
                if (this.savedSettings && result)
                    this.mapSource = result.find(v => v.name == this.savedSettings.mapName);
            })
            .catch((error) => console.error(error));

        this._mapService.getPaperSizes()
            .then((result) => {
                this.paperSizes = result;
                if (this.savedSettings && result)
                    this.paperSize = result.find(v => v.name == this.savedSettings.paperSize.name);
            })
            .catch((error) => console.error(error));
    }

    print() {
        let settings = this.getSettings();

        console.log("Requesting map: " + JSON.stringify(settings));
        this.downloading = true;
        this._mapService.downloadMap(settings)
            .then((result) => this.downloading = false)
            .catch((error) => console.error(error));

        this.saveSettings();
    }

    getSettings(): PrintSettings {
        if (!this._mapSource)
            return null;
        let settings: PrintSettings = {
            title: this.name,
            mapName: this._mapSource.name,
            scaleAndTileSize: this._scale,
            paperSize: this._paperSize,
            radiusR25: this.r25,
            radiusR50: this.r50,
            margins: this.margins,
            showCrossHair: this.showCrossHair,
            showLatLonGrid: this.showLatLonGrid,
            showUtmGrid: this.showUtmGrid,
            location: this.location
        };
        return settings;
    };

    saveSettings() {
        let settings = this.getSettings();
        localStorage.setItem("printSettings", JSON.stringify(settings));
    };

    loadSettings() {
        let temp = localStorage.getItem("printSettings");

        if (temp) {
            this.savedSettings = JSON.parse(temp);
        }
        else // load defaults
        {
            this.savedSettings = new PrintSettings();
            this.savedSettings.mapName = 'topo2';
            this.savedSettings.radiusR25 = 500;
            this.savedSettings.radiusR50 = 2500;
            this.savedSettings.paperSize = { name: "A4 Landscape", width: 0.29725, height: 0.21025 };
            this.savedSettings.scaleAndTileSize = { "scale": 50000.0, "tileSizeInMeters": 2708.0, "name": "1:50000 (Hi)" };
            this.savedSettings.showCrossHair = true;
            this.savedSettings.showLatLonGrid = false;
            this.savedSettings.showUtmGrid = true;
        }
 
        this.name = this.savedSettings.title;
        this.r25 = this.savedSettings.radiusR25;
        this.r50 = this.savedSettings.radiusR50;
        this.showCrossHair = this.savedSettings.showCrossHair;
        this.showLatLonGrid = this.savedSettings.showLatLonGrid;
        this.showUtmGrid = this.savedSettings.showUtmGrid;
    }
}