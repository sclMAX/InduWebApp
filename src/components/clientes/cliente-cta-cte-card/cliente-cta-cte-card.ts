import {CtasCtesProvider} from './../../../providers/ctas-ctes/ctas-ctes';
import {Cliente, CtaCte} from './../../../models/clientes.clases';
import {Component, Input} from '@angular/core';
import * as moment from 'moment';
import {FECHA} from "../../../models/db-base-paths";
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

  constructor(private ctaCteP: CtasCtesProvider) {}

  ngOnInit() { this.getData(); }

  onClickHeader() { this.showList = !this.showList; }

  async getData() {
    if (this.cliente) {
      this.ctaCteP.getCtaCteCliente(this.cliente.id)
          .subscribe((ctacte) => {
            this.ctaCte = ctacte.sort((a, b) => {
              return moment(a.Fecha, FECHA).diff(moment(b.Fecha, FECHA),'days');
            });
            this.saldo = 0.00;
            this.ctaCte.forEach((c) => {
              this.saldo += c.Debe - c.Haber;
              c.Saldo = this.saldo;
            });
          });
    }
  }
}
