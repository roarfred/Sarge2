"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Location = (function () {
    function Location(zone, easting, norting) {
        this.zone = zone;
        this.easting = easting;
        this.northing = norting;
        Location.initProj4();
    }
    ;
    Location.prototype.getLatLongLocation = function () {
        return this.getLocation(0);
    };
    Location.prototype.getLocalLocation = function () {
        if (this.zone == 0) {
            var newZone = Location.getUtmZoneFromLatLong(this.easting, this.northing);
            var newLocation = proj4(Location.getProjectionName(0), Location.getProjectionName(newZone), [this.easting, this.northing]);
            return new Location(newZone, newLocation[0], newLocation[1]);
        }
        else
            return this.getLatLongLocation().getLocalLocation();
    };
    Location.prototype.getLocation = function (zone) {
        if (zone == this.zone)
            return new Location(this.zone, this.easting, this.northing);
        else {
            var newLocation = proj4(Location.getProjectionName(this.zone), Location.getProjectionName(zone), [this.easting, this.northing]);
            return new Location(zone, newLocation[0], newLocation[1]);
        }
    };
    Location.initProj4 = function () {
        if (proj4.defs["EPSG:32601"] == null) {
            for (var i = 1; i < 60; i++) {
                var zone = Location.getProjectionName(i);
                proj4.defs(zone, "+proj=utm +zone=" + i + " +ellps=WGS84 +datum=WGS84 +units=m +no_defs");
                console.log("Created projection def for " + zone);
            }
        }
    };
    Location.getProjectionName = function (zone) {
        if (zone == 0)
            return "EPSG:4326";
        else
            return "EPSG:326" + (zone < 10 ? "0" : "") + zone.toString();
    };
    ;
    Location.prototype.getUtmZone = function () {
        if (this.zone == 0)
            return Location.getUtmZoneFromLatLong(this.easting, this.northing);
        else
            return this.getLatLongLocation().getUtmZone();
    };
    Location.prototype.getUtmZoneLetter = function () {
        if (this.zone == 0)
            return Location.getUtmZoneLetterFromLatLong(this.easting, this.northing);
        else
            return this.getLatLongLocation().getUtmZoneLetter();
    };
    Location.getUtmZoneFromLatLong = function (longitude, latitude) {
        var zone = Math.floor(longitude / 6.0) + 31;
        // Exception #1: Zone 32 is widened (at the cost of zone 31) at the west coast of norway, between 56 and 64 degrees
        if (zone == 31 && latitude >= 56 && latitude < 64 && longitude > 3.0)
            zone++;
        // Exception #2: Between 72 and 84 degrees, the following zones are different:
        // 31: widened to 9 degrees, eastwards
        // 32: eliminated
        // 33: widened to 12 degrees, 3 degrees both east and west
        // 34: eliminated
        // 35: widened to 12 degrees, 3 degrees both east and west
        // 36: eliminated
        // 37: widened to 9 degrees, westwards
        if (zone > 31 && zone < 37 && latitude >= 72 && latitude < 84) {
            if (longitude < 9)
                zone = 31;
            else if (longitude < 21)
                zone = 33;
            else if (longitude < 33)
                zone = 35;
            else
                zone = 37;
        }
        return zone;
    };
    ;
    Location.getUtmZoneLetterFromLatLong = function (longitude, latitude) {
        // From http://www.dmap.co.uk/utmworld.htm
        // There are 20 latitudinal zones spanning the latitudes 80°S to 84°N and 
        // denoted by the letters C to X, ommitting the letters O and I. Each of these is 
        // 8 degrees south-north, apart from zone X which is 12 degrees south-north.
        if (latitude < -80 || latitude > 84)
            return null; // We're outside the UTM definition
        var letters = ["C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "X"]; // An extra X at the end to include the 80-84 degrees north
        var index = Math.floor((latitude + 80) / 8);
        return letters[index];
    };
    return Location;
}());
exports.Location = Location;
//# sourceMappingURL=location.model.js.map