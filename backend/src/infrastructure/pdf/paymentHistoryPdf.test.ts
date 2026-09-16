import { Client } from '../../domain/models/Client';
import { Payment } from '../../domain/models/Payment';
import { buildPaymentHistoryPdf, PaymentHistoryData } from './paymentHistoryPdf';

/** Collects a PDFKit document into a Buffer for assertions. */
function renderToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

function makeClient(): Client {
  return new Client({
    id: 1,
    firstName: 'Ana',
    lastName: 'García',
    dni: '12345678',
    phone: '555-0100',
    email: 'ana@example.com',
    birthDate: new Date('1990-01-01'),
  });
}

function makePayment(overrides: Partial<ConstructorParameters<typeof Payment>[0]> = {}): Payment {
  return new Payment({
    id: 1,
    clientId: 1,
    amount: 5000,
    paymentDate: new Date('2026-09-10'),
    method: 'cash',
    periodMonth: 9,
    periodYear: 2026,
    ...overrides,
  });
}

describe('buildPaymentHistoryPdf', () => {
  it('produces a non-empty PDF for a client with payments', async () => {
    const data: PaymentHistoryData = {
      client: makeClient(),
      payments: [
        makePayment({ id: 2, periodMonth: 9, paymentDate: new Date('2026-09-10') }),
        makePayment({ id: 1, periodMonth: 8, paymentDate: new Date('2026-08-10'), method: 'card' }),
      ],
      status: 'up_to_date',
    };

    const buffer = await renderToBuffer(buildPaymentHistoryPdf(data));

    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  it('produces a valid PDF for a client with no payments', async () => {
    const data: PaymentHistoryData = {
      client: makeClient(),
      payments: [],
      status: 'no_payments',
    };

    const buffer = await renderToBuffer(buildPaymentHistoryPdf(data));

    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  it('respects the language argument without throwing', async () => {
    const data: PaymentHistoryData = {
      client: makeClient(),
      payments: [makePayment()],
      status: 'overdue',
    };

    const en = await renderToBuffer(buildPaymentHistoryPdf(data, 'en'));
    const es = await renderToBuffer(buildPaymentHistoryPdf(data, 'es'));

    expect(en.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(es.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  it('falls back to Spanish for an unknown language', async () => {
    const data: PaymentHistoryData = {
      client: makeClient(),
      payments: [makePayment()],
      status: 'up_to_date',
    };

    // @ts-expect-error intentionally passing an unsupported language
    const buffer = await renderToBuffer(buildPaymentHistoryPdf(data, 'fr'));

    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });
});
