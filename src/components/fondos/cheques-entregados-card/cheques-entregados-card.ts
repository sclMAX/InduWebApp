import {
  ChequeRechazarPage
} from './../../../pages/fondos/cheques/cheque-rechazar/cheque-rechazar';
import {Observable} from 'rxjs/Observable';
import {Cliente} from './../../../models/clientes.clases';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {FondosProvider} from './../../../providers/fondos/fondos';
import {
  PrintChequesEnCarteraPage
} from './../../../pages/documentos/print/print-cheques-en-cartera/print-cheques-en-cartera';
import {Cheque} from './../../../models/fondos.clases';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
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

  filterCheques: Observable<Cheque[]>;
  clientes: Array<{id: number, Cliente: Observable<Cliente>}> = [];
  isFilter: boolean = false;

  constructor(public navCtrl: NavController,private modalCtrl:ModalController, private fondosP: FondosProvider,
              private clientesP: ClientesProvider) {}

  calDias(cheque: Cheque) {
    if (cheque) {
      return moment(cheque.fechaCobro, FECHA).diff(moment(), 'days');
    }
    return 0;
  }

  calTotal(cheques: Cheque[]): number {
    let total: number = 0.00;
    if (cheques) {
      cheques.forEach((c) => { total += Number(c.monto); });
    }
    return total;
  }

  getCliente(cheque: Cheque): Observable<Cliente> {
    let cliente = this.clientes.find(
        (c) => {return c.id == cheque.EntregadoPor.idCliente});
    if (cliente) {
      return cliente.Cliente;
    } else {
      this.clientes.push({
        id: cheque.EntregadoPor.idCliente,
        Cliente: this.clientesP.getOne(cheque.EntregadoPor.idCliente)
      });
    }
    return null;
  }

  printList() {
    this.navCtrl.push(
        PrintChequesEnCarteraPage,
        {Cheques: this.filterCheques, Title: 'Cheques Entregados'});
  }

  goCheque(cheque: Cheque) { this.onSelectCheque.emit(cheque); }

  goRechazar(cheque: Cheque) {
    let modal = this.modalCtrl.create(ChequeRechazarPage,{Cheque: cheque},{enableBackdropDismiss:false});
    modal.present();
  }

  onCancelFilter() {
    this.filterCheques = this.fondosP.getChequesEntregados();
    this.isFilter = false;
  }

  onFilter(ev) {
    this.onCancelFilter();
    let val = ev.target.value;
    if (val && val.trim() != '') {
      val = val.trim();
      this.isFilter = true;
      this.filterCheques = this.fondosP.getChequesEntregados().map(
          (cheques) => {return cheques.filter(
              (c) => { return (c.id.toLowerCase().indexOf(val) > -1); })});
    }
  }

  ngOnInit() { this.getData(); }
  ionViewWillEnter() { this.getData(); }

  private async getData() {
    this.filterCheques = this.fondosP.getChequesEntregados();
  }
}
