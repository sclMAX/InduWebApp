import {Color, Perfil} from './productos.clases';

export class Documento {
  id: number;
  Numero: number;
  idCliente: number;
  Fecha: string = new Date().toISOString();
  Comentario: string;
}

export class DocumentoItem {
  Cantidad: number;
  Perfil: Perfil;
  Color: Color;
  Unidades: number;
  PrecioUs: number;
  Descuento: number;
  isEmbalado: boolean = false;
  isStockActualizado: boolean = false;
}

