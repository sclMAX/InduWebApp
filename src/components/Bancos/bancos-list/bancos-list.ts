import {Banco} from './../../../models/fondos.clases';
import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({selector: 'bancos-list', templateUrl: 'bancos-list.html'})
export class BancosListComponent {
  @Input() bancos: Banco[] = [];
  @Input() colorPar: string = 'listPar';
  @Input() colorImpar: string = 'listImpar';
  @Output() clickItem: EventEmitter<Banco> = new EventEmitter<Banco>();
  constructor() {}

  onClick(banco: Banco) { this.clickItem.emit(banco); }
}
