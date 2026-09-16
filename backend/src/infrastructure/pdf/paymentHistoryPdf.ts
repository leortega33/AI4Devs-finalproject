import PDFDocument from 'pdfkit';
import { Client } from '../../domain/models/Client';
import { Payment, PaymentMethod, PaymentStatus } from '../../domain/models/Payment';

export type PdfLang = 'es' | 'en';

export interface PaymentHistoryData {
  client: Client;
  payments: Payment[];
  status: PaymentStatus;
}

interface Labels {
  title: string;
  client: string;
  status: string;
  date: string;
  period: string;
  method: string;
  amount: string;
  empty: string;
  statuses: Record<PaymentStatus, string>;
  methods: Record<PaymentMethod, string>;
  months: string[];
}

const LABELS: Record<PdfLang, Labels> = {
  es: {
    title: 'Historial de pagos',
    client: 'Cliente',
    status: 'Estado',
    date: 'Fecha',
    period: 'Período',
    method: 'Método',
    amount: 'Monto',
    empty: 'El cliente no tiene pagos registrados.',
    statuses: { up_to_date: 'Al día', overdue: 'Vencido', no_payments: 'Sin pagos' },
    methods: { cash: 'Efectivo', bank_transfer: 'Transferencia', card: 'Tarjeta' },
    months: [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ],
  },
  en: {
    title: 'Payment history',
    client: 'Client',
    status: 'Status',
    date: 'Date',
    period: 'Period',
    method: 'Method',
    amount: 'Amount',
    empty: 'This client has no registered payments.',
    statuses: { up_to_date: 'Up to date', overdue: 'Overdue', no_payments: 'No payments' },
    methods: { cash: 'Cash', bank_transfer: 'Bank transfer', card: 'Card' },
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  },
};

function resolveLabels(lang: PdfLang): Labels {
  return LABELS[lang] ?? LABELS.es;
}

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function formatAmount(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

/**
 * Builds a payment-history PDF document (US-008). Returns the PDFKit document
 * WITHOUT calling `.end()`, so the caller controls piping and lifecycle.
 */
export function buildPaymentHistoryPdf(data: PaymentHistoryData, lang: PdfLang = 'es'): PDFKit.PDFDocument {
  const labels = resolveLabels(lang);
  const locale = lang === 'en' ? 'en-US' : 'es-ES';
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  const clientName = `${data.client.firstName} ${data.client.lastName}`;

  doc.fontSize(20).font('Helvetica-Bold').text(labels.title);
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica');
  doc.text(`${labels.client}: ${clientName}`);
  doc.text(`${labels.status}: ${labels.statuses[data.status]}`);
  doc.moveDown(1);

  if (data.payments.length === 0) {
    doc.font('Helvetica-Oblique').text(labels.empty);
    return doc;
  }

  const columns = [
    { label: labels.date, x: 50, width: 100 },
    { label: labels.period, x: 150, width: 150 },
    { label: labels.method, x: 300, width: 130 },
    { label: labels.amount, x: 430, width: 115 },
  ];

  doc.font('Helvetica-Bold').fontSize(11);
  const headerY = doc.y;
  columns.forEach((col) => doc.text(col.label, col.x, headerY, { width: col.width }));
  doc.moveDown(0.5);
  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();
  doc.moveDown(0.5);

  doc.font('Helvetica').fontSize(11);
  data.payments.forEach((payment) => {
    const rowY = doc.y;
    const period = `${labels.months[payment.periodMonth - 1]} ${payment.periodYear}`;
    doc.text(formatDate(payment.paymentDate, locale), columns[0].x, rowY, { width: columns[0].width });
    doc.text(period, columns[1].x, rowY, { width: columns[1].width });
    doc.text(labels.methods[payment.method], columns[2].x, rowY, { width: columns[2].width });
    doc.text(formatAmount(payment.amount, locale), columns[3].x, rowY, { width: columns[3].width });
    doc.moveDown(0.5);
  });

  return doc;
}
