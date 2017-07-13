export class Cliente {
  idCliente:number;
  Nombre: string = '';
  Direccion: Direccion;
  Telefonos: Telefono[] = [];
  Email: string = '';
  Comentarios: string = '';
}

export interface Telefono {
  Numero: number;
  Contacto: string;
}

export interface Direccion {
  Calle: string;
  Localidad: string;
  Provincia: string;
  Pais: string;
}