import { Component, Input } from '@angular/core';
import { Location } from '../../../models';
declare var ol: any;

@Component({
    selector: 'my-measure-area',
    templateUrl: './measure-area.component.html',
    styleUrls: ['./measure-area.component.css', './measure-common.css']
})
export class MeasureAreaComponent {
    _map: any;

    @Input()
    get map(): any {
        return this._map;
    }
    set map(map: any) {
        if (map != this._map) {
            this._map = map;
            if (this._map) {
                this._map.on('pointermove', this.mouseMove, this);
            }
        }
    }

    private mouseTracker: any;

    draw: any = null;
    drawingLayer: any = null;
    started: boolean;
    track: any;

    distance: number;
    area: number;

    measure(): void {
        this.distance = null;
        this.started = false;

        this.stopDraw();

        var style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "red",
                width: 4
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#33ccff'
                })
            })
        });

        var source = new ol.source.Vector({ wrapX: false });
        this.drawingLayer = new ol.layer.Vector({
            source: source,
            style: style
        });
        this.map.addLayer(this.drawingLayer);

        var value = 'Polygon';
        this.draw = new ol.interaction.Draw({
            source: source,
            style: style,
            type: /** @type {ol.geom.GeometryType} */ (value),
            minPoints: 2
        });

        this.draw.on('drawstart', (event) => {
            let sketch = event.feature;
            this.track = sketch.getGeometry();
            let position = this.track.getCoordinates()[0];
            this.distances = new Array<number>();
            this.started = true;
            this.mouseTracker = this.trackMeasureDistance;
        }, this);

        this.draw.on('change', (event) => {
            console.log("change");
        });

        this.draw.on('drawend', (event) => {
            this.map.removeInteraction(this.draw);
            this.mouseTracker = null;

            // avoid more mouse move events
            this.started = false;
        }, this);


        this.map.addInteraction(this.draw);

        /*
        Circle
        Geometry
        GeometryCollection
        LinearRing
        LineString
        MultiLineString
        MultiPoint
        MultiPolygon
        Point
        Polygon
        SimpleGeometry
        */
    };

    private mouseMove(event): void {
        if (this.mouseTracker)
            this.mouseTracker(event);
    };

    distances: Array<number>;
    
    trackMeasureDistance(event): void {
        if (this.started) {
            let coords = this.track.getCoordinates()[0];
            if (coords.length < 3) return;

            // coords contains each point, but the last one and first one is the same
            // the last point is also the current mouse position, so just skip that
            if (coords.length > this.distances.length + 3) {
                for (let i = this.distances.length; i < coords.length - 3; i++) {
                    let prev = new Location(33, coords[i][0], coords[i][1]);
                    let next = new Location(33, coords[i + 1][0], coords[i + 1][1]);
                    let dist = prev.getDistanceTo(next);
                    this.distances.push(dist);
                }
            }

            let dist = 0;
            this.distances.forEach(v => dist += v);

            // now, let's add in the distance to the current mouse position and then back to start
            let secondLastCoord = coords[coords.length - 3];
            let secondLast = new Location(33, secondLastCoord[0], secondLastCoord[1]).getLocalLocation();

            let lastCoord = coords[coords.length - 2];
            let last = new Location(33, lastCoord[0], lastCoord[1]).getLocalLocation();
            dist += secondLast.getDistanceTo(last);

            let firstCoord = coords[coords.length - 1];
            let first = new Location(33, firstCoord[0], firstCoord[1]).getLocalLocation();
            dist += last.getDistanceTo(first);

            this.distance = dist;

            // Not quite sure if this will make much of an error, but should maybe be calculated from the local projection
            this.area = ol.Sphere.getArea(this.track, { projection: Location.getProjectionName(33) });
        }
    }

    measureDistance(from: Location, to: Location): void {
        this.distance = from.getDistanceTo(to);
    }

    stopDraw(): void {
        if (this.draw) {
            this.map.removeInteraction(this.draw);
            this.draw = null;

            this.map.removeLayer(this.drawingLayer);
            this.drawingLayer = null;
        }
    }

}