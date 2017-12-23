import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timespan' })
export class TimespanPipe implements PipeTransform {
    transform(value: number): string {
        if (!value) {
            return '';
        }

        const hours = Math.floor(value / 1000 / 60 / 60);
        const minutes = Math.floor(value / 1000 / 60) % 60;
        const seconds = Math.floor(value / 1000) % 60;
        const milliseconds = value % 1000;

        if (hours > 0) {
            return hours + 'h ' + minutes + 'm';
        } else if (minutes > 0) {
            return minutes + 'm ' + seconds + 's';
        } else if (seconds > 0) {
            return seconds + 's ' + milliseconds + 'ms';
        } else {
            return milliseconds + 'ms';
        }
    }
}
