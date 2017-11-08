import { Component, Input } from '@angular/core';
import { Location } from '../../models';
declare var ol: any;

@Component({
    selector: 'my-measure-menu',
    templateUrl: './measure-menu.component.html',
    styleUrls: ['./measure-menu.component.css']
})
export class MeasureMenuComponent {
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

    distance: number;
    direction: number;

    measureLine(): void {
        this.distance = null;
        this.direction = null;
        
        this.stopDraw();

        var source = new ol.source.Vector({ wrapX: false });
        this.drawingLayer = new ol.layer.Vector({
            source: source
        });
        this.map.addLayer(this.drawingLayer);

        var value = 'LineString';
        this.draw = new ol.interaction.Draw({
            source: source,
            type: /** @type {ol.geom.GeometryType} */ (value),
            maxPoints: 2,
            minPoints: 2
        });

        this.draw.on('drawstart', (event) => {
            let sketch = event.feature;
            let position = sketch.getGeometry().getCoordinates()[0];
            this.startPosition = new Location(33, position[0], position[1]).getLocalLocation();
            this.mouseTracker = this.trackMeasureDistance;
        }, this);

        this.draw.on('drawend', (event) => {
            this.map.removeInteraction(this.draw);
            this.mouseTracker = null;

            // avoid more mouse move events
            let from = this.startPosition;
            this.startPosition = null;

            let sketch = event.feature;
            let position = sketch.getGeometry().getCoordinates()[1];
            let to = new Location(33, position[0], position[1]).getLocalLocation();

            this.measureDistance(from, to);
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

    trackMeasureDistance(event) : void {
        if (this.startPosition) {
            var current = event.coordinate;
            var to = new Location(33, current[0], current[1]).getLocalLocation();
            this.measureDistance(this.startPosition, to);
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