import { SUCURSAL } from './../providers/sucursal/sucursal';
import {CajaMovimiento} from './../models/fondos.clases';
import * as pdf from 'pdfmake/build/pdfmake';
import pdfFonts from "pdfmake/build/vfs_fonts";
import * as moment from 'moment';
import {FECHA} from '../models/comunes.clases';

export function printCajaMovimientos(
    movimientos: CajaMovimiento[],
    ingresos: {efectivo: number, dolares: number, cheques: number},
    egresos: {efectivo: number, dolares: number, cheques: number}) {
  if (movimientos && movimientos.length > 0) {
    // Table lines config
    pdf.tableLayouts = {
      exampleLayout: {
        hLineWidth: function(i, node) {
          if (i === 0 || i === node.table.body.length) {
            return 0;
          }
          return (i === node.table.headerRows) ? 2 : 1;
        },
        vLineWidth: function(i) { return 0; },
        hLineColor: function(i) { return i === 1 ? 'black' : '#aaa'; },
        paddingLeft: function(i) { return i === 0 ? 0 : 8; },
        paddingRight: function(i, node) {
          return (i === node.table.widths.length - 1) ? 0 : 8;
        }
      }
    };
    let data: any[] = [];
    // Titulos
    data.push([
      {text: 'Fecha', bold: true},
      {text: 'Tipo', bold: true},
      {text: 'Comprobante', bold: true},
      {text: 'Efectivo', bold: true},
      {text: 'Saldo Efectivo', bold: true},
      {text: 'Dolares', bold: true},
      {text: 'Saldo Dolares', bold: true},
      {text: 'Cheques', bold: true},
      {text: 'Saldo Cheques', bold: true}
    ]);
    // Datos
    movimientos.forEach((m) => {
      data.push([
        {text: `${moment(m.fecha, FECHA).format('DD/MM/YYYY')}`, bold: true},
        {text: `${(m.isIngreso)?'IN':'EG'}`, bold: false},
        {text: `${m.id}`, bold: false},
        {text: `$ ${m.efectivo.toFixed(2)}`, bold: false},
        {text: `$ ${m.saldoEfectivo.toFixed(2)}`, bold: true},
        {text: `U$ ${m.dolares.toFixed(2)}`, bold: false},
        {text: `U$ ${m.saldoDolares.toFixed(2)}`, bold: true},
        {text: `$ ${m.cheques.toFixed(2)}`, bold: false},
        {text: `$ ${m.saldoCheques.toFixed(2)}`, bold: true}

      ]);
    });
    // Ultimo movimientos para mostrar saldos
    let ultimoMov = movimientos[movimientos.length - 1];
    // Doc Definition
    let docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',  // by default we use portrait
      header: {
        columns: [
          {text: `Suc. ${SUCURSAL} - Movimientos de Caja`, margin: [50,20], alignment: 'left',fontSize: 12, bold: true},
          {
            text: `${moment().format('DD/MM/YYYY hh:mm a')}`,
            margin: [50,20],
            alignment: 'center'
          }
        ]
      },
      footer: (currentPage, pageCount) => {
        return {
          columns:[
            {text: `${currentPage} de ${pageCount} \t \n`, alignment: 'center'}
          ]
        }
      },
     // pageMargins:50,  // [left, top, right, bottom] or [horizontal, vertical] or Nro
      content: [
        {
          layout: 'lightHorizontalLines',  // optional
          table: {
            // headers are automatically repeated if the table spans over
            // multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: [
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              'auto'
            ],
            body: data
          },
        },
        {
          columns: [
            [
              // to treat a paragraph as a bulleted list, set an array of items
              // under
              // the ul key
              {text: '\nIngresos:', fontSize: 15, bold: true},
              {
                ul: [
                  `Efectivo: $ ${ingresos.efectivo.toFixed(2)}`,
                  `Dolares : U$ ${ingresos.dolares.toFixed(2)}`,
                  `Cheques : $ ${ingresos.cheques.toFixed(2)}`,
                ]
              }
            ],
            [
              {text: '\nEgresos:', fontSize: 15, bold: true},
              {
                ul: [
                  `Efectivo: $ ${egresos.efectivo.toFixed(2)}`,
                  `Dolares : U$ ${egresos.dolares.toFixed(2)}`,
                  `Cheques : $ ${egresos.cheques.toFixed(2)}`,
                ]
              }
            ],
            [
              {text: '\nSaldos:', fontSize: 15, bold: true},
              {
                ul: [
                  `Efectivo: $ ${ultimoMov.saldoEfectivo.toFixed(2)}`,
                  `Dolares : U$ ${ultimoMov.saldoDolares.toFixed(2)}`,
                  `Cheques : $ ${ultimoMov.saldoCheques.toFixed(2)}`,
                ]
              }
            ]
          ]
        }
      ]
    };
    pdf.vfs = pdfFonts.pdfMake.vfs;
    pdf.createPdf(docDefinition).open();
  }
}