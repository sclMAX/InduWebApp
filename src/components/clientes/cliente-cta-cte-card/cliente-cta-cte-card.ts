import {DolarProvider} from './../../../providers/dolar/dolar';
import {Observable} from 'rxjs/Observable';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {NOTA_DEBITO} from './../../../models/documentos.class';
import {Component, Input} from '@angular/core';
import {LoadingController, NavController, ToastController} from 'ionic-angular';
import {Cliente, CtaCte} from './../../../models/clientes.clases';
import {
  ENTREGADO,
  PAGO,
  PEDIDO,
  PEDIDO_CANCELADO,
  ENREPARTO
} from './../../../models/pedidos.clases';
import {
  ClientesAddPagoPage
} from './../../../pages/clientes/clientes-add-pago/clientes-add-pago';
import {
  PrintCtacteCardPage
} from './../../../pages/documentos/print/print-ctacte-card/print-ctacte-card';
import {CtasCtesProvider} from './../../../providers/ctas-ctes/ctas-ctes';
import {PagosProvider} from './../../../providers/pagos/pagos';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';
import {printEntrega} from '../../../print/print-pedidos';
import {numFormat} from '../../../print/config-comun';
import {printNotaDebito} from "../../../print/print-ctacte";

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
  isFiltrando: boolean = false;
  dolar: Observable<number>;

  constructor(public navCtrl: NavController, private ctaCteP: CtasCtesProvider,
              private pedidosP: PedidosProvider, private pagosP: PagosProvider,
              private clientesP: ClientesProvider,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController,
              private dolarP: DolarProvider) {}

  ngOnInit() { this.getData(); }

  onClickHeader() { this.showList = !this.showList; }

  onClickItem(item: CtaCte) {
    let load = this.loadCtrl.create({content: 'Buscando datos...'});
    let toast = this.toastCtrl.create({
      position: 'middle',
      duration: 1000,
      message: 'Datos no encontrasdos o Sin Conexion!'
    });
    switch (item.tipoDocumento) {
      case PAGO:
        load.setContent(`Buscando Pago Nro:${item.numero}...`);
        load.present().then(() => {
          this.pagosP.getOne(item.numero)
              .subscribe(
                  (data) => {
                    load.dismiss();
                    this.navCtrl.push(ClientesAddPagoPage,
                                      {Cliente: this.cliente, Pago: data});
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
                    if (data && data.idCliente) {
                      this.ctaCteP.getSaldoCliente(data.idCliente)
                          .subscribe((saldo) => {
                            printEntrega(
                                this.cliente, data,
                                `Pedido Nro.${numFormat(data.id,'3.0-0')}`,
                                this.pedidosP, saldo);
                          });
                    } else {
                      toast.setMessage('Pedido no Disponible o Cancelado!');
                      toast.present();
                    }
                  },
                  (error) => {
                    load.dismiss();
                    toast.present();
                  });
        });
        break;
      case PEDIDO_CANCELADO:
        load.setContent(`Buscando Pedido CANCELADO Nro:${item.numero}...`);
        load.present().then(() => {
          this.pedidosP.getOne(PEDIDO_CANCELADO, item.numero)
              .subscribe(
                  (data) => {
                    load.dismiss();
                    this.ctaCteP.getSaldoCliente(data.idCliente)
                        .subscribe((saldo) => {
                          printEntrega(
                              this.cliente, data,
                              `Pedido Nro.${numFormat(data.id,'3.0-0')}`,
                              this.pedidosP, saldo);
                        });
                  },
                  (error) => {
                    load.dismiss();
                    toast.present();
                  });
        });
        break;
      case NOTA_DEBITO:
        load.setContent(`Buscando Nota de Debito Nro:${item.numero}...`);
        load.present().then(() => {
          this.ctaCteP.getNotaDebito(item.numero)
              .subscribe(
                  (data) => {
                    load.dismiss();
                    if (data && data.idCliente) {
                      printNotaDebito(
                          data, this.clientesP.getOnePromise(data.idCliente));
                    } else {
                      toast.present();
                    }
                  },
                  (error) => {
                    load.dismiss();
                    toast.present();
                  });
        });
        break;
      case ENREPARTO:
        load.setContent(`Buscando Pedido En Reparto Nro:${item.numero}...`);
        load.present().then(() => {
          this.pedidosP.getOne(ENREPARTO, item.numero)
              .subscribe(
                  (data) => {
                    load.dismiss();
                    if (data && data.idCliente) {
                      this.ctaCteP.getSaldoCliente(data.idCliente)
                          .subscribe((saldo) => {
                            console.log(data);

                            printEntrega(
                                this.cliente, data,
                                `Pedido Nro.${numFormat(data.id,'3.0-0')}`,
                                this.pedidosP, saldo);
                          });
                    } else {
                      toast.setMessage('Pedido no Disponible o Cancelado!');
                      toast.present();
                    }
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
    this.navCtrl.push(PrintCtacteCardPage,
                      {CtaCte: this.ctaCte, Cliente: this.cliente});
  }

  onCancelFilter() {
    this.isFiltrando = false;
    this.getData();
  }

  onFilter(ev) {
    this.onCancelFilter();
    let val = ev.target.value;
    if (val && val.trim() != '') {
      this.isFiltrando = true;
      val = val.toLowerCase();
      this.ctaCte = this.ctaCte.filter((i) => {
        return (i.tipoDocumento &&
                i.tipoDocumento.toLowerCase().indexOf(val) > -1) ||
               (i.numero && i.numero.toString().indexOf(val) > -1);
      });
    }
  }

  private async getData() {
    this.dolar = this.dolarP.getDolar().map(data => data.valor);
    if (this.cliente) {
      this.ctaCteP.getCtaCteCliente(this.cliente.id)
          .subscribe((ctacte) => {
            this.ctaCte = ctacte;
            this.saldo = 0.00;
            this.ctaCte.forEach((i) => {
              this.saldo += Number(i.debe) - Number(i.haber);
              i.saldo = this.saldo;
            });
          });
    }
  }
}
