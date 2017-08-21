import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NavController} from 'ionic-angular';
import * as moment from 'moment';

import {FECHA} from './../../../models/comunes.clases';
import {Cheque} from './../../../models/fondos.clases';
import {PrintChequesEnCarteraPage} from './../../../pages/documentos/print/print-cheques-en-cartera/print-cheques-en-cartera';
import {ChequesAmPage} from './../../../pages/fondos/cheques/cheques-am/cheques-am';
import {FondosProvider} from './../../../providers/fondos/fondos';

@Component({
  selector: 'cheques-en-cartera-card',
  templateUrl: 'cheques-en-cartera-card.html'
})
export class ChequesEnCarteraCardComponent {
  @Input() title:string = 'Cheques en Cartera';
  @Input() color: string = 'scroll-content';
  @Input() headerColor: string = 'chequesHeader';
  @Input() toolBarColor: string = 'subToolBar';
  @Input() itemColor: string = 'light';
  @Input() itemImparColor: string;
  @Input() showList: boolean = false;
  @Input() onlyPorVencer: boolean = false;
  @Output()
  isChequesPorVencer: EventEmitter<boolean> = new EventEmitter<boolean>();
  isExistChequesPorVencer:boolean =false;

  cheques: Cheque[] = [];

  constructor(public navCtrl: NavController, private fondosP: FondosProvider) {}

  calDias(cheque: Cheque) {
    if (cheque) {
      return moment(cheque.fechaCobro, FECHA).diff(moment(), 'days');
      }
    return 0;
  }

  calTotal(): number {
    let total: number = 0.00;
    if (this.cheques) {
      this.cheques.forEach((c) => {
        total += Number(c.monto);
      });
      }
    return total;
  }

  chkExistPorVencer() {
    this.isExistChequesPorVencer = this.cheques.find((c) => {
      return this.calDias(c) <= -25;
    }) != null;
    this.isChequesPorVencer.emit(this.isExistChequesPorVencer);
  }

  getColor(item, par): string {
    let c: string = 'itemColor';
    c = (par) ? 'itemColor' :
                (this.itemImparColor) ? 'itemImparColor' : 'itemColor';
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
    this.navCtrl.push(PrintChequesEnCarteraPage, {Cheques: this.cheques});
  }

  goCheque(cheque: Cheque) {
    this.navCtrl.push(ChequesAmPage, {Cheque: cheque});
  }

  ngOnInit() {
    this.getData();
  }
  ionViewWillEnter() {
    this.getData();
  }

  private async getData() {
    this.fondosP.getChequesEnCartera().subscribe((data) => {
      if (this.onlyPorVencer) {
        this.cheques = data.filter((c) => {
          return this.calDias(c) <= -25;
        });

      } else {
        this.cheques = data;
      }
      this.chkExistPorVencer();
    });
  }
}
