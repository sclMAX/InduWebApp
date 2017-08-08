import {Dolar, Cheque} from './fondos.clases';
import {FFECHA} from './db-base-paths';
import {UserDoc} from './user.class';
import * as moment from 'moment';
export class Cliente {
  id: number;
  Nombre: string = '';
  Direccion: Direccion = new Direccion();
  Telefonos: Telefono[] = [new Telefono()];
  Email: string = '';
  Comentarios: string = '';
  Descuentos: Descuento[] = [];
  Creador: UserDoc = new UserDoc();
  Modificador: UserDoc = new UserDoc();
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

export class CtaCte {
  TipoDocumento: string;
  Numero: number;
  Fecha: string = new Date().toISOString();
  Debe: number = 0.00;
  Haber: number = 0.00;
  Saldo: number = 0.00;
}

export class ClientePago {
  id: number;
  idCliente: number;
  Fecha: string = moment().format(FFECHA);
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