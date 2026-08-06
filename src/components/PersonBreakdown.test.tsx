import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PersonBreakdown from './PersonBreakdown'
import { PersonBreakdownEntry } from '../types'

describe('PersonBreakdown', () => {
  it('renders nothing when entries array is empty', () => {
    const { container } = render(<PersonBreakdown entries={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders heading "Rincian Per Orang"', () => {
    const entries: PersonBreakdownEntry[] = [
      { personName: 'Andi', totalPayment: 55000 },
    ]
    render(<PersonBreakdown entries={entries} />)
    expect(
      screen.getByRole('heading', { name: 'Rincian Per Orang' })
    ).toBeInTheDocument()
  })

  it('displays each entry with person name and formatted rupiah', () => {
    const entries: PersonBreakdownEntry[] = [
      { personName: 'Andi', totalPayment: 55000 },
      { personName: 'Budi', totalPayment: 33000 },
      { personName: '(Tanpa Nama)', totalPayment: 22000 },
    ]
    render(<PersonBreakdown entries={entries} />)

    expect(screen.getByText('Andi')).toBeInTheDocument()
    expect(screen.getByText('Budi')).toBeInTheDocument()
    expect(screen.getByText('(Tanpa Nama)')).toBeInTheDocument()
    expect(screen.getByText('Rp 55.000')).toBeInTheDocument()
    expect(screen.getByText('Rp 33.000')).toBeInTheDocument()
    expect(screen.getByText('Rp 22.000')).toBeInTheDocument()
  })

  it('applies card styling classes', () => {
    const entries: PersonBreakdownEntry[] = [
      { personName: 'Andi', totalPayment: 10000 },
    ]
    render(<PersonBreakdown entries={entries} />)
    const section = screen.getByRole('heading', { name: 'Rincian Per Orang' })
      .closest('section')
    expect(section).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-gray-100', 'p-4', 'sm:p-6')
  })

  it('applies truncate class on person name', () => {
    const entries: PersonBreakdownEntry[] = [
      { personName: 'A Very Long Person Name That Should Be Truncated', totalPayment: 10000 },
    ]
    render(<PersonBreakdown entries={entries} />)
    const nameElement = screen.getByText('A Very Long Person Name That Should Be Truncated')
    expect(nameElement).toHaveClass('truncate')
  })
})
