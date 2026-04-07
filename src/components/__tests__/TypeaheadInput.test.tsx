// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { TypeaheadQuestion } from '@/lib/surveys/types'
import { TypeaheadInput } from '../survey/TypeaheadInput'

const baseQuestion: TypeaheadQuestion = {
  id: 'org',
  type: 'typeahead',
  title: 'Organization',
  required: false,
  suggestions: ['Nav', 'Digdir', 'SSB', 'Skatteetaten', 'Sikt'],
}

describe('TypeaheadInput', () => {
  it('renders label and input with combobox role', () => {
    render(
      <TypeaheadInput question={baseQuestion} value="" onChange={vi.fn()} />
    )
    const input = screen.getByRole('combobox')
    expect(input).toBeInTheDocument()
    expect(screen.getByLabelText('Organization')).toBe(input)
  })

  it('shows filtered suggestions when typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <TypeaheadInput question={baseQuestion} value="" onChange={onChange} />
    )
    await user.type(screen.getByRole('combobox'), 'S')
    // onChange fires — the parent re-renders with value="S"
    expect(onChange).toHaveBeenCalledWith('S')
  })

  it('displays matching suggestions as listbox', () => {
    render(
      <TypeaheadInput question={baseQuestion} value="S" onChange={vi.fn()} />
    )
    // Focus to open
    fireEvent.focus(screen.getByRole('combobox'))
    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()
    const options = screen.getAllByRole('option')
    expect(options.length).toBe(3) // SSB, Skatteetaten, Sikt
  })

  it('selects suggestion on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <TypeaheadInput question={baseQuestion} value="Nav" onChange={onChange} />
    )
    fireEvent.focus(screen.getByRole('combobox'))
    const option = screen.getByRole('option', { name: 'Nav' })
    await user.click(option)
    expect(onChange).toHaveBeenCalledWith('Nav')
  })

  it('navigates suggestions with keyboard', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <TypeaheadInput question={baseQuestion} value="Di" onChange={onChange} />
    )
    const input = screen.getByRole('combobox')
    await user.click(input)
    // Digdir should be visible
    expect(screen.getByRole('option', { name: 'Digdir' })).toBeInTheDocument()

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Digdir' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('Digdir')
  })

  it('closes suggestions on Escape', async () => {
    const user = userEvent.setup()
    render(
      <TypeaheadInput question={baseQuestion} value="Nav" onChange={vi.fn()} />
    )
    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not show suggestions for empty input', () => {
    render(
      <TypeaheadInput question={baseQuestion} value="" onChange={vi.fn()} />
    )
    fireEvent.focus(screen.getByRole('combobox'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('displays error with alert role', () => {
    render(
      <TypeaheadInput
        question={baseQuestion}
        value=""
        onChange={vi.fn()}
        error="Required"
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('sets aria-expanded based on suggestion visibility', () => {
    const { rerender } = render(
      <TypeaheadInput question={baseQuestion} value="" onChange={vi.fn()} />
    )
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false'
    )

    rerender(
      <TypeaheadInput question={baseQuestion} value="Nav" onChange={vi.fn()} />
    )
    fireEvent.focus(screen.getByRole('combobox'))
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })
})
