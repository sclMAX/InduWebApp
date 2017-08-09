import {BancosamPage} from './../../../pages/fondos/bancos/bancosam/bancosam';
import {ModalController} from 'ionic-angular';
import {Banco} from './../../../models/fondos.clases';
import {BancosProvider} from './../../../providers/bancos/bancos';
import {Component, Input} from '@angular/core';

@Component({selector: 'bancos-card', templateUrl: 'bancos-card.html'})
export class BancosCardComponent {
  @Input() showList = false;
  @Input() color: string = 'scroll-content';
  @Input() colorHeader: string = 'toolBar';
  @Input() colorSubHeader: string = 'subToolBar';
  @Input() colorItemPar: string = 'listPar';
  @Input() colorItemImpar: string = 'listImpar';

  bancos: Banco[] = [];
  filterBancos: Banco[] = [];
  constructor(private bancosP: BancosProvider,
              private modalCtrl: ModalController) {}

  add() {
    let addBanco =
        this.modalCtrl.create(BancosamPage, {}, {enableBackdropDismiss: false});
    addBanco.present();
  }

  cancelFilter() { this.filterBancos = this.bancos; }

  filtar(ev) {
    this.cancelFilter();
    let val: string = ev.target.value;
    if (val && val.trim() != '') {
      val = val.trim().toLowerCase();
      this.filterBancos = this.bancos.filter((b) => {
        return (b.id.toString().indexOf(val) > -1) ||
               (b.Nombre.toLocaleLowerCase().indexOf(val) > -1);
      });
    }
  }

  edit(banco: Banco) {
    let editBanco = this.modalCtrl.create(BancosamPage, {Banco: banco},
                                          {enableBackdropDismiss: false});
    editBanco.present();
  }

  ngOnInit() { this.getData(); }

  private async getData() {
    this.bancosP.getAll().subscribe((bancos) => {
      this.bancos = bancos;
      this.cancelFilter();
    });
  }
}
