import {FECHA, ClaseControlada} from './comunes.clases';
import {Perfil, Color} from './productos.clases';
import * as moment from 'moment';

export const NOTA_DEBITO:string ='NotaDebito';

export class Documento extends ClaseControlada {
  id: number;
  idCliente: number;
  tipo: string;
  numero: number;
  fecha: string = moment().format(FECHA);
  fechaEntrega: string = moment().format(FECHA);
  comentario: string;
  isInCtaCte: boolean = false;
  totalFinalUs: number = 0.00;
  isImpreso: boolean = false;
}

export class NotaDebito extends Documento {
  motivo: string;
  Items: NotaDebitoItem[] = [];
  constructor() {
    super();
    this.tipo = NOTA_DEBITO;
  }
}
export interface NotaDebitoItem {
  detalle: string;
  monto: number;
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
