import { render, screen, fireEvent } from '@testing-library/react'
import OrderList from './OrderList'
import { OrderItem, PersonCalculation } from '../types'

const mockOrders: OrderItem[] = [
  { id: '1', personName: 'Alice', orderName: 'Nasi Goreng', price: 25000 },
  { id: '2', personName: 'Bob', orderName: '', price: 30000 },
]

const mockCalculations: PersonCalculation[] = [
  {
    orderId: '1',
    proportion: 0.4545,
    taxShare: 2500,
    serviceShare: 1250,
    discountShare: 0,
    totalPayment: 28750,
  },
  {
    orderId: '2',
    proportion: 0.5455,
    taxShare: 3000,
    serviceShare: 1500,
    discountShare: 0,
    totalPayment: 34500,
  },
]

describe('OrderList', () => {
  const defaultProps = {
    orders: mockOrders,
    calculations: mockCalculations,
    onAddOrder: vi.fn(),
    onUpdateOrder: vi.fn(),
    onDeleteOrder: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the section title', () => {
    render(<OrderList {...defaultProps} />)
    expect(screen.getByText('Daftar Pesanan')).toBeInTheDocument()
  })

  it('renders all order rows', () => {
    render(<OrderList {...defaultProps} />)
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Nasi Goreng')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Bob')).toBeInTheDocument()
  })

  it('displays total payment per person in Rupiah format', () => {
    render(<OrderList {...defaultProps} />)
    expect(screen.getByText('Rp 28.750')).toBeInTheDocument()
    expect(screen.getByText('Rp 34.500')).toBeInTheDocument()
  })

  it('renders the "+ Tambah Orang" button', () => {
    render(<OrderList {...defaultProps} />)
    expect(screen.getByText('+ Tambah Orang')).toBeInTheDocument()
  })

  it('calls onAddOrder when "+ Tambah Orang" is clicked', () => {
    render(<OrderList {...defaultProps} />)
    fireEvent.click(screen.getByText('+ Tambah Orang'))
    expect(defaultProps.onAddOrder).toHaveBeenCalledTimes(1)
  })

  it('calls onDeleteOrder when delete button is clicked', () => {
    render(<OrderList {...defaultProps} />)
    const deleteButtons = screen.getAllByTitle('Hapus pesanan')
    fireEvent.click(deleteButtons[0])
    expect(defaultProps.onDeleteOrder).toHaveBeenCalledWith('1')
  })

  it('calls onUpdateOrder when person name changes', () => {
    render(<OrderList {...defaultProps} />)
    const nameInput = screen.getByDisplayValue('Alice')
    fireEvent.change(nameInput, { target: { value: 'Charlie' } })
    expect(defaultProps.onUpdateOrder).toHaveBeenCalledWith('1', {
      personName: 'Charlie',
    })
  })

  it('calls onUpdateOrder when order name changes', () => {
    render(<OrderList {...defaultProps} />)
    const orderInput = screen.getByDisplayValue('Nasi Goreng')
    fireEvent.change(orderInput, { target: { value: 'Mie Goreng' } })
    expect(defaultProps.onUpdateOrder).toHaveBeenCalledWith('1', {
      orderName: 'Mie Goreng',
    })
  })

  it('calls onUpdateOrder with numeric price when price changes', () => {
    render(<OrderList {...defaultProps} />)
    const priceInputs = screen.getAllByLabelText('Harga Makanan')
    fireEvent.change(priceInputs[0], { target: { value: '35000' } })
    expect(defaultProps.onUpdateOrder).toHaveBeenCalledWith('1', {
      price: 35000,
    })
  })

  it('sets price to 0 when non-numeric value is entered', () => {
    // type="number" inputs report empty string for invalid values in browsers
    // Our handler treats empty/non-numeric as 0
    render(<OrderList {...defaultProps} />)
    const priceInputs = screen.getAllByLabelText('Harga Makanan')
    fireEvent.change(priceInputs[0], { target: { value: '' } })
    expect(defaultProps.onUpdateOrder).toHaveBeenCalledWith('1', {
      price: 0,
    })
  })

  it('renders empty list with just the add button', () => {
    render(<OrderList {...defaultProps} orders={[]} calculations={[]} />)
    expect(screen.getByText('+ Tambah Orang')).toBeInTheDocument()
    expect(screen.queryByLabelText('Nama Orang')).not.toBeInTheDocument()
  })

  it('shows Rp 0 when no calculation exists for an order', () => {
    render(<OrderList {...defaultProps} calculations={[]} />)
    const payments = screen.getAllByText('Rp 0')
    expect(payments).toHaveLength(2)
  })
})
