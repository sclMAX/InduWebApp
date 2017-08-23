import {Cliente} from './../../../models/clientes.clases';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {FondosProvider} from './../../../providers/fondos/fondos';
import {
  PrintChequesEnCarteraPage
} from './../../../pages/documentos/print/print-cheques-en-cartera/print-cheques-en-cartera';
import {Cheque} from './../../../models/fondos.clases';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NavController} from 'ionic-angular';
import * as moment from 'moment';
import {FECHA} from "../../../models/comunes.clases";

@Component({
  selector: 'cheques-entregados-card',
  templateUrl: 'cheques-entregados-card.html'
})
export class ChequesEntregadosCardComponent {
  @Input() title: string = 'Cheques Entregados';
  @Input() color: string = 'scroll-content';
  @Input() headerColor: string = 'dark';
  @Input() toolBarColor: string = 'subToolBar';
  @Input() itemColor: string = 'light';
  @Input() itemImparColor: string;
  @Input() showList: boolean = false;
  @Output() onSelectCheque: EventEmitter<Cheque> = new EventEmitter<Cheque>();

  cheques: Cheque[] = [];
  filterCheques: Cheque[] = [];
  clientes: Cliente[] = [];

  constructor(public navCtrl: NavController, private fondosP: FondosProvider,
              private clientesP: ClientesProvider) {}

  calDias(cheque: Cheque) {
    if (cheque) {
      return moment(cheque.fechaCobro, FECHA).diff(moment(), 'days');
    }
    return 0;
  }

  calTotal(): number {
    let total: number = 0.00;
    if (this.filterCheques) {
      this.filterCheques.forEach((c) => { total += Number(c.monto); });
    }
    return total;
  }

  getCliente(cheque: Cheque): Cliente {
    return this.clientes.find(
        (c) => {return c.id === cheque.EntregadoPor.idCliente});
  }

  printList() {
    this.navCtrl.push(
        PrintChequesEnCarteraPage,
        {Cheques: this.filterCheques, Title: 'Cheques Entregados'});
  }

  goCheque(cheque: Cheque) { this.onSelectCheque.emit(cheque); }

  onCancelFilter() {
    this.filterCheques = JSON.parse(JSON.stringify(this.cheques));
  }

  onFilter(ev) {
    this.onCancelFilter();
    let val = ev.target.value;
    if (val && val.trim() != '') {
      val = val.trim();
      this.filterCheques = this.cheques.filter(
          (c) => { return (c.id.toLowerCase().indexOf(val) > -1); });
    }
  }

  ngOnInit() { this.getData(); }
  ionViewWillEnter() { this.getData(); }

  private async getData() {
    this.fondosP.getChequesEntregados().subscribe((data) => {
      this.clientes = [];
      data.forEach((c) => {
        this.clientesP.getOne(c.EntregadoPor.idCliente)
            .subscribe((cliente) => { this.clientes.push(cliente); });
      });
      this.cheques = data;
      this.onCancelFilter();
    });
  }
}
