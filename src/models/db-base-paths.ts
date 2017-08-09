import {Usuario, UserDoc} from './user.class';
export const FECHA: string = 'DD/MM/YYYY';
export const FECHA_FULL: string = 'DD/MM/YYYY hh:mm:ss';
export const ROOT: string = 'V1/';
export const COMUN_ROOT: string = `${ROOT}Comun/`;
export const COMUN_CONTADORES_ROOT: string = `${COMUN_ROOT}Contadores/`;
export const COMUN_CV: string = `${COMUN_ROOT}CV/`;
export const USUARIOS: string = `${ROOT}Usuarios/`;
export const COMUN_CONTADORES_CLIENTES: string =
    `${COMUN_CONTADORES_ROOT}Clientes/`;
export const COMUN_DOLAR: string = `${ROOT}Comun/Dolar/`;
export const PRODUCTOS_ROOT: string = `${ROOT}Productos/`;
export const PRODUCTOS_PERFILES: string = `${PRODUCTOS_ROOT}Perfiles/`;
export const PRODUCTOS_LINEAS: string = `${PRODUCTOS_ROOT}Lineas/`;
export const BANCOS_ROOT: string = `${COMUN_ROOT}Bancos/`;
export const LOG_ROOT: string = `${ROOT}Log/`;
export const LOG_BANCOS_ROOT: string = `${LOG_ROOT}Bancos/`;
export const LOG_BANCOS_CREADOS: string = `${LOG_BANCOS_ROOT}Creados/`;
export const LOG_BANCOS_MODIFICADOS: string = `${LOG_BANCOS_ROOT}Modificados/`;

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