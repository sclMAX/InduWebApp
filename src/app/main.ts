import { SucursalProvider } from './../providers/sucursal/sucursal';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {enableProdMode} from '@angular/core';

import { AppModule } from './app.module';
//enableProdMode();
platformBrowserDynamic().bootstrapModule(AppModule,{providers:[SucursalProvider]});
