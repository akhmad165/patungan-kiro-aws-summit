import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { OrderItem, PersonCalculation, BillSummary, BankInfo, PersonBreakdownEntry } from '../types/index';
import { formatRupiah, formatDate } from './format';

/**
 * Generate PDF rincian tagihan patungan dan trigger download otomatis.
 * File akan tersimpan sebagai 'tagihan-patungan.pdf'.
 */
export function generatePDF(
  orders: OrderItem[],
  calculations: PersonCalculation[],
  summary: BillSummary,
  bankInfo: BankInfo,
  personBreakdown?: PersonBreakdownEntry[]
): void {
  try {
    const doc = new jsPDF();

    // Judul
    doc.setFontSize(16);
    doc.text('Rincian Tagihan Patungan', 14, 20);

    // Tanggal hari ini
    doc.setFontSize(10);
    doc.text(`Tanggal: ${formatDate(new Date())}`, 14, 28);

    // Tabel data pesanan
    const tableData = orders.map((order, index) => [
      order.personName,
      order.orderName || '-',
      formatRupiah(order.price),
      formatRupiah(calculations[index]?.totalPayment ?? 0),
    ]);

    autoTable(doc, {
      head: [['Nama', 'Pesanan', 'Harga Awal', 'Total Bayar']],
      body: tableData,
      startY: 35,
    });

    // Posisi setelah tabel
    let currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // Rincian Per Orang section
    if (personBreakdown && personBreakdown.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Rincian Per Orang', 14, currentY);
      doc.setFont('helvetica', 'normal');

      const breakdownData = personBreakdown.map((entry) => [
        entry.personName,
        formatRupiah(entry.totalPayment),
      ]);

      autoTable(doc, {
        head: [['Nama', 'Total Bayar']],
        body: breakdownData,
        startY: currentY + 4,
      });

      currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    // Grand Total
    doc.setFontSize(12);
    doc.text(`Grand Total: ${formatRupiah(summary.grandTotal)}`, 14, currentY);

    // Info transfer rekening
    doc.setFontSize(10);
    doc.text(
      `Silakan transfer ke rekening ${bankInfo.bank} ${bankInfo.accountNumber} a.n ${bankInfo.accountName}`,
      14,
      currentY + 8
    );

    // Download otomatis
    doc.save('tagihan-patungan.pdf');
  } catch {
    alert('Gagal membuat PDF. Silakan coba lagi.');
  }
}
