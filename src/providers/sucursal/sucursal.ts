import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ROOT} from '../../models/db-base-paths';
import {UsuarioProvider} from '../usuario/usuario';

export let SUCURSAL: string = '';
export let SUCURSAL_ROOT: string = '';
export let SUC_CLIENTES_ROOT: string = '';
export let SUC_COLORES_ROOT: string = '';
export let SUC_DOCUMENTOS_ROOT: string = '';
export let SUC_DOCUMENTOS_PEDIDOS: string = '';
export let SUC_CONTADORES_ROOT: string = '';
export let SUC_STOCK_ROOT: string = '';
export let SUC_ADICIONALES_ROOT: string = '';
export let SUC_LOG_ROOT: string = '';
export let SUC_DOCUMENTOS_STOCKINGRESOS_ROOT: string = '';

@Injectable()
export class SucursalProvider {
  constructor(private usuarioP: UsuarioProvider) {}

  public setSucursal(): Observable<string> {
    return new Observable((obs) => {
      this.usuarioP.getCurrentUser().subscribe(
          (usuario) => {
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
    SUC_LOG_ROOT = `${SUCURSAL_ROOT}Log/`;
    SUC_DOCUMENTOS_STOCKINGRESOS_ROOT = `${SUC_DOCUMENTOS_ROOT}StockIngresos/`;
  }
}
