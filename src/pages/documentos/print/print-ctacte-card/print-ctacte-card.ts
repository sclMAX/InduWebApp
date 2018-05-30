import {DolarProvider} from './../../../../providers/dolar/dolar';
import {PedidosProvider} from './../../../../providers/pedidos/pedidos';
import {PagosProvider} from './../../../../providers/pagos/pagos';
import {Observable} from 'rxjs/Observable';
import {FECHA} from './../../../../models/comunes.clases';
import {CtaCte, Cliente} from './../../../../models/clientes.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import * as moment from 'moment';
import {
  PAGO,
  PEDIDO,
  PEDIDO_CANCELADO,
  ENTREGADO
} from '../../../../models/pedidos.clases';

@Component({
  selector: 'page-print-ctacte-card',
  templateUrl: 'print-ctacte-card.html',
})
export class PrintCtacteCardPage {
  isPrint: boolean = false;
  ctaCte: CtaCte[] = [];
  cliente: Cliente;
  fecha: string = moment().format(FECHA);
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private pagosP: PagosProvider, private pedidosP: PedidosProvider,
              private dolarP: DolarProvider) {
    this.ctaCte = this.navParams.get('CtaCte');
    this.cliente = this.navParams.get('Cliente');
    if (this.ctaCte && this.cliente) {
    } else {
      this.navCtrl.pop();
    }
  }

  dolares: Array < {cta: CtaCte, valorDolar: Observable<number>} >= [];
  getDolar(item: CtaCte): Observable<number> {
    let idx = this.dolares.findIndex(
        i => (i.cta.numero == item.numero) &&
             (i.cta.tipoDocumento == item.tipoDocumento));
    if (idx > -1) {
      return this.dolares[idx].valorDolar;
    } else {
      let td = item.tipoDocumento;
      if (td == PAGO) {
        this.dolares.push({
          cta: item,
          valorDolar:
              this.pagosP.getOne(item.numero).map(data => data.RefDolar.valor)
        });
        return;
      }
      if (td == PEDIDO) {
        this.dolares.push({
          cta: item,
          valorDolar: this.pedidosP.getOne(ENTREGADO, item.numero)
                          .map(data => data.Dolar.valor)
        });
        return;
      }
      if (td == PEDIDO_CANCELADO) {
        this.dolares.push({
          cta: item,
          valorDolar: this.pedidosP.getOne(PEDIDO_CANCELADO, item.numero)
                          .map(data => data.Dolar.valor)
        });
        return;
      }
      this.dolares.push({cta: item, valorDolar: this.dolarP.getDolarValor()});
      return;
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
