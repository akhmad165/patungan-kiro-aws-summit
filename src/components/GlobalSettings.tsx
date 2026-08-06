import type { GlobalSettings } from '../types'

interface GlobalSettingsProps {
  settings: GlobalSettings
  onSettingsChange: (settings: GlobalSettings) => void
}

function GlobalSettingsPanel({ settings, onSettingsChange }: GlobalSettingsProps) {
  const handleChange = (field: keyof GlobalSettings, value: string) => {
    // Reject non-numeric characters (allow empty string for UX)
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      return
    }

    const numValue = value === '' ? 0 : parseFloat(value)

    // Validate range
    if (field === 'taxPercent' || field === 'servicePercent') {
      if (numValue < 0 || numValue > 100) return
    }
    if (field === 'discountAmount') {
      if (numValue < 0) return
    }

    onSettingsChange({
      ...settings,
      [field]: numValue,
    })
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-sea-blue-800 mb-4">
        Pengaturan Global
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="taxPercent"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Pajak Resto (%)
          </label>
          <input
            id="taxPercent"
            type="text"
            inputMode="decimal"
            value={settings.taxPercent}
            onChange={(e) => handleChange('taxPercent', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-blue-500 focus:border-sea-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="servicePercent"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Service Charge (%)
          </label>
          <input
            id="servicePercent"
            type="text"
            inputMode="decimal"
            value={settings.servicePercent}
            onChange={(e) => handleChange('servicePercent', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-blue-500 focus:border-sea-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="discountAmount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Diskon Tambahan (Rp)
          </label>
          <input
            id="discountAmount"
            type="text"
            inputMode="numeric"
            value={settings.discountAmount}
            onChange={(e) => handleChange('discountAmount', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-blue-500 focus:border-sea-blue-500"
          />
        </div>
      </div>
    </section>
  )
}

export default GlobalSettingsPanel
