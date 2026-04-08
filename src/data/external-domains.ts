export type ExternalDomainLabel =
  | 'Konsulent'
  | 'Leverandør'
  | 'Offentlig sektor'
  | 'Helse'
  | 'Personlig'
  | 'Fellesskap'

export const externalDomains: Record<string, ExternalDomainLabel> = {
  // Konsulentselskaper
  'acando.no': 'Konsulent',
  'accenture.com': 'Konsulent',
  'aneo.com': 'Konsulent',
  'avanade.com': 'Konsulent',
  'aztek.no': 'Konsulent',
  'bekk.no': 'Konsulent',
  'blank.no': 'Konsulent',
  'bouvet.no': 'Konsulent',
  'capgemini.com': 'Konsulent',
  'capraconsulting.no': 'Konsulent',
  'computas.com': 'Konsulent',
  'dfind.no': 'Konsulent',
  'edgeworks.no': 'Konsulent',
  'eyasys.no': 'Konsulent',
  'framit.no': 'Konsulent',
  'gabler.no': 'Konsulent',
  'goopen.no': 'Konsulent',
  'itc.no': 'Konsulent',
  'itonomi.com': 'Konsulent',
  'kantega.no': 'Konsulent',
  'knowit.no': 'Konsulent',
  'miles.no': 'Konsulent',
  'minus.no': 'Konsulent',
  'netcompany.com': 'Konsulent',
  'pwc.com': 'Konsulent',
  'pythonia.no': 'Konsulent',
  'redpill-linpro.com': 'Konsulent',
  'scienta.no': 'Konsulent',
  'sensconsulting.no': 'Konsulent',
  'solom.no': 'Konsulent',
  'stoltit.no': 'Konsulent',
  'sysco.no': 'Konsulent',
  'systek.no': 'Konsulent',
  'teamagile.no': 'Konsulent',
  'turbodata.no': 'Konsulent',
  'udp.no': 'Konsulent',
  'variant.no': 'Konsulent',
  'visito.no': 'Konsulent',
  'webstep.no': 'Konsulent',
  'zeppelin.no': 'Konsulent',
  'data-treehouse.com': 'Konsulent',

  // Leverandører (produkt- og teknologiselskaper)
  'amazon.com': 'Leverandør',
  'buypass.no': 'Leverandør',
  'databricks.com': 'Leverandør',
  'dips.no': 'Leverandør',
  'dnv.com': 'Leverandør',
  'eschergroup.com': 'Leverandør',
  'evry.com': 'Leverandør',
  'fintlabs.no': 'Leverandør',
  'ge.no': 'Leverandør',
  'gjensidige.no': 'Leverandør',
  'isovalent.com': 'Leverandør',
  'ksdigital.no': 'Leverandør',
  'sj.no': 'Leverandør',
  'sintef.no': 'Leverandør',
  'soprasteria.com': 'Leverandør',
  'tietoevry.com': 'Leverandør',
  'twoday.com': 'Leverandør',
  'visma.com': 'Leverandør',

  // Offentlig sektor (ikke-medlemmer)
  'ehelse.no': 'Offentlig sektor',

  // Personlige e-postleverandører
  'gmail.com': 'Personlig',
  'hotmail.com': 'Personlig',
  'hotmail.no': 'Personlig',
  'live.co.uk': 'Personlig',
  'live.no': 'Personlig',
  'mac.com': 'Personlig',
  'mail.com': 'Personlig',
  'outlook.com': 'Personlig',
  'pm.me': 'Personlig',
  'privaterelay.appleid.com': 'Personlig',
  'proton.me': 'Personlig',
  'yahoo.com': 'Personlig',

  // Fellesskap
  'offentlig-paas.no': 'Fellesskap',
  'bibsent.no': 'Fellesskap',
}
