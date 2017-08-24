import { ROOT } from './../../../models/db-base-paths';
import {Component} from '@angular/core';

@Component({selector: 'footer-comun', templateUrl: 'footer-comun.html'})
export class FooterComunComponent {
    text:string;
    constructor(){
        this.text = `Copyright 2017 by MAX - /${ROOT}`;
    }
}
