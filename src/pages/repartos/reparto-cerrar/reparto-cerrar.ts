import {Pedido} from './../../../models/pedidos.clases';
import {RepartosProvider} from './../../../providers/repartos/repartos';
import {
  ClientesAddPagoPage
} from './../../clientes/clientes-add-pago/clientes-add-pago';
import {Observable} from 'rxjs/Observable';
import {CtasCtesProvider} from './../../../providers/ctas-ctes/ctas-ctes';
import {Cliente} from './../../../models/clientes.clases';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {Reparto, RepartoPedido} from './../../../models/repartos.clases';
import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  AlertController,
  LoadingController,
  ToastController
} from 'ionic-angular';
import {numFormat} from '../../../print/config-comun';

@Component({
  selector: 'page-reparto-cerrar',
  templateUrl: 'reparto-cerrar.html',
})
export class RepartoCerrarPage {
  private oldReparto: Reparto;
  reparto: Reparto;
  pedidosNoEntregados: Pedido[] = [];
  title: string;
  showItemDetalle: boolean[] = [];
  private clientes: Array<
      {id: number, Cliente: Observable<Cliente>, saldo: Observable<number>}> =
      [];
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private alertCtrl: AlertController,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController,
              private clientesP: ClientesProvider,
              private ctacteP: CtasCtesProvider,
              private repartoP: RepartosProvider) {
    this.oldReparto = this.navParams.get('Reparto');
    if (this.oldReparto) {
      this.reparto = JSON.parse(JSON.stringify(this.oldReparto));
      this.title = `Reparto Nro ${numFormat(this.reparto.id, '3.0-0')}`;
    } else {
      this.goBack();
    }
  }

  getCliente(idCliente: number): Observable<Cliente> {
    let item = this.clientes.find((c) => {return c.id === idCliente});
    if (!item) {
      this.clientes.push({
        id: idCliente,
        Cliente: this.clientesP.getOne(idCliente),
        saldo: this.ctacteP.getSaldoCliente(idCliente)
      });
    } else {
      return item.Cliente;
    }
  }
  getSaldo(idCliente: number): Observable<number> {
    let item = this.clientes.find((i) => { return i.id === idCliente; });
    if (item) {
      return item.saldo;
    }else{
      this.getCliente(idCliente);
    }
  }

  removePedido(item: RepartoPedido, idx: number) {
    let alert = this.alertCtrl.create({
      title: 'Quitar Pedido...',
      subTitle:
          `Esta seguro que desea quitar el pedido Nro:${numFormat(item.Pedidos[idx].id,'3.0-0')}?`,
      message:
          'Se quitara el pedido del reparto y pasara a pedidos preparados.Los cambios definitivos se aplicaran al Cerrar el Reparto.',
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: () => {
            this.pedidosNoEntregados.push(item.Pedidos[idx]);
            if (item.Pedidos.length > 1) {
              item.Pedidos.splice(idx, 1);
            } else {
              let itemIdx = this.reparto.Items.findIndex(
                  (i) => { return i.idCliente == item.idCliente; });
              if (idx > -1) {
                this.reparto.Items.splice(itemIdx, 1);
              }
            }
          }
        }
      ]
    });
    alert.present();
  }

  isValid(): boolean {
    let r: boolean = false;
    r = !(this.reparto.Items.findIndex((i) => {return !i.isAddPago}) > -1);
    return r;
  }

  cerraReparto() {
    let load = this.loadCtrl.create({content: 'Cerrando Reparto...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    load.present().then(() => {
      let initMsg = (msg) => {
        load.dismiss();
        toast.setMessage(msg);
      };
      this.repartoP.cerrarReparto(this.reparto, this.pedidosNoEntregados)
          .subscribe(
              (ok) => {
                this.navCtrl.pop();
                initMsg(ok);
                toast.setDuration(1000);
                toast.present();
              },
              (error) => {
                initMsg(error);
                toast.setShowCloseButton(true);
                toast.present();
              });
    });
  }

  goPago(item: RepartoPedido) {
    let cliente = this.getCliente(item.idCliente);
    item.isAddPago = true;
    this.navCtrl.push(ClientesAddPagoPage, {Cliente: cliente});
  }

  goBack() { this.navCtrl.pop(); }
}
