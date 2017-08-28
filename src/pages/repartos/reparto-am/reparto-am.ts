import {DolarProvider} from './../../../providers/dolar/dolar';
import {CtasCtesProvider} from './../../../providers/ctas-ctes/ctas-ctes';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

import {Cliente} from './../../../models/clientes.clases';
import {EMBALADO, Pedido} from './../../../models/pedidos.clases';
import {Reparto, RepartoPedido} from './../../../models/repartos.clases';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {ContadoresProvider} from './../../../providers/contadores/contadores';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';

@Component({
  selector: 'page-reparto-am',
  templateUrl: 'reparto-am.html',
})
export class RepartoAmPage {
  title: string;
  reparto: Reparto;
  pedidosEmbalados: Pedido[] = [];
  isEdit: boolean = false;
  isReadOnly: boolean = false;
  showDatos: boolean = true;
  showPedidosDisponibles: boolean = true;
  clientes: Array<{saldo: number, cliente: Cliente}> = [];
  showPedidos: Array < boolean >= [];
  showPedidosAgregados: boolean = true;
  showTotales: boolean = false;
  valorDolar: number = 0.00;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private contadoresP: ContadoresProvider,
              private pedidosP: PedidosProvider,
              private clientesP: ClientesProvider,
              private ctacteP: CtasCtesProvider,
              private dolarP: DolarProvider) {
    this.reparto = this.navParams.get('Reparto');
    this.getDolar();
    this.getPedidos();
    if (this.reparto) {
      this.title = `Reparto ${this.reparto.id}`;
      this.isEdit = true;
    } else {
      this.title = 'Nuevo Reparto...';
      this.isEdit = false;
      this.reparto = new Reparto();
      this.getNumero();
    }
  }

  isValid(form): boolean {
    let res: boolean = form.valid;
    return res;
  }

  goBack() { this.navCtrl.pop(); }

  getCliente(idCliente: number): Cliente {
    if (this.clientes) {
      let cliente =
          this.clientes.find((c) => {return c.cliente.id == idCliente});
      return (cliente) ? cliente.cliente : null;
    } else {
      return null;
    }
  }

  getSaldo(idCliente: number): number {
    if (this.clientes) {
      let cliente =
          this.clientes.find((c) => {return c.cliente.id == idCliente});
      return (cliente) ? cliente.saldo : 0.00;
    } else {
      return 0.00;
    }
  }

  calTotalesReparto() {
    this.reparto.totalDolares = 0.00;
    this.reparto.totalKilos = 0.00;
    this.reparto.saldoTotal = 0.00;
    this.reparto.Items.forEach((pedidos) => {
      this.reparto.totalDolares += Number(pedidos.totalPedidos || 0);
      this.reparto.totalKilos += Number(pedidos.totalKilos || 0);
      this.reparto.saldoTotal +=
          Number((pedidos.saldoActual > 0) ? pedidos.saldoActual : 0);
    });
  }

  private calTotalesPedidos() {
    if (this.reparto && this.reparto.Items) {
      this.reparto.Items.forEach((i) => {
        i.totalKilos = 0.00;
        i.totalPedidos = 0.00;
        i.saldoActual = this.getSaldo(i.idCliente);
        i.Pedidos.forEach((p) => {
          i.totalKilos += Number(p.totalUnidades || 0);
          i.totalPedidos += Number(p.totalFinalUs || 0);
          i.saldoActual += (p.isInCtaCte) ? 0.00 : Number(p.totalFinalUs);
        });
      });
      this.calTotalesReparto();
    }
  }

  addPedido(pedido: Pedido) {
    let existP: number = this.reparto.Items.findIndex(
        (p) => { return p.idCliente === pedido.idCliente; });
    if (existP > -1) {
      this.reparto.Items[existP].Pedidos.push(pedido);
    } else {
      let np: RepartoPedido = new RepartoPedido();
      np.idCliente = pedido.idCliente;
      np.saldoActual = 0.00;
      np.Pedidos.push(pedido);
      this.reparto.Items.push(np);
    }
    this.calTotalesPedidos();
  }

  removeCliente(itemIdx: number) {
    this.reparto.Items.splice(itemIdx, 1);
    this.calTotalesPedidos();
  }

  removePedido(item: RepartoPedido, pedidoIdx: number) {
    item.Pedidos.splice(pedidoIdx, 1);
    this.calTotalesPedidos();
  }

  private async getNumero() {
    if (this.reparto) {
      this.contadoresP.getRepartoCurrentNro().subscribe(
          (data) => { this.reparto.id = Number(data); });
    }
  }

  private addClientes(idCliente: number) {}

  filtrarPedidos(data: Pedido[]): Pedido[] {
    if (this.reparto && this.reparto.Items) {
      let resultado: Pedido[] = data;
      this.reparto.Items.forEach((i) => {
        i.Pedidos.forEach((p) => {
          resultado = resultado.filter((r) => { return r.id != p.id; });
        });
      });
      return resultado;
    } else {
      return data;
    }
  }

  private async getPedidos() {
    this.pedidosP.getAll(EMBALADO).subscribe((data) => {
      this.pedidosEmbalados = data.sort((a,b)=>{
        return a.idCliente - b.idCliente;
      });
      this.clientes = [];
      data.forEach((p) => {
        if (!(this.clientes[p.idCliente])) {
          this.clientesP.getOne(p.idCliente)
              .subscribe((cliente) => {
                this.ctacteP.getSaldoCliente(cliente.id)
                    .subscribe((saldo) => {
                      let idx: number = this.clientes.findIndex(
                          (c) => { return c.cliente.id == cliente.id; });
                      if (idx == -1) {
                        this.clientes.push({saldo: saldo, cliente: cliente});
                      }
                    });
              });
        }
      });
      this.calTotalesPedidos();
    });
  }

  private async getDolar() {
    this.dolarP.getDolarValor().subscribe(
        (data) => { this.valorDolar = data; });
  }
}
