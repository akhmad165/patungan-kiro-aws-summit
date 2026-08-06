# Implementation Plan: Person Breakdown (Rincian Total Per Orang)

## Overview

Implementasi fitur Person Breakdown yang menampilkan ringkasan total pembayaran per orang. Fitur ini terdiri dari: interface baru `PersonBreakdownEntry`, utility function `aggregateByPerson`, React component `PersonBreakdown`, modifikasi `App.tsx` untuk integrasi, dan update PDF generator. Implementasi menggunakan TypeScript dengan React, vitest, fast-check, dan jsPDF.

## Tasks

- [x] 1. Define interface and implement aggregation function
  - [x] 1.1 Add `PersonBreakdownEntry` interface to `src/types/index.ts`
    - Add the interface with `personName: string` and `totalPayment: number`
    - Include JSDoc comment explaining the purpose
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Implement `aggregateByPerson` function in `src/utils/calculator.ts`
    - Create the pure function that accepts `orders: OrderItem[]` and `calculations: PersonCalculation[]`
    - Group orders by personName (case-sensitive, exact string match)
    - Map empty personName to "(Tanpa Nama)"
    - Sum `totalPayment` for each person from matching calculations (match by orderId)
    - Maintain first-occurrence insertion order
    - Return `PersonBreakdownEntry[]`
    - Skip orders without matching calculation defensively
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 1.3 Write property tests for `aggregateByPerson` in `src/utils/calculator.test.ts`
    - **Property 1: Aggregation sum correctness**
    - Generate random orders + calculations with fast-check, verify sum of all output `totalPayment` equals sum of all input calculations' `totalPayment`, and each person's total equals their individual calculations' sum
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [x] 1.4 Write property test for first-occurrence ordering in `src/utils/calculator.test.ts`
    - **Property 2: First-occurrence ordering**
    - Generate random orders with repeated names, verify output person order matches first appearance in input
    - **Validates: Requirements 1.5, 2.5, 3.5**

  - [x] 1.5 Write property test for output entry count in `src/utils/calculator.test.ts`
    - **Property 3: Output entry count equals unique person count**
    - Generate random orders, verify number of output entries equals number of unique personName values (empty strings count as one group)
    - **Validates: Requirements 1.2, 1.3**

  - [x] 1.6 Write unit tests for `aggregateByPerson` in `src/utils/calculator.test.ts`
    - Test empty orders returns `[]`
    - Test single order returns one entry with same totalPayment
    - Test multiple orders same person returns one entry with summed total
    - Test empty personName produces "(Tanpa Nama)" label
    - Test case-sensitivity: "Andi" vs "andi" are separate entries
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 2. Checkpoint - Verify aggregation logic
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create PersonBreakdown React component
  - [x] 3.1 Create `src/components/PersonBreakdown.tsx` component
    - Define `PersonBreakdownProps` interface with `entries: PersonBreakdownEntry[]`
    - Return `null` when entries array is empty (hide section when no data)
    - Render section with heading "Rincian Per Orang" using styling consistent with SummaryCard (`text-lg font-semibold text-sea-blue-800 mb-4`)
    - Display each entry as a flex row: person name (left) and `formatRupiah(totalPayment)` (right)
    - Apply card styling: `bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6`
    - Add Tailwind `truncate` class on person name for long names
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7_

  - [x] 3.2 Write unit tests for PersonBreakdown component in `src/components/PersonBreakdown.test.tsx`
    - Test empty entries renders nothing (null)
    - Test non-empty entries renders heading "Rincian Per Orang"
    - Test each entry shows name on left and formatted Rupiah on right
    - Test card styling classes are present (bg-white, rounded-xl, etc.)
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7_

- [x] 4. Integrate PersonBreakdown into App.tsx
  - [x] 4.1 Modify `src/App.tsx` to compute and render PersonBreakdown
    - Import `PersonBreakdown` component and `aggregateByPerson` function
    - Add `useMemo` call: `const personBreakdown = useMemo(() => aggregateByPerson(orders, calculations), [orders, calculations])`
    - Render `<PersonBreakdown entries={personBreakdown} />` after SummaryCard and before ExportActions
    - Pass `personBreakdown` to `handleExport` for PDF generation
    - _Requirements: 2.1, 2.4_

- [x] 5. Checkpoint - Verify UI integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update PDF generator
  - [x] 6.1 Modify `src/utils/pdfGenerator.ts` to include "Rincian Per Orang" section
    - Add `personBreakdown: PersonBreakdownEntry[]` parameter to `generatePDF` function signature
    - Import `PersonBreakdownEntry` type from types
    - After the order table (autoTable) and before Grand Total text, add section "Rincian Per Orang"
    - Render heading "Rincian Per Orang" with font size 12
    - Render autoTable with columns: Nama | Total Bayar
    - Map each entry to row: `[entry.personName, formatRupiah(entry.totalPayment)]`
    - Skip section entirely if `personBreakdown` array is empty
    - Show "(Tanpa Nama)" label as-is (already normalized by aggregateByPerson)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 6.2 Update `handleExport` in `src/App.tsx` to pass `personBreakdown` to `generatePDF`
    - Modify the dynamic import call to pass `personBreakdown` as the fifth argument
    - _Requirements: 3.1_

  - [x] 6.3 Write unit tests for PDF generator person breakdown section in `src/utils/pdfGenerator.test.ts`
    - Mock jsPDF and autoTable
    - Test PDF includes "Rincian Per Orang" section when personBreakdown is non-empty
    - Test PDF skips section when personBreakdown is empty
    - Test PDF shows "(Tanpa Nama)" for empty-name entries
    - Test section is placed after order table and before Grand Total
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- `aggregateByPerson` is a pure function shared between UI rendering and PDF generation to ensure consistency
- The implementation language is TypeScript throughout

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5", "1.6", "3.1"] },
    { "id": 3, "tasks": ["3.2", "4.1"] },
    { "id": 4, "tasks": ["6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3"] }
  ]
}
```
