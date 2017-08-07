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
  constructor(private bancosP: BancosProvider,
              private modalCtrl: ModalController) {}

  add() {
    let addBanco =
        this.modalCtrl.create(BancosamPage, {}, {enableBackdropDismiss: false});
    addBanco.present();
  }

  edit(banco: Banco) {
    let editBanco = this.modalCtrl.create(BancosamPage, {Banco: banco},
                                          {enableBackdropDismiss: false});
    editBanco.present();
  }

  ngOnInit() { this.getData(); }

  private async getData() {
    this.bancosP.getAll().subscribe((bancos) => { this.bancos = bancos; });
  }
}
