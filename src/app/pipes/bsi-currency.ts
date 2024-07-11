import {
    getLocaleCurrencyCode,
    getLocaleCurrencySymbol,
} from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";


@Pipe({
    name: "BsiCurrencyPipe",
})
export class BsiCurrencyPipe implements PipeTransform {
    constructor() { }

    transform(value: any, currencySymbol: string = '$'): string {

        if (value == null || isNaN(value)) return '';

        // Asegurarse de que el valor es un número
        let numericValue = parseFloat(value);

        // Convert the number to a string with fixed decimal places (as stored)
        let valueString = numericValue.toFixed(2).toString();

        // Split the value into integer and decimal parts
        let [integerPart, decimalPart] = valueString.split('.');

        // Format the integer part with comma as thousands separator
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        // Concatenate the parts with a comma as the decimal separator
        let formattedValue = `${integerPart},${decimalPart}`;

        return `${currencySymbol} ${formattedValue}`;

    }
}
