import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pentagram-learning',
  templateUrl: './pentagram-learning.component.html',
  styleUrls: ['./pentagram-learning.component.css']
})
export class PentagramLearningComponent implements OnInit {

  notas = [
    { 
      nombre: 'Do', 
      y: 170, // Primera posición ajustada
      consejos: [
        'Do se encuentra en el espacio inferior del pentagrama.',
        'Recuerda: Do es la nota más baja del pentagrama en clave de sol.'
      ]
    },
    { 
      nombre: 'Re', 
      y: 150,
      consejos: [
        'Re está justo debajo de la primera línea del pentagrama.',
        'Puedes recordar Re porque es la nota que toca la línea inferior pero está justo afuera.'
      ]
    },
    { 
      nombre: 'Mi', 
      y: 130,
      consejos: [
        'Mi se encuentra en la primera línea del pentagrama.',
        'Recuerda: Mi es la nota de la primera línea en clave de sol.'
      ]
    },
    { 
      nombre: 'Fa', 
      y: 110,
      consejos: [
        'Fa está en el primer espacio del pentagrama.',
        'Fa se ubica justo por encima de Mi, en el primer espacio.'
      ]
    },
    { 
      nombre: 'Sol', 
      y: 90,
      consejos: [
        'Sol está en la segunda línea del pentagrama.',
        'Sol es la segunda línea y tiene una gran importancia en clave de sol, ya que la clave lleva su nombre.'
      ]
    },
    { 
      nombre: 'La', 
      y: 70,
      consejos: [
        'La se encuentra en el segundo espacio del pentagrama.',
        'Recuerda: La está justo encima de Sol, en el segundo espacio.'
      ]
    },
    { 
      nombre: 'Si', 
      y: 50,
      consejos: [
        'Si está en la tercera línea del pentagrama.',
        'La nota Si se encuentra justo en el medio del pentagrama, en la tercera línea.'
      ]
    },
    { 
      nombre: 'Do (octava 2)', 
      y: 30, // Ajuste de posición para la segunda octava
      consejos: [
        'Do de la segunda octava está en el tercer espacio del pentagrama.',
        'Este Do es más alto que el Do de la primera octava.'
      ]
    },
    { 
      nombre: 'Re (octava 2)', 
      y: 10,
      consejos: [
        'Re de la segunda octava está justo en la cuarta línea del pentagrama.',
        'Recuerda: Este Re está más arriba que el Re de la primera octava.'
      ]
    },
    { 
      nombre: 'Mi (octava 2)', 
      y: -10,
      consejos: [
        'Mi de la segunda octava está en el cuarto espacio del pentagrama.',
        'Este Mi es más alto y se encuentra entre la cuarta y la quinta línea.'
      ]
    },
    { 
      nombre: 'Fa (octava 2)', 
      y: -30,
      consejos: [
        'Fa de la segunda octava está en la quinta línea del pentagrama.',
        'Recuerda: Este Fa es la última línea del pentagrama en clave de sol.'
      ]
    },
    { 
      nombre: 'Sol (octava 2)', 
      y: -50,
      consejos: [
        'Sol de la segunda octava está en el espacio superior del pentagrama.',
        'Este Sol se encuentra justo por encima de la quinta línea.'
      ]
    },
    { 
      nombre: 'La (octava 2)', 
      y: -70,
      consejos: [
        'La de la segunda octava está justo por encima del pentagrama.',
        'Este La está en el primer espacio superior por encima de la quinta línea.'
      ]
    },
    { 
      nombre: 'Si (octava 2)', 
      y: -90,
      consejos: [
        'Si de la segunda octava está en la primera línea superior adicional.',
        'Recuerda: Este Si está justo por encima de todas las líneas del pentagrama.'
      ]
    }
  ];



  // Nota actual generada aleatoriamente
  notaActual: any = null;
  mensaje: string = '';
  consejo: string = '';

  constructor() { }

  ngOnInit(): void {
    this.generarNotaAleatoria();
  }

  generarNotaAleatoria(): void {

    const indiceAleatorio = Math.floor(Math.random() * 8);
    this.notaActual = this.notas[indiceAleatorio];
  }

  verificarNota(selectedNota: any): void {

    const notaSeleccionada = (this.notaActual.nombre === selectedNota.nombre);

    if (notaSeleccionada) {
      this.mensaje = 'Correcto!';
      this.generarNotaAleatoria();
    } else {
      this.mensaje = 'Incorrecto!';
    }
    this.generarConsejo(notaSeleccionada);
   
  }

  generarConsejo(selectedNota: any): void {

    let index = Math.floor(Math.random() * 2);
    this.consejo = selectedNota.consejos[index];
  }

}
