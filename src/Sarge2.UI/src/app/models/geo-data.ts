export class GeoData {
    
    public tracks: Array<Track>;
    public pois: Array<Poi>;
    public name: string;

    constructor() {

    }
}

export class Track {
    public name: string;
    public pointCount: number;
    
    public points: Array<TimePoint>;
}

export class Poi {
    
}

export class TimePoint {
    public timeUtc: Date;
    public position: Position;
}

export class Position {
    public longitude: number;
    public latitude: number;
}
    