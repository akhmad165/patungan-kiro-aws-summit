# Implementation Plan: Split Bill Calculator (Kalkulator Patungan Makan)

## Overview

Implementasi aplikasi web single-page React + Tailwind CSS untuk kalkulator patungan makan. Aplikasi menghitung pembagian tagihan restoran secara proporsional berdasarkan harga pesanan masing-masing orang, dengan memperhitungkan pajak, service charge, dan diskon. Termasuk fitur ekspor PDF dan share ke WhatsApp. Seluruh state dikelola di client-side tanpa backend.

## Tasks

- [x] 1. Set up project structure and core interfaces
  - [x] 1.1 Initialize Vite + React + TypeScript project with Tailwind CSS
    - Scaffold project menggunakan Vite template react-ts
    - Install dan konfigurasi Tailwind CSS v3 dengan palet warna biru laut
    - Install dependencies: jspdf, jspdf-autotable, nanoid
    - Install dev dependencies: vitest, @testing-library/react, fast-check
    - Konfigurasi vitest di vite.config.ts
    - _Requirements: 1.1, 1.2, 8.2_

  - [x] 1.2 Define TypeScript interfaces and data models
    - Buat file `src/types/index.ts` dengan interfaces: GlobalSettings, OrderItem, PersonCalculation, BillSummary, BankInfo
    - Pastikan semua field sesuai dengan design document
    - _Requirements: 2.1, 3.1, 4.1_

  - [x] 1.3 Implement utility functions (formatRupiah, generateId)
    - Buat file `src/utils/format.ts` dengan fungsi formatRupiah menggunakan Intl.NumberFormat('id-ID')
    - Buat fungsi formatDate untuk format tanggal Indonesia
    - Buat helper generateId menggunakan nanoid
    - _Requirements: 5.6, 8.1_

- [x] 2. Implement core calculation logic
  - [x] 2.1 Implement calculateBillSplit function
    - Buat file `src/utils/calculator.ts`
    - Implementasi perhitungan subtotal, totalTax, totalService, totalDiscount, grandTotal
    - Implementasi perhitungan proporsi per orang: proportion = price / subtotal
    - Implementasi totalPayment per orang: price + taxShare + serviceShare - discountShare
    - Handle edge case: subtotal = 0 → semua proporsi = 0
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [ ]* 2.2 Write property test: Proportional Fairness
    - **Property 1: Proportional Fairness**
    - Verify ∀i: calculations[i].proportion = orders[i].price / subtotal (jika subtotal > 0)
    - Gunakan fast-check untuk generate random orders dan settings
    - **Validates: Requirements 4.1**

  - [ ]* 2.3 Write property test: Sum Consistency
    - **Property 2: Sum Consistency**
    - Verify Σ calculations[i].totalPayment ≈ summary.grandTotal (tolerance ±1 Rupiah)
    - **Validates: Requirements 4.9**

  - [ ]* 2.4 Write property test: Non-Negative Payments
    - **Property 3: Non-Negative Payments**
    - Verify ∀i: calculations[i].totalPayment >= 0 (selama grandTotal >= 0)
    - **Validates: Requirements 4.7**

  - [ ]* 2.5 Write property test: Proportion Sum equals 1
    - **Property 4: Proportion Sum = 1**
    - Verify Σ calculations[i].proportion = 1.0 (jika subtotal > 0, floating point tolerance)
    - **Validates: Requirements 4.1**

  - [ ]* 2.6 Write property test: Zero Subtotal Safety
    - **Property 5: Zero Subtotal Safety**
    - Verify jika subtotal = 0, maka ∀i: proportion = 0 ∧ totalPayment = 0
    - **Validates: Requirements 4.8**

  - [ ]* 2.7 Write property test: Idempotent Calculation
    - **Property 7: Idempotent Calculation**
    - Verify calculateBillSplit(orders, settings) selalu menghasilkan output yang sama untuk input yang sama
    - **Validates: Requirements 4.1, 4.9**

  - [ ]* 2.8 Write unit tests for calculateBillSplit
    - Test skenario normal: 3 orang dengan harga berbeda
    - Test edge case: 0 orders, semua harga 0, diskon melebihi subtotal
    - Test presisi: sum of totalPayment = grandTotal
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [ ]* 2.9 Write unit tests for formatRupiah
    - Test format 0 → "Rp 0"
    - Test format 150000 → "Rp 150.000"
    - Test format angka besar (jutaan)
    - _Requirements: 5.6, 8.1_

- [x] 3. Checkpoint - Ensure core logic tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement UI components
  - [x] 4.1 Implement Header component
    - Buat file `src/components/Header.tsx`
    - Tampilkan judul "Kalkulator Patungan" dengan styling biru laut
    - Desain clean dan modern menggunakan Tailwind CSS
    - _Requirements: 1.1, 1.2, 8.2_

  - [x] 4.2 Implement GlobalSettings component
    - Buat file `src/components/GlobalSettings.tsx`
    - Render 3 input fields: Pajak Resto (%), Service Charge (%), Diskon Tambahan (Rp)
    - Set default values: tax=10, service=5, discount=0
    - Validasi input: hanya angka, tolak karakter non-numerik
    - Validasi range: tax/service 0-100, discount >= 0
    - Emit perubahan ke parent melalui onSettingsChange callback
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.3 Implement OrderList component
    - Buat file `src/components/OrderList.tsx`
    - Render daftar pesanan dengan fields: Nama Orang, Nama Pesanan (opsional), Harga Makanan (Rp)
    - Tombol "+ Tambah Orang" untuk menambah baris baru
    - Tombol hapus (ikon tong sampah) per baris
    - Tampilkan total bayar per orang di samping setiap baris (format Rupiah, real-time)
    - Validasi harga: hanya angka >= 0, tolak nilai negatif dan karakter non-numerik
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 4.4 Implement SummaryCard component
    - Buat file `src/components/SummaryCard.tsx`
    - Tampilkan: Subtotal Harga Makanan, Total Pajak, Total Service, Total Diskon, Grand Total
    - Grand Total ditampilkan besar dan bold
    - Semua angka dalam format Rupiah Indonesia (Rp X.XXX)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 4.5 Implement ExportActions component (tombol Buat PDF & Share)
    - Buat file `src/components/ExportActions.tsx`
    - Render tombol "Buat PDF & Share ke WhatsApp" berukuran besar dan menonjol
    - Disable tombol jika tidak ada pesanan
    - _Requirements: 6.1, 7.1, 8.4_

- [x] 5. Wire components together in App
  - [x] 5.1 Implement App component with state management
    - Buat/update `src/App.tsx` sebagai root component
    - Kelola state: globalSettings (default: tax=10, service=5, discount=0) dan orders (array kosong)
    - Gunakan useMemo untuk memoize hasil calculateBillSplit
    - Implementasi handler functions: handleSettingsChange, handleAddOrder, handleUpdateOrder, handleDeleteOrder
    - Render semua child components dengan props yang sesuai
    - Layout responsif: 4 section (Header, GlobalSettings, OrderList, SummaryCard) + ExportActions
    - _Requirements: 1.3, 2.2, 2.3, 2.4, 3.1, 3.2, 3.4, 4.1_

- [x] 6. Checkpoint - Ensure UI renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement export features
  - [x] 7.1 Implement PDF generation with jsPDF
    - Buat file `src/utils/pdfGenerator.ts`
    - Generate PDF dengan judul "Rincian Tagihan Patungan" dan tanggal hari ini
    - Buat tabel dengan kolom: Nama, Pesanan, Harga Awal, Total Bayar
    - Tampilkan Grand Total dan teks informasi transfer rekening di bagian bawah
    - Trigger download otomatis file 'tagihan-patungan.pdf'
    - Handle error: try-catch dengan fallback alert jika generate gagal
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 7.2 Implement WhatsApp share functionality
    - Buat file `src/utils/whatsappShare.ts`
    - Compose message: rekap nama + total bayar per orang + grand total
    - Encode message dengan encodeURIComponent
    - Buka URL https://wa.me/?text=[encoded_message] di tab baru
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 7.3 Connect export functions to ExportActions component
    - Wire generatePDF dan shareToWhatsApp ke tombol di ExportActions
    - Lazy-load jsPDF library saat tombol diklik
    - Handle error states (tampilkan alert/toast jika gagal)
    - _Requirements: 6.4, 6.5, 7.3_

- [x] 8. Final styling and responsiveness
  - [x] 8.1 Apply final Tailwind CSS styling and responsive design
    - Terapkan palet warna biru laut, abu-abu terang, dan putih secara konsisten
    - Pastikan layout responsif di mobile dan desktop
    - Pastikan tombol export berukuran besar dan mudah diklik
    - Pastikan horizontal scroll hanya pada elemen tertentu (tabel lebar), layout utama tetap rapi
    - _Requirements: 1.2, 8.1, 8.2, 8.3, 8.4_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Seluruh data dikelola di client-side state (React useState/useMemo), tidak ada backend
- Library jsPDF di-lazy-load untuk performa optimal
- Format mata uang menggunakan Intl.NumberFormat('id-ID') untuk konsistensi

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "4.5"] },
    { "id": 5, "tasks": ["5.1"] },
    { "id": 6, "tasks": ["7.1", "7.2"] },
    { "id": 7, "tasks": ["7.3", "8.1"] }
  ]
}
```
