import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NavController} from 'ionic-angular';
import * as moment from 'moment';

import {FECHA} from './../../../models/comunes.clases';
import {Cheque} from './../../../models/fondos.clases';
import {
  PrintChequesEnCarteraPage
} from './../../../pages/documentos/print/print-cheques-en-cartera/print-cheques-en-cartera';
import {FondosProvider} from './../../../providers/fondos/fondos';

@Component({
  selector: 'cheques-en-cartera-card',
  templateUrl: 'cheques-en-cartera-card.html'
})
export class ChequesEnCarteraCardComponent {
  @Input() title: string = 'Cheques en Cartera';
  @Input() color: string = 'scroll-content';
  @Input() headerColor: string = 'chequesHeader';
  @Input() toolBarColor: string = 'subToolBar';
  @Input() itemColor: string = 'light';
  @Input() itemImparColor: string;
  @Input() showList: boolean = false;
  @Input() onlyPorVencer: boolean = false;
  @Input() excluir: Cheque[];
  @Output()
  isChequesPorVencer: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onSelectCheque: EventEmitter<Cheque> = new EventEmitter<Cheque>();
  isExistChequesPorVencer: boolean = false;

  cheques: Cheque[] = [];
  filterCheques: Cheque[] = [];

  constructor(public navCtrl: NavController, private fondosP: FondosProvider) {}

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

  chkExistPorVencer() {
    this.isExistChequesPorVencer =
        this.cheques.find((c) => { return this.calDias(c) <= -25; }) != null;
    this.isChequesPorVencer.emit(this.isExistChequesPorVencer);
  }

  getColor(item, par): string {
    let c: string = 'itemColor';
    c = (par) ? 'itemColor' : (this.itemImparColor) ? 'itemImparColor' :
                                                      'itemColor';
    let dias: number = this.calDias(item);
    // Cheques al dia
    if (dias > -15 && dias < 1) {
      c = 'primary';
    }
    if (dias > -25 && dias <= -15) {
      c = 'secondary';
    }
    if (dias <= -25) {
      c = 'danger';
    }
    return c;
  }

  printList() {
    this.navCtrl.push(PrintChequesEnCarteraPage, {Cheques: this.filterCheques});
  }

  goCheque(cheque: Cheque) { this.onSelectCheque.emit(cheque); }

  onCancelFilter() {
    if (this.excluir) {
      this.excluir.forEach((e) => {
        this.cheques = this.cheques.filter((c) => {return c.id != e.id});
      });
    }
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
    this.fondosP.getChequesEnCartera().subscribe((data) => {
      if (this.onlyPorVencer) {
        this.cheques = data.filter((c) => { return this.calDias(c) <= -25; });

      } else {
        this.cheques = data;
      }
      this.onCancelFilter();
      this.chkExistPorVencer();
    });
  }
}
