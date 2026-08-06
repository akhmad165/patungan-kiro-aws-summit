import { describe, it, expect } from 'vitest';
import { formatRupiah, formatDate, generateId } from './format';

describe('formatRupiah', () => {
  it('formats 0 as "Rp 0"', () => {
    const result = formatRupiah(0);
    expect(result).toBe('Rp 0');
  });

  it('formats 150000 with titik sebagai pemisah ribuan', () => {
    const result = formatRupiah(150000);
    expect(result).toBe('Rp 150.000');
  });

  it('formats angka jutaan correctly', () => {
    const result = formatRupiah(1500000);
    expect(result).toBe('Rp 1.500.000');
  });

  it('formats small numbers without separator', () => {
    const result = formatRupiah(500);
    expect(result).toBe('Rp 500');
  });

  it('formats negative numbers', () => {
    const result = formatRupiah(-25000);
    expect(result).toBe('-Rp 25.000');
  });
});

describe('formatDate', () => {
  it('formats date to Indonesian format', () => {
    const date = new Date(2024, 0, 1); // 1 Januari 2024
    const result = formatDate(date);
    expect(result).toBe('1 Januari 2024');
  });

  it('formats another date correctly', () => {
    const date = new Date(2024, 11, 25); // 25 Desember 2024
    const result = formatDate(date);
    expect(result).toBe('25 Desember 2024');
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique ids', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});
