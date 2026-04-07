// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { TextareaQuestion } from '@/lib/surveys/types'
import { TextareaInput } from '../survey/TextareaInput'

const baseQuestion: TextareaQuestion = {
  id: 'comments',
  type: 'textarea',
  title: 'Additional comments',
  required: false,
}

describe('TextareaInput', () => {
  it('renders label and textarea', () => {
    render(
      <TextareaInput question={baseQuestion} value="" onChange={vi.fn()} />
    )
    expect(screen.getByLabelText('Additional comments')).toBeInTheDocument()
    expect(screen.getByLabelText('Additional comments').tagName).toBe(
      'TEXTAREA'
    )
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <TextareaInput question={baseQuestion} value="" onChange={onChange} />
    )
    await user.type(screen.getByLabelText('Additional comments'), 'x')
    expect(onChange).toHaveBeenCalledWith('x')
  })

  it('shows character counter when maxLength is set', () => {
    const q = { ...baseQuestion, maxLength: 200 }
    render(<TextareaInput question={q} value="hello" onChange={vi.fn()} />)
    expect(screen.getByText('5 / 200')).toBeInTheDocument()
  })

  it('does not show character counter without maxLength', () => {
    render(
      <TextareaInput question={baseQuestion} value="hello" onChange={vi.fn()} />
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows error with alert role', () => {
    render(
      <TextareaInput
        question={baseQuestion}
        value=""
        onChange={vi.fn()}
        error="Required"
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('sets maxLength HTML attribute', () => {
    const q = { ...baseQuestion, maxLength: 100 }
    render(<TextareaInput question={q} value="" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Additional comments')).toHaveAttribute(
      'maxLength',
      '100'
    )
  })

  it('shows required indicator', () => {
    const q = { ...baseQuestion, required: true }
    render(<TextareaInput question={q} value="" onChange={vi.fn()} />)
    expect(screen.getByText('(påkrevd)')).toBeInTheDocument()
  })
})
