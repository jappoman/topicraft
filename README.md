# Topicraft

Topicraft is a local-first browser bookmark organizer. This first slice includes the responsive dashboard experience, topic filtering, search, sorting, seeded realistic data for development, a safe browser bookmarks adapter, and small domain-level tests.

## Run locally

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

The dashboard runs with demo data outside an extension context. When loaded with a WebExtensions `bookmarks` API, the Sync button reads the browser tree and reports the result. No bookmark data is sent to a server.

## Architecture direction

`src/domain.ts` contains browser-independent domain helpers and bookmark types. `src/browser.ts` isolates WebExtensions access so the future WXT entrypoints can wire import/reconciliation, events, and IndexedDB/Dexie persistence without coupling the UI to browser APIs. Topic suggestions in this MVP are represented locally; the provider boundary for opt-in AI processing should sit beside that domain module before any external requests are added.
