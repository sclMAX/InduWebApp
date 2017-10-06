import {ClientesProvider} from './../../../providers/clientes/clientes';
import {Observable} from 'rxjs/Observable';
import {Component, Input} from '@angular/core';
import {NavController} from 'ionic-angular';

import {Cliente} from './../../../models/clientes.clases';
import {
  ClientesDetallePage
} from './../../../pages/clientes/clientes-detalle/clientes-detalle';

@Component({
  selector: 'clientes-comentarios-card',
  templateUrl: 'clientes-comentarios-card.html'
})
export class ClientesComentariosCardComponent {
  @Input() colorHeader: string = 'warning';
  showList: boolean = false;
  clientes: Observable<Cliente[]>;
  constructor(public navCtrl: NavController,
              private clientesP: ClientesProvider) {}

  ngOnInit() { this.getData(); }

  onClickHeader() { this.showList = !this.showList; }

  onClickItem(cliente: Cliente) {
    this.navCtrl.push(ClientesDetallePage, {Cliente: cliente})
  }

  private async getData() {
    this.clientes = this.clientesP.getClientesConComentario();
  }
}
