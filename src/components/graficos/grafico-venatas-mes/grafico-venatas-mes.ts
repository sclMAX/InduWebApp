import {ENTREGADO} from './../../../models/pedidos.clases';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';
import {Component} from '@angular/core';
import {dateFormat} from "../../../print/config-comun";
@Component(
    {selector: 'grafico-venatas-mes', templateUrl: 'grafico-venatas-mes.html'})
export class GraficoVenatasMesComponent {
  public barChartOptions:
      any = {scaleShowVerticalLines: false, responsive: true};
  barChartLabels: string[] = [];
  barChartType: string = 'bar';
  barChartLegend: boolean = true;
  fechaKilos: Array<{fecha: string, kilos: number}> = [];
  barChartData: any[] = [{data: []}];
  isData:boolean = false;
  colores:Array<any>=[{ backgroundColor:'blue'}];
  constructor(private pedidosP: PedidosProvider) { this.getData(); }



  // events
  public chartClicked(e: any): void { console.log(e); }

  public chartHovered(e: any): void { console.log(e); }

  private async getData() {
    this.pedidosP.getAll(ENTREGADO).subscribe((pedidos) => {
      if (pedidos && pedidos.length > 0) {
        this.fechaKilos = [];
        for (let p of pedidos) {
          let item = this.fechaKilos.find(f => f.fecha == p.fechaEntrega);
          if (item) {
            item.kilos += p.totalUnidades;
          } else {
            this.fechaKilos.push(
                {fecha: p.fechaEntrega, kilos: p.totalUnidades});
          }
        }
        let data = [];
        this.barChartLabels = [];
        for (let i of this.fechaKilos) {
          this.barChartLabels.push(dateFormat(i.fecha,'dd/MM/yyyy'));
          data.push(i.kilos.toFixed(2));
        }
        this.barChartData = [{data: data, label: 'Kilos'}];
        this.isData = true;
      }
    });
  }
}
