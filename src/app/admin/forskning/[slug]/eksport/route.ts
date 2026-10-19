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
  const query = new URL(request.url).searchParams
  const type = query.get('type')
  const input = { slug, pilot: query.get('pilot') === '1' }
  const surveys = (await createCaller()).admin.surveys
  try {
    const { csv, filename } =
      type === 'raw'
        ? await surveys.exportCsv(input)
        : await surveys.exportAggregatedCsv(input)
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
