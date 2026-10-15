// @vitest-environment jsdom
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AddRegistrationModal } from '../AddRegistrationModal'

vi.mock('@/lib/trpc/client', () => ({
  trpc: {
    slack: {
      searchUsers: {
        useQuery: () => ({ data: [], isFetching: false }),
      },
    },
  },
}))

// Mock OrganisationTypeahead
vi.mock('@/components/OrganisationTypeahead', () => ({
  OrganisationTypeahead: ({
    id,
    value,
    onChange,
    label,
    placeholder,
  }: {
    id: string
    value: string
    onChange: (val: string) => void
    label: string
    placeholder?: string
  }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        data-testid="org-input"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  ),
}))

// Mock AdminModal
vi.mock('@/components/AdminModal', () => ({
  AdminModal: ({
    isOpen,
    children,
    title,
  }: {
    isOpen: boolean
    children: React.ReactNode
    title: string
  }) => {
    if (!isOpen) return null
    return (
      <div data-testid="admin-modal">
        <h2>{title}</h2>
        {children}
      </div>
    )
  },
}))

describe('AddRegistrationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    hasSocialEvent: true,
    attendanceTypes: ['physical', 'digital'],
  }

  it('renders all form fields when open', () => {
    render(<AddRegistrationModal {...defaultProps} />)

    expect(screen.getByText('Legg til deltaker manuelt')).toBeInTheDocument()
    expect(screen.getByLabelText(/Navn/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/E-post/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Organisasjon/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Slack-bruker-ID/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Fysisk')).toBeInTheDocument()
    expect(screen.getByLabelText('Digitalt')).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Deltar på sosialt arrangement/i)
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Allergier \/ matpreferanser/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/Kommentarer/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<AddRegistrationModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('admin-modal')).not.toBeInTheDocument()
  })

  it('submits form with entered data including optional slackUserId', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <AddRegistrationModal
        {...defaultProps}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    )

    fireEvent.change(screen.getByLabelText(/Navn/i), {
      target: { value: 'Kari Nordmann' },
    })
    fireEvent.change(screen.getByLabelText(/E-post/i), {
      target: { value: 'kari@politiet.no' },
    })
    fireEvent.change(screen.getByTestId('org-input'), {
      target: { value: 'Politiet' },
    })
    fireEvent.change(screen.getByLabelText(/Slack-bruker-ID/i), {
      target: { value: 'U12345678' },
    })
    fireEvent.click(screen.getByLabelText('Digitalt'))
    fireEvent.click(screen.getByLabelText(/Deltar på sosialt arrangement/i))
    fireEvent.change(screen.getByLabelText(/Allergier \/ matpreferanser/i), {
      target: { value: 'Nøtteallergi' },
    })
    fireEvent.change(screen.getByLabelText(/Kommentarer/i), {
      target: { value: 'Digital deltaker' },
    })

    fireEvent.submit(
      screen.getByRole('button', { name: /Legg til/i }).closest('form')!
    )

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Kari Nordmann',
        email: 'kari@politiet.no',
        organisation: 'Politiet',
        attendanceType: 'digital',
        attendingSocialEvent: true,
        dietary: 'Nøtteallergi',
        comments: 'Digital deltaker',
        slackUserId: 'U12345678',
      })
    })

    expect(onClose).toHaveBeenCalled()
  })

  it('displays error message when submission fails', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(
        new Error('En påmelding med denne e-posten finnes allerede')
      )

    render(<AddRegistrationModal {...defaultProps} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/Navn/i), {
      target: { value: 'Kari Nordmann' },
    })
    fireEvent.change(screen.getByLabelText(/E-post/i), {
      target: { value: 'kari@politiet.no' },
    })
    fireEvent.change(screen.getByTestId('org-input'), {
      target: { value: 'Politiet' },
    })

    fireEvent.submit(
      screen.getByRole('button', { name: /Legg til/i }).closest('form')!
    )

    await waitFor(() => {
      expect(
        screen.getByText('En påmelding med denne e-posten finnes allerede')
      ).toBeInTheDocument()
    })
  })
})
