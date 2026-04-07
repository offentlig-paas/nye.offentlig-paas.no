// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { TextQuestion } from '@/lib/surveys/types'
import { TextInput } from '../survey/TextInput'

const baseQuestion: TextQuestion = {
  id: 'name',
  type: 'text',
  title: 'Your name',
  required: false,
}

describe('TextInput', () => {
  it('renders label and input', () => {
    render(<TextInput question={baseQuestion} value="" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Your name')).toBeInTheDocument()
  })

  it('shows required indicator', () => {
    const q = { ...baseQuestion, required: true }
    render(<TextInput question={q} value="" onChange={vi.fn()} />)
    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByText('(påkrevd)')).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TextInput question={baseQuestion} value="" onChange={onChange} />)
    await user.type(screen.getByLabelText('Your name'), 'a')
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('renders with placeholder', () => {
    const q = { ...baseQuestion, placeholder: 'Type here...' }
    render(<TextInput question={q} value="" onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument()
  })

  it('uses email type for email format', () => {
    const q: TextQuestion = { ...baseQuestion, format: 'email' }
    render(<TextInput question={q} value="" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Your name')).toHaveAttribute('type', 'email')
  })

  it('displays error message with alert role', () => {
    render(
      <TextInput
        question={baseQuestion}
        value=""
        onChange={vi.fn()}
        error="This field is required"
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'This field is required'
    )
  })

  it('sets aria-invalid when error is present', () => {
    render(
      <TextInput
        question={baseQuestion}
        value=""
        onChange={vi.fn()}
        error="Required"
      />
    )
    expect(screen.getByLabelText('Your name')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })

  it('renders description when provided', () => {
    const q = { ...baseQuestion, description: 'Enter your full name' }
    render(<TextInput question={q} value="" onChange={vi.fn()} />)
    expect(screen.getByText('Enter your full name')).toBeInTheDocument()
  })
})
