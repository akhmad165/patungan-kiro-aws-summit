import { OrderItem, PersonCalculation, GlobalSettings } from '../types'

interface ExportActionsProps {
  orders: OrderItem[]
  calculations: PersonCalculation[]
  globalSettings: GlobalSettings
  grandTotal: number
  onExport: () => void
}

function ExportActions({ orders, onExport }: ExportActionsProps) {
  const isDisabled = orders.length === 0

  return (
    <section className="mt-6 mb-8">
      <button
        type="button"
        onClick={onExport}
        disabled={isDisabled}
        className="w-full py-4 px-6 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 bg-sea-blue-600 text-white hover:bg-sea-blue-700 active:bg-sea-blue-800 focus:outline-none focus:ring-4 focus:ring-sea-blue-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
      >
        <span className="text-xl" aria-hidden="true">📄</span>
        Buat PDF &amp; Share ke WhatsApp
      </button>
    </section>
  )
}

export default ExportActions
