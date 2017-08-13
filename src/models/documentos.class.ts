import {FECHA, ClaseControlada} from './comunes.clases';
import {Perfil, Color} from './productos.clases';
import * as moment from 'moment';

export class Documento extends ClaseControlada {
  id: number;
  tipo:string;
  numero: number;
  fecha: string = moment().format(FECHA);
  comentario: string;
}

export class DocStockIngreso extends Documento {
  remito: string;
  Items: DocStockItem[] = [];
}

export class DocStockItem extends ClaseControlada {
  cantidad: number = 0;
  Perfil: Perfil;
  Color: Color;
  isStockActualizado: boolean = false;
}