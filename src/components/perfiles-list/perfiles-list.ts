import {Component, Input} from '@angular/core';
import {Perfil} from '../../models/productos.clases';

@Component({selector: 'perfiles-list', templateUrl: 'perfiles-list.html'})
export class PerfilesListComponent {
  @Input('perfiles') perfiles: Perfil[];
  @Input('color') color: string;
  @Input('colorPar') colorPar: string;
  constructor() {}
}
