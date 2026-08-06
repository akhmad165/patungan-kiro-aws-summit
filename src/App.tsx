import { useState, useMemo } from 'react'
import type { GlobalSettings, OrderItem, BankInfo } from './types'
import { generateId } from './utils/format'
import { calculateBillSplit, aggregateByPerson } from './utils/calculator'
import { shareToWhatsApp } from './utils/whatsappShare'
import Header from './components/Header'
import GlobalSettingsPanel from './components/GlobalSettings'
import OrderList from './components/OrderList'
import SummaryCard from './components/SummaryCard'
import PersonBreakdown from './components/PersonBreakdown'
import ExportActions from './components/ExportActions'

function App() {
  const [settings, setSettings] = useState<GlobalSettings>({
    taxPercent: 10,
    servicePercent: 5,
    discountAmount: 0,
  })

  const [orders, setOrders] = useState<OrderItem[]>([])

  const { summary, calculations } = useMemo(
    () => calculateBillSplit(orders, settings),
    [orders, settings]
  )

  const personBreakdown = useMemo(
    () => aggregateByPerson(orders, calculations),
    [orders, calculations]
  )

  const handleSettingsChange = (newSettings: GlobalSettings) => {
    setSettings(newSettings)
  }

  const handleAddOrder = () => {
    setOrders([
      ...orders,
      {
        id: generateId(),
        personName: '',
        orderName: '',
        price: 0,
      },
    ])
  }

  const handleUpdateOrder = (id: string, updates: Partial<OrderItem>) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, ...updates } : order
      )
    )
  }

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter((order) => order.id !== id))
  }

  const bankInfo: BankInfo = {
    bank: 'BCA',
    accountNumber: '1234567890',
    accountName: 'Nama Pemilik',
  }

  const handleExport = async () => {
    try {
      // Lazy-load jsPDF library (heavy dependency) saat tombol diklik
      const { generatePDF } = await import('./utils/pdfGenerator')
      generatePDF(orders, calculations, summary, bankInfo, personBreakdown)
      shareToWhatsApp(orders, calculations, summary)
    } catch {
      alert('Gagal mengekspor. Silakan coba lagi.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6 overflow-x-hidden">
        <GlobalSettingsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />

        <OrderList
          orders={orders}
          calculations={calculations}
          onAddOrder={handleAddOrder}
          onUpdateOrder={handleUpdateOrder}
          onDeleteOrder={handleDeleteOrder}
        />

        <SummaryCard
          subtotal={summary.subtotal}
          totalTax={summary.totalTax}
          totalService={summary.totalService}
          totalDiscount={summary.totalDiscount}
          grandTotal={summary.grandTotal}
        />

        <PersonBreakdown entries={personBreakdown} />

        <ExportActions
          orders={orders}
          calculations={calculations}
          globalSettings={settings}
          grandTotal={summary.grandTotal}
          onExport={handleExport}
        />
      </main>
    </div>
  )
}

export default App
