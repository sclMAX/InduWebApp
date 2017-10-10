import { SUCURSAL } from './../../../providers/sucursal/sucursal';
import {FECHA} from './../../../models/comunes.clases';
import {ENTREGADO} from './../../../models/pedidos.clases';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';
import {Component, Input} from '@angular/core';
import * as moment from 'moment';


@Component(
    {selector: 'grafico-venatas-mes', templateUrl: 'grafico-venatas-mes.html'})
export class GraficoVenatasMesComponent {
  title: string;
  @Input() sucursal:string = SUCURSAL; 
  barChartOptions: any = {scaleShowVerticalLines: false, responsive: true};
  barChartLabels: string[] = [];
  barChartType: string = 'bar';
  barChartLegend: boolean = true;
  fechaKilos: Array<{fecha: string, kilos: number}> = [];
  barChartData: any[] = [{data: []}];
  isData: boolean = false;
  colores: Array < any >= [{backgroundColor: 'blue'}, {backgroundColor: 'red'},
                           {backgroundColor: 'green'}];
  constructor(private pedidosP: PedidosProvider) { this.getData();
  this.title = `Suc. ${this.sucursal} - Ventas por Mes`; }



  // events
  public chartClicked(e: any): void { console.log(e); }

  public chartHovered(e: any): void { console.log(e); }

  private async getData() {
    this.pedidosP.getAll(ENTREGADO).subscribe((pedidos) => {
      if (pedidos && pedidos.length > 0) {
        this.fechaKilos = [];
        for (let p of pedidos) {
          let item = this.fechaKilos.find(
              f => f.fecha == moment(p.fechaEntrega, FECHA).format('MM/YYYY'));
          if (item) {
            item.kilos += p.totalUnidades;
          } else {
            this.fechaKilos.push({
              fecha: moment(p.fechaEntrega, FECHA).format('MM/YYYY'),
              kilos: p.totalUnidades
            });
          }
        }
        let data = [];
        let minimo = [];
        let meta = [];
        this.barChartLabels = [];
        for (let i of this.fechaKilos) {
          this.barChartLabels.push(i.fecha);
          data.push(i.kilos.toFixed(2));
          minimo.push(2500);
          meta.push(5000);
        }
        this.barChartData = [
          {data: data, label: 'Kilos'},
          {data: minimo, label: 'PE'},
          {data: meta, label: 'Meta'}
        ];
        this.isData = true;
      }
    });
  }
}
