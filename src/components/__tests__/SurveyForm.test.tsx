// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SurveyForm } from '../SurveyForm'
import type { SurveyDefinition, ConsentContact } from '@/lib/surveys/types'
import { SurveyStatus } from '@/lib/surveys/types'

const mockMutateAsync = vi.fn().mockResolvedValue({ success: true })

vi.mock('@/lib/trpc/client', () => ({
  trpc: {
    survey: {
      submit: {
        useMutation: () => ({
          mutateAsync: mockMutateAsync,
          isPending: false,
        }),
      },
    },
  },
}))

vi.mock('@/lib/surveys/useDraftPersistence', () => ({
  useDraftPersistence: vi.fn(),
  loadDraft: () => null,
  clearDraft: vi.fn(),
}))

const contact: ConsentContact = {
  dataController: 'Test Controller',
  contactEmail: 'test@example.com',
  legalBasis: 'Samtykke (GDPR art. 6 nr. 1 bokstav a)',
  retentionPeriod: '12 måneder etter publisering',
}

const simpleSurvey: SurveyDefinition = {
  slug: 'test-survey',
  version: 1,
  title: 'Test Survey',
  status: SurveyStatus.Open,
  consent: {
    dataCollectionText: 'We collect your answers anonymously.',
  },
  sections: [
    {
      id: 'section-1',
      title: 'About you',
      questions: [
        {
          id: 'q1',
          type: 'text',
          title: 'Your name',
          required: true,
        },
      ],
    },
    {
      id: 'section-2',
      title: 'Your work',
      questions: [
        {
          id: 'q2',
          type: 'radio',
          title: 'Your role',
          required: true,
          options: [
            { label: 'Developer', value: 'dev' },
            { label: 'Manager', value: 'mgr' },
          ],
        },
      ],
    },
  ],
}

const branchingSurvey: SurveyDefinition = {
  slug: 'branching-test',
  version: 1,
  title: 'Branching Survey',
  status: SurveyStatus.Open,
  consent: {
    dataCollectionText: 'Test consent text.',
  },
  sections: [
    {
      id: 'gate',
      title: 'Gate question',
      questions: [
        {
          id: 'gate-q',
          type: 'radio',
          title: 'Do you use AI tools?',
          required: true,
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no', skipToSection: 'final' },
          ],
        },
      ],
    },
    {
      id: 'details',
      title: 'Tool details',
      questions: [
        {
          id: 'detail-q',
          type: 'text',
          title: 'Which tools?',
          required: false,
        },
      ],
    },
    {
      id: 'final',
      title: 'Final section',
      questions: [
        {
          id: 'final-q',
          type: 'text',
          title: 'Any comments?',
          required: false,
        },
      ],
    },
  ],
}

beforeEach(() => {
  mockMutateAsync.mockClear()
  sessionStorage.clear()
})

async function acceptConsentAndStart(user: ReturnType<typeof userEvent.setup>) {
  const consentCheckbox = screen.getByLabelText(/samtykker/i)
  await user.click(consentCheckbox)
  await user.click(screen.getByRole('button', { name: /start/i }))
}

describe('SurveyForm', () => {
  describe('consent flow', () => {
    it('shows consent screen initially', () => {
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      expect(screen.getByLabelText('Samtykke')).toBeInTheDocument()
      expect(screen.getByLabelText(/samtykker/i)).toBeInTheDocument()
    })

    it('disables start button until consent is accepted', () => {
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      expect(screen.getByRole('button', { name: /start/i })).toBeDisabled()
    })

    it('enables start button after accepting consent', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await user.click(screen.getByLabelText(/samtykker/i))
      expect(screen.getByRole('button', { name: /start/i })).toBeEnabled()
    })

    it('shows the form after accepting consent and clicking start', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)
      expect(screen.getByText('About you')).toBeInTheDocument()
    })

    it('shows estimated completion time', () => {
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      expect(screen.getByText(/estimert tid/i)).toBeInTheDocument()
    })
  })

  describe('section navigation', () => {
    it('shows first section after consent', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)
      expect(screen.getByText('About you')).toBeInTheDocument()
      expect(screen.getByText('Seksjon 1 av 2')).toBeInTheDocument()
    })

    it('navigates to next section after filling required fields', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      await user.type(screen.getByLabelText(/Your name/), 'Alice')
      await user.click(screen.getByRole('button', { name: /neste/i }))

      expect(screen.getByText('Your work')).toBeInTheDocument()
      expect(screen.getByText('Seksjon 2 av 2')).toBeInTheDocument()
    })

    it('shows validation error when clicking Next without filling required', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      await user.click(screen.getByRole('button', { name: /neste/i }))
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('navigates back without validation', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      await user.type(screen.getByLabelText(/Your name/), 'Alice')
      await user.click(screen.getByRole('button', { name: /neste/i }))
      expect(screen.getByText('Your work')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /tilbake/i }))
      expect(screen.getByText('About you')).toBeInTheDocument()
    })

    it('disables back button on first section', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      const backBtn = screen.getByRole('button', { name: /tilbake/i })
      // The button has disabled:invisible class — check it's visually hidden
      expect(backBtn).toBeDisabled()
    })

    it('shows submit button on last section', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      await user.type(screen.getByLabelText(/Your name/), 'Alice')
      await user.click(screen.getByRole('button', { name: /neste/i }))

      expect(
        screen.getByRole('button', { name: /send inn/i })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /neste/i })
      ).not.toBeInTheDocument()
    })

    it('displays progress bar', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '1'
      )
    })
  })

  describe('submission', () => {
    it('submits answers via tRPC and shows thank you', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      await user.type(screen.getByLabelText(/Your name/), 'Alice')
      await user.click(screen.getByRole('button', { name: /neste/i }))

      await user.click(screen.getByLabelText('Developer'))
      await user.click(screen.getByRole('button', { name: /send inn/i }))

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          surveySlug: 'test-survey',
          surveyVersion: 1,
          submissionId: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
          ),
          answers: expect.arrayContaining([
            expect.objectContaining({ questionId: 'q1', value: 'Alice' }),
            expect.objectContaining({ questionId: 'q2', value: 'dev' }),
          ]),
        })
      )

      expect(screen.getByText(/takk for ditt svar/i)).toBeInTheDocument()
    })

    it('shows error message on submission failure', async () => {
      mockMutateAsync.mockRejectedValueOnce(new Error('Server error'))
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      await user.type(screen.getByLabelText(/Your name/), 'Alice')
      await user.click(screen.getByRole('button', { name: /neste/i }))

      await user.click(screen.getByLabelText('Developer'))
      await user.click(screen.getByRole('button', { name: /send inn/i }))

      expect(screen.getByRole('alert')).toHaveTextContent('Server error')
    })
  })

  describe('branching', () => {
    it('skips sections based on skipToSection', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={branchingSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      // Select "No" which has skipToSection: 'final'
      await user.click(screen.getByLabelText('No'))
      await user.click(screen.getByRole('button', { name: /neste/i }))

      // Should skip "Tool details" and go straight to "Final section"
      expect(screen.getByText('Final section')).toBeInTheDocument()
      expect(screen.queryByText('Tool details')).not.toBeInTheDocument()
    })

    it('shows all sections when no branching triggered', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={branchingSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      // Select "Yes" — no skipToSection
      await user.click(screen.getByLabelText('Yes'))
      await user.click(screen.getByRole('button', { name: /neste/i }))

      // Should show "Tool details"
      expect(screen.getByText('Tool details')).toBeInTheDocument()
    })
  })

  describe('robustness', () => {
    it('does not show success when honeypot triggers', async () => {
      mockMutateAsync.mockResolvedValueOnce({ success: true, honeypot: true })
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      await user.type(screen.getByLabelText(/Your name/), 'Alice')
      await user.click(screen.getByRole('button', { name: /neste/i }))
      await user.click(screen.getByLabelText('Developer'))
      await user.click(screen.getByRole('button', { name: /send inn/i }))

      expect(screen.queryByText(/takk for ditt svar/i)).not.toBeInTheDocument()
    })

    it('sends consistent submissionId on retry after failure', async () => {
      mockMutateAsync
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true })
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      await user.type(screen.getByLabelText(/Your name/), 'Alice')
      await user.click(screen.getByRole('button', { name: /neste/i }))
      await user.click(screen.getByLabelText('Developer'))

      await user.click(screen.getByRole('button', { name: /send inn/i }))
      expect(screen.getByRole('alert')).toHaveTextContent('Network error')

      await user.click(screen.getByRole('button', { name: /send inn/i }))

      const firstId = mockMutateAsync.mock.calls[0]![0].submissionId
      const secondId = mockMutateAsync.mock.calls[1]![0].submissionId
      expect(firstId).toBe(secondId)
      expect(firstId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      )
    })

    it('has hidden honeypot field', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      const honeypot = document.querySelector('input[name="website"]')
      expect(honeypot).toBeInTheDocument()
      expect(honeypot).toHaveAttribute('tabindex', '-1')
    })

    it('includes surveyVersion in submission payload', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      await user.type(screen.getByLabelText(/Your name/), 'Alice')
      await user.click(screen.getByRole('button', { name: /neste/i }))
      await user.click(screen.getByLabelText('Developer'))
      await user.click(screen.getByRole('button', { name: /send inn/i }))

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ surveyVersion: 1 })
      )
    })
  })

  describe('accessibility', () => {
    it('has sr-only step announcement region', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      const srAnnouncement = document.querySelector('[aria-live="polite"]')
      expect(srAnnouncement).toBeInTheDocument()
    })

    it('form has accessible name from survey title', async () => {
      const user = userEvent.setup()
      render(<SurveyForm survey={simpleSurvey} contact={contact} />)
      await acceptConsentAndStart(user)

      expect(
        screen.getByRole('form', { name: 'Test Survey' })
      ).toBeInTheDocument()
    })
  })
})
