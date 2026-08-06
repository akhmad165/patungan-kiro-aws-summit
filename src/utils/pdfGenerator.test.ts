import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { OrderItem, PersonCalculation, BillSummary, BankInfo, PersonBreakdownEntry } from '../types/index';

// Track calls for assertions
const textCalls: Array<{ text: string; x: number; y: number }> = [];
const setFontSizeCalls: number[] = [];
const setFontCalls: Array<{ font: string; style: string }> = [];
const autoTableCalls: Array<{ head: string[][]; body: string[][]; startY: number }> = [];

const mockDoc = {
  text: vi.fn((text: string, x: number, y: number) => {
    textCalls.push({ text, x, y });
  }),
  setFontSize: vi.fn((size: number) => {
    setFontSizeCalls.push(size);
  }),
  setFont: vi.fn((font: string, style: string) => {
    setFontCalls.push({ font, style });
  }),
  save: vi.fn(),
  lastAutoTable: { finalY: 80 },
};

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => mockDoc),
}));

vi.mock('jspdf-autotable', () => ({
  default: vi.fn((doc: unknown, options: { head: string[][]; body: string[][]; startY: number }) => {
    autoTableCalls.push({
      head: options.head,
      body: options.body,
      startY: options.startY,
    });
    // Simulate finalY advancing after each table
    (doc as typeof mockDoc).lastAutoTable = { finalY: options.startY + 40 };
  }),
}));

function createTestData() {
  const orders: OrderItem[] = [
    { id: '1', personName: 'Andi', orderName: 'Nasi Goreng', price: 25000 },
    { id: '2', personName: 'Budi', orderName: 'Mie Ayam', price: 20000 },
  ];

  const calculations: PersonCalculation[] = [
    { orderId: '1', proportion: 0.556, taxShare: 2500, serviceShare: 1250, discountShare: 0, totalPayment: 28750 },
    { orderId: '2', proportion: 0.444, taxShare: 2000, serviceShare: 1000, discountShare: 0, totalPayment: 23000 },
  ];

  const summary: BillSummary = {
    subtotal: 45000,
    totalTax: 4500,
    totalService: 2250,
    totalDiscount: 0,
    grandTotal: 51750,
  };

  const bankInfo: BankInfo = {
    bank: 'BCA',
    accountNumber: '1234567890',
    accountName: 'Test User',
  };

  return { orders, calculations, summary, bankInfo };
}

function resetMocks() {
  textCalls.length = 0;
  setFontSizeCalls.length = 0;
  setFontCalls.length = 0;
  autoTableCalls.length = 0;
  mockDoc.lastAutoTable = { finalY: 80 };
  vi.clearAllMocks();
}

describe('generatePDF - Person Breakdown section', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('includes "Rincian Per Orang" section when personBreakdown is non-empty', async () => {
    const { generatePDF } = await import('./pdfGenerator');
    const { orders, calculations, summary, bankInfo } = createTestData();

    const personBreakdown: PersonBreakdownEntry[] = [
      { personName: 'Andi', totalPayment: 28750 },
      { personName: 'Budi', totalPayment: 23000 },
    ];

    generatePDF(orders, calculations, summary, bankInfo, personBreakdown);

    // Verify heading "Rincian Per Orang" was rendered
    const headingCall = textCalls.find((c) => c.text === 'Rincian Per Orang');
    expect(headingCall).toBeDefined();

    // Verify font was set to bold for the heading
    const boldCall = setFontCalls.find((c) => c.style === 'bold');
    expect(boldCall).toBeDefined();

    // Verify autoTable was called with the person breakdown data
    const breakdownTable = autoTableCalls.find(
      (c) => c.head[0][0] === 'Nama' && c.head[0][1] === 'Total Bayar'
    );
    expect(breakdownTable).toBeDefined();
    expect(breakdownTable!.body).toHaveLength(2);
    expect(breakdownTable!.body[0][0]).toBe('Andi');
    expect(breakdownTable!.body[1][0]).toBe('Budi');
  });

  it('skips "Rincian Per Orang" section when personBreakdown is empty', async () => {
    const { generatePDF } = await import('./pdfGenerator');
    const { orders, calculations, summary, bankInfo } = createTestData();

    const personBreakdown: PersonBreakdownEntry[] = [];

    generatePDF(orders, calculations, summary, bankInfo, personBreakdown);

    // Verify heading "Rincian Per Orang" was NOT rendered
    const headingCall = textCalls.find((c) => c.text === 'Rincian Per Orang');
    expect(headingCall).toBeUndefined();

    // Verify no breakdown table was created (only the orders table)
    const breakdownTable = autoTableCalls.find(
      (c) => c.head[0][0] === 'Nama' && c.head[0][1] === 'Total Bayar'
    );
    expect(breakdownTable).toBeUndefined();
  });

  it('skips "Rincian Per Orang" section when personBreakdown is undefined', async () => {
    const { generatePDF } = await import('./pdfGenerator');
    const { orders, calculations, summary, bankInfo } = createTestData();

    generatePDF(orders, calculations, summary, bankInfo, undefined);

    const headingCall = textCalls.find((c) => c.text === 'Rincian Per Orang');
    expect(headingCall).toBeUndefined();
  });

  it('shows "(Tanpa Nama)" for empty-name entries', async () => {
    const { generatePDF } = await import('./pdfGenerator');
    const { orders, calculations, summary, bankInfo } = createTestData();

    const personBreakdown: PersonBreakdownEntry[] = [
      { personName: 'Andi', totalPayment: 28750 },
      { personName: '(Tanpa Nama)', totalPayment: 23000 },
    ];

    generatePDF(orders, calculations, summary, bankInfo, personBreakdown);

    // Verify the breakdown table includes "(Tanpa Nama)"
    const breakdownTable = autoTableCalls.find(
      (c) => c.head[0][0] === 'Nama' && c.head[0][1] === 'Total Bayar'
    );
    expect(breakdownTable).toBeDefined();
    const tanpaNamaRow = breakdownTable!.body.find((row) => row[0] === '(Tanpa Nama)');
    expect(tanpaNamaRow).toBeDefined();
  });

  it('places person breakdown section after order table and before Grand Total', async () => {
    const { generatePDF } = await import('./pdfGenerator');
    const { orders, calculations, summary, bankInfo } = createTestData();

    const personBreakdown: PersonBreakdownEntry[] = [
      { personName: 'Andi', totalPayment: 28750 },
    ];

    generatePDF(orders, calculations, summary, bankInfo, personBreakdown);

    // The first autoTable call is the orders table
    expect(autoTableCalls[0].head[0]).toEqual(['Nama', 'Pesanan', 'Harga Awal', 'Total Bayar']);

    // The second autoTable call is the person breakdown table
    expect(autoTableCalls[1].head[0]).toEqual(['Nama', 'Total Bayar']);

    // Person breakdown startY should be after the orders table finalY
    // The orders table sets finalY = 80, so breakdown heading is at 90, table at 94
    expect(autoTableCalls[1].startY).toBeGreaterThan(autoTableCalls[0].startY);

    // Grand Total text comes after the breakdown section
    const grandTotalCall = textCalls.find((c) => c.text.includes('Grand Total'));
    expect(grandTotalCall).toBeDefined();

    // The "Rincian Per Orang" heading Y should be less than Grand Total Y
    const headingCall = textCalls.find((c) => c.text === 'Rincian Per Orang');
    expect(headingCall).toBeDefined();
    expect(headingCall!.y).toBeLessThan(grandTotalCall!.y);
  });
});
