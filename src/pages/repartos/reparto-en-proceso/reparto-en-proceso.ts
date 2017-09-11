import {PedidosProvider} from './../../../providers/pedidos/pedidos';
import {RepartosProvider} from './../../../providers/repartos/repartos';
import {
  PrintRepartoPage
} from './../../documentos/print/print-reparto/print-reparto';
import {DolarProvider} from './../../../providers/dolar/dolar';
import {Pedido} from './../../../models/pedidos.clases';
import {CtasCtesProvider} from './../../../providers/ctas-ctes/ctas-ctes';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {Cliente} from './../../../models/clientes.clases';
import {Reparto, RepartoPedido} from './../../../models/repartos.clases';
import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  LoadingController,
  ToastController
} from 'ionic-angular';
import {printEntrega, numFormat} from '../../../print/print-pedidos';

@Component({
  selector: 'page-reparto-en-proceso',
  templateUrl: 'reparto-en-proceso.html',
})
export class RepartoEnProcesoPage {
  reparto: Reparto;
  private oldReparto: Reparto;
  clientes: Cliente[] = [];
  saldos: ({idCliente: number, saldo: number})[] = [];
  valorDolar: number = 0.00;

  showDatos: boolean = true;
  showClientes: boolean = true;
  showTotales: boolean = true;
  showPedidosCliente: boolean[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private pedidosP: PedidosProvider,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController,
              private repartosP: RepartosProvider,
              private clientesP: ClientesProvider,
              private ctacteP: CtasCtesProvider,
              private dolarP: DolarProvider) {
    this.reparto = this.navParams.get('Reparto');
    if (this.reparto) {
      this.oldReparto = JSON.parse(JSON.stringify(this.reparto));
      this.getData();
    } else {
      this.navCtrl.pop();
    }
  }

  getPedidosImpresos(item: RepartoPedido): Pedido[] {
    return item.Pedidos.filter((p) => { return p.isImpreso; });
  }
  getPedidosNoImpresos(item: RepartoPedido): Pedido[] {
    return item.Pedidos.filter((p) => { return !p.isImpreso; });
  }

  getCliente(idCliente: number): Cliente {
    return this.clientes.find((c) => { return c.id == idCliente; });
  }

  getSaldo(item: RepartoPedido): number {
    let i = this.saldos.find((s) => { return s.idCliente == item.idCliente; });
    if (i) {
      item.saldoActual = i.saldo;
      return item.saldoActual;
    }
    return 0.00;
  }

  calSaldoTotal(): number {
    if (this.reparto && this.reparto.Items) {
      this.reparto.saldoTotal = 0.00;
      this.reparto.Items.forEach((i) => {
        let si: number = this.getSaldo(i);
        this.reparto.saldoTotal += Number((si > 0) ? si : 0);
      });
      return this.reparto.saldoTotal;
    }
    return 0.00;
  }

  countTotal(items: RepartoPedido[]): number {
    let t: number = 0;
    items.forEach((i) => { t += i.Pedidos.length; });
    return t;
  }

  countImpresos(items: RepartoPedido[]): number {
    let t: number = 0;
    items.forEach((i) => {
      i.Pedidos.forEach((p) => { t += ((p.isImpreso) ? 1 : 0); });
    });
    return t;
  }
  countNoImpresos(items: RepartoPedido[]): number {
    let t: number = 0;
    items.forEach((i) => {
      i.Pedidos.forEach((p) => { t += ((p.isImpreso) ? 0 : 1); });
    });
    return t;
  }

  printPedido(pedido: Pedido) {
    pedido.Dolar = this.reparto.Dolar;
    this.ctacteP.getSaldoCliente(pedido.idCliente)
        .subscribe((saldo) => {
          printEntrega(this.getCliente(pedido.idCliente), pedido,
                       `Pedido Nro.${numFormat(pedido.id,'3.0-0')}`,
                       this.pedidosP, saldo);
        });
    pedido.isImpreso = true;
  }

  print() {
    let load = this.loadCtrl.create({content: 'Guardando...'});
    load.present().then(() => {
      this.calSaldoTotal();
      this.repartosP.saveEnProceso(this.reparto)
          .subscribe(
              (okReparto) => {
                this.navCtrl.pop();
                load.dismiss();
                this.navCtrl.push(PrintRepartoPage, {Reparto: okReparto});
              },
              (error) => {
                load.dismiss();
                let toast = this.toastCtrl.create({
                  position: 'middle',
                  message: `No se pudo guardar! Error:${error}`,
                  showCloseButton: true,
                  closeButtonText: 'OK'
                });
                toast.present();
              });
    });
  }

  private ordenarItems() {
    if (this.reparto && this.reparto.Items && this.clientes &&
        this.reparto.Items.length == this.clientes.length) {
      this.reparto.Items = this.reparto.Items.sort((a, b) => {
        let r: number = 0;
        let ca = this.getCliente(a.idCliente);
        let cb = this.getCliente(b.idCliente);
        let an: string = (ca) ? ca.nombre.toLowerCase() : '';
        let bn: string = (cb) ? cb.nombre.toLowerCase() : '';
        if (an > bn) r = 1;
        if (an < bn) r = -1;
        return r;
      });
    }
  }

  private async getData() {
    this.clientes = [];
    this.saldos = [];
    this.dolarP.getDolar().subscribe((valor) => {
      this.reparto.Dolar = valor;
      this.valorDolar = this.reparto.Dolar.valor;
    });
    this.reparto.Items.forEach((i) => {
      let idx = this.clientes.findIndex((c) => { return c.id == i.idCliente; });
      if (idx == -1) {
        this.clientesP.getOne(i.idCliente)
            .subscribe((cliente) => {
              this.ctacteP.getSaldoCliente(cliente.id)
                  .subscribe((saldo) => {
                    this.clientes.push(cliente);
                    this.saldos.push({idCliente: cliente.id, saldo: saldo});
                    this.ordenarItems();
                  });
            });
      }
    });
  }
}
