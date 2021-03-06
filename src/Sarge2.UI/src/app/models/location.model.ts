declare var proj4: any;

export class Location {
    zone: number;
    easting: number;
    northing: number;

    static initProj4(): void {
        if (proj4.defs['EPSG:32601'] == null) {
            for (let i = 1; i < 60; i++) {
                const zone = Location.getProjectionName(i);
                proj4.defs(zone, '+proj=utm +zone=' + i + ' +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
            }
        }
    }

    static getProjectionName(zone: number): string {
        if (zone === 0) {
            return 'EPSG:4326';
        } else {
            return 'EPSG:326' + (zone < 10 ? '0' : '') + zone.toString();
        }
    }

    static getUtmZoneFromLatLong(longitude: number, latitude: number): number {
        let zone = Math.floor(longitude / 6.0) + 31;

        // Exception #1: Zone 32 is widened (at the cost of zone 31) at the west coast of norway, between 56 and 64 degrees
        if (zone === 31 && latitude >= 56 && latitude < 64 && longitude > 3.0) {
            zone++;
        }
        // Exception #2: Between 72 and 84 degrees, the following zones are different:
        // 31: widened to 9 degrees, eastwards
        // 32: eliminated
        // 33: widened to 12 degrees, 3 degrees both east and west
        // 34: eliminated
        // 35: widened to 12 degrees, 3 degrees both east and west
        // 36: eliminated
        // 37: widened to 9 degrees, westwards
        if (zone > 31 && zone < 37 && latitude >= 72 && latitude < 84) {
            if (longitude < 9) {
                zone = 31;
            } else if (longitude < 21) {
                zone = 33;
            } else if (longitude < 33) {
                zone = 35;
            } else {
                zone = 37;
            }
        }
        return zone;
    }

    static getUtmZoneLetterFromLatLong(longitude: number, latitude: number): string {
        // From http://www.dmap.co.uk/utmworld.htm
        // There are 20 latitudinal zones spanning the latitudes 80°S to 84°N and
        // denoted by the letters C to X, ommitting the letters O and I. Each of these is
        // 8 degrees south-north, apart from zone X which is 12 degrees south-north.

        if (latitude < -80 || latitude > 84) {
            return null;  // We're outside the UTM definition
        }

        // Adding an extra X at the end to include the 80-84 degrees north
        const letters = ['C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'X'];
        const index = Math.floor((latitude + 80) / 8);
        return letters[index];
    }

    constructor(zone: number, easting: number, norting: number) {
        this.zone = zone;
        this.easting = easting;
        this.northing = norting;
        Location.initProj4();
    }

    equals(location: Location) {
        return location &&
            location.zone === this.zone &&
            location.easting === this.easting &&
            location.northing === this.northing;
    }
    getLatLongLocation(): Location {
        return this.getLocation(0);
    }

    getLocalLocation(): Location {
        if (this.zone === 0) {
            const newZone = Location.getUtmZoneFromLatLong(this.easting, this.northing);
            const newLocation = proj4(Location.getProjectionName(0), Location.getProjectionName(newZone), [this.easting, this.northing]);
            return new Location(newZone, newLocation[0], newLocation[1]);
        } else {
            return this.getLatLongLocation().getLocalLocation();
        }
    }

    getDistanceTo(other: Location): number {
        if (this.zone !== other.zone) {
            return(this.getDistanceTo(other.getLocation(this.zone)));
        } else {
            const n = Math.abs(this.northing - other.northing);
            const e = Math.abs(this.easting - other.easting);
            return Math.sqrt(Math.pow(n, 2) + Math.pow(e, 2));
        }
    }

    getCircularArea(other: Location): number {
        const radius = this.getDistanceTo(other);
        return Math.PI * Math.pow(radius, 2);
    }

    getDirectionTo(other: Location): number {
        if (this.zone !== other.zone) {
            return(this.getDistanceTo(other.getLocation(this.zone)));
        } else {
            const n = other.northing - this.northing;
            const e = other.easting - this.easting;
            const rad = Math.atan2(e, n); // In radians
            const deg = rad * (180 / Math.PI);
            return (deg + 360) % 360; // Make 'em all positive
        }
    }

    getLocation(zone: number) {
        if (zone === this.zone) {
            return new Location(this.zone, this.easting, this.northing);
        } else {
            const newLocation = proj4(
                Location.getProjectionName(this.zone),
                Location.getProjectionName(zone),
                [this.easting, this.northing]);
            return new Location(zone, newLocation[0], newLocation[1]);
        }
    }

    getUtmZone(): number {
        if (this.zone === 0) {
            return Location.getUtmZoneFromLatLong(this.easting, this.northing);
        } else {
            return this.getLatLongLocation().getUtmZone();
        }
    }

    getUtmZoneLetter(): string {
        if (this.zone === 0) {
            return Location.getUtmZoneLetterFromLatLong(this.easting, this.northing);
        } else {
            return this.getLatLongLocation().getUtmZoneLetter();
        }
    }
}
