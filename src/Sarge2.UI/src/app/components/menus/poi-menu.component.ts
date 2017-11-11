import { Component, Input } from '@angular/core';

@Component({
    selector: 'my-poi-menu',
    templateUrl: './poi-menu.component.html',
    styles: ['']
})
export class PoiMenuComponent {
    
    _pois: any;
    map: any;

    @Input()
    get pois() : any {
        return this._pois;
    }
    set pois(pois: any) {
        this._pois = pois;
    }
}