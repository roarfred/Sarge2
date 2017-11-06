import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";

// This is necessary to access ol3!
declare var ol: any;

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit
{ 
  public map: any;
  public name: string;

  constructor(){
    this.name = 'Angular'; 
    var osm_layer: any = new ol.layer.Tile({
        source: new ol.source.OSM()
    });

    // note that the target cannot be set here!
    this.map = new ol.Map({
        layers: [osm_layer],
        view: new ol.View({
        center: ol.proj.transform([0,0], 'EPSG:4326', 'EPSG:3857'),
        zoom: 2
        })
    });
}
    // After view init the map target can be set!
    ngAfterViewInit() {
      this.map.setTarget(this.map.nativeElement.id);
  }
  
}
