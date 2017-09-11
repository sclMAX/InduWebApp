import * as pdf from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

export function toInch(val: number): number {
  return val * 0.393700787;
  }


export function formatTable() {
  // Table lines config
  pdf.tableLayouts = {
    exampleLayout: {
      hLineWidth: function(i, node) {
        if (i === 0 || i === node.table.body.length) {
          return 0;
          }
        return (i === node.table.headerRows) ? 2 : 1;
      },
      vLineWidth: function(i) {
        return 0;
      },
      hLineColor: function(i) {
        return i === 1 ? 'black' : '#aaa';
      },
      paddingLeft: function(i) {
        return i === 0 ? 0 : 8;
      },
      paddingRight: function(i, node) {
        return (i === node.table.widths.length - 1) ? 0 : 8;
      }
    }
  };
  }

export function setInfo(doc, title: string, detalle?: string) {
  doc.info = {
    title: `${title}`,
    subject: `${detalle || ''
                           }`,
    trapped: true
  };
  }

export function showPdf(doc, horizontal: boolean = false) {
  doc.pageSize = 'A4';
  doc.pageOrientation = (horizontal) ? 'landscape' : 'portrait';
  doc.footer = (currentPage, pageCount) => {
    return {
      columns: [{
        text: `${currentPage} de ${pageCount}`,

        alignment: 'right'
      }],
          margin: [20, 20]
    }
  };
  // Set Fonts
  pdf.vfs = pdfFonts.pdfMake.vfs;
  // Show Doc
  pdf.createPdf(doc).open();
}