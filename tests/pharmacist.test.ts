import { describe, expect, it } from 'vitest'
import { chatStars, parseRoleLine, usedPhrase } from '../src/ai/pharmacist'

describe('pharmacist role-play', () => {
  it('parses EN/AR lines and END', () => {
    expect(parseRoleLine('EN: Here you go.\nAR: تفضّل.')).toEqual({ en: 'Here you go.', ar: 'تفضّل.', end: false })
    expect(parseRoleLine('EN: Bye!\nAR: مع السلامة\nEND').end).toBe(true)
    expect(parseRoleLine('Sorry, can you repeat?')).toEqual({ en: 'Sorry, can you repeat?', ar: '', end: false })
  })
  it('detects a used phrase inside a longer reply', () => {
    expect(usedPhrase("I'm allergic to penicillin.", 'yes i am allergic to penicillin sorry')).toBe(true)
    expect(usedPhrase('Can I pay by card?', 'can i pay by card')).toBe(true)
    expect(usedPhrase('Can I pay by card?', 'I want to pay cash')).toBe(false)
  })
  it('needs 3 turns to pass, all phrases for 3 stars', () => {
    expect(chatStars(2, 4, 4)).toBe(1)
    expect(chatStars(3, 0, 4)).toBe(2)
    expect(chatStars(5, 4, 4)).toBe(3)
  })
})
