import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pipes
import { SafeHtmlPipe } from './pipes/sanitize.pipe';
import { BsiCurrencyPipe } from './pipes/bsi-currency.pipe';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    BsiCurrencyPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SafeHtmlPipe,
    BsiCurrencyPipe,
    CommonModule
  ],
  providers: [
    BsiCurrencyPipe
  ]
})
export class SharedModule { }