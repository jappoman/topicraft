export type AnalysisStatus = 'analyzed' | 'pending' | 'failed'

export type Bookmark = {
  id: string
  title: string
  url: string
  domain: string
  description: string
  folder: string
  topics: string[]
  status: AnalysisStatus
  addedAt: string
  color: string
  initials: string
  relatedCount: number
}

export const seedBookmarks: Bookmark[] = [
  { id: '1', title: 'The Ultimate PSP Custom Firmware Guide', url: 'pspunk.com/guide', domain: 'pspunk.com', description: 'A practical walkthrough for installing ARK-4 and getting the most from a PSP in 2024.', folder: 'Gaming', topics: ['PSP', 'Modding', 'Handheld consoles'], status: 'analyzed', addedAt: '2024-06-18', color: '#e9d5ff', initials: 'P', relatedCount: 4 },
  { id: '2', title: 'Building a RAG application from scratch', url: 'supabase.com/blog/rag', domain: 'supabase.com', description: 'A hands-on introduction to retrieval augmented generation, embeddings, and vector search.', folder: 'Read later', topics: ['AI engineering', 'Programming'], status: 'analyzed', addedAt: '2024-06-17', color: '#dbeafe', initials: 'S', relatedCount: 2 },
  { id: '3', title: 'How to make a perfect Neapolitan pizza', url: 'seriouseats.com/pizza', domain: 'seriouseats.com', description: 'The science behind a crisp, airy crust and a recipe tuned for a home oven.', folder: 'Cooking', topics: ['Cooking', 'Recipes'], status: 'analyzed', addedAt: '2024-06-15', color: '#fed7aa', initials: 'S', relatedCount: 1 },
  { id: '4', title: 'A visual introduction to transformers', url: 'jalammar.github.io/illustrated-transformer', domain: 'jalammar.github.io', description: 'An approachable visual explanation of attention and transformer architecture.', folder: 'AI research', topics: ['AI engineering', 'Machine learning'], status: 'analyzed', addedAt: '2024-06-13', color: '#cffafe', initials: 'J', relatedCount: 3 },
  { id: '5', title: 'The beginner’s guide to mechanical keyboards', url: 'switchandclick.com/guide', domain: 'switchandclick.com', description: 'A friendly overview of switches, keycaps, layouts, and building your first board.', folder: 'Projects', topics: ['Hardware', 'Guides'], status: 'pending', addedAt: '2024-06-12', color: '#dcfce7', initials: 'S', relatedCount: 0 },
  { id: '6', title: 'Making sense of the new Firefox extension APIs', url: 'developer.mozilla.org/extensions', domain: 'developer.mozilla.org', description: 'Reference documentation for WebExtensions, permissions, storage, and cross-browser APIs.', folder: 'Development', topics: ['Programming', 'Guides'], status: 'analyzed', addedAt: '2024-06-10', color: '#fee2e2', initials: 'M', relatedCount: 2 },
]

export const bookmarkFromBrowserNode = (node: { id: string; title: string; url: string; dateAdded?: number; folder?: string }, previous?: Bookmark): Bookmark => {
  let domain = 'Unknown site'
  try { domain = new URL(node.url).hostname.replace(/^www\./, '') } catch { domain = node.url.split('/')[0] || 'Unknown site' }
  const title = node.title.trim() || node.url
  return { id: node.id, title, url: node.url, domain, description: previous?.description ?? 'Bookmark imported from your browser.', folder: node.folder || 'Bookmarks', topics: previous?.topics ?? [], status: previous?.status ?? 'pending', addedAt: new Date(node.dateAdded ?? Date.now()).toISOString().slice(0, 10), color: previous?.color ?? '#dbeafe', initials: title.charAt(0).toUpperCase(), relatedCount: previous?.relatedCount ?? 0 }
}

export const topicCounts = (items: Bookmark[]) => Object.entries(items.flatMap((item) => item.topics).reduce<Record<string, number>>((acc, topic) => ({ ...acc, [topic]: (acc[topic] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1])

export const normalizeUrl = (raw: string) => {
  const input = raw.startsWith('http') ? raw : `https://${raw}`
  const url = new URL(input)
  const ignored = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid']
  ignored.forEach((key) => url.searchParams.delete(key))
  url.hash = ''
  return url.toString().replace(/\/$/, '').replace(/\/\?/, '?')
}

export const lexicalScore = (a: string, b: string) => {
  const left = new Set(a.toLowerCase().split(/\W+/).filter(Boolean))
  const right = new Set(b.toLowerCase().split(/\W+/).filter(Boolean))
  const overlap = [...left].filter((word) => right.has(word)).length
  return overlap / Math.max(1, new Set([...left, ...right]).size)
}
