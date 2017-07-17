export class Cliente {
  id: number;
  Nombre: string = '';
  Direccion: Direccion = new Direccion();
  Telefonos: Telefono[] = [new Telefono()];
  Email: string = '';
  Comentarios: string = '';
  }

export class Telefono {
  Numero: number;
  Contacto: string;
  }

export class Direccion {
  Calle: string;
  Localidad: string;
  Provincia: string;
  Pais: string;
}