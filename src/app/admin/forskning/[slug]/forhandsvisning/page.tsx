import { notFound } from 'next/navigation'
import { getSurvey, getConsentContact } from '@/lib/surveys/helpers'
import { SurveyForm } from '@/components/SurveyForm'

interface AdminSurveyPreviewPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Preview of the survey form for owners and researchers, also for drafts.
 * Access is checked in the layout. Answers are never submitted.
 */
export default async function AdminSurveyPreviewPage({
  params,
}: AdminSurveyPreviewPageProps) {
  const { slug } = await params
  const survey = getSurvey(slug)
  const contact = survey && getConsentContact(survey.slug)
  if (!survey || !contact) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <p
        role="note"
        className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
      >
        Forhåndsvisning. Svar du gir her, blir ikke lagret.
      </p>
      <SurveyForm survey={survey} contact={contact} preview />
    </div>
  )
}
