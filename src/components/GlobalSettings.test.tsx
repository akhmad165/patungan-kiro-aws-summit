import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import GlobalSettingsPanel from './GlobalSettings'
import type { GlobalSettings } from '../types'

const defaultSettings: GlobalSettings = {
  taxPercent: 10,
  servicePercent: 5,
  discountAmount: 0,
}

describe('GlobalSettings', () => {
  it('renders all three input fields with correct labels', () => {
    const onChange = vi.fn()
    render(
      <GlobalSettingsPanel settings={defaultSettings} onSettingsChange={onChange} />
    )

    expect(screen.getByLabelText('Pajak Resto (%)')).toBeInTheDocument()
    expect(screen.getByLabelText('Service Charge (%)')).toBeInTheDocument()
    expect(screen.getByLabelText('Diskon Tambahan (Rp)')).toBeInTheDocument()
  })

  it('displays default values from settings prop', () => {
    const onChange = vi.fn()
    render(
      <GlobalSettingsPanel settings={defaultSettings} onSettingsChange={onChange} />
    )

    expect(screen.getByLabelText('Pajak Resto (%)')).toHaveValue('10')
    expect(screen.getByLabelText('Service Charge (%)')).toHaveValue('5')
    expect(screen.getByLabelText('Diskon Tambahan (Rp)')).toHaveValue('0')
  })

  it('calls onSettingsChange when tax is updated with valid number', () => {
    const onChange = vi.fn()
    render(
      <GlobalSettingsPanel settings={defaultSettings} onSettingsChange={onChange} />
    )

    fireEvent.change(screen.getByLabelText('Pajak Resto (%)'), {
      target: { value: '12' },
    })

    expect(onChange).toHaveBeenCalledWith({
      ...defaultSettings,
      taxPercent: 12,
    })
  })

  it('calls onSettingsChange when service charge is updated', () => {
    const onChange = vi.fn()
    render(
      <GlobalSettingsPanel settings={defaultSettings} onSettingsChange={onChange} />
    )

    fireEvent.change(screen.getByLabelText('Service Charge (%)'), {
      target: { value: '8' },
    })

    expect(onChange).toHaveBeenCalledWith({
      ...defaultSettings,
      servicePercent: 8,
    })
  })

  it('calls onSettingsChange when discount is updated', () => {
    const onChange = vi.fn()
    render(
      <GlobalSettingsPanel settings={defaultSettings} onSettingsChange={onChange} />
    )

    fireEvent.change(screen.getByLabelText('Diskon Tambahan (Rp)'), {
      target: { value: '5000' },
    })

    expect(onChange).toHaveBeenCalledWith({
      ...defaultSettings,
      discountAmount: 5000,
    })
  })

  it('rejects non-numeric characters', () => {
    const onChange = vi.fn()
    render(
      <GlobalSettingsPanel settings={defaultSettings} onSettingsChange={onChange} />
    )

    fireEvent.change(screen.getByLabelText('Pajak Resto (%)'), {
      target: { value: 'abc' },
    })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('rejects special characters', () => {
    const onChange = vi.fn()
    render(
      <GlobalSettingsPanel settings={defaultSettings} onSettingsChange={onChange} />
    )

    fireEvent.change(screen.getByLabelText('Service Charge (%)'), {
      target: { value: '5@#' },
    })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('rejects tax value above 100', () => {
    const onChange = vi.fn()
    render(
      <GlobalSettingsPanel settings={defaultSettings} onSettingsChange={onChange} />
    )

    fireEvent.change(screen.getByLabelText('Pajak Resto (%)'), {
      target: { value: '101' },
    })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('rejects service charge value above 100', () => {
    const onChange = vi.fn()
    render(
      <GlobalSettingsPanel settings={defaultSettings} onSettingsChange={onChange} />
    )

    fireEvent.change(screen.getByLabelText('Service Charge (%)'), {
      target: { value: '150' },
    })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('accepts zero values for tax and service', () => {
    const onChange = vi.fn()
    render(
      <GlobalSettingsPanel settings={defaultSettings} onSettingsChange={onChange} />
    )

    fireEvent.change(screen.getByLabelText('Pajak Resto (%)'), {
      target: { value: '0' },
    })

    expect(onChange).toHaveBeenCalledWith({
      ...defaultSettings,
      taxPercent: 0,
    })
  })

  it('accepts boundary value 100 for tax', () => {
    const onChange = vi.fn()
    render(
      <GlobalSettingsPanel settings={defaultSettings} onSettingsChange={onChange} />
    )

    fireEvent.change(screen.getByLabelText('Pajak Resto (%)'), {
      target: { value: '100' },
    })

    expect(onChange).toHaveBeenCalledWith({
      ...defaultSettings,
      taxPercent: 100,
    })
  })

  it('treats empty string as 0', () => {
    const onChange = vi.fn()
    render(
      <GlobalSettingsPanel settings={defaultSettings} onSettingsChange={onChange} />
    )

    fireEvent.change(screen.getByLabelText('Diskon Tambahan (Rp)'), {
      target: { value: '' },
    })

    expect(onChange).toHaveBeenCalledWith({
      ...defaultSettings,
      discountAmount: 0,
    })
  })
})
