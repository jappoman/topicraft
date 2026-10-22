import { bookmarkFromBrowserNode, Bookmark } from './domain'

export type BrowserBookmarkNode = { id: string; title: string; url?: string; parentId?: string; dateAdded?: number; children?: BrowserBookmarkNode[] }

type BookmarkApi = { bookmarks?: { getTree: () => Promise<BrowserBookmarkNode[]>; onCreated?: { addListener: (cb: unknown) => void }; onRemoved?: { addListener: (cb: unknown) => void }; onChanged?: { addListener: (cb: unknown) => void }; onMoved?: { addListener: (cb: unknown) => void } }; storage?: { local?: { get: (key: string) => Promise<Record<string, Bookmark[]>>; set: (value: Record<string, Bookmark[]>) => Promise<void> } } }

export const getBrowserApi = (): BookmarkApi | undefined => {
  const root = globalThis as typeof globalThis & { browser?: BookmarkApi; chrome?: BookmarkApi }
  return root.browser ?? root.chrome
}

export async function readBookmarkTree(): Promise<BrowserBookmarkNode[]> {
  const api = getBrowserApi()
  if (!api?.bookmarks?.getTree) return []
  return api.bookmarks.getTree()
}

export const isExtensionContext = () => Boolean(getBrowserApi()?.bookmarks?.getTree)

export const flattenBookmarkTree = (roots: BrowserBookmarkNode[]) => {
  const result: Array<{ id: string; title: string; url: string; dateAdded?: number; folder: string }> = []
  const visit = (nodes: BrowserBookmarkNode[], folder = 'Bookmarks') => nodes.forEach((node) => { if (node.url) result.push({ id: node.id, title: node.title, url: node.url, dateAdded: node.dateAdded, folder }); if (node.children) visit(node.children, node.title || folder) })
  visit(roots)
  return result
}

const STORAGE_KEY = 'topicraft.bookmarks'
export async function loadSavedBookmarks(): Promise<Bookmark[] | undefined> {
  const storage = getBrowserApi()?.storage?.local
  if (storage) return (await storage.get(STORAGE_KEY))[STORAGE_KEY]
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) as Bookmark[] : undefined
}
export async function saveBookmarks(items: Bookmark[]) {
  const storage = getBrowserApi()?.storage?.local
  if (storage) { await storage.set({ [STORAGE_KEY]: items }); return }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}
export async function syncBookmarks(previous: Bookmark[] = []) {
  const tree = await readBookmarkTree()
  const previousById = new Map(previous.map((item) => [item.id, item]))
  const items = flattenBookmarkTree(tree).map((node) => bookmarkFromBrowserNode(node, previousById.get(node.id)))
  await saveBookmarks(items)
  return items
}

export function subscribeToBookmarkChanges(onChange: () => void) {
  const bookmarks = getBrowserApi()?.bookmarks
  if (!bookmarks) return () => undefined
  ;[bookmarks.onCreated, bookmarks.onRemoved, bookmarks.onChanged, bookmarks.onMoved].filter(Boolean).forEach((event) => event?.addListener(onChange))
  return () => undefined
}
