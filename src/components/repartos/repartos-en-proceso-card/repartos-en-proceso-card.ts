import {RepartosProvider} from './../../../providers/repartos/repartos';
import {Reparto} from './../../../models/repartos.clases';
import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'repartos-en-proceso-card',
  templateUrl: 'repartos-en-proceso-card.html'
})
export class RepartosEnProcesoCardComponent {
  @Input() color: string = 'scroll-content';
  @Input() headerColor: string = 'presupuestosHead';
  @Input() itemColor: string = 'light';
  @Input() itemImparColor: string;
  @Input() showList: boolean = false;
  repartos: Reparto[] = [];

  @Output() onClickItem: EventEmitter<Reparto> = new EventEmitter<Reparto>();
  constructor(private repartosP: RepartosProvider) {}

  onClick(item: Reparto) { this.onClickItem.emit(item); }

  ngOnInit() { this.getData(); }
  ionViewWillEnter() { this.getData(); }

  private async getData() {
    this.repartosP.getEnProceso().subscribe(
        (data) => { this.repartos = data; });
  }
}
