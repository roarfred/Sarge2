function getUtmZone(longitude, latitude) {
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
}

function getProjectionName(zone) {
    var z = (zone < 10 ? "0" : "") + zone.toString();
    return "EPSG:326" + z;
}