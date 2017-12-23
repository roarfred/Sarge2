import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'direction' })
export class DirectionPipe implements PipeTransform {
    transform(value: number): string {
        if (value) {
            return value.toFixed(0) + '°';
        } else {
            return '';
        }
    }
}
