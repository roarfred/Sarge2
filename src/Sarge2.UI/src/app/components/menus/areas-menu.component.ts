import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { ActivatedRoute } from '@angular/router';

declare var ol: any;

@Component({
    selector: 'my-areas-menu',
    templateUrl: 'areas-menu.component.html',
    styleUrls: ['areas-menu.component.css']
})
export class AreasMenuComponent implements OnInit {
    public defaultFillColor: string = "#ffff9911";
    public defaultStrokeColor: string = "#9900ff99";
    public defaultStrokeWidth: number = 2;
    
    private drawingLayer: any;
    private displayLayer: any;
    private displaySource: any;
    private draw: any;
    private style: any;
    private source: any;
    
    public started: boolean = false;
    
    @Input()
    public map: any;
    itemsRef: AngularFireList<any>;
    items: Observable<any[]>;
    areaFeatures: any = {};

    constructor(private db: AngularFireDatabase, private route: ActivatedRoute) {
    }

    private loadMapData(map: string) {
        this.itemsRef = this.db.list('maps/' + map + "/areas");
        
        // Use snapshotChanges().map() to store the key
        this.items = this.itemsRef.snapshotChanges().map(changes => {
          return changes.map(c => ({ 
              key: c.payload.key, 
              ...c.payload.val()
            }));
        });

        this.itemsRef.auditTrail().subscribe(actions => {
            actions.forEach(action => {
                console.log("Firebase ACTION: " + action.type + ", key: " + action.key);
                console.log(action.payload.val());

                if (action.type == "child_added")
                {
                    if (this.areaFeatures[action.key] == null)
                    {
                        let coords = action.payload.child("coords").val();
                        let polygon = new ol.geom.Polygon(coords);
                        
                        polygon.transform("EPSG:4326", "EPSG:32633");
                        // Create feature with polygon.
                        var feature = new ol.Feature({
                            geometry: polygon
                        });
                        feature.setStyle(new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: action.payload.child("strokeColor").val() || "blue",
                                width: action.payload.child("strokeWidth").val() || 2
                            }),
                            fill: new ol.style.Fill({
                                color: action.payload.child("fillColor").val() || "#ffff0011"
                            }),
                            text: new ol.style.Text({
                                
                                text: action.payload.child("name").val()
                            })
                        }));
    
    
                        if (this.displaySource == null)
                        {
                            this.displaySource = new ol.source.Vector({ wrapX: false });
                            this.displayLayer = new ol.layer.Vector({
                                source: this.displaySource,
                                zIndex: 99
                            });
                            this.map.addLayer(this.displayLayer);
                        }
                        this.displaySource.addFeature(feature);
                        this.areaFeatures[action.key] = feature;
                    }
                }
                else if (action.type == "child_removed")
                {
                    if (this.areaFeatures[action.key] != null)
                    {
                        this.displaySource.removeFeature(this.areaFeatures[action.key]);
                        this.areaFeatures[action.key] = null;
                    }
                }
            });
        });
    }

    public ngOnInit(): void {
        this.style = new ol.style.Style({
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

        this.source = new ol.source.Vector({ wrapX: false });
        this.drawingLayer = new ol.layer.Vector({
            source: this.source,
            style: this.style,
            zIndex: 100
        });

        this.map.addLayer(this.drawingLayer);

        this.route.params.subscribe(params => {
            let map = params["id"] || "demo";
            this.loadMapData(map);
        });
    }
    public startDrawing(): void {
        var value = 'Polygon';
        this.draw = new ol.interaction.Draw({
            source: this.source,
            style: this.style,
            type: /** @type {ol.geom.GeometryType} */ (value),
            minPoints: 2
        });
/*
        this.draw.on('drawstart', (event) => {
            let sketch = event.feature;
            this.track = sketch.getGeometry();
            let position = this.track.getCoordinates()[0];
            this.distances = new Array<number>();
            this.started = true;
            this.mouseTracker = this.trackMeasureDistance;
        }, this);
*/
        this.draw.on('change', (event) => {
            console.log("change");
        });

        this.draw.on('drawend', (event) => {
            let sketch = event.feature;
            let area = sketch.getGeometry();
            area.transform("EPSG:32633", "EPSG:4326");
            let coords = area.getCoordinates();

            this.itemsRef.push({
                "name": "area", 
                "strokeColor": this.defaultStrokeColor,
                "strokeWidth": this.defaultStrokeWidth,
                "fillColor": this.defaultFillColor,
                "coords": coords
            });

            this.map.removeInteraction(this.draw);

            // avoid more mouse move events
            this.started = false;
        }, this);


        this.map.addInteraction(this.draw);
        this.started = true;
    }

    deleteItem(item): void {
        this.itemsRef.remove(item.key);
    }
}