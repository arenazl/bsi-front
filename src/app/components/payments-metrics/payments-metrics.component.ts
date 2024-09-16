import { Component, OnInit, ViewEncapsulation, ElementRef, NgZone } from '@angular/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { PaymentMetrics } from './PaymentMetrics';

@Component({
  selector: 'app-payments-metrics',
  template: `
    <div class="">
      <div class="">
        <!-- Este div está vacío como en tu ejemplo -->
      </div>
      <div class="">
        <div #reactContainer class="tailwind-scope w-full">
          <!-- React component will be rendered here -->
        </div>     
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class PaymentsMetricsComponent implements OnInit {
  constructor(private elementRef: ElementRef, private ngZone: NgZone) {}

  ngOnInit() {
    this.renderReactComponent();
  }

  private renderReactComponent() {
    this.ngZone.runOutsideAngular(() => {
      const container = this.elementRef.nativeElement.querySelector('.tailwind-scope');
      if (container) {
        ReactDOM.render(
          React.createElement(PaymentMetrics),
          container
        );
      }
    });
  }

  ngOnDestroy() {
    const container = this.elementRef.nativeElement.querySelector('.tailwind-scope');
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
    }
  }
}