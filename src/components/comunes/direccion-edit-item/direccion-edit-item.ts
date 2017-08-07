import { Direccion } from './../../../models/clientes.clases';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'direccion-edit-item',
  templateUrl: 'direccion-edit-item.html'
})
export class DireccionEditItemComponent {

  @Input() direccion:Direccion;
  @Input() labelColor: string = 'dark';
  @Input() inputColor:string = 'light';

  constructor() {
  }

}
