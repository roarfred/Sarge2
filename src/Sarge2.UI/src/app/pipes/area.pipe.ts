import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'area' })
export class AreaPipe implements PipeTransform {
    transform(value: number): string {
        if (value)
        {
            if (value < 100)
                return `${value.toFixed(2)} m²`;
            else if (value < 500)
                return `${value.toFixed(1)} m²`;
            else if (value < 10000)
                return `${(value / 1000).toFixed(2)} ha`
            else if (value < 100000)
                return `${(value / 1000).toFixed(1)} ha`
            else if (value < 1000000)
                return `${(value / 1000).toFixed(0)} ha`
            else if (value < 10000000)
                return `${(value / 1000000).toFixed(2)} km²`;
            else if (value < 10000000)
                return `${(value / 1000000).toFixed(1)} km²`;
            else 
                return `${(value / 1000000).toFixed(0)} km²`;
        }   
        else
            return "";
    }
}