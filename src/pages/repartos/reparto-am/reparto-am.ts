import { Pedido, EMBALADO } from './../../../models/pedidos.clases';
import { PedidosProvider } from './../../../providers/pedidos/pedidos';
import { ContadoresProvider } from './../../../providers/contadores/contadores';
import { Reparto } from './../../../models/repartos.clases';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-reparto-am',
  templateUrl: 'reparto-am.html',
})
export class RepartoAmPage {
  title: string;
  reparto: Reparto;
  pedidosEmbalados: Pedido[] = [];
  isEdit: boolean = false;
  isReadOnly: boolean = false;
  showDatos: boolean = true;
  showPedidosDisponibles: boolean = true;
  constructor(public navCtrl: NavController, public navParams: NavParams, private contadoresP: ContadoresProvider, private pedidosP: PedidosProvider) {
    this.reparto = this.navParams.get('Reparto');
    this.getPedidos();
    if (this.reparto) {
      this.title = `Reparto ${this.reparto.id}`;
      this.isEdit = true;
    } else {
      this.title = 'Nuevo Reparto...';
      this.isEdit = false;
      this.reparto = new Reparto();
      this.getNumero();
    }

  }

  isValid(form): boolean {
    let res: boolean = form.valid;
    return res;
  }

  goBack() {
    this.navCtrl.pop();
  }

  private async getNumero() {
    if (this.reparto) {
      this.contadoresP.getRepartoCurrentNro().subscribe((data) => {
        this.reparto.id = Number(data);
      });
    }
  }
  private async getPedidos() {
    this.pedidosP.getAll(EMBALADO).subscribe((data) => {
      this.pedidosEmbalados = data;
    });
  }

}
