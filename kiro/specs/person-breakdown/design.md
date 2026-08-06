# Design Document: Person Breakdown (Rincian Total Per Orang)

## Overview

Fitur Person Breakdown menambahkan kemampuan untuk mengagregasi dan menampilkan total pembayaran per orang pada aplikasi kalkulator patungan. Saat ini, setiap baris pesanan menampilkan kalkulasi individual (proporsi pajak, service, diskon). Fitur baru ini mengelompokkan semua pesanan milik orang yang sama dan menampilkan satu total gabungan per orang.

Fitur terdiri dari tiga bagian:
1. **Utility function** (`aggregateByPerson`) — pure function yang menerima orders + calculations, mengembalikan array `PersonBreakdownEntry[]` yang sudah teragregasi dan terurut.
2. **React component** (`PersonBreakdown`) — menampilkan hasil agregasi sebagai card UI di bawah SummaryCard.
3. **PDF generator update** — menambahkan section "Rincian Per Orang" di PDF setelah tabel pesanan dan sebelum Grand Total.

### Design Decisions

- **Single aggregation function, shared between UI and PDF**: Alih-alih mengimplementasikan logik agregasi dua kali (sekali di component, sekali di PDF), kita membuat satu pure utility function yang dipakai keduanya. Ini menghindari inkonsistensi.
- **Pure function tanpa side-effects**: `aggregateByPerson` adalah pure function yang mudah di-test dan di-memoize.
- **useMemo di App.tsx**: Agregasi dihitung via `useMemo` agar tidak re-compute setiap render jika orders/calculations tidak berubah.
- **Case-sensitive grouping**: Sesuai requirement, "Andi" dan "andi" dianggap orang berbeda (exact string match).

## Architecture

```mermaid
flowchart TD
    A[App.tsx] --> B[calculateBillSplit]
    B --> C[orders + calculations]
    C --> D[aggregateByPerson]
    D --> E[PersonBreakdownEntry[]]
    E --> F[PersonBreakdown Component]
    E --> G[generatePDF - Section Rincian Per Orang]
    A --> F
    A --> G
```

**Data Flow:**
1. User menambah/mengubah pesanan → `orders` state di-update
2. `useMemo` memanggil `calculateBillSplit(orders, settings)` → menghasilkan `calculations`
3. `useMemo` memanggil `aggregateByPerson(orders, calculations)` → menghasilkan `personBreakdown`
4. `PersonBreakdown` component menerima `personBreakdown` sebagai prop dan me-render UI
5. Saat export PDF, `generatePDF` menerima `personBreakdown` sebagai parameter tambahan

## Components and Interfaces

### 1. Utility Function: `aggregateByPerson`

**File:** `src/utils/calculator.ts` (ditambahkan di file yang sama dengan `calculateBillSplit`)

```typescript
export interface PersonBreakdownEntry {
  personName: string; // nama yang ditampilkan (empty → "(Tanpa Nama)")
  totalPayment: number; // sum of all totalPayment for this person
}

export function aggregateByPerson(
  orders: OrderItem[],
  calculations: PersonCalculation[]
): PersonBreakdownEntry[] {
  // 1. Iterate orders in order
  // 2. For each order, find matching calculation by orderId
  // 3. Group by personName (exact match, case-sensitive)
  // 4. Empty personName → normalize to "(Tanpa Nama)"
  // 5. Maintain insertion order (first occurrence)
  // 6. Return array of { personName, totalPayment }
}
```

**Rationale:** Ditempatkan di `calculator.ts` karena fungsi ini berkaitan erat dengan kalkulasi bill dan bergantung pada tipe yang sama.

### 2. React Component: `PersonBreakdown`

**File:** `src/components/PersonBreakdown.tsx`

```typescript
interface PersonBreakdownProps {
  entries: PersonBreakdownEntry[];
}

function PersonBreakdown({ entries }: PersonBreakdownProps) {
  // Render nothing if entries is empty
  // Otherwise render card with list of name + formatted total
}
```

**UI Structure:**
```
┌──────────────────────────────────────┐
│  Rincian Per Orang                   │
│                                      │
│  Andi                    Rp 55.000   │
│  Budi                    Rp 33.000   │
│  (Tanpa Nama)            Rp 22.000   │
└──────────────────────────────────────┘
```

**Styling:** Card identik dengan `SummaryCard` — `bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6`.

### 3. App.tsx Modifications

```typescript
// New import
import PersonBreakdown from './components/PersonBreakdown'
import { aggregateByPerson } from './utils/calculator'

// Inside App():
const personBreakdown = useMemo(
  () => aggregateByPerson(orders, calculations),
  [orders, calculations]
)

// In JSX, after SummaryCard:
<PersonBreakdown entries={personBreakdown} />
```

### 4. PDF Generator Update

**File:** `src/utils/pdfGenerator.ts`

Signature berubah menjadi:
```typescript
export function generatePDF(
  orders: OrderItem[],
  calculations: PersonCalculation[],
  summary: BillSummary,
  bankInfo: BankInfo,
  personBreakdown: PersonBreakdownEntry[]  // parameter baru
): void
```

Setelah tabel pesanan dan sebelum Grand Total, tambahkan:
- Heading "Rincian Per Orang" (font size 12, bold)
- Tabel autoTable dengan kolom: Nama | Total Bayar
- Skip section jika `personBreakdown` kosong

## Data Models

### New Interface: `PersonBreakdownEntry`

```typescript
export interface PersonBreakdownEntry {
  personName: string;   // Displayed name. Empty names normalized to "(Tanpa Nama)"
  totalPayment: number; // Aggregated sum of totalPayment for all orders by this person
}
```

**Ditempatkan di:** `src/types/index.ts`

### Existing Interfaces (unchanged)

- `OrderItem` — source of `personName` for grouping
- `PersonCalculation` — source of `totalPayment` for summing
- `BillSummary` — tidak berubah
- `BankInfo` — tidak berubah

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Aggregation sum correctness

*For any* list of orders and corresponding calculations, the sum of `totalPayment` across all entries returned by `aggregateByPerson` SHALL equal the sum of all individual `totalPayment` values in the input calculations array. Additionally, for each unique personName in the output, its `totalPayment` SHALL equal the sum of `totalPayment` from all calculations whose corresponding order has that same personName (with empty strings mapped to "(Tanpa Nama)").

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: First-occurrence ordering

*For any* list of orders, the order of person names in the output of `aggregateByPerson` SHALL match the order of first appearance of each unique personName in the input orders list. That is, if personName A first appears at index i and personName B first appears at index j where i < j, then A SHALL appear before B in the result.

**Validates: Requirements 1.5, 2.5, 3.5**

### Property 3: Output entry count equals unique person count

*For any* list of orders and corresponding calculations, the number of entries returned by `aggregateByPerson` SHALL equal the number of unique personName values in the orders list (treating all empty strings as one unique group "(Tanpa Nama)").

**Validates: Requirements 1.2, 1.3**

## Error Handling

| Scenario | Handling |
|----------|----------|
| Empty orders array | `aggregateByPerson` returns `[]`; component renders nothing; PDF skips section |
| Orders without matching calculation (mismatched orderId) | Skip the order in aggregation (defensive — should not happen in normal flow) |
| Negative totalPayment values | Aggregated normally — no special handling needed since negative values are valid (e.g., heavy discount) |
| Very long person name | UI truncates via Tailwind `truncate` class; PDF auto-wraps in autoTable cell |

## Testing Strategy

### Property-Based Tests (fast-check + vitest)

Fitur ini cocok untuk property-based testing karena `aggregateByPerson` adalah pure function dengan input space yang besar (berbagai kombinasi nama, jumlah pesanan, dan nilai pembayaran). Library yang digunakan: **fast-check** (sudah ada di devDependencies).

**Configuration:**
- Minimum 100 iterations per property test
- Tag format: `Feature: person-breakdown, Property {number}: {property_text}`

**Test file:** `src/utils/calculator.test.ts`

| Property | Test |
|----------|------|
| Property 1: Aggregation sum correctness | Generate random orders + calculations, verify per-person sums and total sum |
| Property 2: First-occurrence ordering | Generate random orders with repeated names, verify output order matches first appearance |
| Property 3: Output entry count | Generate random orders, verify entry count equals unique name count |

### Unit Tests (vitest + @testing-library/react)

**`src/utils/calculator.test.ts`** (example-based):
- Empty orders → returns `[]`
- Single order → single entry with same totalPayment
- Multiple orders same person → one entry with summed total
- Empty personName → labeled "(Tanpa Nama)"
- Case-sensitivity: "Andi" vs "andi" → two separate entries

**`src/components/PersonBreakdown.test.tsx`**:
- Empty entries → renders nothing (null)
- Non-empty entries → renders heading "Rincian Per Orang"
- Each entry shows name on left, formatted Rupiah on right
- Card styling classes present (bg-white, rounded-xl, etc.)

**`src/utils/pdfGenerator.test.ts`** (with jsPDF mocking):
- PDF includes "Rincian Per Orang" section when personBreakdown is non-empty
- PDF skips section when personBreakdown is empty
- PDF shows "(Tanpa Nama)" for empty-name entries
- Section placed after order table and before Grand Total

### Integration Tests

**`src/App.test.tsx`**:
- Adding orders updates PersonBreakdown section reactively
- PersonBreakdown appears after SummaryCard in the DOM
- Changing settings re-calculates person totals
