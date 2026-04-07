// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CheckboxQuestion } from '@/lib/surveys/types'
import { CheckboxGroup } from '../survey/CheckboxGroup'

const baseQuestion: CheckboxQuestion = {
  id: 'tools',
  type: 'checkbox',
  title: 'Which tools do you use?',
  required: false,
  options: [
    { label: 'Copilot', value: 'copilot' },
    { label: 'Cursor', value: 'cursor' },
    { label: 'Claude Code', value: 'claude' },
    { label: 'Other', value: 'other', allowOtherText: true },
  ],
}

describe('CheckboxGroup', () => {
  it('renders legend and all options', () => {
    render(
      <CheckboxGroup
        question={baseQuestion}
        value={[]}
        onChange={vi.fn()}
        sessionSeed={42}
      />
    )
    expect(screen.getByText('Which tools do you use?')).toBeInTheDocument()
    expect(screen.getByLabelText('Copilot')).toBeInTheDocument()
    expect(screen.getByLabelText('Cursor')).toBeInTheDocument()
    expect(screen.getByLabelText('Claude Code')).toBeInTheDocument()
  })

  it('toggles checkbox on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <CheckboxGroup
        question={baseQuestion}
        value={[]}
        onChange={onChange}
        sessionSeed={42}
      />
    )
    await user.click(screen.getByLabelText('Copilot'))
    expect(onChange).toHaveBeenCalledWith(['copilot'], undefined)
  })

  it('unchecks a selected option', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <CheckboxGroup
        question={baseQuestion}
        value={['copilot', 'cursor']}
        onChange={onChange}
        sessionSeed={42}
      />
    )
    await user.click(screen.getByLabelText('Copilot'))
    expect(onChange).toHaveBeenCalledWith(['cursor'], undefined)
  })

  it('shows other text input when other is checked', () => {
    render(
      <CheckboxGroup
        question={baseQuestion}
        value={['other']}
        onChange={vi.fn()}
        sessionSeed={42}
      />
    )
    expect(screen.getByPlaceholderText('Spesifiser')).toBeInTheDocument()
  })

  it('hides other text input when other is not checked', () => {
    render(
      <CheckboxGroup
        question={baseQuestion}
        value={['copilot']}
        onChange={vi.fn()}
        sessionSeed={42}
      />
    )
    expect(screen.queryByPlaceholderText('Spesifiser')).not.toBeInTheDocument()
  })

  it('respects maxSelections — disables unchecked options at limit', () => {
    const q: CheckboxQuestion = { ...baseQuestion, maxSelections: 2 }
    render(
      <CheckboxGroup
        question={q}
        value={['copilot', 'cursor']}
        onChange={vi.fn()}
        sessionSeed={42}
      />
    )
    expect(screen.getByLabelText('Claude Code')).toBeDisabled()
    expect(screen.getByLabelText('Copilot')).not.toBeDisabled()
  })

  it('shows selection counter with maxSelections', () => {
    const q: CheckboxQuestion = { ...baseQuestion, maxSelections: 3 }
    render(
      <CheckboxGroup
        question={q}
        value={['copilot']}
        onChange={vi.fn()}
        sessionSeed={42}
      />
    )
    expect(screen.getByRole('status')).toHaveTextContent('1 av 3 valgt')
  })

  it('shows selection counter with minSelections', () => {
    const q: CheckboxQuestion = { ...baseQuestion, minSelections: 2 }
    render(
      <CheckboxGroup
        question={q}
        value={['copilot']}
        onChange={vi.fn()}
        sessionSeed={42}
      />
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Velg minst 2 (1 valgt)'
    )
  })

  it('exclusive option is disabled when non-exclusive items are selected', () => {
    const q: CheckboxQuestion = {
      ...baseQuestion,
      options: [
        { label: 'Copilot', value: 'copilot' },
        { label: 'Cursor', value: 'cursor' },
        { label: 'None', value: 'none', exclusive: true },
      ],
    }
    render(
      <CheckboxGroup
        question={q}
        value={['copilot', 'cursor']}
        onChange={vi.fn()}
        sessionSeed={42}
      />
    )
    expect(screen.getByLabelText('None')).toBeDisabled()
  })

  it('exclusive option selects when nothing else is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const q: CheckboxQuestion = {
      ...baseQuestion,
      options: [
        { label: 'Copilot', value: 'copilot' },
        { label: 'None', value: 'none', exclusive: true },
      ],
    }
    render(
      <CheckboxGroup
        question={q}
        value={[]}
        onChange={onChange}
        sessionSeed={42}
      />
    )
    await user.click(screen.getByLabelText('None'))
    expect(onChange).toHaveBeenCalledWith(['none'])
  })

  it('non-exclusive options are disabled when exclusive is selected', () => {
    const q: CheckboxQuestion = {
      ...baseQuestion,
      options: [
        { label: 'Copilot', value: 'copilot' },
        { label: 'None', value: 'none', exclusive: true },
      ],
    }
    render(
      <CheckboxGroup
        question={q}
        value={['none']}
        onChange={vi.fn()}
        sessionSeed={42}
      />
    )
    expect(screen.getByLabelText('Copilot')).toBeDisabled()
  })

  it('displays error with alert role', () => {
    render(
      <CheckboxGroup
        question={baseQuestion}
        value={[]}
        onChange={vi.fn()}
        error="Select at least one"
        sessionSeed={42}
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Select at least one')
  })
})
