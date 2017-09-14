import { Observable } from 'rxjs/Observable';
import {CtasCtesProvider} from './../../../providers/ctas-ctes/ctas-ctes';
import {Cliente} from './../../../models/clientes.clases';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {Reparto} from './../../../models/repartos.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {numFormat} from '../../../print/config-comun';

@Component({
  selector: 'page-reparto-cerrar',
  templateUrl: 'reparto-cerrar.html',
})
export class RepartoCerrarPage {
  private oldReparto: Reparto;
  reparto: Reparto;
  title: string;
  showItemDetalle: boolean[] = [];
  private clientes: Cliente[] = [];
  private saldos: Array<{id:number,saldo:Observable<number>}> = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private clientesP: ClientesProvider,
              private ctacteP: CtasCtesProvider) {
    this.oldReparto = this.navParams.get('Reparto');
    if (this.oldReparto) {
      this.reparto = JSON.parse(JSON.stringify(this.oldReparto));
      this.title = `Reparto Nro ${numFormat(this.reparto.id, '3.0-0')}`;
    } else {
      this.goBack();
    }
  }

  getCliente(idCliente: number): Cliente {
    let cliente = this.clientes.find((c) => {return c.id == idCliente});
    this.clientesP.getOne(idCliente).subscribe((data) => {
      cliente = (data);
      return cliente;
    });
    if (!cliente) {
      this.clientesP.getOne(idCliente)
          .subscribe((data) => { this.clientes.push(data); });
    }
    return cliente;
  }
   getSaldo(idCliente: number):Observable<number> {
    let item = this.saldos.find((i)=>{return i.id === idCliente;});
    if(item){
      return item.saldo;
    }
    this.saldos.push({id:idCliente,saldo:this.ctacteP.getSaldoCliente(idCliente) });
  }

  goBack() { this.navCtrl.pop(); }
}
