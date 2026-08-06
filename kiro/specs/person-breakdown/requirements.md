# Requirements Document

## Person Breakdown (Rincian Total Per Orang)

## Introduction

Dokumen ini mendefinisikan requirements untuk fitur tambahan "Person Breakdown" pada aplikasi Kalkulator Patungan Makan. Fitur ini menambahkan section baru di bawah SummaryCard yang menampilkan ringkasan total pembayaran per orang (breakdown per orang), serta menampilkan informasi yang sama pada hasil ekspor PDF. Tujuannya agar pengguna dapat melihat dengan cepat berapa total yang harus dibayar masing-masing orang tanpa perlu melihat satu per satu baris pesanan.

## Glossary

- **PersonBreakdown**: Section UI baru yang menampilkan daftar nama orang beserta total pembayaran masing-masing, dikelompokkan berdasarkan nama orang.
- **SummaryCard**: Komponen UI yang sudah ada, menampilkan ringkasan total tagihan (subtotal, pajak, service, diskon, grand total).
- **PDF_Generator**: Modul utilitas yang menghasilkan file PDF rincian tagihan patungan.
- **PersonCalculation**: Data struktur yang berisi hasil kalkulasi per pesanan termasuk totalPayment.
- **OrderItem**: Data struktur yang berisi informasi pesanan termasuk personName, orderName, dan price.

## Requirements

### Requirement 1: Agregasi Total Per Orang

**User Story:** Sebagai pengguna, saya ingin melihat total pembayaran yang diagregasi per nama orang sehingga saya tahu berapa total yang harus dibayar setiap orang meskipun mereka memiliki lebih dari satu pesanan.

#### Acceptance Criteria

1. WHEN kalkulasi selesai dan terdapat satu atau lebih pesanan, THE PersonBreakdown SHALL mengelompokkan pesanan berdasarkan nama orang (case-sensitive, exact string match) dan menjumlahkan totalPayment dari semua pesanan milik orang yang sama.
2. WHEN satu orang memiliki beberapa pesanan, THE PersonBreakdown SHALL menampilkan satu baris untuk orang tersebut dengan nilai total yang merupakan penjumlahan seluruh totalPayment dari pesanan-pesanan milik orang tersebut.
3. WHEN nama orang kosong (string kosong), THE PersonBreakdown SHALL mengelompokkan semua pesanan tanpa nama ke dalam satu entri dengan label "(Tanpa Nama)".
4. WHEN tidak ada pesanan sama sekali, THE PersonBreakdown SHALL tidak menampilkan section agregasi per orang.
5. THE PersonBreakdown SHALL menampilkan daftar orang diurutkan berdasarkan kemunculan pertama (first occurrence) personName dalam daftar pesanan dari atas ke bawah, dengan entri "(Tanpa Nama)" ditampilkan di posisi sesuai kemunculan pertamanya.

### Requirement 2: Tampilan UI Person Breakdown

**User Story:** Sebagai pengguna, saya ingin melihat ringkasan total per orang di bawah section Ringkasan Total sehingga saya dapat dengan mudah mengetahui berapa yang harus dibayar setiap orang.

#### Acceptance Criteria

1. THE PersonBreakdown SHALL ditampilkan sebagai section terpisah tepat di bawah SummaryCard dalam layout utama aplikasi.
2. THE PersonBreakdown SHALL menampilkan judul section "Rincian Per Orang" menggunakan styling yang konsisten dengan heading SummaryCard (font-size, font-weight, dan color yang serupa).
3. WHEN daftar pesanan mengandung satu atau lebih item, THE PersonBreakdown SHALL menampilkan setiap nama orang unik di sisi kiri dan total pembayaran yang diagregasi dalam format Rupiah (menggunakan formatRupiah) di sisi kanan.
4. WHEN data pesanan atau pengaturan global berubah, THE PersonBreakdown SHALL menampilkan kalkulasi terbaru pada render cycle berikutnya tanpa memerlukan aksi manual dari pengguna.
5. THE PersonBreakdown SHALL menampilkan daftar orang yang diurutkan sesuai urutan kemunculan pertama personName di daftar pesanan.
6. THE PersonBreakdown SHALL menggunakan desain card dengan background putih, rounded corners, border border-gray-100, dan shadow-sm yang identik dengan komponen SummaryCard.
7. IF tidak ada pesanan yang tersedia (daftar pesanan kosong), THEN THE PersonBreakdown SHALL tidak ditampilkan di halaman.

### Requirement 3: Person Breakdown di PDF

**User Story:** Sebagai pengguna, saya ingin rincian total per orang juga tampil di file PDF yang diekspor sehingga bukti tagihan yang saya bagikan sudah lengkap dengan informasi siapa bayar berapa.

#### Acceptance Criteria

1. WHEN PDF di-generate, THE PDF_Generator SHALL menampilkan section dengan heading "Rincian Per Orang" yang ditempatkan setelah tabel pesanan dan sebelum baris Grand Total.
2. WHEN section rincian per orang di-render di PDF, THE PDF_Generator SHALL menampilkan daftar berisi nama orang dan total pembayaran masing-masing orang dalam format Rupiah menggunakan format "Rp X.XXX" (Intl id-ID, tanpa desimal).
3. WHEN satu orang memiliki lebih dari satu pesanan, THE PDF_Generator SHALL menampilkan satu baris dengan nama orang tersebut dan total gabungan dari seluruh totalPayment pesanannya.
4. WHEN nama orang berupa string kosong (""), THE PDF_Generator SHALL menampilkan label "(Tanpa Nama)" sebagai pengganti nama di section rincian per orang pada PDF.
5. THE PDF_Generator SHALL menampilkan daftar orang di section rincian per orang dengan urutan berdasarkan kemunculan pertama (first occurrence) personName dalam daftar pesanan dari atas ke bawah.
6. IF tidak ada pesanan (daftar orders kosong), THEN THE PDF_Generator SHALL tidak menampilkan section "Rincian Per Orang" di PDF.
