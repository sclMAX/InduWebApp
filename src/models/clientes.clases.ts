import {Dolar, Cheque} from './fondos.clases';
import {FECHA, ClaseControlada} from './comunes.clases';
import * as moment from 'moment';

export class Cliente extends ClaseControlada {
  id: number;
  Nombre: string = '';
  Direccion: Direccion = new Direccion();
  Telefonos: Telefono[] = [new Telefono()];
  Email: string = '';
  Comentarios: string = '';
  Descuentos: Descuento[] = [];
}

export class Descuento {
  id: string;
  Descuento: number;
}

export class Telefono {
  Numero: string;
  Contacto: string;
}

export class Direccion {
  Calle: string;
  Localidad: string = 'Corrientes';
  Provincia: string = 'Corrientes';
  Pais: string = 'Argentina';
}

export class CtaCte extends ClaseControlada {
  id: string;
  TipoDocumento: string;
  Numero: number;
  Fecha: string = moment().format(FECHA);
  Debe: number = 0.00;
  Haber: number = 0.00;
  Saldo: number = 0.00;
}

export class ClientePago extends ClaseControlada {
  id: number;
  idCliente: number;
  Fecha: string = moment().format(FECHA);
  Comentarios: string;
  RefDolar: Dolar;
  Cheques: ClientePagoCheque[] = [];
  Dolares: number = 0.00;
  Efectivo: number = 0.00;
  TotalUs: number = 0.00;
}

export class ClientePagoCheque {
  Dolar: Dolar;
  Cheque: Cheque;
}