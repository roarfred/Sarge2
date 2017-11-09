import { Component, Input } from '@angular/core';
import { Location } from '../../models';
declare var ol: any;

@Component({
    selector: 'my-measure-menu',
    templateUrl: './measure-menu.component.html',
    styleUrls: ['./measure-menu.component.css']
})
export class MeasureMenuComponent {
    @Input()
    map: any;
}