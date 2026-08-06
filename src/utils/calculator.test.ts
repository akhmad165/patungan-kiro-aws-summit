import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { aggregateByPerson } from './calculator';
import type { OrderItem, PersonCalculation } from '../types';

// --- Helpers for property-based tests ---

/** Generate a random list of orders with matching calculations */
function ordersAndCalculationsArb() {
  return fc
    .array(
      fc.record({
        id: fc.uuid(),
        personName: fc.oneof(
          fc.constantFrom('Andi', 'Budi', 'Citra', 'andi', ''),
          fc.string({ minLength: 0, maxLength: 10 })
        ),
        orderName: fc.string({ minLength: 1, maxLength: 15 }),
        price: fc.integer({ min: 1000, max: 500000 }),
      }),
      { minLength: 0, maxLength: 20 }
    )
    .map((rawOrders) => {
      const orders: OrderItem[] = rawOrders.map((o) => ({
        id: o.id,
        personName: o.personName,
        orderName: o.orderName,
        price: o.price,
      }));

      const calculations: PersonCalculation[] = orders.map((order) => ({
        orderId: order.id,
        proportion: 1 / Math.max(orders.length, 1),
        taxShare: order.price * 0.1,
        serviceShare: order.price * 0.05,
        discountShare: 0,
        totalPayment: order.price + order.price * 0.1 + order.price * 0.05,
      }));

      return { orders, calculations };
    });
}

// --- Property-Based Tests ---

describe('Feature: person-breakdown, Property 1: Aggregation sum correctness', () => {
  it('sum of all output totalPayment equals sum of all input calculations totalPayment', () => {
    /**
     * Validates: Requirements 1.1, 1.2, 1.3
     */
    fc.assert(
      fc.property(ordersAndCalculationsArb(), ({ orders, calculations }) => {
        const result = aggregateByPerson(orders, calculations);

        // Total sum correctness
        const expectedTotalSum = calculations.reduce((s, c) => s + c.totalPayment, 0);
        const actualTotalSum = result.reduce((s, e) => s + e.totalPayment, 0);

        expect(actualTotalSum).toBeCloseTo(expectedTotalSum, 5);
      }),
      { numRuns: 100 }
    );
  });

  it('each person total equals sum of their individual calculations', () => {
    /**
     * Validates: Requirements 1.1, 1.2, 1.3
     */
    fc.assert(
      fc.property(ordersAndCalculationsArb(), ({ orders, calculations }) => {
        const result = aggregateByPerson(orders, calculations);

        // Build expected per-person sums
        const calcMap = new Map<string, PersonCalculation>();
        for (const calc of calculations) {
          calcMap.set(calc.orderId, calc);
        }

        const expectedByPerson = new Map<string, number>();
        for (const order of orders) {
          const calc = calcMap.get(order.id);
          if (!calc) continue;
          const name = order.personName === '' ? '(Tanpa Nama)' : order.personName;
          expectedByPerson.set(name, (expectedByPerson.get(name) ?? 0) + calc.totalPayment);
        }

        for (const entry of result) {
          const expected = expectedByPerson.get(entry.personName) ?? 0;
          expect(entry.totalPayment).toBeCloseTo(expected, 5);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: person-breakdown, Property 2: First-occurrence ordering', () => {
  it('output person order matches first appearance in input orders', () => {
    /**
     * Validates: Requirements 1.5, 2.5, 3.5
     */
    fc.assert(
      fc.property(ordersAndCalculationsArb(), ({ orders, calculations }) => {
        const result = aggregateByPerson(orders, calculations);

        // Determine expected first-occurrence order
        const seen = new Set<string>();
        const expectedOrder: string[] = [];
        for (const order of orders) {
          const name = order.personName === '' ? '(Tanpa Nama)' : order.personName;
          if (!seen.has(name)) {
            seen.add(name);
            expectedOrder.push(name);
          }
        }

        const actualOrder = result.map((e) => e.personName);
        expect(actualOrder).toEqual(expectedOrder);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: person-breakdown, Property 3: Output entry count equals unique person count', () => {
  it('number of output entries equals number of unique personName values', () => {
    /**
     * Validates: Requirements 1.2, 1.3
     */
    fc.assert(
      fc.property(ordersAndCalculationsArb(), ({ orders, calculations }) => {
        const result = aggregateByPerson(orders, calculations);

        // Count unique person names (empty strings mapped to one group)
        const uniqueNames = new Set<string>();
        for (const order of orders) {
          const name = order.personName === '' ? '(Tanpa Nama)' : order.personName;
          uniqueNames.add(name);
        }

        expect(result.length).toBe(uniqueNames.size);
      }),
      { numRuns: 100 }
    );
  });
});

// --- Unit Tests ---

describe('aggregateByPerson - unit tests', () => {
  it('returns empty array when orders is empty', () => {
    const result = aggregateByPerson([], []);
    expect(result).toEqual([]);
  });

  it('returns one entry with same totalPayment for single order', () => {
    const orders: OrderItem[] = [
      { id: 'order-1', personName: 'Andi', orderName: 'Nasi Goreng', price: 25000 },
    ];
    const calculations: PersonCalculation[] = [
      {
        orderId: 'order-1',
        proportion: 1,
        taxShare: 2500,
        serviceShare: 1250,
        discountShare: 0,
        totalPayment: 28750,
      },
    ];

    const result = aggregateByPerson(orders, calculations);

    expect(result).toEqual([{ personName: 'Andi', totalPayment: 28750 }]);
  });

  it('returns one entry with summed total for multiple orders same person', () => {
    const orders: OrderItem[] = [
      { id: 'order-1', personName: 'Budi', orderName: 'Nasi Goreng', price: 20000 },
      { id: 'order-2', personName: 'Budi', orderName: 'Es Teh', price: 5000 },
    ];
    const calculations: PersonCalculation[] = [
      {
        orderId: 'order-1',
        proportion: 0.8,
        taxShare: 2000,
        serviceShare: 1000,
        discountShare: 0,
        totalPayment: 23000,
      },
      {
        orderId: 'order-2',
        proportion: 0.2,
        taxShare: 500,
        serviceShare: 250,
        discountShare: 0,
        totalPayment: 5750,
      },
    ];

    const result = aggregateByPerson(orders, calculations);

    expect(result).toHaveLength(1);
    expect(result[0].personName).toBe('Budi');
    expect(result[0].totalPayment).toBe(28750);
  });

  it('produces "(Tanpa Nama)" label for empty personName', () => {
    const orders: OrderItem[] = [
      { id: 'order-1', personName: '', orderName: 'Mie Ayam', price: 15000 },
    ];
    const calculations: PersonCalculation[] = [
      {
        orderId: 'order-1',
        proportion: 1,
        taxShare: 1500,
        serviceShare: 750,
        discountShare: 0,
        totalPayment: 17250,
      },
    ];

    const result = aggregateByPerson(orders, calculations);

    expect(result).toHaveLength(1);
    expect(result[0].personName).toBe('(Tanpa Nama)');
    expect(result[0].totalPayment).toBe(17250);
  });

  it('treats "Andi" and "andi" as separate entries (case-sensitive)', () => {
    const orders: OrderItem[] = [
      { id: 'order-1', personName: 'Andi', orderName: 'Nasi Goreng', price: 20000 },
      { id: 'order-2', personName: 'andi', orderName: 'Es Jeruk', price: 10000 },
    ];
    const calculations: PersonCalculation[] = [
      {
        orderId: 'order-1',
        proportion: 0.67,
        taxShare: 2000,
        serviceShare: 1000,
        discountShare: 0,
        totalPayment: 23000,
      },
      {
        orderId: 'order-2',
        proportion: 0.33,
        taxShare: 1000,
        serviceShare: 500,
        discountShare: 0,
        totalPayment: 11500,
      },
    ];

    const result = aggregateByPerson(orders, calculations);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ personName: 'Andi', totalPayment: 23000 });
    expect(result[1]).toEqual({ personName: 'andi', totalPayment: 11500 });
  });
});
