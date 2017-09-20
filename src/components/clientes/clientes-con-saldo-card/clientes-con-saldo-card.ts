import {Observable} from 'rxjs/Observable';
import {Component, Input} from '@angular/core';
import {NavController} from 'ionic-angular';

import {Cliente} from './../../../models/clientes.clases';
import {
  ClientesDetallePage
} from './../../../pages/clientes/clientes-detalle/clientes-detalle';
import {
  ClienteConSaldo,
  CtasCtesProvider
} from './../../../providers/ctas-ctes/ctas-ctes';

@Component({
  selector: 'clientes-con-saldo-card',
  templateUrl: 'clientes-con-saldo-card.html'
})
export class ClientesConSaldoCardComponent {
  @Input() colorHeader: string = 'warning';
  showList: boolean = false;
  clientes: Observable<ClienteConSaldo[]>;
  clientesA: ClienteConSaldo[];
  constructor(public navCtrl: NavController,
              private ctaCteP: CtasCtesProvider) {}

  ngOnInit() { this.getData(); }

  onClickHeader() { this.showList = !this.showList; }

  onClickItem(cliente: Cliente) {
    this.navCtrl.push(ClientesDetallePage, {Cliente: cliente})
  }

  getSaldo(): number {
    let t: number = 0.00;
    if (this.clientesA) {
      t = this.clientesA.reduce((a, b) => a + b.saldo, 0);
    }
    return t;
  }

  private async getData() {
    this.clientes = this.ctaCteP.getAllConSaldoMayorQue(1).map((data) => {
      data = data.sort((a, b) => { return a.saldo - b.saldo; });
      return data;
    });
    this.clientes.subscribe(data => { this.clientesA = data; });
  }
}
