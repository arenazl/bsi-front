import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pipes
import { SafeHtmlPipe } from './pipes/sanitize.pipe';
import { BsiCurrencyPipe } from './pipes/bsi-currency.pipe';

// Components
import { WorldLoaderComponent } from '../components/shared/world-loader/world-loader.component';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    BsiCurrencyPipe,
    WorldLoaderComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SafeHtmlPipe,
    BsiCurrencyPipe,
    CommonModule,
    WorldLoaderComponent
  ],
  providers: [
    BsiCurrencyPipe
  ]
})
export class SharedModule { }