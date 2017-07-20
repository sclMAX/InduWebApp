import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Perfil} from '../../models/productos.clases';

@Component({selector: 'perfiles-list', templateUrl: 'perfiles-list.html'})
export class PerfilesListComponent {
  @Input('perfiles') perfiles: Perfil[];
  @Input('color') color: string;
  @Input('colorPar') colorPar: string;
  @Input('showImg') showImg: boolean = true;
  @Output() onSelectItem: EventEmitter<Perfil> = new EventEmitter<Perfil>();
  constructor() {}

  onClickItem(perfil) { this.onSelectItem.emit(perfil); }
}
