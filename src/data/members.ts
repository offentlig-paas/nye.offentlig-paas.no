import { Member } from "@/lib/members";
import logoSpk from '@/images/logos/spk.svg'
import logoStatkraft from '@/images/logos/statkraft_icon.svg'
import logoStatnettSf from '@/images/logos/statnett.svg'
import logoArbeidstilsynet from '@/images/logos/arbeidstilsynet.svg'

export const members: Member[] = [
  new Member({
    name: 'Nav',
    type: 'Stat',
    github: 'navikt',
    linkedinUrl: 'https://www.linkedin.com/company/nav',
    logoBackgroundColor: '#C20000',
  }),
  new Member({
    name: 'Skatteetaten',
    type: 'Stat',
    github: 'Skatteetaten',
    linkedinUrl: 'https://www.linkedin.com/company/skatteetaten/',
    logoBackgroundColor: '#000000',
  }),
  new Member({
    name: 'Kartverket',
    type: 'Stat',
    github: 'kartverket',
    linkedinUrl: 'https://www.linkedin.com/company/kartverketno/'
  }),
  new Member({
    name: 'Politiet',
    type: 'Stat',
    github: 'politiet',
    linkedinUrl: 'https://www.linkedin.com/company/politiets-it-enhet/'
  }),
  new Member({
    name: 'Brreg',
    type: 'Forvaltningsorgan',
    github: 'brreg',
    linkedinUrl: 'https://www.linkedin.com/company/bronnoysundregistrene/'
  }),
  new Member({
    name: 'NRK',
    type: 'Andre',
    github: 'nrkno',
    linkedinUrl: 'https://www.linkedin.com/company/nrk/',
    logoBackgroundColor: '#000000',
  }),
  new Member({
    name: 'Husbanken',
    type: 'Stat',
    github: 'husbanken',
    linkedinUrl: 'https://www.linkedin.com/company/husbanken/'
  }),
  new Member({
    name: 'Telenor',
    type: 'Selskap',
    github: 'telenornorway',
    linkedinUrl: 'https://www.linkedin.com/company/telenor-group/'
  }),
  new Member({
    name: 'Equinor',
    type: 'Selskap',
    github: 'equinor',
    linkedinUrl: 'https://www.linkedin.com/company/equinor/'
  }),
  new Member({
    name: 'Nasjonalbiblioteket',
    type: 'Forvaltningsorgan',
    github: 'NationalLibraryOfNorway',
    linkedinUrl: 'https://www.linkedin.com/company/nasjonalbiblioteket-the-national-library-of-norway/'
  }),
  new Member({
    name: 'Statens Vegvesen',
    type: 'Forvaltningsorgan',
    github: 'vegvesen',
    linkedinUrl: 'https://www.linkedin.com/company/statens-vegvesen/'
  }),
  new Member({
    name: 'Tolldirektoratet',
    type: 'Stat',
    github: 'tolletaten',
    linkedinUrl: 'https://www.linkedin.com/company/tolletaten1/'
  }),
  new Member({
    name: 'SSB',
    type: 'Stat',
    github: 'statisticsnorway',
    linkedinUrl: 'https://www.linkedin.com/company/statistics-norway/'
  }),
  new Member({
    name: 'Lånekassen',
    type: 'Forvaltningsorgan',
    github: 'lanekassen',
    linkedinUrl: 'https://www.linkedin.com/company/statens-lanekasse-for-utdanning/'
  }),
  new Member({
    name: 'SPK',
    type: 'Forvaltningsorgan',
    logo: logoSpk,
    linkedinUrl: 'https://www.linkedin.com/company/statens-pensjonskasse/'
  }),
  new Member({
    name: 'Statkraft',
    type: 'Selskap',
    logo: logoStatkraft,
    linkedinUrl: 'https://www.linkedin.com/company/statkraft/'
  }),
  new Member({
    name: 'Entur',
    type: 'Selskap',
    github: 'entur',
    linkedinUrl: 'https://www.linkedin.com/company/entur-as/',
    logoBackgroundColor: '#181C56',
  }),
  new Member({
    name: 'Vy',
    type: 'Selskap',
    github: 'nsbno',
    linkedinUrl: 'https://www.linkedin.com/company/vygruppen/'
  }),
  new Member({
    name: 'MET',
    type: 'Forvaltningsorgan',
    github: 'metno',
    linkedinUrl: 'https://www.linkedin.com/company/met-norway/'
  }),
  new Member({
    name: 'NIVA',
    type: 'Forvaltningsorgan',
    linkedinUrl: 'https://www.linkedin.com/company/niva/'
  }),
  new Member({
    name: 'USIT',
    type: 'Forvaltningsorgan',
    github: 'unioslo',
    linkedinUrl: 'https://www.linkedin.com/school/universitetet-i-oslo/'
  }),
  new Member({
    name: 'Mattilsynet',
    type: 'Forvaltningsorgan',
    github: 'mattilsynet',
    linkedinUrl: 'https://www.linkedin.com/company/mattilsynet-norwegian-food-safety-authority/'
  }),
  new Member({
    name: 'Digdir',
    type: 'Stat',
    github: 'digdir',
    linkedinUrl: 'https://www.linkedin.com/company/digitaliseringsdirektoratet/'
  }),
  new Member({
    name: 'Sikt',
    type: 'Stat',
    github: 'sikt-no',
    linkedinUrl: 'https://www.linkedin.com/company/isikt/'
  }),
  new Member({
    name: 'Oslo Kommune',
    type: 'Kommune',
    github: 'oslokommune',
    linkedinUrl: 'https://www.linkedin.com/company/oslo-kommune/'
  }),
  new Member({
    name: 'Norsk Helsenett',
    type: 'Andre',
    github: 'NorskHelsenett',
    linkedinUrl: 'https://www.linkedin.com/company/norsk-helsenett-sf/',
    logoBackgroundColor: '#035A46',
  }),
  new Member({
    name: 'Buypass',
    type: 'Selskap',
    github: 'buypass',
    linkedinUrl: 'https://www.linkedin.com/company/buypass-as/'
  }),
  new Member({
    name: 'UDI',
    type: 'Stat',
    linkedinUrl: 'https://www.linkedin.com/company/udi/'
  }),
  new Member({
    name: 'Domstolene',
    type: 'Stat',
    github: 'domstolene',
    linkedinUrl: 'https://www.linkedin.com/company/domstoladministrasjonen/'
  }),
  new Member({
    name: 'Norsk Tipping',
    type: 'Andre',
    github: 'norsk-tipping',
    linkedinUrl: 'https://www.linkedin.com/company/norsk-tipping/'
  }),
  new Member({
    name: 'Å Energi',
    type: 'Selskap',
    github: 'aenergi',
    linkedinUrl: 'https://www.linkedin.com/company/%C3%A5-energi/'
  }),
  new Member({
    name: 'Fiskeridirektoratet',
    type: 'Stat',
    linkedinUrl: 'https://www.linkedin.com/company/fiskeridirektoratet-fiskeridir-no-/'
  }),
  new Member({
    name: 'Sykehuspartner',
    type: 'Andre',
    github: 'sykehuspartner',
    linkedinUrl: 'https://www.linkedin.com/company/sykehuspartner/'
  }),
  new Member({
    name: 'Posten Bring',
    type: 'Selskap',
    github: 'bring',
    linkedinUrl: 'https://www.linkedin.com/company/postenbring/'
  }),
  new Member({
    name: 'Digipost',
    type: 'Selskap',
    github: 'digipost',
    linkedinUrl: 'https://www.linkedin.com/company/postenbring/'
  }),
  new Member({
    name: 'DSB',
    type: 'Stat',
    linkedinUrl: 'https://www.linkedin.com/company/direktoratet-for-samfunnssikkerhet-og-beredskap-dsb-/'
  }),
  new Member({
    name: 'Arkivverket',
    type: 'Forvaltningsorgan',
    github: 'arkivverket',
    linkedinUrl: 'https://www.linkedin.com/company/arkivverket/'
  }),
  new Member({
    name: 'Arbeidstilsynet',
    type: 'Stat',
    logo: logoArbeidstilsynet,
    linkedinUrl: 'https://www.linkedin.com/company/arbeidstilsynet'
  }),
  new Member({
    name: 'Statnett SF',
    type: 'Andre',
    github: 'statnett',
    logo: logoStatnettSf,
    linkedinUrl: 'https://www.linkedin.com/company/statnett-sf/',
  }),
  new Member({
    name: 'KS Digital',
    type: 'Selskap',
    github: 'ks-no',
    linkedinUrl: 'https://www.linkedin.com/company/ksdigital-norge/',
  })
];
