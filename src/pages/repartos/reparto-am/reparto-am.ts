import { RepartoEnProcesoPage } from './../reparto-en-proceso/reparto-en-proceso';
import { RepartosProvider } from './../../../providers/repartos/repartos';
import { DolarProvider } from './../../../providers/dolar/dolar';
import { CtasCtesProvider } from './../../../providers/ctas-ctes/ctas-ctes';
import { Component } from '@angular/core';
import {
  NavController,
  NavParams,
  LoadingController,
  ToastController,
  AlertController
} from 'ionic-angular';

import { Cliente } from './../../../models/clientes.clases';
import { Pedido, EMBALADO } from './../../../models/pedidos.clases';
import { Reparto, RepartoPedido } from './../../../models/repartos.clases';
import { ClientesProvider } from './../../../providers/clientes/clientes';
import { ContadoresProvider } from './../../../providers/contadores/contadores';
import { PedidosProvider } from './../../../providers/pedidos/pedidos';

@Component({
  selector: 'page-reparto-am',
  templateUrl: 'reparto-am.html',
})
export class RepartoAmPage {
  title: string;
  reparto: Reparto;
  oldReparto: Reparto;
  pedidosEmbalados: Pedido[] = [];
  isEdit: boolean = false;
  isReadOnly: boolean = false;
  showDatos: boolean = true;
  showPedidosDisponibles: boolean = true;
  clientes: Array<{ saldo: number, cliente: Cliente }> = [];
  showPedidos: Array<boolean> = [];
  showPedidosAgregados: boolean = true;
  showTotales: boolean = true;
  valorDolar: number = 0.00;
  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    private loadCtrl: LoadingController, private toastCtrl: ToastController,
    private alertCtrl: AlertController, private repartosP: RepartosProvider,
    private contadoresP: ContadoresProvider,
    private pedidosP: PedidosProvider, private clientesP: ClientesProvider,
    private ctacteP: CtasCtesProvider, private dolarP: DolarProvider) {
    this.oldReparto = this.navParams.get('Reparto');
    if (this.oldReparto) {
      this.title = `Reparto`;
      this.reparto = JSON.parse(JSON.stringify(this.oldReparto));
      this.isEdit = true;
    } else {
      this.reparto = new Reparto();
      this.title = 'Nuevo Reparto';
      this.isEdit = false;
      this.getNumero();
    }
    this.getDolar();
    this.getPedidos();
  }

  isExistPedido(pedido: Pedido): boolean {
    let res: boolean = false;
    if (this.isEdit && this.oldReparto) {
      let pInRepato: Pedido[] = [];
      this.oldReparto.Items.forEach(
        (i) => { i.Pedidos.forEach((p) => { pInRepato.push(p); }); });
      res = (pInRepato.findIndex((p) => { return p.id == pedido.id; }) > -1);
      if (res) {
        return res;
      }
    }
    if (this.pedidosEmbalados) {
      res = this.pedidosEmbalados.findIndex(
        (p) => { return p.id == pedido.id; }) > -1;
    }
    return res;
  }

  chkItems(): boolean {
    let res: boolean = true;
    this.reparto.Items.forEach((i) => {
      i.Pedidos.forEach((p) => { res = res && this.isExistPedido(p); });
    });
    return res;
  }

  isDatosValid(form): boolean {
    let res: boolean = form.valid;
    res = res && this.reparto.id > 0;
    return res;
  }

  isValid(form): boolean {
    let res: boolean = this.isDatosValid(form);
    res = res && (this.reparto.Items.length > 0);
    res = res && this.chkItems();
    return res;
  }

  goBack() { this.navCtrl.pop(); }

  guardar() {
    let load = this.loadCtrl.create({ content: 'Guardando Reparto...' });
    let toast = this.toastCtrl.create({ position: 'middle' });
    let okMsg = (ok) => {
      this.navCtrl.pop();
      load.dismiss();
      toast.setMessage(ok);
      toast.setDuration(1000);
      toast.present();
    };
    let errorMsg = (error) => {
      load.dismiss();
      toast.setMessage(error);
      toast.setBackButtonText('OK');
      toast.setShowCloseButton(true);
      toast.present();
    };
    if (this.isEdit) {
      load.setContent('Actualizando Reparto...');
    }
    load.present().then(() => {
      if (!this.isEdit) {
        this.repartosP.add(this.reparto)
          .subscribe((ok) => { okMsg(ok); }, (error) => { errorMsg(error); });
      } else {
        this.repartosP.update(this.oldReparto, this.reparto)
          .subscribe((ok) => { okMsg(ok); }, (error) => { errorMsg(error); });
      }
    });
  }

  confirmar() {
    // Si confirman
    let okConfirmar = () => {
      let load = this.loadCtrl.create({ content: 'Guardando Reparto...' });
      // Si se guardaron loa cambios
      let ok = (msg) => {
        load.dismiss().then(() => {
          // Presentar nuevo Loading...
          load = this.loadCtrl.create({ content: 'Confirmando Reparto...' });
          load.present().then(() => {
            // Intentar confirmar el reparto
            this.repartosP.setEnProceso(this.reparto)
              .subscribe(
              // Si todo va bien
              (reparto) => {
                this.navCtrl.pop();
                load.dismiss();
                this.navCtrl.push(RepartoEnProcesoPage,
                  { Reparto: reparto });
              },
              // Si hay error
              (err) => {
                // Lamar al manejador comun de errores
                error(err);
              });
          });
        });
      };
      // Manejador comun de errores
      let error = (msg) => {
        load.dismiss();
        let toast = this.toastCtrl.create({
          message: msg,
          showCloseButton: true,
          dismissOnPageChange: true,
          closeButtonText: 'OK'
        });
        toast.present();
      };
      // Show Loading...
      load.present().then(() => {
        // Actualizar Totales
        this.calTotalesPedidos();
        // Guardar Cambios en el reparto
        if (this.isEdit && this.oldReparto) {  // Editado
          this.repartosP.update(this.oldReparto, this.reparto)
            .subscribe(
            (okUpdate) => {
              // Cambios guardados
              ok(okUpdate);
            },
            (err) => {
              // error al guardar cambios
              error(err);
            });
        } else {  // Nuevo
          this.isEdit = true;
          this.repartosP.add(this.reparto)
            .subscribe(
            (okAdd) => {
              // Nuevo guardado
              ok(okAdd);
            },
            (err) => {
              // error al guardar nuevo
              error(err);
            });
        }
      });
    };
    // Confirmar Accion
    let alert = this.alertCtrl.create({
      title: 'Confirmar Reparto',
      subTitle: 'Confirmar reparto para su salida?',
      message:
      'Se confirmara el reparto para imprimir las ordenes y detalles, luego de esto no se podra editar.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Aceptar', role: 'ok', handler: () => { okConfirmar(); } }
      ]
    });
    alert.present();
  }

  remove() {
    if (this.oldReparto) {
      let alert = this.alertCtrl.create({
        title: 'Eliminar!',
        subTitle:
        `Esta seguro que desea eliminar definitivamente el Reparto Nro:${this.oldReparto.id}?`,
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Aceptar', role: 'ok', handler: () => { this.remover(); } }
        ]
      });
      alert.present();
    }
  }

  private remover() {
    let load = this.loadCtrl.create({ content: 'Eliminando Reparto...' });
    let toast = this.toastCtrl.create({ position: 'middle' });
    this.repartosP.remove(this.oldReparto)
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
        toast.setBackButtonText('OK');
        toast.showBackButton(true);
        toast.present();
      });
  }

  getCliente(idCliente: number): Cliente {
    if (this.clientes) {
      let cliente =
        this.clientes.find((c) => { return c.cliente.id == idCliente });
      if (cliente) {
        return cliente.cliente;
      } else {
        this.clientesP.getOne(idCliente).subscribe((data) => {
          this.ctacteP.getSaldoCliente(data.id).subscribe((saldo) => {
            cliente = { cliente: data, saldo: saldo };
            this.clientes.push(cliente);
          });
        });
      }
      return (cliente) ? cliente.cliente : null;
    } else {
      this.clientes = [];
      return null;
    }
  }

  getSaldo(idCliente: number): number {
    if (this.clientes) {
      let cliente =
        this.clientes.find((c) => { return c.cliente.id == idCliente });
      if (cliente) {
        return cliente.saldo;
      } else {
        this.getCliente(idCliente);
        return 0.00;
      }
    } else {
      return 0.00;
    }
  }

  calTotalesReparto() {
    this.reparto.totalDolares = 0.00;
    this.reparto.totalKilos = 0.00;
    this.reparto.saldoTotal = 0.00;
    this.reparto.Items.forEach((pedidos) => {
      this.reparto.totalDolares += Number(pedidos.totalPedidos || 0);
      this.reparto.totalKilos += Number(pedidos.totalKilos || 0);
      this.reparto.saldoTotal +=
        Number((pedidos.saldoActual > 0) ? pedidos.saldoActual : 0);
    });
  }

  private calTotalesPedidos() {
    if (this.reparto && this.reparto.Items) {
      this.reparto.Items.forEach((i) => {
        i.totalKilos = 0.00;
        i.totalPedidos = 0.00;
        i.saldoActual = this.getSaldo(i.idCliente);
        i.Pedidos.forEach((p) => {
          i.totalKilos += Number(p.totalUnidades || 0);
          i.totalPedidos += Number(p.totalFinalUs || 0);
          i.saldoActual += (p.isInCtaCte) ? 0.00 : Number(p.totalFinalUs);
        });
      });
      this.calTotalesReparto();
    }
  }

  addPedido(pedido: Pedido) {
    let existP: number = this.reparto.Items.findIndex(
      (p) => { return p.idCliente === pedido.idCliente; });
    if (existP > -1) {
      this.reparto.Items[existP].Pedidos.push(pedido);
    } else {
      let np: RepartoPedido = new RepartoPedido();
      np.idCliente = pedido.idCliente;
      np.saldoActual = 0.00;
      np.Pedidos.push(pedido);
      this.reparto.Items.push(np);
    }
    this.calTotalesPedidos();
  }

  removeCliente(itemIdx: number) {
    this.reparto.Items.splice(itemIdx, 1);
    this.calTotalesPedidos();
  }

  removePedido(item: RepartoPedido, pedidoIdx: number) {
    item.Pedidos.splice(pedidoIdx, 1);
    this.calTotalesPedidos();
  }

  private async getNumero() {
    if (this.reparto) {
      this.contadoresP.getRepartoCurrentNro().subscribe(
        (data) => { if (!this.isEdit) { this.reparto.id = Number(data); } });
    }
  }

  filtrarPedidos(data: Pedido[]): Pedido[] {
    if (this.reparto && this.reparto.Items) {
      let resultado: Pedido[] = data;
      this.reparto.Items.forEach((i) => {
        i.Pedidos.forEach((p) => {
          resultado = resultado.filter((r) => { return r.id != p.id; });
        });
      });
      return resultado;
    } else {
      return data;
    }
  }


  private async getPedidos() {
    this.pedidosP.getAll(EMBALADO).subscribe((data) => {
      this.pedidosEmbalados =
        data.sort((a, b) => { return a.idCliente - b.idCliente; });
    });
  }

  private async getDolar() {
    this.dolarP.getDolar().subscribe((data) => {
      this.reparto.Dolar = data;
      this.valorDolar = data.valor;
    });
  }
}
