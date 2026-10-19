import { describe, it, expect } from 'vitest'
import {
  getConsentContact,
  getExportColumns,
  getVisibleQuestionIds,
  getVisibleSectionIds,
  validateSurveyDefinition,
} from '@/lib/surveys/helpers'
import { SurveyStatus, type SurveyAnswer } from '@/lib/surveys/types'
import { aiAgents2027 } from '../ai-agents-2027'
import { stateOfPlatforms2027 } from '../state-of-platforms-2027'

const map = (pairs: [string, string | string[]][]) =>
  new Map<string, SurveyAnswer>(
    pairs.map(([questionId, value]) => [questionId, { questionId, value }])
  )

describe.each([aiAgents2027, stateOfPlatforms2027])('$slug', survey => {
  it('is valid and has the expected status', () => {
    expect(validateSurveyDefinition(survey)).toEqual([])
    expect(survey.status).toBe(
      survey === aiAgents2027 ? SurveyStatus.Open : SurveyStatus.Pilot
    )
    expect(survey.consent.fullText).toContain('foreningen Offentlig PAAS')
  })

  it('has no ":" in matrix codes (used as row:column separator)', () => {
    for (const q of survey.sections.flatMap(s => s.questions)) {
      if (q.type !== 'matrix') continue
      for (const v of [...q.rows, ...q.options].map(o => o.value)) {
        expect(v).not.toContain(':')
      }
    }
  })
})

describe('AI Agents Wave 2 routing', () => {
  const contactIds = ['q24-email', 'q24-later-rounds']
  const count = (answers: Map<string, SurveyAnswer>) =>
    [...getVisibleQuestionIds(aiAgents2027.sections, answers)].filter(
      id => !contactIds.includes(id)
    ).length

  it('matches the question counts in the instrument', () => {
    expect(count(map([['q8-personal-use', 'no']]))).toBe(23)
    expect(
      count(
        map([
          ['q8-personal-use', 'no'],
          ['q20-concerns', ['skill-loss']],
        ])
      )
    ).toBe(24)
    expect(
      count(
        map([
          ['q8-personal-use', 'yes'],
          ['q10b-agent-production', 'no-agents'],
        ])
      )
    ).toBe(28)
    expect(
      count(
        map([
          ['q8-personal-use', 'yes'],
          ['q10b-agent-production', 'regular-prod'],
          ['q11-integrations', ['scm']],
          ['q20-concerns', ['skill-loss']],
        ])
      )
    ).toBe(31)
  })

  it('has four columns in the Q26b matrix', () => {
    const q = aiAgents2027.sections
      .flatMap(s => s.questions)
      .find(q => q.id === 'q26b-system-access')
    expect(q?.type === 'matrix' && q.options.map(o => o.value)).toEqual([
      'none',
      'read',
      'read-write',
      'unknown',
    ])
  })

  it('shows the contact page only after yes to the interview', () => {
    const sections = (interview: string) =>
      getVisibleSectionIds(
        aiAgents2027.sections,
        map([['q24-interview', interview]])
      )
    expect(sections('yes')).toContain('contact')
    expect(sections('no')).not.toContain('contact')
  })

  it('ends the survey when there are no developers', () => {
    const ids = getVisibleSectionIds(
      aiAgents2027.sections,
      map([['q4-dev-count', 'none']])
    )
    expect(ids).toEqual(['context'])
  })

  it('shows Q20b only after skill-loss', () => {
    const without = getVisibleQuestionIds(
      aiAgents2027.sections,
      map([['q20-concerns', ['security']]])
    )
    expect(without.has('q20b-skill-loss')).toBe(false)
    const withIt = getVisibleQuestionIds(
      aiAgents2027.sections,
      map([['q20-concerns', ['skill-loss']]])
    )
    expect(withIt.has('q20b-skill-loss')).toBe(true)
  })
})

describe('State of Platforms Wave 3 routing', () => {
  it('skips platform questions and the maturity page without a platform', () => {
    const answers = map([
      ['q7-platform', 'Nei'],
      ['q14-kubernetes', 'Nei'],
    ])
    const sections = getVisibleSectionIds(
      stateOfPlatforms2027.sections,
      answers
    )
    expect(sections).not.toContain('maturity')
    const ids = getVisibleQuestionIds(stateOfPlatforms2027.sections, answers)
    for (const id of [
      'q8-platform-name',
      'q15-distributions',
      'q32-ai-capabilities',
      'q35-agent-interfaces',
    ]) {
      expect(ids.has(id)).toBe(false)
    }
    expect(ids.has('q34-platform-role')).toBe(true)
  })

  it('shows Q33b only for external AI services', () => {
    const visible = (q32: string[]) =>
      getVisibleQuestionIds(
        stateOfPlatforms2027.sections,
        map([
          ['q7-platform', 'Ja'],
          ['q32-ai-capabilities', q32],
        ])
      ).has('q33b-inference-region')
    expect(visible(['gpu-k8s'])).toBe(false)
    expect(visible(['ai-gateway', 'gpu-k8s'])).toBe(true)
    expect(visible(['cloud-llm-access'])).toBe(true)
  })

  it('matches the question counts in the instrument', () => {
    const count = (q7: string, q14: string) =>
      getVisibleQuestionIds(
        stateOfPlatforms2027.sections,
        map([
          ['q7-platform', q7],
          ['q14-kubernetes', q14],
          ['q32-ai-capabilities', ['cloud-llm-access']],
        ])
      ).size
    expect(count('Ja', 'Ja')).toBe(39)
    expect(count('Ja', 'Nei')).toBe(33)
    expect(count('Nei', 'Ja')).toBe(26)
    expect(count('Nei', 'Nei')).toBe(20)
  })

  it('keeps the export column order expected by aggregate.py', () => {
    expect(getExportColumns(stateOfPlatforms2027).map(c => c.header)).toEqual([
      'Organisasjon',
      'Type organisasjon',
      'Ansatte',
      'Budsjett (MNOK)',
      'Hva er din primærrolle?',
      'Har dere en applikasjonsplattform?',
      'Har plattformen deres et navn?',
      'Hvorfor lager dere plattform?',
      'Hvilke selvbetjente tjenester består plattformen deres av?',
      'Ca. hvor mange applikasjonsteam benytter seg av plattformen deres i dag?',
      'Topp tre programmeringsspråk for applikasjoner?',
      'Hvordan allokeres ansatte og midler til plattformfunksjoner',
      'Hvordan oppdager brukere interne plattformer og plattformfunksjonalitet?',
      'Hvordan benytter brukere plattformfunksjonalitet?',
      'Hvordan planlegges, prioriteres, utvikles og vedlikeholdes plattformer og deres funksjonalitet?',
      'Hva er prosessen for å samle inn og lære av tilbakemeldinger?',
      'Bruker dere Kubernetes?',
      'Hvilke Kubernetes distribusjoner bruker dere?',
      'Hvor mange år har dere kjørt Kubernetes i produksjon?',
      'Hvor mange Kubernetes clustere har dere?',
      'Hvor mange applikasjoner i produksjon har dere på Kubernetes?',
      'Utvikler dere egne Kubernetes operators?',
      'Kjører dere databaser i Kubernetes?',
      'Bruker dere sky for plattformen deres?',
      'Hva er deres primære sky for applikasjoner?',
      'Brukere dere flere sky-leverandører?',
      'Hvor mange år har dere kjørt applikasjoner i sky?',
      'Benytter dere serverless funksjoner?',
      'Hva bruker dere for overvåking av applikasjoner?',
      'Hva bruker dere for pakking av applikasjoner?',
      'Hva bruker dere for deploy av applikasjoner?',
      'Hva bruker dere for nettverksikkerhet?',
      'Hva bruker dere for applikasjonsikkerhet?',
      'Hva bruker dere for infrastruktur-automatisering?',
      'Deltok organisasjonen din i plattformundersøkelsen i 2023/2024 eller 2025/2026?',
      ...[
        'q32-ai-capabilities',
        'q33b-inference-region',
        'q34-platform-role',
        'q35-agent-interfaces',
        'q37-ai-changes',
        'q38-ai-barrier',
      ].map(
        id =>
          stateOfPlatforms2027.sections
            .flatMap(s => s.questions)
            .find(q => q.id === id)!.title
      ),
    ])
  })

  it('exports every question exactly once', () => {
    const exported = getExportColumns(stateOfPlatforms2027).flatMap(c =>
      c.question ? [c.question.id] : []
    )
    const all = stateOfPlatforms2027.sections
      .flatMap(s => s.questions)
      .map(q => q.id)
      .filter(id => id !== 'kontakt')
    expect([...exported].sort()).toEqual([...all].sort())
  })
})

describe('per-wave data controller', () => {
  it('uses the association for new waves and keeps earlier waves unchanged', () => {
    expect(getConsentContact(aiAgents2027.slug)?.dataController).toBe(
      'foreningen Offentlig PAAS, ved styreleder'
    )
    expect(getConsentContact(stateOfPlatforms2027.slug)?.dataController).toBe(
      'foreningen Offentlig PAAS, ved styreleder'
    )
    expect(getConsentContact('ai-agents-2026')?.dataController).toBe(
      'Hans Kristian Flaatten (styreleder, Offentlig PaaS)'
    )
  })
})
