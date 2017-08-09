import {FECHA, ClaseControlada} from './db-base-paths';
import {Perfil, Color} from './productos.clases';
import {UserDoc} from './user.class';
import * as moment from 'moment';

export class Documento extends ClaseControlada {
  id: number;
  Numero: number;
  Fecha: string = moment().format(FECHA);
  Comentario: string;
}

export class DocStockIngreso extends Documento {
  Remito: string;
  Items: DocStockItem[] = [];
}

export class DocStockItem extends ClaseControlada {
  Cantidad: number = 0;
  Perfil: Perfil;
  Color: Color;
  isStockActualizado: boolean = false;
}