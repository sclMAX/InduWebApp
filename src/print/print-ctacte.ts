import {Cliente} from './../models/clientes.clases';
import {NotaDebito} from './../models/documentos.class';
import {
  numFormat,
  dateFormat,
  formatTable,
  setInfo,
  showPdf
} from "./config-comun";


export async function printNotaDebito(nd: NotaDebito,
                                      cliente: Promise<Cliente>) {
  let doc: any = {};
  // Table lines config
  let c = await cliente;
  formatTable();
  setInfo(doc, `Nota de Debito Nro: ${numFormat(nd.id, '3.0-0')}`);
  doc.header = {
    columns: [
      [
        {
          text: `Nota de Debito Nro: ${numFormat(nd.id, '3.0-0')}`,
          margin: [50, 20],
          alignment: 'left',
          fontSize: 12,
          bold: true
        }
      ],
      [
        {
          text: `Fecha:${dateFormat(nd.fecha, 'dd/MM/yyyy')}`,
          margin: [50, 20],
          alignment: 'right'
        }
      ]
    ]
  };
  doc.content = [];
  doc.content.push(
      {text: [{text: 'Cliente: ', bold: true}, {text: `${c.nombre}`}]},
      {text: [{text: 'Motivo: ', bold: true}, {text: `${nd.motivo}`}]}, );
  doc.content.push('\n');
  if (nd.comentario) {
    doc.content.push({
      text: [{text: 'Comentarios:', bold: true}, {text: `${nd.comentario}`}]
    });
  }
  doc.content.push('\n');
  let items: Array<any> = [['Detalle', 'Monto(U$)']];
  for (let item of nd.Items) {
    items.push([
      {text: `${item.detalle}`, alingment: 'left'},
      {text: `U$ ${numFormat(item.monto , '1.2-2')}`, alignment: 'right'}
    ]);
  }
  doc.content.push(
      {table: {headerRows: 1, widths: ['*', 'auto'], body: items}});
  doc.content.push('\n');

  // Totales
  doc.content.push({
    table: {
      widths: ['*','auto', 'auto'],
      body: [
        // Fila1
        [
          // Col1 Total label
          {},
          {text: 'Total: ', bold: true},
          // Col2 Total data
          {text: `U$ ${numFormat(nd.totalFinalUs,'1.2-2')}`, alignment: 'right',bold:true}
        ]
      ]
    },
    layout: 'noBorders'
  });
  // Crear y mostrar pdf
  showPdf(doc, false);
}