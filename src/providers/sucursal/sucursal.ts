import {FECHA, FECHA_FULL, Log} from './../../models/db-base-paths';
import {Usuario, UserDoc} from './../../models/user.class';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ROOT} from '../../models/db-base-paths';
import {UsuarioProvider} from '../usuario/usuario';
import * as moment from 'moment';

export let SUCURSAL: string = '';
export let SUCURSAL_ROOT: string = '';
export let SUC_CLIENTES_ROOT: string = '';
export let SUC_COLORES_ROOT: string = '';
export let SUC_DOCUMENTOS_ROOT: string = '';
export let SUC_DOCUMENTOS_PEDIDOS: string = '';
export let SUC_CONTADORES_ROOT: string = '';
export let SUC_STOCK_ROOT: string = '';
export let SUC_ADICIONALES_ROOT: string = '';
export let SUC_DESCUENTOS_ROOT: string = '';
export let SUC_LOG_ROOT: string = '';
export let SUC_DOCUMENTOS_STOCKINGRESOS_ROOT: string = '';
export let SUC_DOCUMENTOS_CTASCTES_ROOT: string = '';
export let SUC_DOCUMENTOS_PAGOS_ROOT: string = '';
export let SUC_FONDOS_ROOT: string = '';
export let SUC_FONDOS_CHEQUES_ROOT: string = '';
export let SUC_FONDOS_CHEQUES_CARTERA: string = '';

@Injectable()
export class SucursalProvider {
  private usuario: Usuario;
  constructor(private usuarioP: UsuarioProvider) {}

  public setSucursal(): Observable<string> {
    return new Observable((obs) => {
      this.usuarioP.getCurrentUser().subscribe(
          (usuario) => {
            this.usuario = usuario;
            this.setPaths(usuario.Sucursal);
            obs.next(SUCURSAL);
            obs.complete();
          },
          (error) => {
            obs.error();
            obs.complete();
          });

    });
  }

  genUserDoc(): UserDoc {
    let ud: UserDoc = new UserDoc();
    ud.Fecha = moment().format(FECHA_FULL);
    ud.Usuario = this.usuario;
    return ud;
  }

  genLog(data: any): Log {
    let log: Log = new Log();
    log.id = Date.now();
    log.Fecha = moment().format(FECHA_FULL);
    log.Data = data;
    log.Usuario = this.usuario;
    return log;
  }

  /*
  * Seteo de Rutas base para toda la App
  * Agregar nodos hijos de la sucursal
  */
  private setPaths(sucursal: string) {
    SUCURSAL = sucursal;
    SUCURSAL_ROOT = `${ROOT}Sucursales/${SUCURSAL}/`;
    SUC_CLIENTES_ROOT = `${SUCURSAL_ROOT}Clientes/`;
    SUC_COLORES_ROOT = `${SUCURSAL_ROOT}Colores/`;
    SUC_CONTADORES_ROOT = `${SUCURSAL_ROOT}Contadores/`;
    SUC_STOCK_ROOT = `${SUCURSAL_ROOT}Stock/`;
    SUC_DOCUMENTOS_ROOT = `${SUCURSAL_ROOT}Documentos/`;
    SUC_DOCUMENTOS_PEDIDOS = `${SUC_DOCUMENTOS_ROOT}Pedidos/`;
    SUC_ADICIONALES_ROOT = `${SUCURSAL_ROOT}Adicionales/`;
    SUC_DESCUENTOS_ROOT = `${SUCURSAL_ROOT}Descuentos/`;
    SUC_LOG_ROOT = `${SUCURSAL_ROOT}Log/`;
    SUC_DOCUMENTOS_STOCKINGRESOS_ROOT = `${SUC_DOCUMENTOS_ROOT}StockIngresos/`;
    SUC_DOCUMENTOS_CTASCTES_ROOT = `${SUC_DOCUMENTOS_ROOT}CtasCtes/`;
    SUC_DOCUMENTOS_PAGOS_ROOT = `${SUC_DOCUMENTOS_ROOT}Pagos/`;
    SUC_FONDOS_ROOT = `${SUCURSAL_ROOT}Fondos/`;
    SUC_FONDOS_CHEQUES_ROOT = `${SUC_FONDOS_ROOT}Cheques/`;
    SUC_FONDOS_CHEQUES_CARTERA = `${SUC_FONDOS_CHEQUES_ROOT}Cartera/`;
  }
}
