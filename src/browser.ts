export type BrowserBookmarkNode = { id: string; title: string; url?: string; parentId?: string; dateAdded?: number; children?: BrowserBookmarkNode[] }

type BookmarkApi = { bookmarks?: { getTree: () => Promise<BrowserBookmarkNode[]>; onCreated?: { addListener: (cb: unknown) => void }; onRemoved?: { addListener: (cb: unknown) => void }; onChanged?: { addListener: (cb: unknown) => void }; onMoved?: { addListener: (cb: unknown) => void } } }

export const getBrowserApi = (): BookmarkApi | undefined => {
  const root = globalThis as typeof globalThis & { browser?: BookmarkApi; chrome?: BookmarkApi }
  return root.browser ?? root.chrome
}

export async function readBookmarkTree(): Promise<BrowserBookmarkNode[]> {
  const api = getBrowserApi()
  if (!api?.bookmarks?.getTree) return []
  return api.bookmarks.getTree()
}
