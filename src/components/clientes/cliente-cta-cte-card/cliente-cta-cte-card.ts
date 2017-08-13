import {FECHA} from './../../../models/comunes.clases';
import {
  PrintCtacteCardPage
} from './../../../pages/documentos/print/print-ctacte-card/print-ctacte-card';
import {NavController} from 'ionic-angular';
import {CtasCtesProvider} from './../../../providers/ctas-ctes/ctas-ctes';
import {Cliente, CtaCte} from './../../../models/clientes.clases';
import {Component, Input} from '@angular/core';
import * as moment from 'moment';
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

  constructor(public navCtrl: NavController,
              private ctaCteP: CtasCtesProvider) {}

  ngOnInit() { this.getData(); }

  onClickHeader() { this.showList = !this.showList; }

  print() {
    this.navCtrl.push(PrintCtacteCardPage,
                      {CtaCte: this.ctaCte, Cliente: this.cliente});
  }

  async getData() {
    if (this.cliente) {
      this.ctaCteP.getCtaCteCliente(this.cliente.id)
          .subscribe((ctacte) => {
            this.ctaCte = ctacte.sort((a, b) => {
              return moment(a.fecha, FECHA)
                  .diff(moment(b.fecha, FECHA), 'days');
            });
            this.saldo = 0.00;
            this.ctaCte.forEach((c) => {
              this.saldo += c.debe - c.haber;
              c.saldo = this.saldo;
            });
          });
    }
  }
}
