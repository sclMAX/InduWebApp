import {Observable} from 'rxjs/Observable';
import * as moment from 'moment';
import {Cliente} from './../models/clientes.clases';
import {
  Pedido,
  calcularTotalCF,
  calcularTotalSF,
  calSubTotalCDs
} from './../models/pedidos.clases';
import {PedidosProvider} from './../providers/pedidos/pedidos';
import {
  formatTable,
  setInfo,
  showPdf,
  numFormat,
  dateFormat
} from './config-comun';


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
          text: `PRESUPUESTO Nro: ${numFormat(pedido.id, '3.0-0')}`,
          margin: [50, 20],
          alignment: 'left',
          fontSize: 12,
          bold: true
        }
      ],
      [
        {
          text: `Fecha:${dateFormat(pedido.fecha, 'dd/MM/yyyy')}`,
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
  if (pedido.comentario) {
    doc.content.push({
      text: `Comenterios: ${pedido.comentario || ''
                                                 }\n\n`,
      bold: false
    });
  }
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
      {text: `${numFormat(i.unidades, '1.2-2')}kg`, alignment: 'right'},
      {text: `U$ ${numFormat(i.precioUs, '1.2-2')}`, alignment: 'right'},
      {
        text: `U$ ${numFormat(pedidosP.calSubTotalU$(i, cliente), '1.2-2')}`,
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

function toDataURL(url): Observable<string> {
  return new Observable((obs) => {
    fetch(url)
        .then((response) => { return response.blob(); })
        .then((blob) => {
          var reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = function() {
            let base64data = reader.result;
            obs.next(<string>base64data);
            obs.complete();
          };
        });
  });
}

export async function printEmbalar(cliente: Cliente, pedido: Pedido) {
  let doc: any = {};
  // Table lines config
  formatTable();
  setInfo(doc, `Pedido Nro:${numFormat(pedido.id, '3.0-0')}`);
  doc.header = {
    columns: [
      [
        {
          text: `PEDIDO Nro: ${numFormat(pedido.id, '3.0-0')}`,
          alignment: 'left',
          fontSize: 12,
          bold: true,
        }
      ],
      [
        {
          text:
              `Fecha:${dateFormat(pedido.fecha, 'dd/MM/yyyy')}\nFecha Entrega:${dateFormat(
                pedido.fechaEntrega, 'dd/MM/yyyy')}`,
          alignment: 'right'
        }
      ]
    ],
    margin: [50, 10]
  };
  doc.content = [];
  // Lineas en blanco
  doc.content.push('\n');
  doc.content.push({
    columns: [
      {
        text: [
          {text: 'Cliente: ', bold: true},
          {text: `${cliente.nombre}`},
          {text: '\rDireccion: ', bold: true},
          {
            text: `${cliente.Direccion.calle}, ${cliente.Direccion
                      .localidad}, ${cliente.Direccion.provincia}`
          }
        ],
        width: '*'
      }
    ]
  });
  if (pedido.comentario) {
    doc.content.push({
      text: `Comenterios: ${pedido.comentario || ''
                                                 }`,
      bold: false
    });
  }
  // Pedido Items Preparar Table Data
  let tData: any =
      [['Codigo', 'Perfil', 'Largo', 'Color', 'Cantidad', 'Embalado']];
  pedido.Items.forEach(async(i) => {
    let img: string =
        await toDataURL(`assets/perfiles/80x80/${i.Perfil.codigo}.png`)
            .toPromise();
    let dd = [
      {text: `${i.Perfil.codigo}`, alignment: 'right'},
      {
        image:img, fit:[40,40]
      },
      {text: `${i.Perfil.largo}`, alignment: 'right'},
      {text: `${i.Color.nombre}`, alignment: 'center'},
      {text: `${i.cantidad}`, alignment: 'center'},
      {text: `${(i.isEmbalado)?'X':''}`,fontSize:12, bold: true, alignment: 'center'}
    ];
    tData.push(dd);
  });
  // Lineas en blanco
  doc.content.push('\n');
  // Agregar Table
  doc.content.push({
    table: {
      widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*'],
      headerRows: 1,
      body: tData
    }
  });
  // Lineas en blanco
  doc.content.push('\n');
  doc.content.push({text: 'Paquetes:', bold: true});
  await toDataURL(`assets/perfiles/80x80/901.png`).toPromise();        
  showPdf(doc);
}

export function printEntrega(cliente: Cliente, pedido: Pedido, title: string,
                             pedidosP: PedidosProvider, saldo: number) {
  let doc: any = {};
  // Table lines config
  formatTable();
  setInfo(doc, title);
  doc.header = {
    columns: [
      [
        {
          text: `PEDIDO Nro: ${numFormat(pedido.id, '3.0-0')}`,
          alignment: 'left',
          fontSize: 12,
          bold: true,
        }
      ],
      [
        {
          text:
              `Fecha:${dateFormat(pedido.fecha, 'dd/MM/yyyy')}\nFecha Entrega:${dateFormat(
                pedido.fechaEntrega, 'dd/MM/yyyy')}`,
          alignment: 'right'
        }
      ]
    ],
    margin: [50, 10]
  };
  doc.content = [];
  // Lineas en blanco
  doc.content.push('\n');
  let telefonos = [{text: 'Telefonos', bold: true}];
  cliente.Telefonos.forEach((t) => {
    telefonos.push({text: `\r${t.contacto}: ${t.numero}`, bold: false});
  });
  doc.content.push({
    columns: [
      {
        text: [
          {text: 'Cliente: ', bold: true},
          {text: `${cliente.nombre}`},
          {text: '\rDireccion: ', bold: true},
          {
            text: `${cliente.Direccion.calle}, ${cliente.Direccion
                      .localidad}, ${cliente.Direccion.provincia}`
          },
          {text: '\rDireccion Entrega: ', bold: true},
          {
            text: `${pedido.DireccionEntrega.calle}, ${pedido.DireccionEntrega
                      .localidad}, ${pedido.DireccionEntrega.provincia}`
          }
        ],
        width: '*'
      },
      {text: telefonos, width: 'auto'}
    ]
  });
  if (pedido.comentario) {
    doc.content.push({
      text: `Comenterios: ${pedido.comentario || ''
                                                 }`,
      bold: false
    });
  }
  // Pedido Items Preparar Table Data
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
      {text: `${numFormat(i.unidades, '1.2-2')}kg`, alignment: 'right'},
      {text: `U$ ${numFormat(i.precioUs, '1.2-2')}`, alignment: 'right'},
      {
        text: `U$ ${numFormat(pedidosP.calSubTotalU$(i, cliente), '1.2-2')}`,
        alignment: 'right'
      }
    ]);
  });
  // Lineas en blanco
  doc.content.push('\n');
  // Agregar Table
  doc.content.push({
    table: {
      widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', '*'],
      headerRows: 1,
      body: tData
    }
  });
  // Lineas en blanco
  doc.content.push('\n');
  // Totales
  doc.content.push({
    table: {
      widths: ['auto', 'auto', '*', 'auto', '*', 'auto'],
      body: [
        // Fila1
        [
          // Col1 Paquetes label
          {text: 'Paquetes: ', bold: true},
          // Col2 Paquetes data
          {text: `${pedido.cantidadPaquetes}`, alignment: 'right'},
          // Col3 CV label
          {text: 'CV:', bold: true, alignment: 'right'},
          // Col4 CV data
          {text: `${pedido.CV.tipo}`, alignment: 'right'},
          // Col5 Total Final(U$) label
          {text: 'Total Pedido(U$): ', bold: true, alignment: 'right'},
          // Col6 Total Final(U$) data
          {
            text: `U$ ${numFormat(pedido.totalFinalUs , '1.2-2')}`,
            alignment: 'right'
          }
        ],
        // Fila2
        [
          // Col1 Kilos label
          {text: 'Kilos: ', bold: true},
          // Col2 Kilos data
          {
            text: `${numFormat(pedido.totalUnidades, '1.2-2')}kg`,
            alignment: 'right'
          },
          // Col3
          {text: 'CF(U$):', bold: true, alignment: 'right'},
          // Col4
          {
            text: `U$ ${numFormat(calcularTotalCF(pedido), '1.2-2')}`,
            alignment: 'right'
          },
          // Col5 Ref Dolar label
          {
            text: [
              {text: 'R.Dolar', bold: true},
              {
                text: `(${dateFormat(pedido.Dolar.fecha, 'dd/MM/yyyy')})`,
                fontSize: 8,
                bold: true
              },
              {text: ':', bold: true}
            ],
            alignment: 'right',
            bold: true
          },
          // Col6 Ref Dolar data
          {
            text: `$ ${numFormat(pedido.Dolar.valor, '1.2-2')}`,
            alignment: 'right'
          }
        ],
        // Fila3
        [
          // Col1 Descuento Cantidad label
          {text: 'DC(%):', bold: true},
          // Col2 Descuento Cantidad data
          {
            text: `${numFormat(pedido.descuentoKilos, '1.2-2')}%`,
            alignment: 'right'
          },
          // Col3
          {text: 'CF($):', bold: true, alignment: 'right'},
          // Col4
          {
            text:
                `$ ${numFormat((calcularTotalCF(pedido) * pedido.Dolar.valor), '1.2-2')}`,
            alignment: 'right'
          },
          // Col5 Total Final(U$) label
          {text: 'Total Pedido($): ', bold: true, alignment: 'right'},
          // Col6 Total Final(U$) data
          {
            text:
                `$ ${numFormat((pedido.totalFinalUs * pedido.Dolar.valor), '1.2-2')}`,
            alignment: 'right'
          }

        ],
        // Fila4
        [
          // Col1 Descuento Cantidad label
          {text: 'DE(%):', bold: true},
          // Col2 Descuento Cantidad data
          {
            text: `${numFormat(pedido.descuentoGeneral, '1.2-2')}%`,
            alignment: 'right'
          },
          // Col3 SF label
          {text: 'SF(U$):', bold: true, alignment: 'right'},
          // Col4 SF data
          {
            text: `U$ ${numFormat(calcularTotalSF(pedido), '1.2-2')}`,
            alignment: 'right'
          },
          // Col5 Saldo U$ label
          {text: 'Saldo Actual(U$):', bold: true, alignment: 'right'},
          // Col6 Saldo U$ data
          {text: `U$ ${numFormat(saldo, '1.2-2')}`, alignment: 'right'}
        ],
        [
          // Col1 Subtotal CD label
          {text: 'SubTotal:', bold: true},
          // Col2 Subtotal CD data
          {
            text: `U$ ${numFormat(calSubTotalCDs(pedido), '1.2-2')}`,
            alignment: 'right'
          },
          // Col3 SF label
          {text: 'SF($):', bold: true, alignment: 'right'},
          // Col4 SF data
          {
            text:
                `$ ${numFormat((calcularTotalSF(pedido) * pedido.Dolar.valor),'1.2-2')}`,
            alignment: 'right'
          },
          // Col5 Saldo U$ label
          {text: 'Saldo Actual($):', bold: true, alignment: 'right'},
          // Col6 Saldo U$ data
          {
            text: `$ ${numFormat((saldo * pedido.Dolar.valor), '1.2-2')}`,
            alignment: 'right'
          }
        ]
      ]
    },
    layout: 'noBorders'
  });

  showPdf(doc);
}