export class MapSource {
    constructor(name: string) {
        this.name = name;
    };
    
    name: string;
    layer: number;
    tileSize: number;
    eastOrigin: number;
    northOrigin: number;
}