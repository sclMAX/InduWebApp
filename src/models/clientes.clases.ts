import {UserDoc} from './user.class';
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
  id: string;
  idCliente: number;
  Fecha: string = new Date().toISOString();
  Debe: number = 0.00;
  Haber: number = 0.00;
  isEntregado:boolean = false;
}