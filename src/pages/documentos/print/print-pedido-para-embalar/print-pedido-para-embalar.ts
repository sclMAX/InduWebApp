import {Cliente} from './../../../../models/clientes.clases';
import {Pedido} from './../../../../models/pedidos.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-print-pedido-para-embalar',
  templateUrl: 'print-pedido-para-embalar.html',
})
export class PrintPedidoParaEmbalarPage {
  pedido: Pedido;
  cliente: Cliente;
  isPrint: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.pedido = this.navParams.get('Pedido');
    this.cliente = this.navParams.get('Cliente');
    if (!this.pedido || !this.cliente) {
      this.navCtrl.pop();
    }
  }

  goPrint() {
    this.isPrint = true;
    setTimeout(() => {
      window.print();
      this.goBack();
    }, 10);
  }
  goBack() { this.navCtrl.pop(); }
}
