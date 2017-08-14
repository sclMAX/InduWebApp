import {FECHA, ClaseControlada} from './comunes.clases';
import {Perfil, Color} from './productos.clases';
import * as moment from 'moment';

export class Documento extends ClaseControlada {
  id: number;
  idCliente: number;
  tipo:string;
  numero: number;
  fecha: string = moment().format(FECHA);
  comentario: string;
  isInCtaCte:boolean = false;
  totalFinalUs: number = 0.00;
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
