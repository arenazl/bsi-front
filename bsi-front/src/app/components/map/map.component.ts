import { Component, OnInit } from '@angular/core';
import { NgForm, FormGroup, FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  toggleForm=false;
  showForm =false;
  barrio='';

  constructor() { }

  ngOnInit(): void {

    let id_barrio = sessionStorage.getItem('id_barrio') as unknown as number

    if(id_barrio == 1){
      this.barrio = 'FINCA';
    }
    if(id_barrio == 2){
      this.barrio = 'DONLUIS';
    }

  }

  loadLotes()
  {

    this.showForm=true;

    if(this.toggleForm)
    {


      this.toggleForm=false;
    }
    else
    {

      this.toggleForm=true;
    }
  
  }

}
