// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RadioQuestion } from '@/lib/surveys/types'
import { RadioGroup } from '../survey/RadioGroup'

const baseQuestion: RadioQuestion = {
  id: 'role',
  type: 'radio',
  title: 'What is your role?',
  required: true,
  options: [
    { label: 'Developer', value: 'dev' },
    { label: 'Manager', value: 'mgr' },
    { label: 'Other', value: 'other', allowOtherText: true },
  ],
}

describe('RadioGroup', () => {
  it('renders legend and all options', () => {
    render(
      <RadioGroup
        question={baseQuestion}
        value=""
        onChange={vi.fn()}
        sessionSeed={42}
      />
    )
    expect(
      screen.getByText('What is your role?', { selector: 'legend' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Developer')).toBeInTheDocument()
    expect(screen.getByLabelText('Manager')).toBeInTheDocument()
    expect(screen.getByLabelText('Other')).toBeInTheDocument()
  })

  it('calls onChange when selecting an option', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <RadioGroup
        question={baseQuestion}
        value=""
        onChange={onChange}
        sessionSeed={42}
      />
    )
    await user.click(screen.getByLabelText('Developer'))
    expect(onChange).toHaveBeenCalledWith('dev')
  })

  it('shows other text input when other option is selected', () => {
    render(
      <RadioGroup
        question={baseQuestion}
        value="other"
        onChange={vi.fn()}
        sessionSeed={42}
      />
    )
    expect(screen.getByPlaceholderText('Spesifiser')).toBeInTheDocument()
  })

  it('does not show other text input when non-other option selected', () => {
    render(
      <RadioGroup
        question={baseQuestion}
        value="dev"
        onChange={vi.fn()}
        sessionSeed={42}
      />
    )
    expect(screen.queryByPlaceholderText('Spesifiser')).not.toBeInTheDocument()
  })

  it('passes otherText when typing in other field', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <RadioGroup
        question={baseQuestion}
        value="other"
        onChange={onChange}
        sessionSeed={42}
      />
    )
    await user.type(screen.getByPlaceholderText('Spesifiser'), 'QA')
    expect(onChange).toHaveBeenCalledWith('other', 'QA')
  })

  it('displays error with alert role', () => {
    render(
      <RadioGroup
        question={baseQuestion}
        value=""
        onChange={vi.fn()}
        error="Please select one"
        sessionSeed={42}
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Please select one')
  })

  it('marks selected radio as checked', () => {
    render(
      <RadioGroup
        question={baseQuestion}
        value="mgr"
        onChange={vi.fn()}
        sessionSeed={42}
      />
    )
    expect(screen.getByLabelText('Manager')).toBeChecked()
    expect(screen.getByLabelText('Developer')).not.toBeChecked()
  })

  it('does not randomize when randomizeOptions is false', () => {
    const q: RadioQuestion = { ...baseQuestion, randomizeOptions: false }
    const { container } = render(
      <RadioGroup question={q} value="" onChange={vi.fn()} sessionSeed={42} />
    )
    const labels = container.querySelectorAll('label[for^="q-role-"]')
    expect(labels[0]).toHaveTextContent('Developer')
    expect(labels[1]).toHaveTextContent('Manager')
    expect(labels[2]).toHaveTextContent('Other')
  })
})
