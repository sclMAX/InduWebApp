import {Perfil, Color} from './productos.clases';
import {Usuario, UserDoc} from './user.class';

export class Documento {
  id: number;
  Numero: number;
  Creador: UserDoc = new UserDoc();
  Modificador: UserDoc = new UserDoc();
  Fecha: string;
  Comentario: string;
  constructor() { this.Fecha = new Date().toISOString(); }
}

export class DocStockIngreso extends Documento {
  Remito: string;
  Items: DocStockItem[] = [];
}

export class DocStockItem {
  Cantidad: number = 0;
  Perfil: Perfil;
  Color: Color;
  isStockActualizado: boolean = false;
  Creador: UserDoc;
  Modificador: UserDoc;
}