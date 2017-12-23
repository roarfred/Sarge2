import 'rxjs/add/operator/toPromise';
import { environment } from '../../environments/environment';

import { Injectable } from '@angular/core';
import { Headers, Http, ResponseContentType } from '@angular/http';

import { PaperSize } from '../models/paper-size.model';
import { ScaleAndTileSize } from '../models/scale-and-tile-size.model';
import { MapSource } from '../models/map-source.model';
import { PrintSettings } from '../models/print-settings.model';

import * as FileSaver from 'file-saver';

@Injectable()
export class MapService {
    private headers = new Headers({ 'Content-Type': 'application/json' });
    private baseUrl = environment.apiUrl;

    constructor(private http: Http) { }

    getMapSources(): Promise<Array<MapSource>> {
        return this.http
            .get(`${this.baseUrl}/api/mapsource`, { headers: this.headers })
            .toPromise()
            .then((result) => result.json())
            .catch((error) => console.error(error));
    }

    getPaperSizes(): Promise<Array<PaperSize>> {
        return this.http
            .get(`${this.baseUrl}/api/papersize`, { headers: this.headers })
            .toPromise()
            .then((result) => result.json())
            .catch((error) => console.error(error));
    }

    getScales(mapName: string): Promise<Array<ScaleAndTileSize>> {
        return this.http
            .get(`${this.baseUrl}/api/scale/${mapName}`, { headers: this.headers })
            .toPromise()
            .then((result) => result.json())
            .catch((error) => console.error(error));
    }

    downloadMap(settings: PrintSettings): Promise<boolean> {
        return this.http
            .post(`${this.baseUrl}/api/mapaspdf`, settings, { headers: this.headers, responseType: ResponseContentType.Blob })
            .toPromise()
            .then((result) => {
                FileSaver.saveAs(result.blob(), 'Map.pdf');
                return null;
            })
            .catch((error) => console.error(error));
    }

    getPoiSymbolNames(): Promise<Array<string>> {
        return this.http
            .get(`${this.baseUrl}/api/symbols`, { headers: this.headers })
            .toPromise()
            .then((result) => result.json())
            .catch((error) => console.error(error));
    }
}
