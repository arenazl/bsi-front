import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-world-loader',
  templateUrl: './world-loader.component.html',
  styleUrls: ['./world-loader.component.css']
})
export class WorldLoaderComponent {
  @Input() text: string = 'Cargando...';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showText: boolean = true;
}