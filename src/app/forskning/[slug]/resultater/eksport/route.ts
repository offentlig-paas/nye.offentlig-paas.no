import { TRPCError } from '@trpc/server'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'
import { createCaller } from '@/server/root'
import { getSurveyForProject } from '@/lib/surveys/helpers'
import { aggregatedToCsv, csvResponse } from '@/lib/surveys/csv'

// Uses the same procedure as the public results page, so it never shows more.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const survey = getSurveyForProject(slug, 'results')
  if (!survey) return new Response('Fant ikke resultatene', { status: 404 })
  try {
    const data = await (
      await createCaller()
    ).survey.getAggregatedResults({ surveySlug: survey.slug })
    return csvResponse(aggregatedToCsv(data), `${survey.slug}-resultater.csv`)
  } catch (error) {
    if (error instanceof TRPCError) {
      return new Response(error.message, {
        status: getHTTPStatusCodeFromError(error),
      })
    }
    throw error
  }
}
