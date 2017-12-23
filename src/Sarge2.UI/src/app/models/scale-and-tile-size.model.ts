export class ScaleAndTileSize {
    name: string;
    scale: number;
    tileSizeInMeters: number;

    constructor(name: string, scale: number, tileSizeInMeters: number) {
        this.name = name;
        this.scale = scale;
        this.tileSizeInMeters = tileSizeInMeters;
    }
}
