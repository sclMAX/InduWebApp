import {SUCURSAL} from './../../../providers/sucursal/sucursal';
import {
  REPARTO_PREPARADO,
  REPARTO_PROCESO,
  REPARTO_CERRADO
} from './../../../providers/repartos/repartos';
import {CtasCtesProvider} from './../../../providers/ctas-ctes/ctas-ctes';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {RepartoCerrarPage} from './../reparto-cerrar/reparto-cerrar';
import {Reparto} from './../../../models/repartos.clases';
import {RepartoAmPage} from './../reparto-am/reparto-am';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {printReparto} from "../../../print/print-repartos";

@Component({
  selector: 'page-repartos-home',
  templateUrl: 'repartos-home.html',
})
export class RepartosHomePage {
  title: string;
  preparados: string = REPARTO_PREPARADO;
  enProceso: string = REPARTO_PROCESO;
  cerrados: string = REPARTO_CERRADO;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private clientesP: ClientesProvider,
              private ctacteP: CtasCtesProvider) {
    this.title = `Suc. ${SUCURSAL} - Repartos`;
  }

  onSelectPreparado(item: Reparto) {
    this.navCtrl.push(RepartoAmPage, {Reparto: item});
  }

  onSelectEnProceso(item: Reparto) {
    // this.navCtrl.push(PrintRepartoPage, {Reparto: item});
    // printReparto(item, this.clientesP, this.ctacteP);
    this.navCtrl.push(RepartoCerrarPage, {Reparto: item});
  }

  onSelectCerrado(item: Reparto) {
    printReparto(item, this.clientesP, this.ctacteP);
  }
  nuevoReparto() { this.navCtrl.push(RepartoAmPage); }
}
