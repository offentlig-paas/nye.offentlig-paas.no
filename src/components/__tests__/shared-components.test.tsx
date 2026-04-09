// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'
import { AdminCard } from '../AdminCard'
import { AdminEmptyState } from '../AdminEmptyState'
import { StatusBadge } from '../StatusBadge'
import { StatCard } from '../StatCard'
import { UsersIcon } from '@heroicons/react/24/outline'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('defaults to zinc color', () => {
    const { container } = render(<Badge>Default</Badge>)
    expect(container.firstChild).toHaveClass('bg-zinc-100')
  })

  it('applies specified color variant', () => {
    const { container } = render(<Badge color="green">Success</Badge>)
    expect(container.firstChild).toHaveClass('bg-green-50')
  })

  it('applies all color variants without error', () => {
    const colors = [
      'green',
      'blue',
      'yellow',
      'red',
      'zinc',
      'teal',
      'purple',
      'orange',
    ] as const

    for (const color of colors) {
      const { unmount } = render(<Badge color={color}>{color}</Badge>)
      expect(screen.getByText(color)).toBeInTheDocument()
      unmount()
    }
  })

  it('renders with custom className', () => {
    const { container } = render(<Badge className="gap-1">Custom</Badge>)
    expect(container.firstChild).toHaveClass('gap-1')
  })

  it('renders as a span with proper base classes', () => {
    const { container } = render(<Badge>Test</Badge>)
    const el = container.firstChild as HTMLElement
    expect(el.tagName).toBe('SPAN')
    expect(el).toHaveClass('rounded-full', 'text-xs', 'font-medium')
  })
})

describe('AdminCard', () => {
  it('renders children', () => {
    render(<AdminCard>Card content</AdminCard>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('defaults to p-4 padding', () => {
    const { container } = render(<AdminCard>Content</AdminCard>)
    expect(container.firstChild).toHaveClass('p-4')
  })

  it('applies specified padding', () => {
    const { container } = render(<AdminCard padding="6">Content</AdminCard>)
    expect(container.firstChild).toHaveClass('p-6')
  })

  it('applies no padding when none specified', () => {
    const { container } = render(<AdminCard padding="none">Content</AdminCard>)
    expect(container.firstChild).not.toHaveClass('p-4')
    expect(container.firstChild).not.toHaveClass('p-5')
    expect(container.firstChild).not.toHaveClass('p-6')
  })

  it('has correct base classes', () => {
    const { container } = render(<AdminCard>Content</AdminCard>)
    expect(container.firstChild).toHaveClass(
      'rounded-xl',
      'border',
      'bg-white',
      'shadow-sm'
    )
  })

  it('accepts custom className', () => {
    const { container } = render(
      <AdminCard className="overflow-hidden">Content</AdminCard>
    )
    expect(container.firstChild).toHaveClass('overflow-hidden')
  })
})

describe('AdminEmptyState', () => {
  it('renders title and description', () => {
    render(
      <AdminEmptyState
        icon={UsersIcon}
        title="No users"
        description="There are no users yet."
      />
    )
    expect(screen.getByText('No users')).toBeInTheDocument()
    expect(screen.getByText('There are no users yet.')).toBeInTheDocument()
  })

  it('renders icon', () => {
    const { container } = render(
      <AdminEmptyState
        icon={UsersIcon}
        title="Empty"
        description="Nothing here"
      />
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders children when provided', () => {
    render(
      <AdminEmptyState
        icon={UsersIcon}
        title="Empty"
        description="Nothing here"
      >
        <button>Add item</button>
      </AdminEmptyState>
    )
    expect(screen.getByText('Add item')).toBeInTheDocument()
  })

  it('wraps content in a card container', () => {
    const { container } = render(
      <AdminEmptyState
        icon={UsersIcon}
        title="Empty"
        description="Nothing here"
      />
    )
    expect(container.firstChild).toHaveClass('rounded-xl', 'border')
  })
})

describe('StatusBadge', () => {
  it('renders confirmed status with green color', () => {
    const { container } = render(<StatusBadge status="confirmed" />)
    expect(screen.getByText('Bekreftet')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-green-50')
  })

  it('renders waitlist status with yellow color', () => {
    const { container } = render(<StatusBadge status="waitlist" />)
    expect(screen.getByText('Venteliste')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-yellow-50')
  })

  it('renders cancelled status with red color', () => {
    const { container } = render(<StatusBadge status="cancelled" />)
    expect(screen.getByText('Avmeldt')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-red-50')
  })

  it('renders attended status with blue color', () => {
    const { container } = render(<StatusBadge status="attended" />)
    expect(screen.getByText('Deltok')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-blue-50')
  })

  it('renders no-show status with zinc color', () => {
    const { container } = render(<StatusBadge status="no-show" />)
    expect(screen.getByText('Ikke møtt')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-zinc-100')
  })

  it('applies custom className', () => {
    const { container } = render(
      <StatusBadge status="confirmed" className="ml-2" />
    )
    expect(container.firstChild).toHaveClass('ml-2')
  })
})

describe('StatCard', () => {
  it('renders value and label', () => {
    render(<StatCard icon={UsersIcon} value={42} label="Participants" />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Participants')).toBeInTheDocument()
  })

  it('renders string values', () => {
    render(<StatCard icon={UsersIcon} value="N/A" label="Rating" />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('renders subtext when provided', () => {
    render(
      <StatCard
        icon={UsersIcon}
        value={10}
        label="Active"
        subtext="5 new today"
      />
    )
    expect(screen.getByText('5 new today')).toBeInTheDocument()
  })

  it('does not render subtext when not provided', () => {
    const { container } = render(
      <StatCard icon={UsersIcon} value={10} label="Active" />
    )
    const texts = container.querySelectorAll('.text-teal-600')
    expect(texts).toHaveLength(1) // Only the icon container
  })

  it('renders inside an AdminCard', () => {
    const { container } = render(
      <StatCard icon={UsersIcon} value={10} label="Test" />
    )
    expect(container.firstChild).toHaveClass('rounded-xl', 'border')
  })
})
