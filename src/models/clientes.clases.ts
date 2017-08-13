import { LOCALIDAD, PROVINCIA } from './../providers/sucursal/sucursal';
import {Dolar, Cheque} from './fondos.clases';
import {FECHA, ClaseControlada} from './comunes.clases';
import * as moment from 'moment';

export class Cliente extends ClaseControlada {
  id: number;
  nombre: string = '';
  Direccion: Direccion = new Direccion();
  Telefonos: Telefono[] = [new Telefono()];
  email: string = '';
  comentarios: string = '';
  Descuentos: Descuento[] = [];
}

export class Descuento {
  id: string;
  descuento: number;
}

export class Telefono {
  numero: string;
  contacto: string;
}

export class Direccion {
  calle: string;
  localidad: string = LOCALIDAD;
  provincia: string = PROVINCIA;
  pais: string = 'Argentina';
}

export class CtaCte extends ClaseControlada {
  id: string;
  tipoDocumento: string;
  numero: number;
  fecha: string = moment().format(FECHA);
  debe: number = 0.00;
  haber: number = 0.00;
  saldo: number = 0.00;
}

export class ClientePago extends ClaseControlada {
  id: number;
  idCliente: number;
  fecha: string = moment().format(FECHA);
  comentarios: string;
  RefDolar: Dolar;
  Cheques: ClientePagoCheque[] = [];
  dolares: number = 0.00;
  efectivo: number = 0.00;
  totalUs: number = 0.00;
}

export class ClientePagoCheque {
  Dolar: Dolar;
  Cheque: Cheque;
}