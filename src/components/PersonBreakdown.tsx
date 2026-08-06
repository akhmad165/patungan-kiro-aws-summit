import { formatRupiah } from '../utils/format'
import { PersonBreakdownEntry } from '../types'

interface PersonBreakdownProps {
  entries: PersonBreakdownEntry[]
}

function PersonBreakdown({ entries }: PersonBreakdownProps) {
  if (entries.length === 0) {
    return null
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-sea-blue-800 mb-4">
        Rincian Per Orang
      </h2>

      <div className="space-y-2 text-sm text-gray-700">
        {entries.map((entry) => (
          <div key={entry.personName} className="flex justify-between">
            <span className="truncate">{entry.personName}</span>
            <span className="ml-4 whitespace-nowrap">
              {formatRupiah(entry.totalPayment)}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default PersonBreakdown
