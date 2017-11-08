import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'distance' })
export class DistancePipe implements PipeTransform {
    transform(value: number): string {
        if (!value)
            return "";
        else if (value < 10)
            return value.toFixed(1) + " m";
        else if (value < 2000)
            return value.toFixed(0) + " m";
        else if (value < 10000)
            return (value / 1000).toFixed(2) + " km";
        else if (value < 100000)
            return (value / 1000).toFixed(1) + " km";
        else 
            return (value / 1000).toFixed(0) + " km";
    }
}