import { Component, Input } from '@angular/core';
import { Location } from '../../../models';
declare var ol: any;

@Component({
    selector: 'app-measure-area',
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
        if (map !== this._map) {
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
    distances: Array<number>;
    area: number;

    measure(): void {
        this.distance = null;
        this.started = false;

        this.stopDraw();

        const style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 4
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#33ccff'
                })
            })
        });

        const source = new ol.source.Vector({ wrapX: false });
        this.drawingLayer = new ol.layer.Vector({
            source: source,
            style: style
        });
        this.map.addLayer(this.drawingLayer);

        const value = 'Polygon';
        this.draw = new ol.interaction.Draw({
            source: source,
            style: style,
            type: /** @type {ol.geom.GeometryType} */ (value),
            minPoints: 2
        });

        this.draw.on('drawstart', (event) => {
            const sketch = event.feature;
            this.track = sketch.getGeometry();
            const position = this.track.getCoordinates()[0];
            this.distances = new Array<number>();
            this.started = true;
            this.mouseTracker = this.trackMeasureDistance;
        }, this);

        this.draw.on('change', (event) => {
            console.log('change');
        });

        this.draw.on('drawend', (event) => {
            this.trackMeasureDistance(null);

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
    }

    private mouseMove(event): void {
        if (this.mouseTracker) {
            this.mouseTracker(event);
        }
    }

    trackMeasureDistance(event): void {
        if (this.started) {
            const coords = this.track.getCoordinates()[0];
            if (coords.length < 3) {
                return;
            }

            // coords contains each point, but the last one and first one is the same
            // the last point is also the current mouse position, so just skip that
            if (coords.length > this.distances.length + 3) {
                for (let i = this.distances.length; i < coords.length - 3; i++) {
                    const prev = new Location(33, coords[i][0], coords[i][1]);
                    const next = new Location(33, coords[i + 1][0], coords[i + 1][1]);
                    const distance = prev.getDistanceTo(next);
                    this.distances.push(distance);
                }
            }

            let dist = 0;
            this.distances.forEach(v => dist += v);

            // now, let's add in the distance to the current mouse position and then back to start
            const secondLastCoord = coords[coords.length - 3];
            const secondLast = new Location(33, secondLastCoord[0], secondLastCoord[1]).getLocalLocation();

            const lastCoord = coords[coords.length - 2];
            const last = new Location(33, lastCoord[0], lastCoord[1]).getLocalLocation();
            dist += secondLast.getDistanceTo(last);

            const firstCoord = coords[coords.length - 1];
            const first = new Location(33, firstCoord[0], firstCoord[1]).getLocalLocation();
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
