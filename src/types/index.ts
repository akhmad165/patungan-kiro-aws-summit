export interface GlobalSettings {
  taxPercent: number; // default: 10
  servicePercent: number; // default: 5
  discountAmount: number; // default: 0 (dalam Rupiah)
}

export interface OrderItem {
  id: string; // unique identifier (nanoid)
  personName: string; // nama orang
  orderName: string; // nama pesanan (opsional)
  price: number; // harga makanan dalam Rupiah
}

export interface PersonCalculation {
  orderId: string;
  proportion: number; // rasio: price / subtotal
  taxShare: number; // beban pajak dalam Rupiah
  serviceShare: number; // beban service dalam Rupiah
  discountShare: number; // potongan diskon dalam Rupiah
  totalPayment: number; // total yang harus dibayar
}

export interface BillSummary {
  subtotal: number; // sum of all order prices
  totalTax: number; // subtotal * taxPercent / 100
  totalService: number; // subtotal * servicePercent / 100
  totalDiscount: number; // discountAmount (flat)
  grandTotal: number; // subtotal + totalTax + totalService - totalDiscount
}

export interface BankInfo {
  bank: string;
  accountNumber: string;
  accountName: string;
}

/**
 * Represents the aggregated total payment for a single person across all their orders.
 * Used by the Person Breakdown feature to display per-person totals in the UI and PDF export.
 * Empty person names are normalized to "(Tanpa Nama)".
 */
export interface PersonBreakdownEntry {
  personName: string;   // Displayed name. Empty names normalized to "(Tanpa Nama)"
  totalPayment: number; // Aggregated sum of totalPayment for all orders by this person
}
