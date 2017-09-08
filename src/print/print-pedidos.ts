import {PedidosProvider} from './../providers/pedidos/pedidos';
import {setInfo, showPdf, formatTable} from './config-comun';
import {Cliente} from './../models/clientes.clases';
import {Pedido} from './../models/pedidos.clases';
import {DecimalPipe, DatePipe} from '@angular/common';
import * as moment from 'moment';

export function numFormat(val: number, format: string): string {
  let decimalPipe = new DecimalPipe('es');
  return decimalPipe.transform(val, format);
}
export function dateFormat(val, format: string): string {
  let datePipe = new DatePipe('es');
  return datePipe.transform(val, format);
}

export function printPresupuesto(cliente: Cliente, pedido: Pedido,
                                 title: string, pedidosP: PedidosProvider,
                                 dolar: number) {
  let doc: any = {};
  // Table lines config
  formatTable();
  setInfo(doc, title);
  doc.header = {
    columns: [
      [
        {
          text: `PRESUPUESTO Nro: ${numFormat(pedido.id,'3.0-0')}`,
          margin: [50, 20],
          alignment: 'left',
          fontSize: 12,
          bold: true
        }
      ],
      [
        {
          text: `Fecha:${dateFormat(pedido.fecha,'dd/MM/yyyy')}`,
          margin: [50, 20],
          alignment: 'right'
        }
      ]
    ]
  };
  doc.content = [];
  doc.content.push({text: `Cliente: ${cliente.nombre}`, bold: true});
  doc.content.push(
      {text: `Telefono: ${cliente.Telefonos[0].numero}`, bold: true});
  doc.content.push(
      {text: `Comenterios: ${cliente.comentarios || ''}\n\n`, bold: false});
  // Pedido Items
  let tData: any = [
    [
      'Cantidad',
      'Codigo',
      'Color',
      'Largo',
      'Unidades',
      'Precio(U$)',
      'SubTotal'
    ]
  ];
  pedido.Items.forEach((i) => {
    tData.push([
      {text: `${i.cantidad}`, alignment: 'center'},
      {text: `${i.Perfil.codigo}`, alignment: 'center'},
      {text: `${i.Color.nombre}`, alignment: 'center'},
      {text: `${i.Perfil.largo}`, alignment: 'center'},
      {text: `${numFormat(i.unidades,'1.2-2')}kg`, alignment: 'right'},
      {text: `U$ ${numFormat(i.precioUs,'1.2-2')}`, alignment: 'right'},
      {
        text: `U$ ${numFormat(pedidosP.calSubTotalU$(i,cliente), '1.2-2')}`,
        alignment: 'right'
      }
    ]);
  });
  doc.content.push({
    table: {
      widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', '*'],
      headerRows: 1,
      body: tData
    }
  });
  doc.content.push('\n\n');
  // Totales
  doc.content.push({
    table: {
      body: [
        [
          {text: 'Kilos: ', bold: true},
          {
            text: `${numFormat(pedido.totalUnidades, '1.2-2')}kg`,
            alignment: 'right'
          },
          {text: 'Total Final(U$): ', bold: true},
          {
            text: `U$ ${numFormat(pedido.totalFinalUs, '1.2-2')}`,
            alignment: 'right'
          }
        ],
        [
          {text: 'SubTotal: ', bold: true},
          {
            text: `U$ ${numFormat(pedido.totalUs, '1.2-2')}`,
            alignment: 'right'
          },
          {text: `R.Dolar(${moment().format('DD/MM/YYYY')}):`, bold: true},
          {text: `$ ${numFormat(dolar, '1.3-3')}`, alignment: 'right'}
        ],
        [
          {text: 'CV: ', bold: true},
          {text: `${pedido.CV.tipo}`, alignment: 'right'},
          {text: 'Total Final($): ', bold: true},
          {
            text: `$ ${numFormat((pedido.totalFinalUs * dolar), '1.2-2')}`,
            alignment: 'right'
          }
        ]
      ]
    },
    layout: 'noBorders',
  });
  doc.content.push({
    text:
        '\nEl presente esta expresado en Dolares (Banco Nacion Cotizacion Billetes Venta).\nLos valores en Pesos son a modo orientativo y seran recalculados al momento de la entrega.\nValidez del presente 7 dias. ',
    fontSize: 8,
    italics: true
  });
  showPdf(doc);
}