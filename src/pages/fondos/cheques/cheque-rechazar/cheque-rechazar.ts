import {FondosProvider} from './../../../../providers/fondos/fondos';
import {Cliente} from './../../../../models/clientes.clases';
import {ClientesProvider} from './../../../../providers/clientes/clientes';
import {Observable} from 'rxjs/Observable';
import {Cheque} from './../../../../models/fondos.clases';
import {NavParams, ViewController} from 'ionic-angular';
import {Component} from '@angular/core';

@Component({
  selector: 'page-cheque-rechazar',
  templateUrl: 'cheque-rechazar.html',
})
export class ChequeRechazarPage {
  title: string;
  cheque: Cheque;
  cliente: Observable<Cliente>;
  gastos: number = 0.00;
  constructor(public viewCtrl: ViewController, public navParams: NavParams,
              private clientesP: ClientesProvider,
              private fondosP: FondosProvider) {
    this.cheque = this.navParams.get('Cheque');
    if (this.cheque) {
      this.title = `Cheque ${this.cheque.id} Rechazado...`;
      this.cliente = this.clientesP.getOne(this.cheque.EntregadoPor.idCliente);
    } else {
      this.goBack();
    }
  }

  ionViewDidLoad() {}

  goBack() { this.viewCtrl.dismiss(); }

  aceptar() { 
    
    this.fondosP.setChequeRechazado(this.cheque, this.gastos).subscribe((ok)=>{
      alert(ok);
    })
  }
}
