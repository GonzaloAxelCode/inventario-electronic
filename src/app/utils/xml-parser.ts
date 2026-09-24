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

function normalizarEncoding(enc: string): string {
  const e = enc.toLowerCase().replace(/_/g, '-');
  if (e === 'iso8859-1' || e === 'latin1' || e === 'latin-1') return 'windows-1252';
  return e;
}

function decodificaEstricto(bytes: Uint8Array, enc: string): string | null {
  try {
    return new TextDecoder(enc, { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Lee el XML respetando su encoding real. Los CPE de SUNAT suelen venir en
 * iso-8859-1 pero file.text() asume UTF-8 y rompe tildes/Ñ o el parseo.
 * Se prueba en cascada (declarado → utf-8 → windows-1252) con decodificación
 * estricta, así también funciona si la declaración miente.
 */
export async function leerTextoXml(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const head = String.fromCharCode.apply(null, Array.from(bytes.slice(0, 300)) as number[]);
  const m = head.match(/<\?xml[^>]*encoding\s*=\s*["']([^"']+)["']/i);
  const declarado = m?.[1] ? normalizarEncoding(m[1]) : 'utf-8';

  let text: string | null = null;
  if (bytes.includes(0) && declarado.indexOf('utf-16') === 0) {
    // UTF-16 con nulos: respetar lo declarado
    try {
      text = new TextDecoder(declarado).decode(buffer);
    } catch {
      text = null;
    }
  } else {
    // Si los bytes son UTF-8 válido, es UTF-8 (aunque la declaración diga otro).
    // Si no, se respeta lo declarado y al final windows-1252 (nunca falla).
    text = decodificaEstricto(bytes, 'utf-8')
      ?? decodificaEstricto(bytes, declarado)
      ?? new TextDecoder('windows-1252').decode(buffer);
  }
  if (text === null) text = new TextDecoder('windows-1252').decode(buffer);
  // BOM fuera y declaración normalizada para DOMParser (parsea desde string)
  text = text.replace(/^\uFEFF/, '');
  text = text.replace(/<\?xml([^>]*?)encoding\s*=\s*["'][^"']*["']([^>]*?)\?>/i, '<?xml$1$2?>');
  return text;
}

/** Búsqueda por namespace con fallback sin namespace (algunos PSE usan otros prefijos). */
function childElements(parent: Element | Document, ns: string, localName: string): ArrayLike<Element> {
  const byNs = (parent as Element).getElementsByTagNameNS(ns, localName);
  if (byNs.length > 0) return byNs;
  return parent.getElementsByTagName(localName);
}

function getText(parent: Element, localName: string, ns: string = NS.cbc): string {
  const els = childElements(parent, ns, localName);
  return els.length > 0 ? els[0].textContent?.trim() || '' : '';
}

function getNumber(parent: Element, localName: string, ns: string = NS.cbc): number {
  const text = getText(parent, localName, ns);
  return parseFloat(text) || 0;
}

function parsearItems(invoice: Element): XmlItemParseado[] {
  const items: XmlItemParseado[] = [];
  const invoiceLines = childElements(invoice, NS.cac, 'InvoiceLine');

  for (let i = 0; i < invoiceLines.length; i++) {
    const line = invoiceLines[i];

    const cantidad = getNumber(line, 'InvoicedQuantity');
    const descripcion = getText(line, 'Description');

    let precioUnitario = 0;

    const pricingRef = childElements(line, NS.cac, 'AlternativeConditionPrice');
    if (pricingRef.length > 0) {
      const priceTypeCode = getText(pricingRef[0], 'PriceTypeCode');
      const priceAmount = getNumber(pricingRef[0], 'PriceAmount');

      if (priceTypeCode === '01') {
        precioUnitario = parseFloat((priceAmount / 1.18).toFixed(2));
      } else {
        precioUnitario = priceAmount;
      }
    } else {
      const priceElements = childElements(line, NS.cac, 'Price');
      if (priceElements.length > 0) {
        precioUnitario = getNumber(priceElements[0], 'PriceAmount');
      }
    }

    let descuento = 0;
    const allowanceCharges = childElements(line, NS.cac, 'AllowanceCharge');
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
  const text = await leerTextoXml(file);
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
  const paymentTerms = childElements(invoice, NS.cac, 'PaymentTerms');
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

  const supplierParty = childElements(invoice, NS.cac, 'AccountingSupplierParty');
  if (supplierParty.length > 0) {
    const party = childElements(supplierParty[0], NS.cac, 'Party');
    if (party.length > 0) {
      const ids = childElements(party[0], NS.cbc, 'ID');
      if (ids.length > 0) {
        numeroDocumentoProveedor = ids[0].textContent?.trim() || '';
        tipoDocumentoProveedor = ids[0].getAttribute('schemeID') || '6';
      }

      const legalEntities = childElements(party[0], NS.cac, 'PartyLegalEntity');
      if (legalEntities.length > 0) {
        nombreProveedor = getText(legalEntities[0], 'RegistrationName');
      }
    }
  }

  let gravadas = 0;
  let igv = 0;
  let total = 0;

  const taxTotals = childElements(invoice, NS.cac, 'TaxTotal');
  for (let i = 0; i < taxTotals.length; i++) {
    const taxScheme = childElements(taxTotals[i], NS.cac, 'TaxScheme');
    if (taxScheme.length > 0) {
      const taxId = getText(taxScheme[0], 'ID');
      if (taxId === '1000') {
        igv = getNumber(taxTotals[i], 'TaxAmount');
        const taxSubtotals = childElements(taxTotals[i], NS.cac, 'TaxSubtotal');
        if (taxSubtotals.length > 0) {
          gravadas = getNumber(taxSubtotals[0], 'TaxableAmount');
        }
      }
    }
  }

  const monetaryTotal = childElements(invoice, NS.cac, 'LegalMonetaryTotal');
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
