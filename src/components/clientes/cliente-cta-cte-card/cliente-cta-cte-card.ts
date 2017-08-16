<<<<<<< HEAD
import {PagosProvider} from './../../../providers/pagos/pagos';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';
import {
  PrintPedidoEntregaPage
} from './../../../pages/documentos/print/print-pedido-entrega/print-pedido-entrega';
import {ENTREGADO, PAGO, PEDIDO} from './../../../models/pedidos.clases';
import {
  ClientesAddPagoPage
} from './../../../pages/clientes/clientes-add-pago/clientes-add-pago';
import {FECHA} from './../../../models/comunes.clases';
import {
  PrintCtacteCardPage
} from './../../../pages/documentos/print/print-ctacte-card/print-ctacte-card';
import {NavController, LoadingController, ToastController} from 'ionic-angular';
import {CtasCtesProvider} from './../../../providers/ctas-ctes/ctas-ctes';
import {Cliente, CtaCte} from './../../../models/clientes.clases';
=======
>>>>>>> 61d6c144c7dffa41f1002b37fd05bc147734acdf
import {Component, Input} from '@angular/core';
import {LoadingController, NavController, ToastController} from 'ionic-angular';
import * as moment from 'moment';

import {Cliente, CtaCte} from './../../../models/clientes.clases';
import {FECHA} from './../../../models/comunes.clases';
import {ENTREGADO, PAGO, PEDIDO} from './../../../models/pedidos.clases';
import {ClientesAddPagoPage} from './../../../pages/clientes/clientes-add-pago/clientes-add-pago';
import {PrintCtacteCardPage} from './../../../pages/documentos/print/print-ctacte-card/print-ctacte-card';
import {PrintPedidoEntregaPage} from './../../../pages/documentos/print/print-pedido-entrega/print-pedido-entrega';
import {CtasCtesProvider} from './../../../providers/ctas-ctes/ctas-ctes';
import {PagosProvider} from './../../../providers/pagos/pagos';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';

@Component({
  selector: 'cliente-cta-cte-card',
  templateUrl: 'cliente-cta-cte-card.html'
})
export class ClienteCtaCteCardComponent {
  @Input() cliente: Cliente;
  @Input() colorHeader: string = 'toolBar';
  ctaCte: CtaCte[] = [];
  saldo: number = 0.00;
  showList: boolean = false;

  constructor(
      public navCtrl: NavController, private ctaCteP: CtasCtesProvider,
      private pedidosP: PedidosProvider, private pagosP: PagosProvider,
      private loadCtrl: LoadingController, private toastCtrl: ToastController) {
  }

  ngOnInit() {
    this.getData();
  }

  onClickHeader() {
    this.showList = !this.showList;
  }

  onClickItem(item: CtaCte) {
    let load = this.loadCtrl.create({content: 'Buscando datos...'});
    let toast = this.toastCtrl.create(
        {position: 'middle', duration: 1000, message: 'Sin Conexion!'});
    console.log(item);
    switch (item.tipoDocumento) {
      case PAGO:
        load.setContent(`Buscando Pago Nro:${item.numero}...`);
        load.present().then(() => {
          this.pagosP.getOne(item.numero)
              .subscribe(
                  (data) => {
                    load.dismiss();
<<<<<<< HEAD
                    this.navCtrl.push(ClientesAddPagoPage,
                                      {Cliente: this.cliente, Pago: data});
=======
                    this.navCtrl.push(
                        ClientesAddPagoPage,
                        {Cliente: this.cliente, Pago: data});
>>>>>>> 61d6c144c7dffa41f1002b37fd05bc147734acdf
                  },
                  (error) => {
                    load.dismiss();
                    toast.present();
                  });
        });

        break;
      case PEDIDO:
        load.setContent(`Buscando Pedido Nro:${item.numero}...`);
        load.present().then(() => {
          this.pedidosP.getOne(ENTREGADO, item.numero)
              .subscribe(
                  (data) => {
                    load.dismiss();
                    this.navCtrl.push(PrintPedidoEntregaPage, {Pedido: data});
                  },
                  (error) => {
                    load.dismiss();
                    toast.present();
                  });
        });
        break;
    }
  }

  print() {
    this.navCtrl.push(
        PrintCtacteCardPage, {CtaCte: this.ctaCte, Cliente: this.cliente});
    }

  async getData() {
    if (this.cliente) {
      this.ctaCteP.getCtaCteCliente(this.cliente.id).subscribe((ctacte) => {
        this.ctaCte = ctacte.sort((a, b) => {
          return moment(a.fecha, FECHA).diff(moment(b.fecha, FECHA), 'days');
        });
        this.saldo = 0.00;
        this.ctaCte.forEach((c) => {
          this.saldo += c.debe - c.haber;
          c.saldo = this.saldo;
        });
      });
    }
  }
}
