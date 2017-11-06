export class ScaleAndTileSize {
    constructor(name: string, scale: number, tileSizeInMeters: number) {
        this.name = name;
        this.scale = scale;
        this.tileSizeInMeters = tileSizeInMeters;
    }
    name: string;
    scale: number;
    tileSizeInMeters: number;
}