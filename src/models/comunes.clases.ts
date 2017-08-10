import {Usuario, UserDoc} from './user.class';
export const FECHA: string = 'YYYY-MM-DD';
export const FECHA_FULL: string = 'YYYY-MM-DD hh:mm:ss';
export class Contadores { Clientes: number; }

export class Log {
  id: number;
  Fecha: string;
  Data: any;
  Usuario: Usuario;
}

export class ClaseControlada {
  Creador: UserDoc;
  Modificador: UserDoc;
}