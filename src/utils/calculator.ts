import type {
  GlobalSettings,
  OrderItem,
  PersonCalculation,
  BillSummary,
  PersonBreakdownEntry,
} from '../types/index';

export function calculateBillSplit(
  orders: OrderItem[],
  settings: GlobalSettings
): { summary: BillSummary; calculations: PersonCalculation[] } {
  // Step 1: Hitung subtotal
  const subtotal = orders.reduce((sum, order) => sum + order.price, 0);

  // Step 2: Hitung total pajak dan service
  const totalTax = subtotal * (settings.taxPercent / 100);
  const totalService = subtotal * (settings.servicePercent / 100);
  const totalDiscount = settings.discountAmount;

  // Step 3: Hitung grand total
  const grandTotal = subtotal + totalTax + totalService - totalDiscount;

  // Step 4: Hitung proporsi dan beban per orang
  const calculations: PersonCalculation[] = orders.map((order) => {
    const proportion = subtotal > 0 ? order.price / subtotal : 0;
    const taxShare = proportion * totalTax;
    const serviceShare = proportion * totalService;
    const discountShare = proportion * totalDiscount;
    const totalPayment = order.price + taxShare + serviceShare - discountShare;

    return {
      orderId: order.id,
      proportion,
      taxShare,
      serviceShare,
      discountShare,
      totalPayment,
    };
  });

  const summary: BillSummary = {
    subtotal,
    totalTax,
    totalService,
    totalDiscount,
    grandTotal,
  };

  return { summary, calculations };
}

export function aggregateByPerson(
  orders: OrderItem[],
  calculations: PersonCalculation[]
): PersonBreakdownEntry[] {
  const calcMap = new Map<string, PersonCalculation>();
  for (const calc of calculations) {
    calcMap.set(calc.orderId, calc);
  }

  const aggregation = new Map<string, number>();

  for (const order of orders) {
    const calc = calcMap.get(order.id);
    if (!calc) {
      continue;
    }

    const name = order.personName === '' ? '(Tanpa Nama)' : order.personName;

    const current = aggregation.get(name) ?? 0;
    aggregation.set(name, current + calc.totalPayment);
  }

  const result: PersonBreakdownEntry[] = [];
  for (const [personName, totalPayment] of aggregation) {
    result.push({ personName, totalPayment });
  }

  return result;
}
