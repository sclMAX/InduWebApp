import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
@Injectable()
export class HelpProvider {
  helpMsg: string = '';
  constructor() {}

  setHelp(msg: string) { this.helpMsg = msg; }

  getHelp(): string { return this.helpMsg; }
}
