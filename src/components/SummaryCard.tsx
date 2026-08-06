import { formatRupiah } from '../utils/format'

interface SummaryCardProps {
  subtotal: number
  totalTax: number
  totalService: number
  totalDiscount: number
  grandTotal: number
}

function SummaryCard({
  subtotal,
  totalTax,
  totalService,
  totalDiscount,
  grandTotal,
}: SummaryCardProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-sea-blue-800 mb-4">
        Ringkasan Total
      </h2>

      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal Harga Makanan</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Pajak</span>
          <span>{formatRupiah(totalTax)}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Service</span>
          <span>{formatRupiah(totalService)}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Diskon</span>
          <span className="text-red-500">- {formatRupiah(totalDiscount)}</span>
        </div>
      </div>

      <hr className="my-4 border-gray-200" />

      <div className="flex justify-between items-center">
        <span className="text-base font-semibold text-sea-blue-900">
          Grand Total
        </span>
        <span className="text-xl sm:text-2xl font-bold text-sea-blue-700">
          {formatRupiah(grandTotal)}
        </span>
      </div>
    </section>
  )
}

export default SummaryCard
