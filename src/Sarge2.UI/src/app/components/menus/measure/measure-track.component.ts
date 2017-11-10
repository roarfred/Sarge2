import { Component, Input } from '@angular/core';
import { Location } from '../../../models';
declare var ol: any;

@Component({
    selector: 'my-measure-track',
    templateUrl: './measure-track.component.html',
    styleUrls: ['./measure-track.component.css', './measure-common.css']
})
export class MeasureTrackComponent {
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
    startPosition: Location;
    track: any;

    distance: number;
    direction: number;
    straightDistance: number;

    measure(): void {
        this.distance = null;
        this.direction = null;

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

        var value = 'LineString';
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
            this.startPosition = new Location(33, position[0], position[1]).getLocalLocation();
            this.distances = new Array<number>();
            this.mouseTracker = this.trackMeasureDistance;
        }, this);

        this.draw.on('change', (event) => {
            console.log("change");
        });

        this.draw.on('drawend', (event) => {
            this.trackMeasureDistance(null);
            this.map.removeInteraction(this.draw);
            this.mouseTracker = null;

            // avoid more mouse move events
            let from = this.startPosition;
            this.startPosition = null;
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
        if (this.startPosition) {
            let coords = this.track.getCoordinates();

            if (coords.length > this.distances.length + 2) {
                for (let i = this.distances.length; i < coords.length - 2; i++) {
                    let prev = new Location(33, coords[i][0], coords[i][1]);
                    let next = new Location(33, coords[i + 1][0], coords[i + 1][1]);
                    let dist = prev.getDistanceTo(next);
                    this.distances.push(dist);
                }
            }

            let dist = 0;
            this.distances.forEach(v => dist += v);

            // add inn the distance to current cursor position
            let lastCoord = coords[coords.length-2];
            let last = new Location(33, lastCoord[0], lastCoord[1]).getLocalLocation();
            
            var current = coords[coords.length-1];
            var to = new Location(33, current[0], current[1]).getLocalLocation();
            dist += last.getDistanceTo(to);
            this.distance = dist;

            this.straightDistance = this.startPosition.getDistanceTo(to);
            this.direction = this.startPosition.getDirectionTo(to);
            /*
                        var current = event.coordinate;
                        var to = new Location(33, current[0], current[1]).getLocalLocation();
                        this.measureDistance(this.startPosition, to);
                        */
        }
    }

    measureDistance(from: Location, to: Location): void {
        this.distance = from.getDistanceTo(to);
        this.direction = from.getDirectionTo(to);
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