import {
  AlertController,
  LoadingController,
  ToastController
} from 'ionic-angular';
import {SucursalProvider} from './../../../providers/sucursal/sucursal';
import {DolarProvider} from './../../../providers/dolar/dolar';
import {Dolar} from './../../../models/fondos.clases';
import {Component, Input} from '@angular/core';
import {FECHA} from "../../../models/comunes.clases";
import * as moment from 'moment';

@Component({selector: 'dolar-card', templateUrl: 'dolar-card.html'})

export class DolarCardComponent {
  dolar: Dolar;
  dolarHistorico: Dolar[];
  isEditor: boolean = false;
  @Input() color: string = 'scroll-content';
  @Input() headerColor: string = 'dolarCardHeader';
  @Input() toolBarColor: string = 'subToolBar';
  @Input() itemColor: string = 'light';
  @Input() itemImparColor: string;
  @Input() showList: boolean = false;
  constructor(private dolarP: DolarProvider, private sucP: SucursalProvider,
              private alertCtrl: AlertController,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController) {}

  ngOnInit() { this.getData(); }
  ionViewWillEnter() { this.getData(); }

  editDolar() {
    let alert = this.alertCtrl.create({
      title: 'Editar Valor Dolar...',
      message: 'Se modificara la referencia de Dolar para todas las Sucursales',
      inputs: [
        {
          name: 'valorDolar',
          type: 'number',
          min: '1',
          value: `${this.dolar.valor}`
        }
      ],
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: (data) => {
            if (data && data.valorDolar) {
              let v: number = Number(data.valorDolar);
              if (v > 0) {
                this.dolar.valor = v;
                this.saveDolar(v);
              }
            }
          }
        }
      ]
    });
    alert.present();
  }

  private saveDolar(valor: number) {
    let load = this.loadCtrl.create({content: 'Guardando Referencia Dolar...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    load.present().then(() => {
      this.dolarP.setDolar(valor).subscribe(
          (ok) => {
            load.dismiss();
            toast.setMessage(ok);
            toast.setDuration(1000);
            toast.present();
          },
          (error) => {
            load.dismiss();
            toast.setMessage(error);
            toast.setBackButtonText('OK');
            toast.setShowCloseButton(true);
            toast.present();
          });
    });
  }

  private async getData() {
    this.isEditor = this.sucP.getUsuario().isDolarEdit;
    this.dolarP.getDolar().subscribe((data) => { this.dolar = data; });
    this.dolarP.getHistorial().subscribe((data) => {
      data.sort((a, b) => {
        return moment(b.fecha, FECHA).diff(moment(a.fecha, FECHA), 'days');
      });
      this.dolarHistorico = data;
    })
  }
}
