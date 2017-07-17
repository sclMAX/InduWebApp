export class Documento{
    id:number = 1;
    idCliente:number = 1;
    Fecha: string = new Date().toISOString() ;
    FechaEntrega: string = new Date().toISOString();
    Comentario: string = "Documento de PRueba";
    Items: DocumentoItem[] = [];
}

export class DocumentoItem{
    Cantidad:number;

}