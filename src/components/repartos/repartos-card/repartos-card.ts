import {DolarProvider} from './../../../providers/dolar/dolar';
import {Observable} from 'rxjs/Observable';
import {
  RepartosProvider,
  REPARTO_PREPARADO,
  REPARTO_PROCESO,
  REPARTO_CERRADO
} from './../../../providers/repartos/repartos';
import {Reparto} from './../../../models/repartos.clases';
import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({selector: 'repartos-card', templateUrl: 'repartos-card.html'})
export class RepartosCardComponent {
  @Input() color: string = 'scroll-content';
  @Input() headerColor: string = 'presupuestosHead';
  @Input() itemColor: string = 'light';
  @Input() itemImparColor: string;
  @Input() showList: boolean = false;
  @Input() tipo: string = REPARTO_PREPARADO;
  title: string;
  dolar: Observable<number>;
  repartos: Observable<Reparto[]>;

  @Output() onClickItem: EventEmitter<Reparto> = new EventEmitter<Reparto>();
  constructor(private repartosP: RepartosProvider,
              private dolarP: DolarProvider) {}

  onClick(item: Reparto) { this.onClickItem.emit(item); }

  ngOnInit() { this.getData(); }
  ionViewWillEnter() { this.getData(); }

  calTotalKilos(reparto: Reparto[]): number {
    let t: number = 0.00;
    if (reparto) {
      reparto.forEach((i) => { t += Number(i.totalKilos); });
    }
    return t;
  }

  calTotalUs(reparto: Reparto[]): number {
    let t: number = 0.00;
    if (reparto) {
      reparto.forEach((i) => { t += Number(i.saldoTotal); });
    }
    return t;
  }

  private async getData() {
    let t: string = '';
    switch (this.tipo) {
      case REPARTO_PREPARADO:
        t = 'Repartos Preparados';
        break;
      case REPARTO_PROCESO:
        t = 'En Proceso';
        break;
      case REPARTO_CERRADO:
        t = 'Repartos Cerrados';
        break;
    }
    this.title = t;
    this.dolar = this.dolarP.getDolar().map(data => data.valor);
    this.repartos = this.repartosP.getAll(this.tipo);
  }
}
