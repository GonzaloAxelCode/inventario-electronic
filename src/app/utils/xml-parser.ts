export interface XmlItemParseado {
  producto: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
}

export interface DatosXmlCompra {
  tipo_comprobante: string;
  serie: string;
  correlativo: string;
  fecha_emision: string;
  moneda: string;
  forma_pago: string;
  nombre_proveedor: string;
  numero_documento_proveedor: string;
  tipo_documento_proveedor: string;
  gravadas: number;
  igv: number;
  total: number;
  items: XmlItemParseado[];
}

const NS = {
  cbc: 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
  cac: 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
};

function getText(parent: Element, localName: string, ns: string = NS.cbc): string {
  const byTag = parent.getElementsByTagNameNS(ns, localName);
  return byTag.length > 0 ? byTag[0].textContent?.trim() || '' : '';
}

function getNumber(parent: Element, localName: string, ns: string = NS.cbc): number {
  const text = getText(parent, localName, ns);
  return parseFloat(text) || 0;
}

function parsearItems(invoice: Element): XmlItemParseado[] {
  const items: XmlItemParseado[] = [];
  const invoiceLines = invoice.getElementsByTagNameNS(NS.cac, 'InvoiceLine');

  for (let i = 0; i < invoiceLines.length; i++) {
    const line = invoiceLines[i];

    const cantidad = getNumber(line, 'InvoicedQuantity');
    const descripcion = getText(line, 'Description');

    let precioUnitario = 0;

    const pricingRef = line.getElementsByTagNameNS(NS.cac, 'AlternativeConditionPrice');
    if (pricingRef.length > 0) {
      const priceTypeCode = getText(pricingRef[0], 'PriceTypeCode');
      const priceAmount = getNumber(pricingRef[0], 'PriceAmount');

      if (priceTypeCode === '01') {
        precioUnitario = parseFloat((priceAmount / 1.18).toFixed(2));
      } else {
        precioUnitario = priceAmount;
      }
    } else {
      const priceElements = line.getElementsByTagNameNS(NS.cac, 'Price');
      if (priceElements.length > 0) {
        precioUnitario = getNumber(priceElements[0], 'PriceAmount');
      }
    }

    let descuento = 0;
    const allowanceCharges = line.getElementsByTagNameNS(NS.cac, 'AllowanceCharge');
    if (allowanceCharges.length > 0) {
      const chargeIndicator = getText(allowanceCharges[0], 'ChargeIndicator');
      if (chargeIndicator === 'false') {
        descuento = getNumber(allowanceCharges[0], 'Amount');
      }
    }

    items.push({
      producto: descripcion || `Producto ${i + 1}`,
      cantidad: cantidad || 1,
      precio_unitario: precioUnitario || 0.01,
      descuento: descuento || 0,
    });
  }

  return items;
}

export async function parseXmlCompra(file: File): Promise<DatosXmlCompra> {
  const text = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('El archivo XML no es valido o tiene formato incorrecto');
  }

  const invoice = doc.documentElement;
  const rootTag = invoice.localName || invoice.tagName;

  if (rootTag !== 'Invoice' && rootTag !== 'CreditNote' && rootTag !== 'DebitNote') {
    throw new Error(`Tipo de documento no soportado: ${rootTag}. Se esperaba Invoice, CreditNote o DebitNote.`);
  }

  const id = getText(invoice, 'ID');
  const partes = id.split('-');
  const serie = partes[0] || '';
  const correlativo = partes[1] || '';

  const tipoComprobanteCode = getText(invoice, 'InvoiceTypeCode');
  let tipoComprobante = tipoComprobanteCode;
  if (rootTag === 'CreditNote') tipoComprobante = '07';
  if (rootTag === 'DebitNote') tipoComprobante = '08';

  const fechaEmision = getText(invoice, 'IssueDate');
  const moneda = getText(invoice, 'DocumentCurrencyCode');

  let formaPago = '';
  const paymentTerms = invoice.getElementsByTagNameNS(NS.cac, 'PaymentTerms');
  if (paymentTerms.length > 0) {
    const medioPago = getText(paymentTerms[0], 'PaymentMeansID');
    if (medioPago.toLowerCase().includes('contado')) {
      formaPago = 'CONTADO';
    } else if (medioPago.toLowerCase().includes('credito')) {
      formaPago = 'CREDITO';
    }
  }

  let nombreProveedor = '';
  let numeroDocumentoProveedor = '';
  let tipoDocumentoProveedor = '6';

  const supplierParty = invoice.getElementsByTagNameNS(NS.cac, 'AccountingSupplierParty');
  if (supplierParty.length > 0) {
    const party = supplierParty[0].getElementsByTagNameNS(NS.cac, 'Party');
    if (party.length > 0) {
      const ids = party[0].getElementsByTagNameNS(NS.cbc, 'ID');
      if (ids.length > 0) {
        numeroDocumentoProveedor = ids[0].textContent?.trim() || '';
        tipoDocumentoProveedor = ids[0].getAttribute('schemeID') || '6';
      }

      const legalEntities = party[0].getElementsByTagNameNS(NS.cac, 'PartyLegalEntity');
      if (legalEntities.length > 0) {
        nombreProveedor = getText(legalEntities[0], 'RegistrationName');
      }
    }
  }

  let gravadas = 0;
  let igv = 0;
  let total = 0;

  const taxTotals = invoice.getElementsByTagNameNS(NS.cac, 'TaxTotal');
  for (let i = 0; i < taxTotals.length; i++) {
    const taxScheme = taxTotals[i].getElementsByTagNameNS(NS.cac, 'TaxScheme');
    if (taxScheme.length > 0) {
      const taxId = getText(taxScheme[0], 'ID');
      if (taxId === '1000') {
        igv = getNumber(taxTotals[i], 'TaxAmount');
        const taxSubtotals = taxTotals[i].getElementsByTagNameNS(NS.cac, 'TaxSubtotal');
        if (taxSubtotals.length > 0) {
          gravadas = getNumber(taxSubtotals[0], 'TaxableAmount');
        }
      }
    }
  }

  const monetaryTotal = invoice.getElementsByTagNameNS(NS.cac, 'LegalMonetaryTotal');
  if (monetaryTotal.length > 0) {
    total = getNumber(monetaryTotal[0], 'PayableAmount');
    if (total === 0) {
      total = getNumber(monetaryTotal[0], 'TaxInclusiveAmount');
    }
  }

  if (total === 0 && gravadas > 0) {
    total = parseFloat((gravadas + igv).toFixed(2));
  }

  const items = parsearItems(invoice);

  return {
    tipo_comprobante: tipoComprobante,
    serie,
    correlativo,
    fecha_emision: fechaEmision,
    moneda: moneda || 'PEN',
    forma_pago: formaPago,
    nombre_proveedor: nombreProveedor,
    numero_documento_proveedor: numeroDocumentoProveedor,
    tipo_documento_proveedor: tipoDocumentoProveedor,
    gravadas: parseFloat(gravadas.toFixed(2)),
    igv: parseFloat(igv.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    items,
  };
}
