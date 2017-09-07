import {FECHA} from './../../../models/comunes.clases';
import {Component, Input} from '@angular/core';
import {NavController} from 'ionic-angular';

import {Cliente} from './../../../models/clientes.clases';
import {Pedido, ENTREGADO} from './../../../models/pedidos.clases';
import {
  PrintPedidoEntregaPage
} from './../../../pages/documentos/print/print-pedido-entrega/print-pedido-entrega';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';
import * as moment from 'moment';

@Component({
  selector: 'pedidos-entregados-card',
  templateUrl: 'pedidos-entregados-card.html'
})
export class PedidosEntregadosCardComponent {
  @Input() cliente: Cliente;
  @Input() showList: boolean = false;
  @Input() autoOcultar: boolean = false;

  pedidos: Pedido[];
  filterPedidos: Pedido[];
  clientes: Cliente[] = [];
  fecha1: string;
  fecha2: string;
  isFilter: boolean = false;

  constructor(private pedidosP: PedidosProvider,
              private clientesP: ClientesProvider,
              public navCtrl: NavController) {}

  ngOnInit() { this.getData(); }
  ionViewWillEnter() { this.getData(); }

  getCliente(id): Cliente {
    if (this.cliente) {
      return this.cliente;
    } else {
      let c = this.clientes.find((cliente) => { return (cliente.id == id); });
      if (c) {
        return c;
      } else {
        this.clientesP.getOne(id).subscribe((cliente) => {
          this.clientes.push(cliente);
          return cliente;
        });
      }
    }
  }

  filtrar() {
    if (this.isFilter) {
      this.isFilter = false;
      this.fecha1 = '';
      this.fecha2 = '';
      this.filterPedidos = JSON.parse(JSON.stringify(this.pedidos));
    } else {
      if (this.fecha1 && this.fecha2) {
        this.filterPedidos = this.pedidos.filter((p) => {
          return (moment(p.fechaEntrega, FECHA)
                      .diff(moment(this.fecha1), 'days') >= 0) &&
                 (moment(p.fechaEntrega, FECHA)
                      .diff(moment(this.fecha2), 'days') <= 0);
        });
        this.isFilter = true;
      }
    }
  }

  goPedido(pedido: Pedido) {
    this.navCtrl.push(PrintPedidoEntregaPage, {Pedido: pedido});
  }

  calTotalUs(): number {
    let t: number = 0.00;
    if (this.filterPedidos) {
      this.filterPedidos.forEach((p) => { t += Number(p.totalFinalUs || 0); });
    }
    return t;
  }

  calTotal$(): number {
    let t: number = 0.00;
    if (this.filterPedidos) {
      this.filterPedidos.forEach(
          (p) => { t += Number((p.totalFinalUs * p.Dolar.valor) || 0); });
    }
    return t;
  }

  calTotalKilos(): number {
    let t: number = 0.00;
    if (this.filterPedidos) {
      this.filterPedidos.forEach((p) => { t += Number(p.totalUnidades || 0); });
    }
    return t;
  }

  private async getData() {
    let cargar = (data) => {
      this.pedidos = data;
      this.filterPedidos = JSON.parse(JSON.stringify(this.pedidos));
    };
    if (this.cliente) {
      this.pedidosP.getAllCliente(this.cliente.id, ENTREGADO)
          .subscribe((data) => { cargar(data); });
    } else {
      this.pedidosP.getAll(ENTREGADO).subscribe((data) => { cargar(data); });
    }
  }
}
