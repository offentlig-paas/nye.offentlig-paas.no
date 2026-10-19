import { TRPCError } from '@trpc/server'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'
import { createCaller } from '@/server/root'
import { csvResponse } from '@/lib/surveys/csv'

// Role checks live in the tRPC procedures: raw is owner-only, aggregert needs any survey role.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const type = new URL(request.url).searchParams.get('type')
  const surveys = (await createCaller()).admin.surveys
  try {
    const { csv, filename } =
      type === 'raw'
        ? await surveys.exportCsv({ slug })
        : await surveys.exportAggregatedCsv({ slug })
    return csvResponse(csv, filename)
  } catch (error) {
    if (error instanceof TRPCError) {
      return new Response(error.message, {
        status: getHTTPStatusCodeFromError(error),
      })
    }
    throw error
  }
}
