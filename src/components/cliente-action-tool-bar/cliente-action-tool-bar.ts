import { Component } from '@angular/core';

/**
 * Generated class for the ClienteActionToolBarComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'cliente-action-tool-bar',
  templateUrl: 'cliente-action-tool-bar.html'
})
export class ClienteActionToolBarComponent {

  text: string;

  constructor() {
    console.log('Hello ClienteActionToolBarComponent Component');
    this.text = 'Hello World';
  }

}
