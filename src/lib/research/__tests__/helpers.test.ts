import { describe, it, expect } from 'vitest'
import {
  getAllProjects,
  getProject,
  getOpenSurveys,
  getResponseRate,
  getWaveResponseRate,
  getSurveyResponseRate,
  findWaveForSurvey,
  getSurveyStatus,
  isSurveyLinkable,
} from '../helpers'
import { researchProjects } from '@/data/research'
import {
  SurveyStatus,
  ResearchStatus,
  type ResearchWave,
  type ExternalSurvey,
} from '../types'

describe('Research Helpers', () => {
  describe('getAllProjects', () => {
    it('returns projects sorted by lastUpdated descending', () => {
      const projects = getAllProjects()
      for (let i = 1; i < projects.length; i++) {
        const prev = projects[i - 1]!
        const curr = projects[i]!
        expect(new Date(prev.lastUpdated).getTime()).toBeGreaterThanOrEqual(
          new Date(curr.lastUpdated).getTime()
        )
      }
    })

    it('returns a copy that does not mutate the source', () => {
      const projects = getAllProjects()
      projects.pop()
      expect(getAllProjects().length).toBe(researchProjects.length)
    })
  })

  describe('getProject', () => {
    it('returns a project by slug', () => {
      const project = getProject('state-of-platforms')
      expect(project).toBeDefined()
      expect(project!.title).toBe('State of Platforms')
    })

    it('returns undefined for unknown slug', () => {
      expect(getProject('nonexistent')).toBeUndefined()
    })
  })

  describe('getOpenSurveys', () => {
    it('returns only open and linkable surveys', () => {
      const open = getOpenSurveys()
      for (const { survey } of open) {
        expect(getSurveyStatus(survey)).toBe(SurveyStatus.Open)
        expect(isSurveyLinkable(survey)).toBe(true)
      }
    })

    it('includes the parent project', () => {
      const open = getOpenSurveys()
      for (const { project } of open) {
        expect(project.slug).toBeTruthy()
      }
    })
  })

  describe('getResponseRate', () => {
    it('calculates percentage rounded to nearest integer', () => {
      expect(getResponseRate(35, 65)).toBe(54)
      expect(getResponseRate(45, 80)).toBe(56)
      expect(getResponseRate(1, 3)).toBe(33)
    })

    it('returns 0 when population is 0', () => {
      expect(getResponseRate(10, 0)).toBe(0)
    })

    it('returns 0 when population is negative', () => {
      expect(getResponseRate(10, -1)).toBe(0)
    })

    it('returns 100 when responses equal population', () => {
      expect(getResponseRate(50, 50)).toBe(100)
    })
  })

  describe('getWaveResponseRate', () => {
    it('derives rate from organizations and invited', () => {
      const wave: ResearchWave = {
        name: 'Wave 1',
        year: 2024,
        status: ResearchStatus.Published,
        organizations: 35,
        invited: 65,
      }
      expect(getWaveResponseRate(wave)).toBe(54)
    })

    it('returns null when invited is missing', () => {
      const wave: ResearchWave = {
        name: 'Wave 1',
        year: 2024,
        status: ResearchStatus.Published,
        organizations: 35,
      }
      expect(getWaveResponseRate(wave)).toBeNull()
    })

    it('returns null when organizations is missing', () => {
      const wave: ResearchWave = {
        name: 'Wave 1',
        year: 2024,
        status: ResearchStatus.Published,
        invited: 65,
      }
      expect(getWaveResponseRate(wave)).toBeNull()
    })
  })

  describe('getSurveyResponseRate', () => {
    it('returns responses, total, and rate', () => {
      const survey: ExternalSurvey = {
        title: 'Test',
        status: SurveyStatus.Open,
        responses: 10,
      }
      const result = getSurveyResponseRate(survey)
      expect(result.responses).toBe(10)
      expect(result.total).toBeGreaterThan(0)
      expect(result.rate).toBe(Math.round((10 / result.total) * 100))
    })

    it('defaults to 0 responses when undefined', () => {
      const survey: ExternalSurvey = {
        title: 'Test',
        status: SurveyStatus.Open,
      }
      const result = getSurveyResponseRate(survey)
      expect(result.responses).toBe(0)
      expect(result.rate).toBe(0)
    })
  })

  describe('findWaveForSurvey', () => {
    const waves: ResearchWave[] = [
      { name: 'Wave 1', year: 2024, status: ResearchStatus.Published },
      { name: 'Wave 2', year: 2026, status: ResearchStatus.Published },
    ]

    it('finds matching wave by waveName', () => {
      const survey: ExternalSurvey = {
        title: 'Survey',
        status: SurveyStatus.Closed,
        waveName: 'Wave 2',
      }
      expect(findWaveForSurvey(survey, waves)).toBe(waves[1])
    })

    it('returns undefined when waveName does not match', () => {
      const survey: ExternalSurvey = {
        title: 'Survey',
        status: SurveyStatus.Closed,
        waveName: 'Wave 99',
      }
      expect(findWaveForSurvey(survey, waves)).toBeUndefined()
    })

    it('returns undefined when waveName is not set', () => {
      const survey: ExternalSurvey = {
        title: 'Survey',
        status: SurveyStatus.Open,
      }
      expect(findWaveForSurvey(survey, waves)).toBeUndefined()
    })

    it('returns undefined when waves is undefined', () => {
      const survey: ExternalSurvey = {
        title: 'Survey',
        status: SurveyStatus.Closed,
        waveName: 'Wave 1',
      }
      expect(findWaveForSurvey(survey, undefined)).toBeUndefined()
    })
  })
})

describe('Research Data Invariants', () => {
  it('all projects have unique slugs', () => {
    const slugs = researchProjects.map(p => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('all wave names within a project are unique', () => {
    for (const project of researchProjects) {
      if (!project.waves) continue
      const names = project.waves.map(w => w.name)
      expect(new Set(names).size).toBe(names.length)
    }
  })

  it('all survey waveName references point to an existing wave', () => {
    for (const project of researchProjects) {
      const waveNames = new Set((project.waves ?? []).map(w => w.name))
      for (const survey of project.surveys ?? []) {
        if (survey.waveName) {
          expect(
            waveNames.has(survey.waveName),
            `Survey in project "${project.slug}" references wave "${survey.waveName}" which does not exist`
          ).toBe(true)
        }
      }
    }
  })

  it('waves with invited also have organizations', () => {
    for (const project of researchProjects) {
      for (const wave of project.waves ?? []) {
        if (wave.invited != null) {
          expect(
            wave.organizations,
            `Wave "${wave.name}" in "${project.slug}" has invited but no organizations`
          ).toBeDefined()
        }
      }
    }
  })

  it('wave organizations never exceeds invited', () => {
    for (const project of researchProjects) {
      for (const wave of project.waves ?? []) {
        if (wave.organizations != null && wave.invited != null) {
          expect(
            wave.organizations,
            `Wave "${wave.name}" in "${project.slug}": organizations (${wave.organizations}) > invited (${wave.invited})`
          ).toBeLessThanOrEqual(wave.invited)
        }
      }
    }
  })
})
