import { joinSession } from "@github/copilot-sdk/extension";

// ─── Event Manager — Fagdag Scaffolding & Checklist ─────────────────────────
//
// Scaffolds new events with correct TypeScript types and provides operational
// checklists for the full event lifecycle (before, during, after).
//
// The event data model is the most complex structure in the codebase — this
// extension eliminates manual type reference and reduces scaffolding errors.

import { readFile } from "node:fs/promises";
import { join } from "node:path";

function slugFromDate(dateStr) {
  return dateStr.replace(/T.*/, "");
}

const session = await joinSession({
  tools: [
    {
      name: "scaffold_event",
      description:
        "Generates a TypeScript event skeleton for the Offentlig PaaS fagdag system. " +
        "Returns the complete event object with correct types (Event, Item, SlackUser, " +
        "AttendanceType, Audience, ItemType) ready to paste into src/data/events.ts. " +
        "Use this when creating a new fagdag or event.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Event title, e.g. 'Offentlig PaaS Fagdag Observability'",
          },
          date: {
            type: "string",
            description: "Event date in YYYY-MM-DD format",
          },
          start_time: {
            type: "string",
            description: "Start time in HH:MM format (24h), e.g. '11:00'",
          },
          end_time: {
            type: "string",
            description: "End time in HH:MM format (24h), e.g. '15:00'",
          },
          location: {
            type: "string",
            description: "Physical location or 'Zoom' for digital events",
          },
          ingress: {
            type: "string",
            description: "Short description (1-2 sentences) shown on event cards",
          },
          description: {
            type: "string",
            description: "Longer description of the event",
          },
          max_capacity: {
            type: "number",
            description: "Maximum physical attendees. Omit for unlimited.",
          },
          attendance_types: {
            type: "array",
            items: { type: "string", enum: ["physical", "digital"] },
            description: "How people can attend. Default: ['physical', 'digital']",
          },
          has_social_event: {
            type: "boolean",
            description: "Include a social event (mingling) after the main event",
          },
          num_talks: {
            type: "number",
            description: "Number of talk placeholder slots to generate in the schedule. Default: 4",
          },
        },
        required: ["title", "date", "start_time", "end_time", "location", "ingress"],
      },
      handler: async (args) => {
        const slug = `${args.date}-${args.title.toLowerCase().replace(/[^a-z0-9æøå]+/gi, "-").replace(/(^-|-$)/g, "")}`;
        const attendanceTypes = args.attendance_types || ["physical", "digital"];
        const numTalks = args.num_talks || 4;
        const tz = "+02:00";

        const attendanceStr = attendanceTypes
          .map((t) => `AttendanceType.${t === "physical" ? "Physical" : "Digital"}`)
          .join(", ");

        // Build schedule
        const scheduleItems = [];

        scheduleItems.push(`    {
      time: '${args.start_time} - ${addMinutes(args.start_time, 30)}',
      title: 'Registrering og velkommen',
      speakers: [
        {
          name: 'ORGANIZER_NAME',
          org: 'ORGANIZER_ORG',
          url: 'https://offentlig-paas-no.slack.com/team/SLACK_ID',
        },
      ],
      type: ItemType.Registration,
    }`);

        let currentTime = addMinutes(args.start_time, 30);

        for (let i = 0; i < numTalks; i++) {
          const talkEnd = addMinutes(currentTime, 25);
          scheduleItems.push(`    {
      time: '${currentTime} - ${talkEnd}',
      title: 'TALK_TITLE_${i + 1}',
      description: 'TALK_DESCRIPTION',
      speakers: [
        {
          name: 'SPEAKER_NAME',
          org: 'SPEAKER_ORG',
          url: 'https://offentlig-paas-no.slack.com/team/SLACK_ID',
        },
      ],
      type: ItemType.Talk,
    }`);
          currentTime = talkEnd;

          if (i === Math.floor(numTalks / 2) - 1) {
            const breakEnd = addMinutes(currentTime, 60);
            scheduleItems.push(`    {
      time: '${currentTime} - ${breakEnd}',
      title: 'Lunsj',
      type: ItemType.Break,
    }`);
            currentTime = breakEnd;
          }
        }

        let socialEventStr = "";
        if (args.has_social_event) {
          socialEventStr = `
  socialEvent: {
    description: 'Bli med på mingling og nettverksbygging. En uformell anledning til å møte andre deltakere, dele erfaringer og bygge nettverk over pizza og drikke.',
    start: new Date('${args.date}T${addMinutes(args.end_time, 60)}${tz}'),
    location: '${args.location}',
  },`;
        }

        const capacityStr = args.max_capacity ? `\n  maxCapacity: ${args.max_capacity},` : "";

        const event = `{
  slug: '${slug}',
  title: '${args.title}',
  ingress: '${args.ingress}',${args.description ? `\n  description: '${args.description}',` : ""}
  start: new Date('${args.date}T${args.start_time}${tz}'),
  end: new Date('${args.date}T${args.end_time}${tz}'),
  audience: Audience.PublicSector,
  location: '${args.location}',${capacityStr}
  registration: {
    attendanceTypes: [${attendanceStr}],
  },
  organizers: [
    {
      name: 'ORGANIZER_NAME',
      org: 'ORGANIZER_ORG',
      url: 'https://offentlig-paas-no.slack.com/team/SLACK_ID',
    },
  ],${socialEventStr}
  schedule: [
${scheduleItems.join(",\n")}
  ],
}`;

        return [
          `✅ Event scaffolded: ${slug}`,
          "",
          "Add this to the events array in src/data/events.ts:",
          "(Insert at the TOP of the array — newest events first)",
          "",
          "```typescript",
          event,
          "```",
          "",
          "The file uses these imports (already present at top of events.ts):",
          "```typescript",
          "import type { Event } from '@/lib/events/types'",
          "import { AttachmentType, Audience, ItemType, AttendanceType } from '@/lib/events/types'",
          "```",
          "",
          "Replace all UPPERCASE placeholders:",
          "- ORGANIZER_NAME, ORGANIZER_ORG, SLACK_ID — Event organizers",
          "- TALK_TITLE_N, TALK_DESCRIPTION — Talk details",
          "- SPEAKER_NAME, SPEAKER_ORG — Speaker info",
          "",
          "SlackUser URLs follow the pattern: https://offentlig-paas-no.slack.com/team/<SLACK_USER_ID>",
        ].join("\n");
      },
    },

    {
      name: "event_checklist",
      description:
        "Returns the operational checklist for managing Offentlig PaaS events (fagdager). " +
        "Covers before, during, and after the event — registration, Slack channels, " +
        "reminders, feedback collection, and article writing. " +
        "Use this when planning or running a fagdag.",
      parameters: {
        type: "object",
        properties: {
          phase: {
            type: "string",
            enum: ["all", "before", "during", "after"],
            description: "Which phase of the event lifecycle. Default: 'all'.",
          },
        },
      },
      handler: async (args) => {
        const phase = args.phase || "all";
        const phases = {};

        phases.before = `
## Før arrangementet

### Planlegging
- [ ] Bestem tema, dato, sted og kapasitet
- [ ] Finn 4-6 foredragsholdere med relevant erfaring
- [ ] Bekreft lokale (AV-utstyr, streaming, lunsj, sosialt)
- [ ] Opprett event i src/data/events.ts (bruk scaffold_event)
- [ ] Kjør yarn run check for å verifisere typer

### Registrering (2-4 uker før)
- [ ] Verifiser at registrering er åpen (registration.disabled !== true)
- [ ] Test registreringsskjemaet som innlogget bruker
- [ ] Sjekk at maxCapacity er riktig satt (eller fjern for ubegrenset)

### Kommunikasjon (1-2 uker før)
- [ ] Opprett Slack-kanal via Admin → Slack Channel Manager
- [ ] Send invitasjon på #general i Slack-workspacet
- [ ] Del på LinkedIn / andre kanaler
- [ ] Send påminnelse 2-3 dager før (Admin → Send Reminder)

### Teknisk
- [ ] Test streaming-oppsett (Zoom/YouTube)
- [ ] Legg inn streaming-URL via Admin → Participant Info
- [ ] Sett opp opptak om ønskelig
`;

        phases.during = `
## Under arrangementet

### Start
- [ ] Oppdater oppmøte-status i Admin → Attendees (confirmed → attended)
- [ ] Marker no-shows etter registrering lukker
- [ ] Verifiser at streaming fungerer
- [ ] Del streaming-lenke i Slack-kanalen

### Under foredrag
- [ ] Ta bilder (mingling, presentasjoner, gruppebilder)
- [ ] Noter eventuelle endringer i programmet
- [ ] Del lenker og ressurser i Slack-kanalen

### Sosialt arrangement
- [ ] Bekreft deltakere for sosialt arrangement
- [ ] Legg ut bilder i Slack-kanalen
`;

        phases.after = `
## Etter arrangementet

### Samme dag / neste dag
- [ ] Last opp bilder via Admin → Photos
- [ ] Tagg bilder med foredragsholdere (Speaker Matcher)
- [ ] Send tilbakemeldingsforespørsel (Admin → Send Feedback Request)
- [ ] Del opptak-lenker i Slack-kanalen

### Innen en uke
- [ ] Sjekk tilbakemeldinger i Admin → Feedback
- [ ] Last opp presentasjoner (Admin → Agenda → Talk Attachments)
- [ ] Legg til recording-URLer i eventet (recordingUrl / attachments)
- [ ] Publiser YouTube-opptak om relevant

### Innen to uker
- [ ] Skriv oppsummeringsartikkel (bruk scaffold_article med content_plan "event-summary")
  - Intro med antall deltakere og organisasjoner
  - Høydepunkter og nøkkelfunn
  - Bilder fra arrangementet
  - Agenda med YouTube-lenker
  - Takk til arrangører og foredragsholdere
- [ ] Kjør artikkelen gjennom plain-language-no / plain-language-en
- [ ] Arkiver Slack-kanalen når det passer (Admin → Slack Channel Manager)

### Datatyper for referanse
Event-registreringer lagres i Sanity med status:
- confirmed → attended (oppmøtte)
- confirmed → no-show (ikke møtt)
- waitlist (venteliste)
- cancelled (avmeldt)

Tilbakemeldinger samles per foredrag (1-5 stjerner + kommentar) + helhetlig vurdering.
`;

        if (phase === "all") {
          return Object.values(phases).join("\n---\n");
        }
        if (phases[phase]) {
          return phases[phase];
        }
        return {
          textResultForLlm: `Ukjent fase '${phase}'. Gyldige: all, before, during, after`,
          resultType: "failure",
        };
      },
    },
  ],

  hooks: {
    onUserPromptSubmitted: async (input) => {
      const prompt = input.prompt.toLowerCase();

      const eventKeywords = [
        "fagdag", "event", "arrangement", "foredrag", "talk",
        "registrering", "registration", "agenda", "schedule",
        "program", "foredragsholder", "speaker",
      ];

      const isEventRelated = eventKeywords.some((kw) => prompt.includes(kw));
      if (!isEventRelated) return;

      return {
        additionalContext: `
[Event Manager Context — Offentlig PaaS Fagdager]

Du jobber med arrangementssystemet for Offentlig PaaS.

Verktøy:
- scaffold_event — Generer event-skjelett med riktige TypeScript-typer
- event_checklist — Sjekkliste for før/under/etter arrangement

Arrangementer defineres i src/data/events.ts som TypeScript-objekter.
Nøkkeltyper: Event, Item, SlackUser, ItemType (Talk/Panel/Break/Registration/Info/Workshop), AttendanceType (Physical/Digital), Audience.

SlackUser-format: { name: 'Navn', org: 'Organisasjon', url: 'https://offentlig-paas-no.slack.com/team/SLACK_ID' }

Registreringer og tilbakemeldinger lagres i Sanity CMS (ikke i koden).
Admin-verktøy: /admin/events/[slug] for påmelding, tilbakemeldinger, bilder, Slack-kanal.
`,
      };
    },
  },
});

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

await session.log("Event Manager ready — scaffold_event & event_checklist available");
