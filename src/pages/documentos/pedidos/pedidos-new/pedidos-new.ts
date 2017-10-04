import {Component} from '@angular/core';
import {
  AlertController,
  LoadingController,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';

import {Cliente} from './../../../../models/clientes.clases';
import {
  calcularTotalFinal,
  calSubTotalCDs,
  Pedido,
  PRESUPUESTO,
  PEDIDO
} from './../../../../models/pedidos.clases';
import {ClientesProvider} from './../../../../providers/clientes/clientes';
import {
  ContadoresProvider
} from './../../../../providers/contadores/contadores';
import {DolarProvider} from './../../../../providers/dolar/dolar';
import {PedidosProvider} from './../../../../providers/pedidos/pedidos';
import {SucursalProvider} from './../../../../providers/sucursal/sucursal';
import {CV, UsuarioProvider} from './../../../../providers/usuario/usuario';
import {printPresupuesto} from '../../../../print/print-pedidos';

@Component({
  selector: 'page-pedidos-new',
  templateUrl: 'pedidos-new.html',
})
export class PedidosNewPage {
  cliente: Cliente;
  pedido: Pedido;
  oldPedido: Pedido;
  isEdit: boolean = false;
  dolarValor: number = 0.00;
  CVs: CV[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private pedidosP: PedidosProvider, private dolarP: DolarProvider,
              private loadCtrl: LoadingController,
              private contadoresP: ContadoresProvider,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private clientesP: ClientesProvider,
              private usuarioP: UsuarioProvider,
              private sucP: SucursalProvider) {
    this.cliente = this.navParams.get('Cliente');
    this.oldPedido = this.navParams.get('Pedido');
    if (!this.cliente && !this.oldPedido) {
      this.navCtrl.pop();
    }
    if (!this.oldPedido) {
      this.pedido = new Pedido();
      this.pedido.tipo = PRESUPUESTO;
      this.isEdit = false;
      this.pedido.idCliente = this.cliente.id;
      this.pedido.DireccionEntrega = this.cliente.Direccion;
      this.getNro();
    } else {
      this.isEdit = true;
      this.pedido = JSON.parse(JSON.stringify(this.oldPedido));
      if (!this.cliente) {
        this.getCliente();
      }
    }
    this.getDolarValor();
    this.getCVs();
  }

  ionViewDidLoad() {}

  chkExistEmbalados(): boolean {
    if (this.isEdit) {
      return this.pedido.Items.findIndex((i) => {return i.isEmbalado}) > -1;
    }
    return false;
  }

  onGuardar() {
    this.oldPedido = this.pedido;
    let load = this.loadCtrl.create({content: 'Guardando...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    load.present().then(() => {
      if (this.isEdit) {
        this.pedidosP.update(this.oldPedido)
            .subscribe(
                (ok) => {
                  this.navCtrl.pop();
                  load.dismiss();
                  toast.setMessage(ok);
                  toast.setDuration(1000);
                  toast.present();
                },
                (error) => {
                  load.dismiss();
                  toast.setMessage(error);
                  toast.setShowCloseButton(true);
                  toast.present();
                });
      } else {
        this.pedidosP.add(this.oldPedido)
            .subscribe(
                (ok) => {
                  this.navCtrl.pop();
                  load.dismiss();
                  toast.setMessage(ok);
                  toast.setDuration(2000);
                  toast.present();
                },
                (error) => {
                  load.dismiss();
                  toast.setMessage(error);
                  toast.present();
                });
      }
    });
  }

  borrar() {
    let alert = this.alertCtrl.create({
      title: 'ELIMINAR...',
      subTitle: 'Eliminar Presupuesto?',
      message: `Esta seguro que desea ELIMINAR el Presupuesto Nro:${this.pedido
                   .numero}?`,
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: () => {
            let load = this.loadCtrl.create({content: 'Eliminando...'});
            let toast = this.toastCtrl.create({position: 'middle'});
            load.present().then(() => {
              this.pedidosP.remove(this.pedido)
                  .subscribe(
                      (ok) => {
                        this.navCtrl.pop();
                        load.dismiss();
                        toast.setMessage(ok);
                        toast.setDuration(1000);
                        toast.present();
                      },
                      (error) => {
                        load.dismiss();
                        toast.setMessage(error);
                        toast.setShowCloseButton(true);
                        toast.present();
                      });
            });
          }
        }
      ]
    });
    alert.present();
  }

  confirmar() {
    let alert = this.alertCtrl.create({
      title: 'Confirmar Presupuesto...',
      subTitle: 'Pasar presupuesto a Pedido?',
      message:
          'Aceptar para confirmar el Presupuesto y pasarlo a Pedido para su Embalaje.',
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: () => {
            if (this.isEdit) {
              this.toPedido();
            } else {
              this.pedido.tipo = PEDIDO;
              this.pedido.isImpreso = false;
              this.onGuardar();
            }
          }
        }
      ]
    });
    alert.present();
  }

  isPresupuesto(): boolean { return this.pedido.tipo == PRESUPUESTO; }

  print() {
    if (this.isPresupuesto()) {
      this.onGuardar();
      this.pedido.isImpreso = true;
      printPresupuesto(this.cliente, this.pedido,
                       `Presupuesto Nro: 00${this.pedido.id}`, this.pedidosP,
                       this.dolarValor);
    }
  }

  private toPedido() {
    let load = this.loadCtrl.create({content: 'Confirmando Presupuesto...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    load.present().then(() => {
      this.pedido.isImpreso = false;
      this.pedidosP.confirmarPresupuesto(this.pedido)
          .subscribe(
              (ok) => {
                this.navCtrl.pop();
                load.dismiss();
                toast.setMessage(ok);
                toast.setDuration(1000);
                toast.present();
              },
              (error) => {
                load.dismiss();
                toast.setMessage(error);
                toast.setShowCloseButton(true);
                toast.present();
              });
    });
  }

  goBack() { this.navCtrl.pop(); }

  setCV() {
    let alert = this.alertCtrl.create({
      title: 'CV',
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: (data) => {
            if (data) {
              this.pedido.CV = this.CVs[data];
            }
          }
        }
      ]
    });
    this.CVs.forEach((cv, idx) => {
      alert.addInput({
        id: `${idx}`,
        name: `${idx}`,
        type: 'radio',
        value: `${idx}`,
        label: cv.tipo,
        checked: (this.pedido && this.pedido.CV && this.pedido.CV.tipo &&
                  (cv.tipo == this.pedido.CV.tipo))
      });
    });
    alert.present();
  }

  setDescuentoGeneral() {
    let alert = this.alertCtrl.create({
      title: 'Descuento General (%)',
      subTitle:
          `maximo autorizado ${this.sucP.getUsuario().maxDescuentoGeneral}%`,
      inputs: [
        {
          type: 'number',
          name: 'descuento',
          placeholder: 'Ingrese el descuento...',
          min: 0,
          max: this.sucP.getUsuario().maxDescuentoGeneral,
          value: `${this.pedido.descuentoGeneral}`
        }
      ],
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: (data) => {
            if (data) {
              let d: number = data.descuento * 1;
              if (d >= 0 && d <= this.sucP.getUsuario().maxDescuentoGeneral) {
                this.pedido.descuentoGeneral = d;
              }
            }
          }
        }
      ]
    });
    alert.present();
  }

  isDireccionValid(): boolean {
    let estado: boolean = false;
    estado = (this.pedido.DireccionEntrega.calle) &&
             (this.pedido.DireccionEntrega.calle.trim().length > 0);
    estado = estado && (this.pedido.DireccionEntrega.localidad) &&
             (this.pedido.DireccionEntrega.localidad.trim().length > 0);
    estado = estado && (this.pedido.fechaEntrega) &&
             (this.pedido.fechaEntrega.trim().length > 0);
    return estado;
  }

  isValid(): boolean {
    let estado: boolean = false;
    estado = (this.pedido && (this.pedido.Items.length > 0));
    estado = estado && this.isDireccionValid();
    estado = estado && this.pedido.idCliente > 0;
    estado = estado && this.pedido.CV != null;
    return estado;
  }
  calTotalNeto(): number { return calSubTotalCDs(this.pedido); }
  calTotalFinal(): number { return calcularTotalFinal(this.pedido); }

  calTotalU$() {
    this.pedido.totalUs = this.pedidosP.calTotalU$(this.pedido, this.cliente);
    return this.pedido.totalUs;
  }

  calTotal$() { return this.pedidosP.calTotal$(this.pedido, this.cliente); }

  calTotalUnidades(): number {
    return this.pedidosP.calTotalUnidades(this.pedido);
  }

  calTotalBarras(): number {
    return this.pedidosP.calTotalBarras(this.pedido.Items);
  }

  calDescuentoKilos(): number {
    this.calTotalUnidades();
    this.pedido.descuentoKilos = this.pedidosP.calDescuentoKilos(this.pedido);
    return this.pedido.descuentoKilos;
  }

  calTotalU$ConDescuento(): number {
    let des: number = this.pedido.descuentoKilos * 1;
    return this.calTotalU$() / ((des > 0) ? (1 + (des / 100)) : 1);
  }

  private async getNro() {
    this.contadoresP.getPedidosCurrentNro(this.pedido.tipo)
        .subscribe((data: number) => { this.pedido.numero = data; });
  }

  private async getCliente() {
    this.clientesP.getOne(this.oldPedido.idCliente)
        .subscribe((data) => { this.cliente = data; });
  }
  async getDolarValor() {
    this.dolarP.getDolarValor().subscribe(
        (val: number) => { this.dolarValor = val; })
  }
  private async getCVs() {
    this.usuarioP.getCV().subscribe((cvs) => { this.CVs = cvs; });
  }
}
