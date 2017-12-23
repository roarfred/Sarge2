import { MapSource } from './map-source.model';
import { PaperSize } from './paper-size.model';
import { ScaleAndTileSize } from './scale-and-tile-size.model';
import { Margins } from './margins.model';
import { Location } from './location.model';

export class PrintSettings {
    mapName: string;
    margins: Margins;
    title: string;
    location: Location;

    paperSize: PaperSize;
    scaleAndTileSize: ScaleAndTileSize;

    showUtmGrid: boolean;
    showLatLonGrid: boolean;
    showCrossHair: boolean;

    radiusR50: number;
    radiusR25: number;
}
