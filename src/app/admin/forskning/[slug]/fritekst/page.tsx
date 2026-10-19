import { Suspense } from 'react'
import { createCaller } from '@/server/root'

interface AdminSurveyFreeTextPageProps {
  params: Promise<{ slug: string }>
}

function FreeTextSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
        />
      ))}
    </div>
  )
}

async function FreeTextContent({ slug }: { slug: string }) {
  const caller = await createCaller()
  const questions = await caller.admin.surveys.getFreeText({ slug })

  if (questions.every(q => q.answers.length === 0)) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Ingen fritekstsvar ennå.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Svarene vises i tilfeldig rekkefølge og uten organisasjonsnavn.
      </p>
      {questions.map(q => (
        <section key={q.id}>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {q.title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {q.answers.length} svar
          </p>
          {q.answers.length > 0 && (
            <ul className="mt-3 space-y-2">
              {q.answers.map((answer, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-zinc-200 bg-white p-3 text-sm whitespace-pre-line text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {answer}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

export default async function AdminSurveyFreeTextPage({
  params,
}: AdminSurveyFreeTextPageProps) {
  const { slug } = await params
  return (
    <Suspense fallback={<FreeTextSkeleton />}>
      <FreeTextContent slug={slug} />
    </Suspense>
  )
}
