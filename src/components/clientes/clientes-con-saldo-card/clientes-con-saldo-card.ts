import { ClientesDetallePage } from './../../../pages/clientes/clientes-detalle/clientes-detalle';
import { Cliente } from './../../../models/clientes.clases';
import { CtasCtesProvider, ClienteConSaldo } from './../../../providers/ctas-ctes/ctas-ctes';
import { NavController } from 'ionic-angular';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'clientes-con-saldo-card',
  templateUrl: 'clientes-con-saldo-card.html'
})
export class ClientesConSaldoCardComponent {
  @Input() colorHeader: string = 'warning';
  showList: boolean = false;
  clientes: ClienteConSaldo[] = [];

  constructor(public navCtrl: NavController, private ctaCteP: CtasCtesProvider) { }

  ngOnInit() { this.getData(); }

  onClickHeader() { this.showList = !this.showList; }

  onClickItem(cliente:Cliente) {
    this.navCtrl.push(ClientesDetallePage, {Cliente: cliente})
  }

  calTotal(): number {
    let t: number = 0.00;
    if (this.clientes) {
      this.clientes.forEach((cs) => {
        t += Number(cs.saldo);
      });
    }
    return t;
  }

  private async getData() {
    this.ctaCteP.getAllConSaldoMayorQue(1).subscribe((data) => {
      this.clientes = data.sort((a, b) => {
        return a.saldo - b.saldo;
      });
    })
  }
}
