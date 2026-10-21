import { describe, expect, it } from 'vitest'
import { lexicalScore, normalizeUrl } from './domain'

describe('bookmark domain helpers', () => {
  it('normalizes tracking parameters without changing the page', () => {
    expect(normalizeUrl('https://example.com/guide/?utm_source=newsletter&x=1#top')).toBe('https://example.com/guide?x=1')
  })
  it('scores lexical overlap as a similarity signal', () => {
    expect(lexicalScore('PSP custom firmware guide', 'PSP firmware installation')).toBeGreaterThan(0)
    expect(lexicalScore('cooking pizza', 'mechanical keyboard')).toBe(0)
  })
})
