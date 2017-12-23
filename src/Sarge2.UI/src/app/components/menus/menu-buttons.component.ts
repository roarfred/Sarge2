import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-menu-buttons',
    templateUrl: './menu-buttons.component.html',
    styleUrls: ['./menu-buttons.component.css']
}) export class MenuButtonsComponent {
    public menuName: string;
    public menuItems: Array<any> = [
        {name: 'print', icon: 'print'},
        {name: 'location', icon: 'info_outline'},
        {name: 'measure', icon: 'straighten'},
        {name: 'tracks', icon: 'gesture'},
        {name: 'pois', icon: 'flag'},
        {name: 'areas', icon: 'format_shapes'},
        {name: 'import', icon: 'backup'}
    ];
    @Output()
    public menuClick = new EventEmitter<string>();
    public toggleMenu(menuName: string): void {
        this.menuName = menuName;
        this.menuClick.emit(menuName);
    }
}
