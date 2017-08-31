import {AngularFireDatabase} from 'angularfire2/database';
import {ContadoresProvider} from './../contadores/contadores';
import {EMBALADO, ENREPARTO} from './../../models/pedidos.clases';
import {PedidosProvider} from './../pedidos/pedidos';
import {SucursalProvider, SUC_DOCUMENTOS_ROOT} from './../sucursal/sucursal';
import {Observable} from 'rxjs/Observable';
import {Reparto} from './../../models/repartos.clases';
import {Injectable} from '@angular/core';
export const REPARTO_PREPARADO: string = 'Preparado';
export const REPARTO_PROCESO: string = 'EnProceso';
export const REPARTO_CERRADO: string = 'Cerrado';

@Injectable()
export class RepartosProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider,
              private pedidosP: PedidosProvider,
              private contadoresP: ContadoresProvider) {}

  private getPath(tipo: string): string {
    return `${SUC_DOCUMENTOS_ROOT}Reparto/${tipo}/`;
  }

  add(reparto: Reparto): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      // Preparar para guardar
      reparto.Creador = this.sucP.genUserDoc();
      let nro: number = reparto.id;
      // Mover pedidos EMBALADOS >>> ENREPARTO
      reparto.Items.forEach((i) => {
        i.Pedidos.forEach((p) => {
          // Quitar de EMBALADOS
          this.pedidosP.genUpdateData(updData, p, EMBALADO, {});
          // Agregar a EN_REPARTO
          this.pedidosP.genUpdateData(updData, p, ENREPARTO);
        });
      });
      // Add Reparto
      this.genUpdateData(updData, nro, REPARTO_PREPARADO, reparto);
      // Update Contador
      this.contadoresP.genRepartoUpdateData(updData, nro);
      // Ejecutar Peticion
      this.db.database.ref()
          .update(updData)
          .then(() => {
            obs.next('Reparto Guardado Correctamente!');
            obs.complete();
          })
          .catch((error) => {
            obs.error(`No se pudo guardar el Reparto! Error:${error}`);
            obs.complete();
          });
    });
  }

  update(oldReparto: Reparto, newReparto: Reparto): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      // Set Editor
      newReparto.Modificador = this.sucP.genUserDoc();
      // Set a oldPedidos de ENREPARTO >>> EMBALADOS por si se quito alguno
      oldReparto.Items.forEach((i) => {
        i.Pedidos.forEach((p) => {
          // Quitar de ENREPARTO
          this.pedidosP.genUpdateData(updData, p, ENREPARTO, {});
          // Agregar a EMBALADOS
          this.pedidosP.genUpdateData(updData, p, EMBALADO);
        });
      });
      // Mover pedidos EMBALADOS >>> ENREPARTO
      newReparto.Items.forEach((i) => {
        i.Pedidos.forEach((p) => {
          // Quitar de EMBALADOS
          this.pedidosP.genUpdateData(updData, p, EMBALADO, {});
          // Agregar a EN_REPARTO
          this.pedidosP.genUpdateData(updData, p, ENREPARTO);
        });
      });
      // Actualizar Reparto
      this.genUpdateData(updData, newReparto.id, REPARTO_PREPARADO, newReparto);
      // Ejecutar Peticion
      this.db.database.ref()
          .update(updData)
          .then(() => {
            obs.next('Reparto Actualizado Correctamente!');
            obs.complete();
          })
          .catch((error) => {
            obs.error(`No se pudo Actualizar! Error:${error}`);
            obs.complete();
          });
    });
  }

  remove(reparto: Reparto): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      // Mover Pedidos de ENREPARTO >>> EMBALADOS
      reparto.Items.forEach((i) => {
        i.Pedidos.forEach((p) => {
          // Quitar de ENREPARTO
          this.pedidosP.genUpdateData(updData, p, ENREPARTO, {});
          // Agregar a EMBALADO
          this.pedidosP.genUpdateData(updData, p, EMBALADO);
        });
      });
      // Eliminar reparto
      this.genUpdateData(updData, reparto.id, REPARTO_PREPARADO, {});
      // Ejecutar Peticion
      this.db.database.ref()
          .update(updData)
          .then(() => {
            obs.next('Reparto Eliminado!');
            obs.complete();
          })
          .catch((error) => {
            obs.error(`No se pudo Eliminar el Reparto! Error:${error}`);
            obs.complete();
          });
    });
  }

  getPreparados(): Observable<Reparto[]> {
    return new Observable((obs) => {
      this.db.list(this.getPath(REPARTO_PREPARADO))
          .subscribe((snap: Reparto[]) => { obs.next(snap || []); },
                     (error) => { obs.error(error); });
    });
  }

  genUpdateData(updData, id: number, tipo: string, valor) {
    updData[`${this.getPath(tipo)}${id}/`] = valor;
  }
}
