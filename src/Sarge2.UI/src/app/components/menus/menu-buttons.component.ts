import { Component, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
    selector: 'app-menu-buttons',
    templateUrl: './menu-buttons.component.html',
    styleUrls: ['./menu-buttons.component.css']
}) export class MenuButtonsComponent {
    public menuName: string;
    @ViewChild('photo') photo: any;
    public menuItems: Array<any> = [
        {name: 'print', icon: 'print'},
        {name: 'location', icon: 'info_outline'},
        {name: 'measure', icon: 'straighten'},
        {name: 'tracks', icon: 'gesture'},
        {name: 'pois', icon: 'flag'},
        {name: 'areas', icon: 'format_shapes'},
        {name: 'import', icon: 'backup'}
        // ,{name: 'camera', icon: 'photo_camera', action: this.capturePhoto}
    ];
    @Output()
    public menuClick = new EventEmitter<string>();
    public toggleMenu(menuName: string): void {
        this.menuName = menuName;
        this.menuClick.emit(menuName);
    }
    public click(item) {
        if (item.action) {
            item.action(item, this);
        } else {
            this.toggleMenu(item.name);
        }
    }
    /*
    public capturePhoto(item, component): void {
        component.photo.nativeElement.click();
    }
    */
}
