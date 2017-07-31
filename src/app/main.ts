import { SucursalProvider } from './../providers/sucursal/sucursal';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule,{providers:[SucursalProvider]});
