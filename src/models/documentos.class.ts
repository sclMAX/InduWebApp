import {Color, Perfil} from './productos.clases';

export class Documento {
  id: number;
  Numero: number;
  idCliente: number;
  Fecha: string;
  Comentario: string;
  constructor() {
    this.Fecha = new Date().toISOString();
  }
  }

