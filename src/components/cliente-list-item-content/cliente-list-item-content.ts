import { ClientesDetallePage } from './../../pages/clientes/clientes-detalle/clientes-detalle';
import { NavController } from 'ionic-angular';
import {Cliente} from './../../models/clientes.clases';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'cliente-list-item-content',
  templateUrl: 'cliente-list-item-content.html'
})
export class ClienteListItemContentComponent {
  @Input('cliente') cliente: Cliente;
  @Input('color') color: string;
  @Input('showActions') isShowActions: boolean = true;
  constructor(public navCtrl:NavController) {}

  goCliente(){
    this.navCtrl.push(ClientesDetallePage, {Cliente: this.cliente});
  }
}
