import { getAllEvents, getUpcomingEvents } from '@/lib/events/helpers'
import type { Event } from '@/lib/events/types'

const siteUrl = process.env.NEXT_PUBLIC_URL

export async function GET() {
  if (!siteUrl) {
    throw Error('Missing NEXT_PUBLIC_URL environment variable')
  }

  const ical = await createCalendar()
  return new Response(ical, {
    status: 200,
    headers: {
      'content-type': 'text/calendar',
      'cache-control': 's-maxage=31556952',
    },
  })
}

const createCalendar = async () => {
  const eventsAsIcalString = getUpcomingEvents().map(event => toIcal(event)).join("\n")
  return icalBase.replace("{{ EVENTS }}", eventsAsIcalString)
}

const toIcal = (event: Event) => `BEGIN:VEVENT
UID:${event.slug}
SUMMARY:${event.title}
LOCATION:${event.location ?? "Ukjent"}
DTSTAMP:${customDateFormat(event.start)}
DTSTART:${customDateFormat(event.start)}
DTEND:${customDateFormat(event.end)}
URL:${siteUrl}/fagdag/${event.slug}
END:VEVENT`

const icalBase = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OFFENTLIGPAASNO//NONSGML offentlig-paas.no//nb-NO
{{ EVENTS }}
END:VCALENDAR`

const customDateFormat = (when: Date) => `${when.getUTCFullYear()}${twoDigits(when.getUTCMonth() + 1)}${twoDigits(when.getUTCDate())}T${twoDigits(when.getUTCHours())}${twoDigits(when.getUTCMinutes())}00Z`

const twoDigits = (num: number) => num.toString().padStart(2, '0')
