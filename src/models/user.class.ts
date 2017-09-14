import * as moment from 'moment';
import {FECHA_FULL} from './comunes.clases';
export class UserLogin {
  email: string;
  password: string;
}

export class Usuario {
  id: string;
  sucursal: string;
  nombre: string;
  email: string;
  localidad: string;
  provincia: string;
  isEmbalaje: boolean = false;
  maxDescuentoItem: number = 0.00;
  maxDescuentoGeneral: number = 0.00;
  isDolarEdit: boolean = false;
  isAdmin: boolean = false;
}

export class UserDoc {
  Usuario: Usuario = new Usuario();
  fecha: string = moment().format(FECHA_FULL);
}