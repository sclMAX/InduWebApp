import {CtasCtesProvider} from './../providers/ctas-ctes/ctas-ctes';
import {Cliente} from './../models/clientes.clases';
import {ClientesProvider} from './../providers/clientes/clientes';
import {Reparto} from './../models/repartos.clases';
import {
  numFormat,
  dateFormat,
  formatTable,
  setInfo,
  showPdf
} from "./config-comun";



export function printReparto(reparto: Reparto, clientesP: ClientesProvider,
                             ctacteP: CtasCtesProvider) {
  let doc: any = {};
  let ClientesData: Array<{Cliente: Cliente, saldo: number}> = [];
  let getData = async() => {
    for (let i = 0; i < reparto.Items.length; i++) {
      let id = reparto.Items[i].idCliente;
      if (ClientesData.findIndex((c) => { return c.Cliente.id == id; }) == -1) {
        clientesP.getOne(id).subscribe((cliente) => {
          ctacteP.getSaldoCliente(cliente.id)
              .subscribe((saldo) => {
                ClientesData.push({Cliente: cliente, saldo: saldo});
              });
        });
      }
    }
  };
  getData();
  // Table lines config
  formatTable();
  setInfo(doc, `Reparto Nro: ${numFormat(reparto.id, '3.0-0')}`);
  doc.header = {
    columns: [
      [
        {
          text: `Reparto Nro: ${numFormat(reparto.id, '3.0-0')}`,
          margin: [50, 20],
          alignment: 'left',
          fontSize: 12,
          bold: true
        }
      ],
      [
        {
          text: `Fecha:${dateFormat(reparto.fecha, 'dd/MM/yyyy')}`,
          margin: [50, 20],
          alignment: 'right'
        }
      ]
    ]
  };
  doc.content = [];
  doc.content.push(
      {text: [{text: 'Etiqueta: ', bold: true}, {text: `${reparto.nombre}`}]});
  doc.content.push(
      {text: [{text: 'Chofer: ', bold: true}, {text: `${reparto.chofer}`}]});
  if (reparto.comentarios) {
    doc.content.push({
      text: [
        {text: 'Comentarios:', bold: true},
        {text: `${reparto.comentarios}`}
      ]
    });
  }
  doc.content.push('\n');
  //Clientes y pedidos
  reparto.Items.forEach((i) => {
    let cd = ClientesData.find((c) => { return c.Cliente.id == i.idCliente; });
    doc.content.push({
      table: {
        widths: [200, 'auto', 'auto', 'auto', '*', 100, 100],
        body: [
          [
            {text: `${numFormat(i.idCliente, '3.0-0')}-${cd.Cliente.nombre}`},
            {text: `${cd.Cliente.Direccion.localidad}`},
            {text: `${numFormat(i.totalKilos, '1.2-2')}kg`, alignment: 'right'},
            {
              text: `U$ ${numFormat(i.saldoActual, '1.2-2')}`,
              alignment: 'right'
            },
            {
              text:
                  `$ ${numFormat((Number(i.totalPedidos) * Number( reparto.Dolar.valor)),'1.2-2')}`,
              alignment: 'right'
            },
            {text: '$\n\n'},
            {text: 'Ch.\n\n'}
          ]
        ]
      }
    });
    i.Pedidos.forEach((p) => {
      doc.content.push({
        table: {
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
          body: [
            [
              {text: `${numFormat(p.id, '3.0-0')}`, alignment: 'right'},
              {text: `${dateFormat(p.fecha,'dd/MM/yyyy')}`},
              {text: `${p.cantidadPaquetes} Paq.`},
              {
                text: `${numFormat(p.totalUnidades,'1.2-2')}kg`,
                alignment: 'right'
              },
              {
                text: `U$ ${numFormat(p.totalFinalUs, '1.2-2')}`,
                alignment: 'right'
              },
              {
                text:
                    `$ ${numFormat((p.totalFinalUs * reparto.Dolar.valor), '1.2-2')}`,
                alignment: 'right'
              },
              {}
            ]
          ]
        }
      });
    });
  });
  doc.content.push('\n');
  //Totales
  doc.content.push({
    table: {
      body: [
        [
          {text: 'Clientes:', alignment: 'right', bold: true},
          {text: `${reparto.Items.length}`, alignment: 'right'},
          {},
          {text: 'Total Saldos(U$):', alignment: 'right', bold: true},
          {
            text: `U$ ${numFormat(reparto.saldoTotal, '1.2-2')}`,
            alignment: 'right'
          },
          {},
          {text: 'Total Ingreso($):', bold: true, alignment: 'right'}
        ],
        [
          {text: 'Kilos:', alignment: 'right', bold: true},
          {
            text: `${numFormat(reparto.totalKilos, '1.2-2')}kg`,
            alignment: 'right'
          },
          {},
          {text: 'Ref.Dolar:', alignment: 'right', bold: true},
          {
            text: `$ ${numFormat((reparto.Dolar.valor), '1.2-2')}`,
            alignment: 'right'
          },
          {},
          {text: 'Total Ingreso(U$):', bold: true, alignment: 'right'}
        ],
        [
          {text: 'Pedidos(U$):', alignment: 'right', bold: true},
          {
            text: `U$ ${numFormat(reparto.totalDolares, '1.2-2')}`,
            alignment: 'right'
          },
          {},
          {text: 'Total Saldos($):', alignment: 'right', bold: true},
          {
            text:
                `$ ${numFormat((reparto.saldoTotal * reparto.Dolar.valor), '1.2-2')}`,
            alignment: 'right'
          },
          {},
          {text: 'Total Ingreso(Cheques):', bold: true, alignment: 'right'}
        ]
      ]
    },
    layout: 'noBorders'
  });
  //Crear y mostrar pdf
  showPdf(doc, true);
}