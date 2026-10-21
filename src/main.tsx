import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Bookmark, seedBookmarks, topicCounts } from './domain'
import { readBookmarkTree } from './browser'
import { Archive, ArrowUpRight, BarChart3, Bell, Bookmark as BookmarkIcon, Check, ChevronDown, CircleHelp, Clock3, Command, Download, ExternalLink, Folder, Grid2X2, Inbox, Layers3, ListFilter, Menu, MoreHorizontal, Plus, RefreshCw, Search, Settings, Sparkles, Sun, Tags, Trash2, X } from 'lucide-react'
import './styles.css'

const nav = [{ label: 'Overview', icon: Grid2X2 }, { label: 'All bookmarks', icon: BookmarkIcon }, { label: 'Topics', icon: Tags }, { label: 'Duplicates', icon: Layers3 }, { label: 'Folders', icon: Folder }]

function App() {
  const [items, setItems] = useState<Bookmark[]>(seedBookmarks)
  const [activeNav, setActiveNav] = useState('Overview')
  const [query, setQuery] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [filterMode, setFilterMode] = useState<'AND' | 'OR'>('AND')
  const [sort, setSort] = useState('Recently added')
  const [notice, setNotice] = useState('')
  const [dark, setDark] = useState(false)
  const topics = topicCounts(items)
  const filtered = useMemo(() => items.filter((item) => {
    const haystack = `${item.title} ${item.description} ${item.domain} ${item.topics.join(' ')}`.toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const matchesTopics = !selectedTopics.length || (filterMode === 'AND' ? selectedTopics.every((topic) => item.topics.includes(topic)) : selectedTopics.some((topic) => item.topics.includes(topic)))
    return matchesQuery && matchesTopics
  }).sort((a, b) => sort === 'Alphabetical' ? a.title.localeCompare(b.title) : b.addedAt.localeCompare(a.addedAt)), [items, query, selectedTopics, filterMode, sort])

  const sync = async () => {
    const tree = await readBookmarkTree()
    setNotice(tree.length ? `Synced ${tree.length} bookmark roots from your browser.` : 'Demo data is active — connect the extension to sync browser bookmarks.')
    setTimeout(() => setNotice(''), 3500)
  }
  const toggleTopic = (topic: string) => setSelectedTopics((current) => current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic])
  const markAnalyzed = (id: string) => setItems((current) => current.map((item) => item.id === id ? { ...item, status: 'analyzed' } : item))

  return <div className={dark ? 'app dark' : 'app'}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={17} /></div><span>topicraft</span><span className="beta">BETA</span></div>
      <div className="workspace-label">WORKSPACE</div>
      <div className="workspace"><div className="avatar">JD</div><div><strong>Jappoman’s space</strong><span>Personal workspace</span></div><ChevronDown size={15} /></div>
      <nav>{nav.map(({ label, icon: Icon }) => <button className={activeNav === label ? 'nav-item active' : 'nav-item'} onClick={() => setActiveNav(label)} key={label}><Icon size={17} /><span>{label}</span>{label === 'Duplicates' && <em>6</em>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item"><Archive size={17} /><span>Archive</span></button><button className="nav-item"><Settings size={17} /><span>Settings</span></button><div className="sync-card"><div className="sync-icon"><RefreshCw size={16} /></div><div><strong>All synced</strong><span>Just now</span></div><Check size={15} className="success" /></div><div className="user-row"><div className="avatar small">JD</div><span>Jappoman</span><MoreHorizontal size={16} /></div></div>
    </aside>
    <main>
      <header className="topbar"><button className="mobile-menu"><Menu size={18} /></button><div className="crumb"><span>Workspace</span><span>/</span><strong>{activeNav}</strong></div><div className="header-actions"><button className="icon-button" onClick={() => setDark(!dark)} title="Toggle theme">{dark ? <Sun size={18} /> : <Sun size={18} />}</button><button className="icon-button"><Bell size={18} /></button><button className="help"><CircleHelp size={16} /> Help</button><div className="header-avatar">JD</div></div></header>
      <section className="content">
        <div className="page-heading"><div><p className="eyebrow">WEDNESDAY, JUNE 19, 2024</p><h1>Good morning, Jappoman <span>✦</span></h1><p className="subtitle">Here’s what’s happening with your saved knowledge.</p></div><button className="primary-button" onClick={sync}><RefreshCw size={16} /> Sync bookmarks</button></div>
        {notice && <div className="notice"><Check size={16} />{notice}<button onClick={() => setNotice('')}><X size={15} /></button></div>}
        <div className="stats"><Stat label="Total bookmarks" value={items.length.toString()} detail="↑ 12% this month" color="blue" icon={<BookmarkIcon size={17} />} /><Stat label="Analyzed" value={items.filter((i) => i.status === 'analyzed').length.toString()} detail="83% of your library" color="green" icon={<Sparkles size={17} />} /><Stat label="Discovered topics" value={topics.length.toString()} detail="+4 this week" color="purple" icon={<Tags size={17} />} /><Stat label="Potential duplicates" value="6" detail="Needs your review" color="orange" icon={<Layers3 size={17} />} /></div>
        <div className="section-head"><div><h2>Explore your library</h2><p>Find the things you saved, when you need them.</p></div><div className="view-toggle"><button className="selected"><Grid2X2 size={16} /></button><button><ListFilter size={16} /></button></div></div>
        <div className="toolbar"><div className="search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search bookmarks, topics, or domains..." /><kbd><Command size={12} /> K</kbd></div><button className="filter-button"><ListFilter size={16} /> Filters <span>0</span></button><select value={sort} onChange={(e) => setSort(e.target.value)}><option>Recently added</option><option>Alphabetical</option></select></div>
        <div className="topic-row"><span className="topic-label">TOPICS</span>{topics.slice(0, 6).map(([topic, count]) => <button key={topic} className={selectedTopics.includes(topic) ? 'topic-chip selected' : 'topic-chip'} onClick={() => toggleTopic(topic)}><span className="dot" />{topic}<small>{count}</small></button>)}<button className="topic-more">View all <ArrowUpRight size={13} /></button></div>
        {selectedTopics.length > 1 && <div className="logic-row"><span>Matching selected topics</span><button className={filterMode === 'AND' ? 'logic selected' : 'logic'} onClick={() => setFilterMode('AND')}>ALL</button><button className={filterMode === 'OR' ? 'logic selected' : 'logic'} onClick={() => setFilterMode('OR')}>ANY</button></div>}
        <div className="results-head"><span><strong>{filtered.length}</strong> bookmarks</span><span className="updated"><Clock3 size={14} /> Last synced 2 minutes ago</span></div>
        <div className="bookmark-grid">{filtered.map((item) => <BookmarkCard item={item} key={item.id} onAnalyze={markAnalyzed} />)}</div>
        {!filtered.length && <div className="empty"><Search size={28} /><h3>No bookmarks found</h3><p>Try a different search or clear your topic filters.</p></div>}
      </section>
    </main>
  </div>
}

function Stat({ label, value, detail, color, icon }: { label: string; value: string; detail: string; color: string; icon: React.ReactNode }) { return <div className="stat"><div className={`stat-icon ${color}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong><small className={detail.includes('↑') || detail.includes('+') ? 'positive' : ''}>{detail}</small></div></div> }
function BookmarkCard({ item, onAnalyze }: { item: Bookmark; onAnalyze: (id: string) => void }) { return <article className="bookmark-card"><div className="card-top"><div className="site-icon" style={{ background: item.color }}>{item.initials}</div><div className="card-meta"><span>{item.domain}</span><small>· {item.folder}</small></div><button className="more"><MoreHorizontal size={18} /></button></div><h3>{item.title}</h3><p>{item.description}</p><div className="card-topics">{item.topics.slice(0, 3).map((topic) => <span className="mini-topic" key={topic}>{topic}</span>)}</div><div className="card-footer"><span className={item.status === 'pending' ? 'status pending' : 'status'}>{item.status === 'pending' ? <Clock3 size={13} /> : <Check size={13} />}{item.status === 'pending' ? 'Pending analysis' : 'Analyzed'}</span><div className="card-actions"><button title="Open bookmark"><ExternalLink size={15} /></button>{item.status === 'pending' && <button title="Analyze" onClick={() => onAnalyze(item.id)}><Sparkles size={15} /></button>}<button title="Delete"><Trash2 size={15} /></button></div></div></article> }

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
