import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'utmLocation' })
export class UtmLocationPipe implements PipeTransform {
    transform(value: number): string {
        return this.pad(Math.round(value), 7);
    }

    pad(value: number, digits: number) {
        let v = value.toString();
        while (v.length < digits) {
            v = '0' + v;
        }
        return v;
    }
}
