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
  clientes: Cliente[];
  constructor(
      public navCtrl: NavController, public navParams: NavParams,
      private contadoresP: ContadoresProvider,
      private pedidosP: PedidosProvider, private clientesP: ClientesProvider) {
    this.reparto = this.navParams.get('Reparto');
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

  goBack() {
    this.navCtrl.pop();
  }

  getCliente(idCliente): Cliente {
    return this.clientes.find((c) => {
      return c.id === idCliente;
    });
  }

  calTotalesReparto() {
    this.reparto.totalDolares = 0.00;
    this.reparto.totalKilos = 0.00;
    this.reparto.saldoTotal = 0.00;
    this.reparto.Pedidos.forEach((pedidos) => {
      this.reparto.totalDolares += Number(pedidos.totalPedidos || 0);
      this.reparto.totalKilos += Number(pedidos.totalKilos || 0);
      this.reparto.saldoTotal += Number(pedidos.saldoActual || 0);
    });
  }

  private calTotalesPedido(){

  }

  addPedido(pedido: Pedido) {
    let existP: number = this.reparto.Pedidos.findIndex((p) => {
      return p.idCliente === pedido.idCliente;
    });
    if (existP > -1) {
      this.reparto.Pedidos[existP].Pedidos.push(pedido);
    } else {
      let np:RepartoPedido = new RepartoPedido();
      np.idCliente = pedido.idCliente;
      np.Pedidos.push(pedido);
      this.reparto.Pedidos.push(np);
      this.calTotalesReparto();
    }
  }

  private async getNumero() {
    if (this.reparto) {
      this.contadoresP.getRepartoCurrentNro().subscribe((data) => {
        this.reparto.id = Number(data);
      });
    }
  }

  private async addClientes(idCliente: number) {
    if (!this.getCliente(idCliente)) {
      this.clientesP.getOne(idCliente).subscribe((cliente) => {
        this.clientes.push(cliente);
      });
    }
  }

  private async getPedidos() {
    this.pedidosP.getAll(EMBALADO).subscribe((data) => {
      this.pedidosEmbalados = data;
      this.clientes = [];
      data.forEach((p) => {
        this.addClientes(p.idCliente);
      });
    });
  }
}
