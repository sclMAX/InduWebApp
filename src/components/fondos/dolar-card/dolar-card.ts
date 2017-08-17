import {DolarProvider} from './../../../providers/dolar/dolar';
import {Dolar} from './../../../models/fondos.clases';
import {Component, Input} from '@angular/core';

@Component({selector: 'dolar-card', templateUrl: 'dolar-card.html'})

export class DolarCardComponent {
  dolar: Dolar;
  dolarHistorico: Dolar[];
  @Input() color: string = 'scroll-content';
  @Input() headerColor: string = 'dolarCardHeader';
  @Input() toolBarColor: string = 'subToolBar';
  @Input() itemColor: string = 'light';
  @Input() itemImparColor: string;
  @Input() showList: boolean = false;
  constructor(private dolarP: DolarProvider) {}

  ngOnInit() { this.getData(); }
  ionViewWillEnter() { this.getData(); }

  private async getData() {
    this.dolarP.getDolar().subscribe((data) => { this.dolar = data; });
    this.dolarP.getHistorial().subscribe(
        (data) => { this.dolarHistorico = data; })
  }
}
