import {BancoSucursal, Banco} from './../../../models/fondos.clases';
import {Component, Input, Output, EventEmitter} from '@angular/core';
@Component({
  selector: 'bancos-sucursales-list',
  templateUrl: 'bancos-sucursales-list.html'
})
export class BancosSucursalesListComponent {
  @Input() banco: Banco;
  @Input() colorPar: string = 'listPar';
  @Input() colorImpar: string = 'listImpar';
  @Output()
  clickSucursal: EventEmitter<BancoSucursal> =
      new EventEmitter<BancoSucursal>();
  constructor() {}

  onClick(sucursal: BancoSucursal) { this.clickSucursal.emit(sucursal); }
}
