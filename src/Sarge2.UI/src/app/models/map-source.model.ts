export class MapSource {
    name: string;
    layer: number;
    tileSize: number;
    eastOrigin: number;
    northOrigin: number;

    constructor(name: string) {
        this.name = name;
    }
}
