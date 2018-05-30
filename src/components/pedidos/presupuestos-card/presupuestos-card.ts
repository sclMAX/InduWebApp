import {DolarProvider} from './../../../providers/dolar/dolar';
import {Observable} from 'rxjs/Observable';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {Pedido, PRESUPUESTO} from './../../../models/pedidos.clases';
import {Cliente} from './../../../models/clientes.clases';
import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component(
    {selector: 'presupuestos-card', templateUrl: 'presupuestos-card.html'})
export class PresupuestosCardComponent {
  @Input() cliente: Cliente;
  Docs: Pedido[];
  @Input() color: string = 'scroll-content';
  @Input() headerColor: string = 'presupuestosHead';
  @Input() itemColor: string = 'light';
  @Input() itemImparColor: string;
  @Input() showList: boolean = false;
  private clientes: Cliente[] = [];
  dolar: Observable<number>;
  tipo: string = PRESUPUESTO;

  @Output() onClickItem: EventEmitter<Pedido> = new EventEmitter<Pedido>();
  constructor(private clientesP: ClientesProvider,
              private pedidosP: PedidosProvider,
              private dolarP: DolarProvider) {}

  onClick(item: Pedido) { this.onClickItem.emit(item); }

  getTotalKilos(): number {
    if (this.Docs) {
      return this.Docs.reduce((a, b) => a + b.totalUnidades, 0);
    }
    return 0.00;
  }

  getTotalU$(): number {
    if (this.Docs) {
      return this.Docs.reduce((a, b) => a + b.totalFinalUs, 0);
    }
    return 0.00;
  }

  getCliente(id): Cliente {
    if (this.cliente) {
      return this.cliente;
    } else {
      if (this.clientes) {
        return this.clientes.find((c) => { return c.id == id; });
      }
    }
    return null;
  }

  ngOnInit() { this.getData(); }
  ionViewWillEnter() { this.getData(); }

  private async getData() {
    this.dolar = this.dolarP.getDolar().map(data => data.valor);
    if (this.cliente) {
      this.pedidosP.getAllCliente(this.cliente.id, this.tipo)
          .subscribe((data) => { this.Docs = data; });
    } else {
      this.pedidosP.getAll(this.tipo).subscribe((data) => {
        this.Docs = data;
        this.clientes = [];
        data.forEach((i) => {
          this.clientesP.getOne(i.idCliente)
              .subscribe((c) => { this.clientes.push(c); });
        });
      });
    }
  }
}
