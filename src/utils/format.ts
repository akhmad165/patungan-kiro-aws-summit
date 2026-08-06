import { nanoid } from 'nanoid';

/**
 * Format angka ke format Rupiah Indonesia "Rp X.XXX"
 * Menggunakan Intl.NumberFormat('id-ID') dengan titik sebagai pemisah ribuan, tanpa desimal.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u00A0/g, ' ');
}

/**
 * Format Date ke format tanggal Indonesia (e.g., "1 Januari 2024")
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Generate unique identifier menggunakan nanoid
 */
export function generateId(): string {
  return nanoid();
}
