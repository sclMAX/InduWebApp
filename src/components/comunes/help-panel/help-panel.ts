import {HelpProvider} from './../../../providers/help/help';
import {Component} from '@angular/core';

@Component({selector: 'help-panel', templateUrl: 'help-panel.html'})
export class HelpPanelComponent {
  constructor(private helpP: HelpProvider) {}

  getHelp(): string { return this.helpP.getHelp(); }
}
