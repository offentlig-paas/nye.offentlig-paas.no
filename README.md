# Offentlig PaaS

Dette er den nye nettsiden til Offentlig PaaS. Den er bygget med [Tailwind CSS](https://tailwindcss.com) og [Next.js](https://nextjs.org).

## Lokal utvikling

For å komme i gang med denne malen, installer først npm-avhengighetene:

```bash
npm install
```

Kjør deretter utviklingsserveren:

```bash
npm run dev
```

Sist, åpne [http://localhost:3000](http://localhost:3000) i nettleseren din for å se nettsiden.

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

export default (props) => <ArticleLayout article={article} {...props} />

<!-- Innholdet til artikkelen -->
```

### Oppdatere medlemmer

Medlemmer er definert i `data/members.ts`. For å legge til et nytt medlem, legg til en ny oppføring i `members`-arrayet.

### Oppdatere prosjekter

Prosjekter er definert i `data/platforms.ts`. For å legge til en ny platform, legg til en ny oppføring i `platform`-arrayet.

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
