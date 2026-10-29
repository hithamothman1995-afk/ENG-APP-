import { describe, expect, it, vi } from 'vitest'
import { genderOf } from '../src/audio/speech'

describe('genderOf', () => {
  it('knows common iPhone, Android and desktop voices', () => {
    expect(genderOf('Samantha')).toBe('female')
    expect(genderOf('Daniel (Enhanced)')).toBe('male')
    expect(genderOf('Google UK English Female')).toBe('female')
    expect(genderOf('Google UK English Male')).toBe('male')
    expect(genderOf('Microsoft David - English (United States)')).toBe('male')
    expect(genderOf('en-us-x-iom-local')).toBe('male')
    expect(genderOf('en-us-x-sfg-network')).toBe('female')
  })

  it('returns null when the name says nothing', () => {
    expect(genderOf('Google US English')).toBeNull()
  })
})

describe('voiceFor', () => {
  it('gives Maya a female voice and Sam a male one, never a novelty voice', async () => {
    const list = ['Zarvox', 'Albert', 'Samantha', 'Daniel', 'Eddy (English (US))', 'Karen'].map((name) => ({
      name,
      lang: name === 'Daniel' || name === 'Karen' ? 'en-GB' : 'en-US',
      localService: true,
    }))
    const fake = { getVoices: () => list, addEventListener: () => {} }
    const g = globalThis as unknown as Record<string, unknown>
    g.window = { speechSynthesis: fake, SpeechSynthesisUtterance: class {} }
    const { voiceFor, warmUpVoices } = (vi.resetModules(), await import('../src/audio/speech'))
    warmUpVoices()
    expect(voiceFor(0, 'female').voice?.name).toBe('Samantha')
    expect(voiceFor(1, 'male').voice?.name).toBe('Daniel')
    expect(voiceFor(1, 'male').pitch).toBe(1)
    delete g.window
  })
})
