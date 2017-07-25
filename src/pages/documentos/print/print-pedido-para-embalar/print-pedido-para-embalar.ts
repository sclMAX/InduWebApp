import { Pedido } from './../../../../models/pedidos.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-print-pedido-para-embalar',
  templateUrl: 'print-pedido-para-embalar.html',
})
export class PrintPedidoParaEmbalarPage {
  pedido:Pedido;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.pedido = this.navParams.get('Pedido');
    if(!this.pedido){
      this.navCtrl.pop();
    }
  }

  goBack(){
    this.navCtrl.pop();
  }
  print(){
    window.print();
  }

} 
