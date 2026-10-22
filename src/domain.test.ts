import { describe, expect, it } from 'vitest'
import { bookmarkFromBrowserNode, lexicalScore, normalizeUrl } from './domain'

describe('bookmark domain helpers', () => {
  it('normalizes tracking parameters without changing the page', () => {
    expect(normalizeUrl('https://example.com/guide/?utm_source=newsletter&x=1#top')).toBe('https://example.com/guide?x=1')
  })
  it('scores lexical overlap as a similarity signal', () => {
    expect(lexicalScore('PSP custom firmware guide', 'PSP firmware installation')).toBeGreaterThan(0)
    expect(lexicalScore('cooking pizza', 'mechanical keyboard')).toBe(0)
  })
  it('maps a browser bookmark while preserving local metadata', () => {
    const item = bookmarkFromBrowserNode({ id: '42', title: 'Docs', url: 'https://www.example.com/docs', folder: 'Work', dateAdded: 1718668800000 }, { id: '42', title: 'Docs', url: 'https://www.example.com/docs', domain: 'example.com', description: 'Saved note', folder: 'Old', topics: ['Guides'], status: 'analyzed', addedAt: '2024-01-01', color: '#fff', initials: 'D', relatedCount: 2 })
    expect(item.domain).toBe('example.com')
    expect(item.folder).toBe('Work')
    expect(item.topics).toEqual(['Guides'])
    expect(item.status).toBe('analyzed')
  })
})
