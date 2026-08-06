import { OrderItem, PersonCalculation, BillSummary } from '../types/index';
import { formatRupiah, formatDate } from './format';

/**
 * Share rincian tagihan patungan ke WhatsApp.
 * Compose message dengan rekap nama + total bayar per orang + grand total,
 * encode dengan encodeURIComponent, dan buka URL wa.me di tab baru.
 */
export function shareToWhatsApp(
  orders: OrderItem[],
  calculations: PersonCalculation[],
  summary: BillSummary
): void {
  let message = '🧾 *Rincian Tagihan Patungan*\n';
  message += `📅 ${formatDate(new Date())}\n\n`;

  orders.forEach((order, index) => {
    message += `• ${order.personName}: ${formatRupiah(calculations[index].totalPayment)}\n`;
  });

  message += `\n💰 *Grand Total: ${formatRupiah(summary.grandTotal)}*\n`;
  message += `\nSilakan transfer ke rekening yang sudah ditentukan. Terima kasih! 🙏`;

  const encodedMessage = encodeURIComponent(message);
  const waUrl = `https://wa.me/?text=${encodedMessage}`;
  window.open(waUrl, '_blank');
}
