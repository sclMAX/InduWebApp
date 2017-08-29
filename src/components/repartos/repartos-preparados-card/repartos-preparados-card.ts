import { Reparto } from './../../../models/repartos.clases';
import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'repartos-preparados-card',
  templateUrl: 'repartos-preparados-card.html'
})
export class RepartosPreparadosCardComponent {

  @Input() color: string = 'scroll-content';
  @Input() headerColor: string = 'presupuestosHead';
  @Input() itemColor: string = 'light';
  @Input() itemImparColor: string;
  @Input() showList: boolean = false;
  repartos:Reparto[] = [];

  @Output() onClickItem: EventEmitter<Pedido> = new EventEmitter<Pedido>();
  constructor(private clientesP: ClientesProvider,
              private pedidosP: PedidosProvider) {}

  onClick(item: Pedido) { this.onClickItem.emit(item); }

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
