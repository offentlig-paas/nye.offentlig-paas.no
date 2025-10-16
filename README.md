# Offentlig PaaS

Nettside for Offentlig PaaS - et samarbeid mellom offentlige virksomheter om deling av kunnskap og erfaring med plattformutvikling og DevOps-praksis.

## Hovedfunksjoner

- 📝 **Artikler** - MDX-baserte blogginnlegg om teknologi og plattformutvikling
- 📅 **Fagdager** - Arrangement med påmelding, program og foredragsholdere
- 👥 **Medlemsoversikt** - Oversikt over medlemsorganisasjoner
- 🔐 **Slack OAuth** - Autentisering via Slack workspace
- 📊 **Admin-portal** - Administrere påmeldinger, sende påminnelser, og behandle foredrag
- 📎 **Presentasjonsopplasting** - Foredragsholdere kan laste opp slides
- 💬 **Slack-integrasjon** - Slack-kanaler og notifikasjoner for arrangement

## Lokal utvikling

For å komme i gang med denne malen, installer først avhengighetene:

```bash
yarn install
```

Konfigurer miljøvariabler:

```bash
cp .env.example .env.local
# Rediger .env.local med dine verdier
```

Kjør deretter utviklingsserveren:

```bash
yarn dev
```

Sist, åpne [https://localhost:3000](https://localhost:3000) i nettleseren din for å se nettsiden.

**Merk:** Utviklingsserveren kjører automatisk med HTTPS og selvgenererte sertifikater - ingen ekstra konfigurasjon nødvendig.

### Miljøvariabler

Følgende miljøvariabler må konfigureres for full funksjonalitet:

#### NextAuth.js v5

- `AUTH_SECRET` - Hemmelig nøkkel for JWT-kryptering (generer med `openssl rand -base64 32`)
- `AUTH_URL` - Base URL for applikasjonen (f.eks. `https://localhost:3000`) - **kun nødvendig i produksjon**

#### Slack OAuth & API

- `SLACK_CLIENT_ID` - Slack OAuth app client ID
- `SLACK_CLIENT_SECRET` - Slack OAuth app client secret
- `SLACK_BOT_TOKEN` - Slack bot token for admin-sjekking og meldingsutsending

#### Sanity CMS

- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Sanity project ID (for client-side)
- `NEXT_PUBLIC_SANITY_DATASET` - Sanity dataset (vanligvis 'production')
- `SANITY_API_TOKEN` - Sanity API token med skrivetilgang (for server-side)
- `SANITY_STUDIO_PROJECT_ID` - Sanity project ID (for Studio)
- `SANITY_STUDIO_DATASET` - Sanity dataset (for Studio)

#### URL-konfigurasjon (produksjon)

- `NEXT_PUBLIC_URL` - Base URL for applikasjonen (brukes i meldinger til foredragsholdere)

**Viktig:** I development mode blokkeres Slack-meldinger hvis disse ikke er satt til produksjons-URL for å unngå å sende localhost-lenker.

Se `.env.example` for eksempler.

**Merk:** I utvikling vil NextAuth automatisk sette `AUTH_URL` til `https://localhost:3000`, så denne kan utelates lokalt.

### Slack OAuth Setup

For å sette opp Slack OAuth:

1. Gå til [Slack API](https://api.slack.com/apps) og opprett en ny app
2. Under "OAuth & Permissions", legg til følgende scopes:
   - `openid`
   - `email`
   - `profile`
   - `users:read` (for å hente brukerinfo)
   - `usergroups:read` (for å sjekke admin-grupper)
3. Under "OAuth & Permissions", legg til redirect URL:
   - `https://localhost:3000/api/auth/callback/slack` (for lokal utvikling)
   - `https://yourdomain.com/api/auth/callback/slack` (for produksjon)
4. Kopier Client ID og Client Secret til miljøvariabler

## Arkitektur

### API og Type Safety

Bruker **tRPC v11** for type-safe API-kall mellom klient og server:

- **Routers:** `src/server/routers/` - Type-safe endepunkter med Zod-validering
- **Client:** `src/lib/trpc/client.ts` - Type-safe client med React Query
- **Access control:** `publicProcedure`, `protectedProcedure`, `adminProcedure`, `adminEventProcedure`

**REST endepunkter bevart:**

- NextAuth OAuth (`/api/auth`)
- File uploads (`/api/talk-attachments`, `/api/admin/events/[slug]/talk-attachments`)
- Full CRUD på events og speaker updates (kun dev)
- Slack avatar proxy
- User deletion

### Autentisering

Bruker NextAuth.js v5 med Slack OAuth. Brukere logger inn med Slack workspace-kontoen sin.

**Admin-tilgang:** Workspace-admins i Slack eller medlemmer av "styret" usergroup får automatisk admin-rettigheter.

### Datalagring

- **Påmeldinger:** JSON-filer i `data/registrations/` (gitignored for personvern)
- **Presentasjoner:** Sanity CMS for filopplasting
- **Arrangement:** Statisk definert i `src/data/events.ts`

### Slack-integrasjon

- **Autentisering:** OAuth for innlogging
- **Admin-sjekk:** Bot token verifiserer admin-status via Slack API
- **Notifikasjoner:** Sender påminnelser til deltakere og foredragsholdere
- **Kanaler:** Oppretter og administrerer arrangement-kanaler

### Utviklingskommandoer

```bash
yarn dev             # Utviklingsserver med HTTPS (https://localhost:3000)
yarn build           # Produksjonsbygg
yarn start           # Start produksjonsserver
yarn lint            # ESLint sjekking
yarn format          # Prettier formatering
yarn typecheck       # TypeScript sjekking
```

### VS Code

Hvis du bruker Visual Studio Code, anbefaler vi å installere følgende utvidelser for best mulig utviklingsopplevelse.
Det gjøres enkelt ved å godta popupen "Do you want to install the recommended extensions [..]?" når prosjektet åpnes.

- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Headwind](https://marketplace.visualstudio.com/items?itemName=heybourn.headwind)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [TypeScript](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)
- [Next.js](https://marketplace.visualstudio.com/items?itemName=foxundermoon.next-js)
- [MDX](https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx)

## Vanlige oppgaver

### Skrive artikler

Artikler er skrevet i MDX og lagret i `app/artikkel/`. For å legge til en ny artikkel, lag en ny mappe med en `page.mdx`-fil i, navnet på mappen vil bli URL-en til artikkelen.

MDX er en kombinasjon av Markdown og JSX. For å legge til bilder, legg bildene i samme mappe som `page.mdx`-filen og importer dem øverst i filen. For å legge til et bilde i artikkelen, bruk `<Image src={bilde} alt="" />`.

`page.mdx`-filen følger denne malen:

```mdx
import { ArticleLayout } from '@/components/ArticleLayout'

export const article = {
  author: 'Kari Nordmann',
  date: '2024-MM-DD',
  title: 'Tittel på artikkelen',
  description: 'To tre setninger som beskriver hva artikkelen handler om.',
}

export const metadata = {
  title: article.title,
  description: article.description,
}

export default props => <ArticleLayout article={article} {...props} />

<!-- Innholdet til artikkelen -->
```

### Oppdatere medlemmer

Medlemmer er definert i `data/members.ts`. For å legge til et nytt medlem, legg til en ny oppføring i `members`-arrayet.

### Oppdatere prosjekter

Prosjekter er definert i `data/platforms.ts`. For å legge til en ny platform, legg til en ny oppføring i `platform`-arrayet.

### Legge til arrangement

Arrangement er definert i `src/data/events.ts`. Legg til en ny oppføring med program, foredragsholdere, og metadata.

## Admin-funksjoner

Administratorer har tilgang til `/admin` hvor de kan:

- 📋 Se alle påmeldinger til arrangement
- ✅ Endre påmeldingsstatus (bekreftet, venteliste, deltok)
- 📊 Behandle deltakerinfo (allergier, preferanser)
- 💬 Sende påminnelser til deltakere via Slack
- 🎤 Sende påminnelser til foredragsholdere
- 📎 Administrere presentasjonsopplastinger
- 🔗 Opprette og administrere Slack-kanaler for arrangement

**Sikkerhet:** Slack-notifikasjoner blokkeres automatisk i development mode for å hindre at localhost-URLer sendes til brukere.

## Lisens

Innhold på denne nettsiden er lisensiert under [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

Kode for denne nettsiden er lisensiert under [MIT License](LICENSE).

Template som denne nettsiden er basert på er lisensiert under [Tailwind UI license](https://tailwindui.com/license).

## Lær mer

For å lære mer om teknologiene som er brukt i denne malen, se følgende ressurser:

- [Tailwind CSS](https://tailwindcss.com/docs) - the official Tailwind CSS documentation
- [Next.js](https://nextjs.org/docs) - the official Next.js documentation
- [Headless UI](https://headlessui.dev) - the official Headless UI documentation
- [MDX](https://mdxjs.com) - the MDX documentation
