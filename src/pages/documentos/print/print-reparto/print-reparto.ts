import {ClientesProvider} from './../../../../providers/clientes/clientes';
import {Cliente} from './../../../../models/clientes.clases';
import {Reparto} from './../../../../models/repartos.clases';
import {Component} from '@angular/core';
import {NavController, NavParams, LoadingController} from 'ionic-angular';

@Component({
  selector: 'page-print-reparto',
  templateUrl: 'print-reparto.html',
})
export class PrintRepartoPage {
  isPrint: boolean = false;
  reparto: Reparto;
  private clientes: Cliente[] = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private clientesP: ClientesProvider,
              private loadCtrl: LoadingController) {
    this.reparto = this.navParams.get('Reparto');
    if (this.reparto) {
      this.getData();
    } else {
      this.navCtrl.pop();
    }
  }

  getCliente(idCliente: number): Cliente {
    return this.clientes.find((c) => { return c.id == idCliente; });
  }

  countTotalPedidos(): number {
    let t: number = 0;
    if (this.reparto && this.reparto.Items) {
      this.reparto.Items.forEach((i) => { t += i.Pedidos.length; });
    }
    return t;
  }

  goPrint() {
    this.isPrint = true;
    setTimeout(() => {
      window.print();
      this.goBack();
    }, 10);
  }

  goBack() { this.navCtrl.pop(); }

  private async getData() {
    if (this.reparto && this.reparto.Items && this.reparto.Items.length > 0) {
      let load = this.loadCtrl.create({content: 'Actualizando Datos...'});
      // Chequea el fin de los items
      let chkfin = (idx) => {
        idx++;
        if (idx < this.reparto.Items.length) {
          loop(idx);
        } else {
          load.dismiss();
        }
      };
      // Buscar clientes
      let loop = (idx) => {
        let cExist: boolean = (this.clientes.findIndex((cliente) => {
          return cliente.id == this.reparto.Items[idx].idCliente;
        }) > -1);
        if (!cExist) {
          this.clientesP.getOne(this.reparto.Items[idx].idCliente)
              .subscribe(
                  (data) => {
                    this.clientes.push(data);
                    chkfin(idx);
                  },
                  (error) => {
                    // Si hay un error volver a intentar todo
                    load.dismiss().then(() => { this.getData(); });
                  });
        } else {
          chkfin(idx);
        }
      };
      // Presentar Loading
      load.present().then(() => {
        // Inicializar Array clientes
        this.clientes = [];
        loop(0);
      });
    }
  }
}
