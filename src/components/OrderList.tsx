import { OrderItem, PersonCalculation } from '../types'
import { formatRupiah } from '../utils/format'

interface OrderListProps {
  orders: OrderItem[]
  calculations: PersonCalculation[]
  onAddOrder: () => void
  onUpdateOrder: (id: string, updates: Partial<OrderItem>) => void
  onDeleteOrder: (id: string) => void
}

function OrderList({
  orders,
  calculations,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
}: OrderListProps) {
  const getCalculation = (orderId: string): PersonCalculation | undefined => {
    return calculations.find((c) => c.orderId === orderId)
  }

  const handlePriceChange = (id: string, value: string) => {
    // Remove non-numeric characters except empty string
    const cleaned = value.replace(/[^0-9]/g, '')
    const numericValue = cleaned === '' ? 0 : parseInt(cleaned, 10)

    // Only accept values >= 0
    if (numericValue >= 0) {
      onUpdateOrder(id, { price: numericValue })
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-sea-blue-900 mb-4">
        Daftar Pesanan
      </h2>

      <div className="space-y-3">
        {orders.map((order) => {
          const calc = getCalculation(order.id)
          const totalPayment = calc?.totalPayment ?? 0

          return (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden"
            >
              {/* Person Name */}
              <input
                type="text"
                placeholder="Nama Orang"
                value={order.personName}
                onChange={(e) =>
                  onUpdateOrder(order.id, { personName: e.target.value })
                }
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sea-blue-400 focus:border-transparent"
                aria-label="Nama Orang"
              />

              {/* Order Name */}
              <input
                type="text"
                placeholder="Nama Pesanan (opsional)"
                value={order.orderName}
                onChange={(e) =>
                  onUpdateOrder(order.id, { orderName: e.target.value })
                }
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sea-blue-400 focus:border-transparent"
                aria-label="Nama Pesanan"
              />

              {/* Price Input */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={order.price === 0 ? '' : order.price}
                  onChange={(e) => handlePriceChange(order.id, e.target.value)}
                  onKeyDown={(e) => {
                    // Prevent minus sign and 'e' for scientific notation
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault()
                    }
                  }}
                  className="w-full sm:w-32 pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sea-blue-400 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Harga Makanan"
                />
              </div>

              {/* Total Payment Display */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm font-medium text-sea-blue-700 whitespace-nowrap min-w-[100px] text-right">
                  {formatRupiah(totalPayment)}
                </span>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => onDeleteOrder(order.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  aria-label={`Hapus pesanan ${order.personName || 'ini'}`}
                  title="Hapus pesanan"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Person Button */}
      <button
        type="button"
        onClick={onAddOrder}
        className="mt-4 w-full py-2.5 px-4 border-2 border-dashed border-sea-blue-300 text-sea-blue-600 font-medium text-sm rounded-lg hover:bg-sea-blue-50 hover:border-sea-blue-400 transition-colors"
      >
        + Tambah Orang
      </button>
    </section>
  )
}

export default OrderList
