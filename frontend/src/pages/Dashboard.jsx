import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import '../style/dashboard.css'

import spiderIcon   from "../assets/icons/icons8-spider-man-new-50.png"
import empireIcon   from "../assets/icons/icons8-empire-50.png"
import yodaIcon     from "../assets/icons/icons8-baby-yoda-50.png"
import princessIcon from "../assets/icons/icons8-princess-bubblegum-50.png"
import trashIcon    from "../assets/icons/icons8-trash-50.png"
import uploadIcon   from "../assets/icons/icons8-download-from-the-cloud-50.png"
import musicIcon    from "../assets/icons/music-maker-app.png"
import cameraIcon   from "../assets/icons/camera.png"
import fileIcon     from "../assets/icons/pages.png"
import walletIcon   from "../assets/icons/wallet-passes-app.png"
import logo from '../assets/logo.png'

const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const PngIcon = ({ src, size = 14, style = {} }) => (
  <img src={src} alt="" width={size} height={size}
    style={{ objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', ...style }} />
)

const Icons = {
  Search:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Logout:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Close:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Grid:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  List:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Eye:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Brain:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3z"/></svg>,
  Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Spark:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Folder:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Refresh:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Back:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
}

const TYPE_CONFIG = {
  all:   { label: 'All Files', color: '#7c5cbf', bg: 'rgba(124,92,191,0.12)', pngIcon: fileIcon   },
  pdf:   { label: 'PDFs',      color: '#e05cb5', bg: 'rgba(224,92,181,0.12)', pngIcon: empireIcon },
  image: { label: 'Images',    color: '#34d399', bg: 'rgba(52,211,153,0.12)', pngIcon: cameraIcon },
  audio: { label: 'Audio',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', pngIcon: musicIcon  },
  video: { label: 'Videos',    color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', pngIcon: walletIcon },
}

const fmt = {
  size: (b) => !b ? '—' : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`,
  ago:  (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000)
    return s < 60 ? 'just now' : s < 3600 ? `${Math.floor(s/60)}m ago`
      : s < 86400 ? `${Math.floor(s/3600)}h ago` : `${Math.floor(s/86400)}d ago`
  },
}

// ─── File Viewer ──────────────────────────────────────────────────────────────
function FileViewer({ doc }) {
  const fileUrl = `http://localhost:5000/uploads/${doc.filename}`
  if (doc.type === 'pdf') return (
    <div className="viewer-iframe-wrap">
      <iframe src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`} title={doc.title} />
    </div>
  )
  if (doc.type === 'image') return (
    <div className="viewer-image-wrap">
      <img src={fileUrl} alt={doc.title} onError={e => { e.target.style.display = 'none' }} />
      {doc.content && doc.content.length > 20 && !doc.content.startsWith('[') && (
        <div className="viewer-ocr-box">
          <p className="viewer-ocr-label"><PngIcon src={cameraIcon} size={13} style={{ marginRight:'5px', opacity:0.8 }} />OCR — Extracted Text</p>
          <p className="viewer-ocr-text">{doc.content.substring(0, 500)}</p>
        </div>
      )}
    </div>
  )
  if (doc.type === 'audio') return (
    <div className="viewer-audio-wrap">
      <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'rgba(124,92,191,0.12)', border:'2px solid rgba(124,92,191,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
        <PngIcon src={musicIcon} size={32} />
      </div>
      <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:'1rem', marginBottom:'1.25rem', color:'var(--text-primary)' }}>{doc.title}</p>
      <audio controls style={{ width:'100%', accentColor:'#7c5cbf' }}><source src={fileUrl} /></audio>
      {doc.content && doc.content.length > 30 && !doc.content.startsWith('[') && (
        <div style={{ marginTop:'1.5rem', textAlign:'left' }}>
          <p className="viewer-ocr-label"><PngIcon src={musicIcon} size={13} style={{ marginRight:'5px', opacity:0.8 }} />Transcript</p>
          <div className="viewer-ocr-box" style={{ marginTop:'0.5rem' }}><p className="viewer-ocr-text" style={{ maxHeight:'200px' }}>{doc.content}</p></div>
        </div>
      )}
    </div>
  )
  if (doc.type === 'video') return (
    <div className="viewer-video-wrap">
      <video controls><source src={fileUrl} /></video>
      {doc.content && doc.content.length > 30 && !doc.content.startsWith('[') && (
        <div style={{ padding:'1rem', background:'rgba(56,189,248,0.06)', borderTop:'1px solid rgba(56,189,248,0.15)' }}>
          <p className="viewer-ocr-label" style={{ color:'#38bdf8' }}><PngIcon src={walletIcon} size={13} style={{ marginRight:'5px', opacity:0.8 }} />Transcript</p>
          <div style={{ maxHeight:'150px', overflowY:'auto', marginTop:'0.5rem' }}><p className="viewer-ocr-text">{doc.content.substring(0, 600)}</p></div>
        </div>
      )}
    </div>
  )
  return <div style={{ color:'var(--text-muted)', textAlign:'center', padding:'3rem' }}>Preview not available.</div>
}

// ─── Doc Modal ────────────────────────────────────────────────────────────────
function DocModal({ doc, onClose, onDelete, defaultTab = 'view' }) {
  const [tab, setTab] = useState(defaultTab)
  const cfg = doc ? (TYPE_CONFIG[doc.type] || TYPE_CONFIG.pdf) : null
  const navigate = useNavigate()
  useEffect(() => { if (doc) setTab(defaultTab) }, [defaultTab])
  if (!doc) return null

  const tabs = [
    { id: 'view',    label: 'View File',       icon: Icons.Eye   },
    { id: 'summary', label: 'AI Summary',      icon: Icons.Brain },
    { id: 'explain', label: 'Explain with AI', icon: Icons.Spark },
  ]

  const handleExplainWithAI = () => {
    const msg = `Give me a detailed explanation of the document titled "${doc.title}".\n\nSummary: ${doc.summary}\n\nKeywords: ${(doc.keywords || []).join(', ')}\n\nPlease expand on these concepts in detail.`
    sessionStorage.setItem('chatPrefill', msg)
    onClose(); navigate('/chat')
  }
  const handleDelete = async () => {
    if (!window.confirm(`Delete "${doc.title}"?`)) return
    try { await api.delete(`/documents/${doc._id}`) } catch {}
    onDelete(doc._id); onClose()
  }
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = `http://localhost:5000/uploads/${doc.filename}`
    a.download = doc.title; a.click()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-top-bar" style={{ background:`linear-gradient(90deg, ${cfg.color}, ${cfg.color}88, transparent)` }} />
        <div className="modal-header">
          <div className="modal-header-row">
            <div className="modal-title-block">
              <span className="doc-type-badge" style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.color}33` }}>
                <PngIcon src={cfg.pngIcon} size={13} style={{ marginRight:'4px', opacity:0.85 }} />{doc.type}
              </span>
              <h2 className="modal-doc-title">{doc.title}</h2>
              <p className="modal-doc-meta">{new Date(doc.createdAt).toLocaleDateString('en-IN', { dateStyle:'long' })} · {fmt.size(doc.fileSize)}</p>
            </div>
            <div className="modal-header-btns">
              <button className="modal-btn" onClick={handleDownload}><Icons.Download /> Download</button>
              <button className="modal-btn modal-btn-delete" onClick={handleDelete}><img src={trashIcon} className="icon" /> Delete</button>
              <button className="modal-btn-close" onClick={onClose}><Icons.Close /></button>
            </div>
          </div>
          <div className="modal-tabs">
            {tabs.map(t => {
              const TIcon = t.icon; const active = tab === t.id
              return (
                <button key={t.id} className={`modal-tab-btn${active?' active':''}`} onClick={() => setTab(t.id)}
                  style={{ color:active?cfg.color:undefined, borderBottomColor:active?cfg.color:undefined }}>
                  <TIcon /> {t.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="modal-body">
          {tab === 'view'    && <FileViewer doc={doc} />}
          {tab === 'summary' && (
            <div>
              <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', lineHeight:1.7 }}>{doc.summary || 'No summary available.'}</p>
              {doc.keywords?.length > 0 && (
                <>
                  <p style={{ fontSize:'0.65rem', color:cfg.color, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', marginTop:'1.25rem', marginBottom:'0.5rem' }}>Keywords</p>
                  <div className="keywords-wrap">{doc.keywords.map(k => <span key={k} className="keyword-tag">{k}</span>)}</div>
                </>
              )}
            </div>
          )}
          {tab === 'explain' && (
            <div style={{ textAlign:'center', padding:'3rem 2rem' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem' }}><PngIcon src={spiderIcon} size={48} /></div>
              <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'1.1rem', color:'var(--purple-deep)', marginBottom:'0.5rem' }}>Explain with AI</p>
              <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:'1.5rem' }}>Open this document in the AI Chat for a deep-dive explanation.</p>
              <button onClick={handleExplainWithAI} style={{ background:'linear-gradient(135deg, #7c5cbf, #5b3fa6)', color:'#fff', border:'none', borderRadius:'10px', padding:'0.65rem 1.5rem', fontFamily:"'DM Sans',sans-serif", fontSize:'0.85rem', fontWeight:600, cursor:'pointer', boxShadow:'0 4px 18px rgba(91,63,166,0.3)' }}>
                Open in AI Chat →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Doc Card ─────────────────────────────────────────────────────────────────
function DocCard({ doc, onDelete, onClick }) {
  const cfg = TYPE_CONFIG[doc.type] || TYPE_CONFIG.pdf
  return (
    <div className="doc-card" style={{ '--card-color': cfg.color }} onClick={() => onClick(doc)}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:`linear-gradient(90deg, ${cfg.color}, ${cfg.color}55)`, borderRadius:'var(--radius-lg) var(--radius-lg) 0 0' }} />
      <span className="doc-type-badge" style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.color}33` }}>
        <PngIcon src={cfg.pngIcon} size={13} style={{ marginRight:'4px', opacity:0.85 }} />{doc.type}
      </span>
      <p className="doc-title">{doc.title}</p>
      <p className="doc-summary">{doc.summary || 'No summary available.'}</p>
      {doc._score !== undefined && (
        <p style={{ fontSize:'0.65rem', color:cfg.color, fontWeight:600, marginTop:'0.25rem', opacity:0.8 }}>
          relevance {(doc._score * 100).toFixed(0)}%
        </p>
      )}
      <div className="doc-meta">
        <span className="doc-meta-info">{fmt.ago(doc.createdAt)} · {fmt.size(doc.fileSize)}</span>
        <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
          <div className="doc-actions">
            {[['view', Icons.Eye], ['summary', Icons.Brain], ['explain', Icons.Spark]].map(([t, Ico]) => (
              <button key={t} className="doc-action-btn" onClick={e => { e.stopPropagation(); onClick(doc) }} title={t}><Ico /></button>
            ))}
          </div>
          <button className="doc-delete-btn" onClick={async e => {
            e.stopPropagation()
            if (!window.confirm(`Delete "${doc.title}"?`)) return
            try { await api.delete(`/documents/${doc._id}`) } catch {}
            onDelete(doc._id)
          }}><img src={trashIcon} className="icon" /></button>
        </div>
      </div>
    </div>
  )
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ onSuccess }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')
  const inputRef = useRef()

  const upload = async (file) => {
    if (!file) return
    setUploading(true); setStatus(`Uploading ${file.name}…`)
    const fd = new FormData(); fd.append('file', file)
    try {
      const { data } = await api.post('/documents/upload', fd)
      setStatus('✓ Upload complete!'); onSuccess(data)
      setTimeout(() => setStatus(''), 2000)
    } catch { setStatus('✗ Upload failed.'); setTimeout(() => setStatus(''), 2500) }
    finally { setUploading(false) }
  }

  return (
    <div className={`upload-zone${dragging?' dragging':''}`}
      onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files[0]) }}>
      <input ref={inputRef} type="file" style={{ display:'none' }} onChange={e => upload(e.target.files[0])} />
      <div className="upload-zone-icon"><img src={uploadIcon} className="icon" /></div>
      {status ? <p className="upload-zone-text">{status}</p> : (
        <>
          <p className="upload-zone-text">Drop a file here or <span style={{ color:'var(--purple-mid)', fontWeight:600 }}>browse</span></p>
          <p className="upload-zone-hint">PDF, Image, Audio, Video supported</p>
        </>
      )}
      {uploading && <div className="upload-progress-bar"><div className="upload-progress-fill" /></div>}
    </div>
  )
}

// ─── Folders View ─────────────────────────────────────────────────────────────
function FoldersView({ onOpenDoc }) {
  const [folders, setFolders]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [organizing, setOrganizing]   = useState(false)
  const [openFolder, setOpenFolder]   = useState(null)
  const [orgResult, setOrgResult]     = useState(null)

  const loadFolders = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/documents/folders')
      setFolders(data.folders || [])
    } catch { setFolders([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadFolders() }, [loadFolders])

  const handleAutoOrganize = async () => {
    setOrganizing(true); setOrgResult(null)
    try {
      const { data } = await api.post('/documents/auto-organize')
      setOrgResult(`✓ Organized into ${data.folders?.length || 0} folders using ${data.total} documents`)
      await loadFolders()
    } catch (err) {
      setOrgResult('✗ Auto-organize failed. Make sure documents have embeddings.')
    }
    finally { setOrganizing(false) }
  }

  if (loading) return (
    <div className="loading-state"><div className="loading-spinner">⚙</div><p>Loading folders…</p></div>
  )

  // ── Folder detail view ────────────────────────────────────────────────────
  if (openFolder) {
    const folder = folders.find(f => f.name === openFolder)
    if (!folder) return null
    return (
      <div style={{ animation: 'fadeUp 0.2s ease' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.5rem' }}>
          <button onClick={() => setOpenFolder(null)}
            style={{ background:'rgba(124,92,191,0.1)', border:'none', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'var(--purple-deep)', display:'flex', alignItems:'center', gap:'4px', fontSize:'0.78rem', fontWeight:600 }}>
            <Icons.Back /> Back
          </button>
          <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:folder.color, flexShrink:0 }} />
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'1.2rem', color:'var(--purple-deep)' }}>{folder.name}</h2>
          <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', background:'rgba(124,92,191,0.08)', padding:'3px 8px', borderRadius:'12px' }}>
            {folder.docs.length} file{folder.docs.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="docs-grid">
          {folder.docs.map(d => (
            <DocCard key={d._id} doc={d} onDelete={() => loadFolders()} onClick={(doc) => onOpenDoc(doc)} />
          ))}
        </div>
      </div>
    )
  }

  // ── Folder grid ───────────────────────────────────────────────────────────
  return (
    <div style={{ animation: 'fadeUp 0.2s ease' }}>
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1.4rem', color:'var(--purple-deep)', display:'flex', alignItems:'center', gap:'8px' }}>
            <Icons.Folder /> Smart Folders
          </h1>
          <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'2px' }}>
            AI-grouped by semantic similarity · {folders.length} folder{folders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleAutoOrganize}
          disabled={organizing}
          style={{ display:'flex', alignItems:'center', gap:'6px', background:'linear-gradient(135deg, #7c5cbf, #5b3fa6)', color:'#fff', border:'none', borderRadius:'10px', padding:'0.55rem 1.1rem', fontSize:'0.8rem', fontWeight:600, cursor:organizing?'not-allowed':'pointer', opacity:organizing?0.7:1, fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 14px rgba(91,63,166,0.3)', transition:'all 0.2s' }}>
          <Icons.Refresh />
          {organizing ? 'Organizing…' : folders.length ? 'Re-organize' : 'Auto-organize'}
        </button>
      </div>

      {orgResult && (
        <div style={{ padding:'0.6rem 1rem', borderRadius:'10px', background:orgResult.startsWith('✓')?'rgba(52,211,153,0.1)':'rgba(248,113,113,0.1)', border:`1px solid ${orgResult.startsWith('✓')?'rgba(52,211,153,0.3)':'rgba(248,113,113,0.3)'}`, color:orgResult.startsWith('✓')?'#059669':'#dc2626', fontSize:'0.8rem', fontWeight:500, marginBottom:'1.25rem' }}>
          {orgResult}
        </div>
      )}

      {folders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" style={{ fontSize:'2.5rem' }}>📂</div>
          <p className="empty-title">No folders yet</p>
          <p className="empty-hint">Click "Auto-organize" to let AI group your documents by topic</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'14px' }}>
          {folders.map(folder => (
            <div key={folder.name}
              onClick={() => setOpenFolder(folder.name)}
              style={{ background:'rgba(255,255,255,0.7)', border:`1px solid ${folder.color}33`, borderRadius:'var(--radius-lg)', padding:'1.25rem', cursor:'pointer', backdropFilter:'blur(10px)', transition:'all 0.2s', boxShadow:'var(--shadow-card)', position:'relative', overflow:'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 28px ${folder.color}25` }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow-card)' }}>
              {/* Color bar */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:`linear-gradient(90deg, ${folder.color}, ${folder.color}66)` }} />
              {/* Folder icon */}
              <div style={{ width:'42px', height:'42px', borderRadius:'10px', background:`${folder.color}18`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'0.85rem' }}>
                <span style={{ fontSize:'1.3rem' }}>📁</span>
              </div>
              <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'0.92rem', color:'var(--purple-deep)', marginBottom:'4px', lineHeight:1.3 }}>{folder.name}</p>
              <p style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
                {folder.docs.length} file{folder.docs.length !== 1 ? 's' : ''}
              </p>
              {/* Type breakdown dots */}
              <div style={{ display:'flex', gap:'4px', marginTop:'0.75rem', flexWrap:'wrap' }}>
                {['pdf','image','audio','video'].map(t => {
                  const count = folder.docs.filter(d => d.type === t).length
                  if (!count) return null
                  const cfg = TYPE_CONFIG[t]
                  return (
                    <span key={t} style={{ fontSize:'0.63rem', fontWeight:600, color:cfg.color, background:cfg.bg, padding:'2px 6px', borderRadius:'6px' }}>
                      {count} {t}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [docs, setDocs]             = useState([])
  const [stats, setStats]           = useState({ total:0, pdf:0, image:0, audio:0, video:0 })
  const [filter, setFilter]         = useState('all')
  const [rawSearch, setRawSearch]   = useState('')
  const [view, setView]             = useState('grid')
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)
  const [defaultTab, setDefaultTab] = useState('view')
  const [user, setUser]             = useState({})
  const [page, setPage]             = useState('files') // 'files' | 'folders'
  const navigate                    = useNavigate()
  const debounceRef                 = useRef()

  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  const fetchDocs = useCallback(async (search = '') => {
    setLoading(true)
    try {
      const params = {}
      if (filter !== 'all') params.type = filter
      if (search && search.trim().length > 2) params.search = search.trim()
      const { data } = await api.get('/documents', { params })
      setDocs(data)
    } catch { setDocs([]) }
    finally { setLoading(false) }
  }, [filter])

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/documents/stats')
      setStats({
        total: Number(data.total ?? data.all ?? 0),
        pdf:   Number(data.pdf   ?? 0),
        image: Number(data.image ?? 0),
        audio: Number(data.audio ?? 0),
        video: Number(data.video ?? 0),
      })
    } catch (err) { console.error('fetchStats failed:', err) }
  }, [])

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(u); fetchStats()
  }, [])

  useEffect(() => { fetchDocs(rawSearch) }, [filter, fetchDocs])

  const onSearch = (val) => {
    setRawSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchDocs(val), 350)
  }
  const clearSearch = () => { setRawSearch(''); fetchDocs('') }
  const onUpload    = (doc) => { setDocs(prev => [doc, ...prev]); fetchStats() }
  const onDelete    = (id)  => { setDocs(prev => prev.filter(d => d._id !== id)); fetchStats() }
  const openDoc     = (doc, tab = 'view') => { setSelected(doc); setDefaultTab(tab) }

  const STATS_ROW = [
    { k:'total', label:'Total',  pngIcon:fileIcon,   color:'#7c5cbf' },
    { k:'pdf',   label:'PDFs',   pngIcon:empireIcon, color:'#e05cb5' },
    { k:'image', label:'Images', pngIcon:cameraIcon, color:'#34d399' },
    { k:'audio', label:'Audio',  pngIcon:musicIcon,  color:'#f59e0b' },
    { k:'video', label:'Videos', pngIcon:walletIcon, color:'#38bdf8' },
  ]

  return (
    <div className="dashboard-wrapper">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Knowledge Vault" className="sidebar-logo-img" />
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">Knowledge</span>
            <span className="sidebar-logo-sub">Vault</span>
          </div>
        </div>

        <p className="sidebar-section-label">Library</p>

        {/* All Files button */}
        <button className={`sidebar-nav-btn${page==='files'&&filter==='all'?' active':''}`}
          onClick={() => { setPage('files'); setFilter('all') }}>
          <div className="sidebar-nav-btn-label">
            <PngIcon src={fileIcon} size={14} style={{ opacity: page==='files'&&filter==='all'?1:0.7 }} />
            All Files
          </div>
          <span className="sidebar-nav-count">{stats.total}</span>
        </button>

        {/* Type filters */}
        {Object.entries(TYPE_CONFIG).filter(([k]) => k !== 'all').map(([key, cfg]) => {
          const active = page === 'files' && filter === key
          return (
            <button key={key} className={`sidebar-nav-btn${active?' active':''}`}
              onClick={() => { setPage('files'); setFilter(key) }}>
              <div className="sidebar-nav-btn-label">
                <PngIcon src={cfg.pngIcon} size={14} style={{ opacity:active?1:0.7 }} />{cfg.label}
              </div>
              <span className="sidebar-nav-count">{stats[key] ?? 0}</span>
            </button>
          )
        })}

        {/* Smart Folders button */}
        <button
          className={`sidebar-nav-btn${page==='folders'?' active':''}`}
          onClick={() => setPage('folders')}
          style={{ marginTop:'0.5rem', borderTop:'1px solid var(--border-soft)', paddingTop:'0.75rem' }}>
          <div className="sidebar-nav-btn-label">
            <Icons.Folder /> Smart Folders
          </div>
          <span className="sidebar-nav-count" style={{ background:'linear-gradient(135deg,#7c5cbf,#5b3fa6)', color:'#fff', padding:'2px 7px' }}>AI</span>
        </button>

        <div className="sidebar-spacer" />
        <p className="sidebar-section-label" style={{ marginTop:'0.5rem' }}>Tools</p>

        {[
          { to:'/graph',    pngIcon:princessIcon, label:'Knowledge Graph' },
          { to:'/insights', pngIcon:yodaIcon,     label:'Insights'        },
          { to:'/eval',     pngIcon:spiderIcon,   label:'RAG Eval'        },
          { to:'/ml',       pngIcon:empireIcon,   label:'ML Classifier'   },
        ].map(({ to, pngIcon, label }) => (
          <Link key={to} to={to} className="sidebar-tool-link">
            <PngIcon src={pngIcon} size={14} style={{ opacity:0.8 }} /> {label}
          </Link>
        ))}

        <Link to="/chat" className="sidebar-chat-link">
          <PngIcon src={spiderIcon} size={15} style={{ opacity:0.9 }} /> AI Chat (RAG)
        </Link>

        <div className="sidebar-user-card">
          <div className="sidebar-user-inner">
            <div style={{ minWidth:0 }}>
              <p className="sidebar-user-name">{user.name || 'User'}</p>
              <p className="sidebar-user-email">{user.email}</p>
            </div>
            <button className="sidebar-logout-btn" onClick={logout} title="Log out"><Icons.Logout /></button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main-content">
        {page === 'folders' ? (
          <FoldersView onOpenDoc={(doc) => openDoc(doc, 'view')} />
        ) : (
          <>
            <div className="main-header">
              <div>
                <h1 className="main-title" style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <PngIcon src={TYPE_CONFIG[filter]?.pngIcon || fileIcon} size={22} />
                  {TYPE_CONFIG[filter]?.label || 'All Files'}
                </h1>
                <p className="main-subtitle">
                  {rawSearch
                    ? `${docs.length} result${docs.length!==1?'s':''} for "${rawSearch}"`
                    : `${docs.length} document${docs.length!==1?'s':''}`}
                </p>
              </div>
              <div className="main-header-controls">
                <div className="search-wrap" style={{ position:'relative' }}>
                  <span className="search-icon"><Icons.Search /></span>
                  <input className="search-input" value={rawSearch} onChange={e => onSearch(e.target.value)} placeholder="Search documents…" />
                  {rawSearch && (
                    <button onClick={clearSearch} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:0 }}>
                      <Icons.Close />
                    </button>
                  )}
                </div>
                <div className="view-toggle">
                  {['grid','list'].map(m => (
                    <button key={m} className={`view-toggle-btn${view===m?' active':''}`} onClick={() => setView(m)} title={m}>
                      {m==='grid'?<Icons.Grid />:<Icons.List />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <UploadZone onSuccess={onUpload} />

            {/* ── STAT CARDS — pure inline styles, immune to CSS conflicts ── */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'10px', margin:'1rem 0' }}>
              {STATS_ROW.map(s => (
                <div key={s.k} onClick={() => setFilter(s.k)}
                  style={{ background:'rgba(255,255,255,0.75)', border:`1.5px solid ${s.color}30`, borderRadius:'14px', padding:'0.9rem 1rem', cursor:'pointer', backdropFilter:'blur(10px)', boxShadow:'0 2px 12px rgba(91,63,166,0.08)', transition:'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 6px 22px ${s.color}25` }}
                  onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 12px rgba(91,63,166,0.08)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                    <PngIcon src={s.pngIcon} size={15} style={{ opacity:0.85 }} />
                    <span style={{ fontSize:'0.68rem', fontWeight:700, color:s.color, fontFamily:"'DM Sans',sans-serif", textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize:'1.8rem', fontWeight:800, color:s.color, fontFamily:"'Syne',sans-serif", lineHeight:1 }}>
                    {stats[s.k] ?? 0}
                  </div>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="loading-state"><div className="loading-spinner">⚙</div><p>Loading…</p></div>
            ) : docs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><PngIcon src={fileIcon} size={48} style={{ opacity:0.4 }} /></div>
                <p className="empty-title">{rawSearch?`No results for "${rawSearch}"`:filter==='all'?'No documents yet':`No ${filter} files yet`}</p>
                <p className="empty-hint">{rawSearch?'Try a different search term':'Upload a file above to get started'}</p>
              </div>
            ) : view === 'grid' ? (
              <div className="docs-grid">
                {docs.map(d => <DocCard key={d._id} doc={d} onDelete={onDelete} onClick={(doc) => openDoc(doc,'view')} />)}
              </div>
            ) : (
              <div className="docs-list">
                <div className="docs-list-header">
                  {['Name','Type','Date','Size','Actions'].map(h => <span key={h} className="docs-list-header-cell">{h}</span>)}
                </div>
                {docs.map(d => {
                  const cfg = TYPE_CONFIG[d.type] || TYPE_CONFIG.pdf
                  return (
                    <div key={d._id} className="docs-list-row" style={{ '--row-color':cfg.color }}
                      onMouseOver={e => e.currentTarget.style.borderColor=cfg.color+'33'}
                      onMouseOut={e => e.currentTarget.style.borderColor='transparent'}>
                      <div style={{ minWidth:0 }} onClick={() => openDoc(d,'view')}>
                        <p className="docs-list-title">{d.title}</p>
                        <p className="docs-list-summary">{d.summary?.slice(0,60)}…</p>
                        {d._score !== undefined && <p style={{ fontSize:'0.65rem', color:cfg.color, fontWeight:600, marginTop:'2px', opacity:0.8 }}>relevance {(d._score*100).toFixed(0)}%</p>}
                      </div>
                      <span className="doc-type-badge" style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.color}33`, whiteSpace:'nowrap' }}>
                        <PngIcon src={cfg.pngIcon} size={12} style={{ marginRight:'4px', opacity:0.85 }} />{d.type}
                      </span>
                      <span className="docs-list-meta">{fmt.ago(d.createdAt)}</span>
                      <span className="docs-list-meta">{fmt.size(d.fileSize)}</span>
                      <div className="docs-list-actions">
                        {[['view',Icons.Eye],['summary',Icons.Brain],['explain',Icons.Spark]].map(([t,Ico]) => (
                          <button key={t} className="doc-action-btn" onClick={() => openDoc(d,t)} title={t}><Ico /></button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>

      {selected && (
        <DocModal doc={selected} defaultTab={defaultTab}
          onClose={() => setSelected(null)}
          onDelete={(id) => { onDelete(id); setSelected(null) }} />
      )}
    </div>
  )
}