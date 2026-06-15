
// import { useState, useEffect, useRef, useCallback } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import axios from 'axios'
//
// const api = axios.create({ baseURL: '/api' })
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })
//
// // ─── Icons ────────────────────────────────────────────────────────────────────
// const Icons = {
//   Upload:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
//   File:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
//   Image:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
//   Audio:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
//   Video:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
//   Search:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
//   Trash:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
//   Logout:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
//   Close:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
//   Grid:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
//   List:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
//   Eye:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
//   Brain:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3z"/></svg>,
//   Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
//   Spark:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
//   Mic:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M19 10a7 7 0 0 1-14 0"/><line x1="12" y1="19" x2="12" y2="22"/></svg>,
// }
//
// // ─── Type config with richer colors ──────────────────────────────────────────
// const TYPE_CONFIG = {
//   all:   { label:'All Files', color:'#a78bfa', bg:'rgba(167,139,250,0.15)', glow:'rgba(167,139,250,0.3)',  icon: Icons.File,  emoji:'📁' },
//   pdf:   { label:'PDFs',      color:'#fb7185', bg:'rgba(251,113,133,0.15)', glow:'rgba(251,113,133,0.3)',  icon: Icons.File,  emoji:'📄' },
//   image: { label:'Images',    color:'#34d399', bg:'rgba(52,211,153,0.15)',  glow:'rgba(52,211,153,0.3)',   icon: Icons.Image, emoji:'🖼️' },
//   audio: { label:'Audio',     color:'#fbbf24', bg:'rgba(251,191,36,0.15)',  glow:'rgba(251,191,36,0.3)',   icon: Icons.Audio, emoji:'🎵' },
//   video: { label:'Videos',    color:'#38bdf8', bg:'rgba(56,189,248,0.15)',  glow:'rgba(56,189,248,0.3)',   icon: Icons.Video, emoji:'🎬' },
// }
//
// const fmt = {
//   size: (b) => !b ? '—' : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`,
//   ago:  (d) => { const s = Math.floor((Date.now()-new Date(d))/1000); return s<60?'just now':s<3600?`${Math.floor(s/60)}m ago`:s<86400?`${Math.floor(s/3600)}h ago`:`${Math.floor(s/86400)}d ago` },
// }
//
// // ─── File Viewer ──────────────────────────────────────────────────────────────
// function FileViewer({ doc }) {
//   const fileUrl = `http://localhost:5000/uploads/${doc.filename}`
//
//   if (doc.type === 'pdf') {
//     return (
//       <div style={{ borderRadius:'12px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)', height:'500px' }}>
//         <iframe src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`} title={doc.title}
//           style={{ width:'100%', height:'100%', border:'none', background:'#fff' }} />
//       </div>
//     )
//   }
//
//   if (doc.type === 'image') {
//     return (
//       <div style={{ borderRadius:'12px', overflow:'hidden', border:'1px solid rgba(52,211,153,0.2)', background:'linear-gradient(135deg,rgba(52,211,153,0.05),rgba(16,185,129,0.03))', minHeight:'300px', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', flexDirection:'column', gap:'1rem' }}>
//         <img src={fileUrl} alt={doc.title}
//           style={{ maxWidth:'100%', maxHeight:'450px', borderRadius:'8px', objectFit:'contain', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}
//           onError={e => { e.target.style.display='none' }} />
//         {doc.content && doc.content.length > 20 && !doc.content.startsWith('[') && (
//           <div style={{ width:'100%', background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.15)', borderRadius:'10px', padding:'0.75rem 1rem' }}>
//             <p style={{ fontSize:'0.68rem', color:'#34d399', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.4rem' }}>🔍 OCR — Extracted Text</p>
//             <p style={{ fontSize:'0.8rem', color:'#8b8ba0', lineHeight:1.6, maxHeight:'100px', overflowY:'auto' }}>{doc.content.substring(0, 500)}</p>
//           </div>
//         )}
//       </div>
//     )
//   }
//
//   if (doc.type === 'audio') {
//     return (
//       <div style={{ background:'linear-gradient(135deg,rgba(251,191,36,0.08),rgba(245,158,11,0.04))', borderRadius:'12px', border:'1px solid rgba(251,191,36,0.2)', padding:'2.5rem', textAlign:'center' }}>
//         <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'rgba(251,191,36,0.15)', border:'2px solid rgba(251,191,36,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem', fontSize:'28px' }}>🎵</div>
//         <p style={{ color:'#f0eeff', fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:'1rem', marginBottom:'1.25rem' }}>{doc.title}</p>
//         <audio controls style={{ width:'100%', accentColor:'#fbbf24' }}>
//           <source src={fileUrl} />
//         </audio>
//         {doc.content && doc.content.length > 30 && !doc.content.startsWith('[') && (
//           <div style={{ marginTop:'1.5rem', textAlign:'left' }}>
//             <p style={{ fontSize:'0.68rem', color:'#fbbf24', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.5rem' }}>🎤 Transcript</p>
//             <div style={{ background:'rgba(251,191,36,0.06)', borderRadius:'10px', padding:'1rem', border:'1px solid rgba(251,191,36,0.15)', maxHeight:'200px', overflowY:'auto' }}>
//               <p style={{ fontSize:'0.82rem', color:'#8b8ba0', lineHeight:1.7 }}>{doc.content}</p>
//             </div>
//           </div>
//         )}
//       </div>
//     )
//   }
//
//   if (doc.type === 'video') {
//     return (
//       <div style={{ background:'#000', borderRadius:'12px', overflow:'hidden', border:'1px solid rgba(56,189,248,0.2)' }}>
//         <video controls style={{ width:'100%', maxHeight:'500px', display:'block' }}>
//           <source src={fileUrl} />
//         </video>
//         {doc.content && doc.content.length > 30 && !doc.content.startsWith('[') && (
//           <div style={{ padding:'1rem', background:'rgba(56,189,248,0.06)', borderTop:'1px solid rgba(56,189,248,0.15)' }}>
//             <p style={{ fontSize:'0.68rem', color:'#38bdf8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.5rem' }}>🎬 Transcript</p>
//             <div style={{ maxHeight:'150px', overflowY:'auto' }}>
//               <p style={{ fontSize:'0.8rem', color:'#8b8ba0', lineHeight:1.65 }}>{doc.content.substring(0, 600)}</p>
//             </div>
//           </div>
//         )}
//       </div>
//     )
//   }
//
//   return <div style={{ color:'#4a4a60', textAlign:'center', padding:'3rem' }}>Preview not available.</div>
// }
//
// // ─── Doc Modal ────────────────────────────────────────────────────────────────
// function DocModal({ doc, onClose, onDelete, defaultTab = 'view' }) {
//   const [tab, setTab] = useState(defaultTab)
//   const cfg = doc ? (TYPE_CONFIG[doc.type] || TYPE_CONFIG.pdf) : null
//   const navigate = useNavigate()
//   useEffect(() => { if (doc) setTab(defaultTab) }, [defaultTab])
//   if (!doc) return null
//
//   const tabs = [
//     { id:'view',    label:'View File',       icon: Icons.Eye   },
//     { id:'summary', label:'AI Summary',      icon: Icons.Brain },
//     { id:'explain', label:'Explain with AI', icon: Icons.Spark },
//   ]
//
//   const handleExplainWithAI = () => {
//     const msg = `Give me a detailed explanation of the document titled "${doc.title}".\n\nSummary: ${doc.summary}\n\nKeywords: ${(doc.keywords||[]).join(', ')}\n\nPlease expand on these concepts in detail, explain what I should know to fully understand this document, and suggest related topics I should explore.`
//     sessionStorage.setItem('chatPrefill', msg)
//     onClose()
//     navigate('/chat')
//   }
//
//   const handleDelete = async () => {
//     if (!window.confirm(`Delete "${doc.title}"?`)) return
//     try { await api.delete(`/documents/${doc._id}`) } catch {}
//     onDelete(doc._id); onClose()
//   }
//
//   const handleDownload = () => {
//     const a = document.createElement('a')
//     a.href = `http://localhost:5000/uploads/${doc.filename}`
//     a.download = doc.title; a.click()
//   }
//
//   return (
//     <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem', backdropFilter:'blur(4px)' }}>
//       <div onClick={e => e.stopPropagation()}
//         style={{ background:'#0f0f1a', border:`1px solid ${cfg.color}33`, borderRadius:'22px', width:'100%', maxWidth:'800px', maxHeight:'92vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:`0 0 60px ${cfg.glow}` }}>
//
//         {/* Colored top bar */}
//         <div style={{ height:'3px', background:`linear-gradient(90deg, ${cfg.color}, ${cfg.color}88, transparent)` }}/>
//
//         {/* Header */}
//         <div style={{ padding:'1.5rem 1.75rem 0', flexShrink:0 }}>
//           <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.25rem' }}>
//             <div style={{ minWidth:0, flex:1, paddingRight:'1rem' }}>
//               <span style={{ background:cfg.bg, color:cfg.color, padding:'3px 10px', borderRadius:'20px', fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', border:`1px solid ${cfg.color}33` }}>
//                 {cfg.emoji} {doc.type}
//               </span>
//               <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'1.25rem', color:'#f0eeff', marginTop:'0.6rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.title}</h2>
//               <p style={{ fontSize:'0.76rem', color:'#4a4a60', marginTop:'2px' }}>
//                 {new Date(doc.createdAt).toLocaleDateString('en-IN', { dateStyle:'long' })} · {fmt.size(doc.fileSize)}
//               </p>
//             </div>
//             <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
//               <button onClick={handleDownload} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#8b8ba0', cursor:'pointer', borderRadius:'9px', padding:'7px 10px', display:'flex', alignItems:'center', gap:'5px', fontSize:'0.8rem', transition:'all 0.2s' }}
//                 onMouseOver={e=>{e.currentTarget.style.color='#f0eeff';e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}} onMouseOut={e=>{e.currentTarget.style.color='#8b8ba0';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}}>
//                 <Icons.Download /> Download
//               </button>
//               <button onClick={handleDelete} style={{ background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.25)', color:'#fb7185', cursor:'pointer', borderRadius:'9px', padding:'7px 10px', display:'flex', alignItems:'center', gap:'5px', fontSize:'0.8rem' }}>
//                 <Icons.Trash /> Delete
//               </button>
//               <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'none', color:'#8b8ba0', cursor:'pointer', borderRadius:'9px', padding:'7px', display:'flex' }}>
//                 <Icons.Close />
//               </button>
//             </div>
//           </div>
//
//           <div style={{ display:'flex', gap:'4px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
//             {tabs.map(t => {
//               const TIcon = t.icon; const active = tab === t.id
//               return (
//                 <button key={t.id} onClick={() => setTab(t.id)} style={{
//                   display:'flex', alignItems:'center', gap:'6px', padding:'0.6rem 1rem',
//                   border:'none', borderRadius:'0', cursor:'pointer', fontSize:'0.83rem',
//                   fontWeight: active ? 600 : 400, background:'transparent',
//                   color: active ? cfg.color : '#8b8ba0',
//                   borderBottom: active ? `2px solid ${cfg.color}` : '2px solid transparent',
//                   marginBottom:'-1px', transition:'all 0.15s', fontFamily:"'DM Sans',sans-serif",
//                 }}>
//                   <TIcon /> {t.label}
//                 </button>
//               )
//             })}
//           </div>
//         </div>
//
//         <div style={{ padding:'1.5rem 1.75rem', overflowY:'auto', flex:1 }}>
//           {tab === 'view' && <FileViewer doc={doc} />}
//
//           {tab === 'summary' && (
//             <div style={{ animation:'fadeUp 0.2s ease' }}>
//               <div style={{ background:cfg.bg, border:`1px solid ${cfg.color}33`, borderRadius:'14px', padding:'1.25rem 1.5rem', marginBottom:'1.25rem' }}>
//                 <p style={{ fontSize:'0.7rem', color:cfg.color, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700, marginBottom:'0.6rem' }}>✦ Gemini Summary</p>
//                 <p style={{ fontSize:'0.95rem', color:'#d4d4e8', lineHeight:1.75 }}>{doc.summary || 'No summary available.'}</p>
//               </div>
//               {doc.keywords?.length > 0 && (
//                 <div style={{ marginBottom:'1.25rem' }}>
//                   <p style={{ fontSize:'0.7rem', color:'#4a4a60', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.6rem' }}>Keywords</p>
//                   <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
//                     {doc.keywords.map(kw => (
//                       <span key={kw} style={{ background:cfg.bg, color:cfg.color, padding:'4px 13px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:500, border:`1px solid ${cfg.color}33` }}>{kw}</span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//               {doc.content && doc.content.length > 20 && (
//                 <div>
//                   <p style={{ fontSize:'0.7rem', color:'#4a4a60', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.6rem' }}>
//                     {doc.type === 'image' ? '🔍 OCR Text' : doc.type === 'audio' ? '🎤 Transcript' : doc.type === 'video' ? '🎬 Transcript' : 'Extracted Text'}
//                   </p>
//                   <div style={{ background:'#16161f', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'1rem', maxHeight:'220px', overflowY:'auto' }}>
//                     <pre style={{ fontSize:'0.8rem', color:'#8b8ba0', lineHeight:1.75, whiteSpace:'pre-wrap', fontFamily:'monospace', margin:0 }}>
//                       {doc.content.substring(0, 2000)}{doc.content.length > 2000 ? '\n\n… (truncated)' : ''}
//                     </pre>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//
//           {tab === 'explain' && (
//             <div style={{ animation:'fadeUp 0.2s ease' }}>
//               <div style={{ background:cfg.bg, border:`1px solid ${cfg.color}33`, borderRadius:'14px', padding:'1.5rem', marginBottom:'1.25rem', textAlign:'center' }}>
//                 <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🤖</div>
//                 <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:'1.05rem', color:'#f0eeff', marginBottom:'0.5rem' }}>Get a Detailed AI Explanation</h3>
//                 <p style={{ fontSize:'0.875rem', color:'#8b8ba0', lineHeight:1.7, marginBottom:'1.25rem' }}>
//                   Opens the AI chat with a pre-filled question about <strong style={{ color:'#d4d4e8' }}>{doc.title}</strong>
//                 </p>
//                 <button onClick={handleExplainWithAI} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'0.75rem 1.75rem', borderRadius:'10px', border:'none', background:`linear-gradient(135deg,${cfg.color},${cfg.color}cc)`, color:'#fff', cursor:'pointer', fontSize:'0.9rem', fontWeight:600, fontFamily:"'Syne',sans-serif" }}>
//                   <Icons.Spark/> Explain with AI →
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
//
// // ─── Upload Zone ──────────────────────────────────────────────────────────────
// function UploadZone({ onSuccess }) {
//   const [drag, setDrag] = useState(false)
//   const [busy, setBusy] = useState(false)
//   const [msg, setMsg]   = useState('')
//   const [phase, setPhase] = useState(0) // 0=idle 1=uploading 2=processing 3=done
//   const ref = useRef()
//
//   const PHASES = [
//     'Uploading file…',
//     'Extracting content with Gemini…',
//     'Generating AI summary & keywords…',
//     '✓ Done!',
//   ]
//
//   const upload = async (file) => {
//     if (!file) return
//     setBusy(true); setPhase(0); setMsg(PHASES[0])
//     const fd = new FormData(); fd.append('file', file)
//     try {
//       setPhase(1); setMsg(PHASES[1])
//       const r = await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
//       setPhase(3); setMsg(PHASES[3])
//       setTimeout(() => { setBusy(false); setMsg(''); setPhase(0) }, 1200)
//       onSuccess(r.data)
//     } catch (e) {
//       setMsg('Failed: ' + (e.response?.data?.message || e.message))
//       setTimeout(() => { setBusy(false); setMsg(''); setPhase(0) }, 3000)
//     }
//   }
//
//   const phaseColors = ['#a78bfa','#34d399','#fbbf24','#34d399']
//
//   return (
//     <div
//       onClick={() => !busy && ref.current.click()}
//       onDragOver={e => { e.preventDefault(); setDrag(true) }}
//       onDragLeave={() => setDrag(false)}
//       onDrop={e => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files[0]) }}
//       style={{
//         border: `2px dashed ${drag ? '#a78bfa' : busy ? phaseColors[phase] : 'rgba(255,255,255,0.1)'}`,
//         borderRadius:'18px', padding:'2.25rem', textAlign:'center',
//         cursor: busy ? 'default' : 'pointer',
//         background: drag ? 'rgba(167,139,250,0.06)' : busy ? `rgba(${phase===3?'52,211,153':'139,92,246'},0.04)` : 'rgba(255,255,255,0.01)',
//         transition:'all 0.25s', marginBottom:'1.5rem',
//         boxShadow: drag ? '0 0 30px rgba(167,139,250,0.15)' : 'none',
//       }}
//     >
//       <input ref={ref} type="file" accept=".pdf,image/*,audio/*,video/*" style={{ display:'none' }} onChange={e => upload(e.target.files[0])} />
//       {busy ? (
//         <>
//           <div style={{ fontSize:'1.5rem', marginBottom:'0.75rem', animation:'spin 2s linear infinite', display:'inline-block' }}>⚙</div>
//           <p style={{ color: phaseColors[phase], fontSize:'0.9rem', fontWeight:600, marginBottom:'0.75rem', fontFamily:"'Syne',sans-serif" }}>{msg}</p>
//           <div style={{ height:'3px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', overflow:'hidden', maxWidth:'300px', margin:'0 auto' }}>
//             <div style={{ height:'100%', background:`linear-gradient(90deg,${phaseColors[phase]},${phaseColors[phase]}88)`, animation:'bar 1.4s ease-in-out infinite', borderRadius:'2px' }}/>
//           </div>
//           <p style={{ fontSize:'0.72rem', color:'#4a4a60', marginTop:'0.75rem' }}>
//             {phase === 1 ? 'Images use Gemini Vision OCR · Audio/Video use Gemini File API' : phase === 2 ? 'Generating AI summary and keywords…' : ''}
//           </p>
//         </>
//       ) : (
//         <>
//           <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'linear-gradient(135deg,rgba(167,139,250,0.2),rgba(139,92,246,0.1))', color:'#a78bfa', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.9rem', border:'1px solid rgba(167,139,250,0.2)' }}>
//             <Icons.Upload />
//           </div>
//           <p style={{ color:'#e2e0ff', fontSize:'0.95rem', fontWeight:600, marginBottom:'0.3rem', fontFamily:"'Syne',sans-serif" }}>
//             {drag ? '✦ Drop it!' : 'Drop a file or click to upload'}
//           </p>
//           <p style={{ color:'#4a4a60', fontSize:'0.75rem', marginBottom:'0.75rem' }}>PDF · Image (OCR) · Audio (transcript) · Video (transcript) — max 50 MB</p>
//           <div style={{ display:'flex', gap:'6px', justifyContent:'center', flexWrap:'wrap' }}>
//             {[['📄','PDF','#fb7185'],['🖼️','Image + OCR','#34d399'],['🎵','Audio + Transcript','#fbbf24'],['🎬','Video + Transcript','#38bdf8']].map(([emoji,label,color])=>(
//               <span key={label} style={{ background:`rgba(${color==='#fb7185'?'251,113,133':color==='#34d399'?'52,211,153':color==='#fbbf24'?'251,191,36':'56,189,248'},0.1)`, color, padding:'2px 8px', borderRadius:'20px', fontSize:'0.68rem', fontWeight:500 }}>
//                 {emoji} {label}
//               </span>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   )
// }
//
// // ─── Doc Card ─────────────────────────────────────────────────────────────────
// function DocCard({ doc, onDelete, onClick }) {
//   const cfg = TYPE_CONFIG[doc.type] || TYPE_CONFIG.pdf
//   const TIcon = cfg.icon
//   const hasTranscript = doc.content && doc.content.length > 20 && !doc.content.startsWith('[')
//
//   return (
//     <div
//       onClick={() => onClick(doc)}
//       style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'1.15rem', cursor:'pointer', transition:'all 0.2s', position:'relative', overflow:'hidden' }}
//       onMouseOver={e => { e.currentTarget.style.borderColor = cfg.color+'55'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${cfg.glow}` }}
//       onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
//     >
//       {/* Top color accent */}
//       <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,${cfg.color},transparent)`, opacity:0.6 }}/>
//
//       <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
//         <span style={{ background:cfg.bg, color:cfg.color, padding:'3px 10px', borderRadius:'20px', fontSize:'0.67rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:'4px', border:`1px solid ${cfg.color}33` }}>
//           {cfg.emoji} {doc.type}
//         </span>
//         <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
//           {hasTranscript && (
//             <span title="Content extracted" style={{ fontSize:'10px', color:cfg.color, opacity:0.7 }}>✦</span>
//           )}
//           <button onClick={e => { e.stopPropagation(); if(window.confirm(`Delete "${doc.title}"?`)) onDelete(doc._id) }}
//             style={{ background:'transparent', border:'none', color:'#4a4a60', cursor:'pointer', padding:'3px', display:'flex', borderRadius:'5px', transition:'color 0.2s' }}
//             onMouseOver={e=>e.currentTarget.style.color='#fb7185'} onMouseOut={e=>e.currentTarget.style.color='#4a4a60'}>
//             <Icons.Trash />
//           </button>
//         </div>
//       </div>
//
//       <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:'0.88rem', color:'#f0eeff', marginBottom:'0.4rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.title}</h3>
//       <p style={{ fontSize:'0.76rem', color:'#8b8ba0', lineHeight:1.55, marginBottom:'0.7rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
//         {doc.summary || (doc.type==='image'?'Image — click to view OCR text':doc.type==='audio'?'Audio — click to view transcript':doc.type==='video'?'Video — click to view transcript':'No summary')}
//       </p>
//
//       {doc.keywords?.length > 0 && (
//         <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'0.7rem' }}>
//           {doc.keywords.slice(0,3).map(k=>(
//             <span key={k} style={{ background:'rgba(255,255,255,0.05)', color:'#8b8ba0', padding:'1px 7px', borderRadius:'4px', fontSize:'0.67rem', border:'1px solid rgba(255,255,255,0.06)' }}>{k}</span>
//           ))}
//         </div>
//       )}
//
//       <div style={{ display:'flex', gap:'4px', marginTop:'0.6rem', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'0.65rem' }}>
//         {[{ icon: Icons.Eye, label:'View' }, { icon: Icons.Brain, label:'Summary' }, { icon: Icons.Spark, label:'Explain' }].map(btn => {
//           const BIcon = btn.icon
//           return (
//             <div key={btn.label} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'3px', fontSize:'0.67rem', color:'#4a4a60', padding:'3px 0', borderRadius:'5px', transition:'all 0.15s' }}
//               onMouseOver={e=>{e.currentTarget.style.color=cfg.color;e.currentTarget.style.background=cfg.bg}}
//               onMouseOut={e=>{e.currentTarget.style.color='#4a4a60';e.currentTarget.style.background='transparent'}}>
//               <BIcon /> {btn.label}
//             </div>
//           )
//         })}
//       </div>
//       <p style={{ fontSize:'0.68rem', color:'#4a4a60', marginTop:'0.35rem', textAlign:'center' }}>{fmt.ago(doc.createdAt)} · {fmt.size(doc.fileSize)}</p>
//     </div>
//   )
// }
//
// // ─── Main Dashboard ───────────────────────────────────────────────────────────
// export default function Dashboard() {
//   const navigate = useNavigate()
//   const user = JSON.parse(localStorage.getItem('user') || '{}')
//   const [docs, setDocs]           = useState([])
//   const [stats, setStats]         = useState({ total:0, pdf:0, image:0, audio:0, video:0 })
//   const [filter, setFilter]       = useState('all')
//   const [search, setSearch]       = useState('')
//   const [rawSearch, setRawSearch] = useState('')
//   const [view, setView]           = useState('grid')
//   const [loading, setLoading]     = useState(true)
//   const [selected, setSelected]   = useState(null)
//   const [defaultTab, setDefaultTab] = useState('view')
//   const timer = useRef()
//
//   const loadDocs = useCallback(async () => {
//     setLoading(true)
//     try {
//       const p = {}
//       if (filter !== 'all') p.type = filter
//       if (search) p.search = search
//       const r = await api.get('/documents', { params: p })
//       setDocs(r.data)
//     } catch {}
//     setLoading(false)
//   }, [filter, search])
//
//   const loadStats = useCallback(async () => {
//     try { const r = await api.get('/documents/stats'); setStats(r.data) } catch {}
//   }, [])
//
//   useEffect(() => { loadDocs() }, [loadDocs])
//   useEffect(() => { loadStats() }, [loadStats])
//
//   const onSearch = (v) => {
//     setRawSearch(v)
//     clearTimeout(timer.current)
//     timer.current = setTimeout(() => setSearch(v), 400)
//   }
//
//   const openDoc = (doc, tab = 'view') => { setDefaultTab(tab); setSelected(doc) }
//   const onUpload = (doc) => { setDocs(p => [doc, ...p]); loadStats() }
//   const onDelete = (id) => { setDocs(p => p.filter(d => d._id !== id)); loadStats() }
//   const logout   = () => { localStorage.clear(); navigate('/login') }
//
//   const STATS_ROW = [
//     { k:'pdf',   label:'PDFs',   emoji:'📄', color:'#fb7185', bg:'rgba(251,113,133,0.12)' },
//     { k:'image', label:'Images', emoji:'🖼️', color:'#34d399', bg:'rgba(52,211,153,0.12)'  },
//     { k:'audio', label:'Audio',  emoji:'🎵', color:'#fbbf24', bg:'rgba(251,191,36,0.12)'  },
//     { k:'video', label:'Videos', emoji:'🎬', color:'#38bdf8', bg:'rgba(56,189,248,0.12)'  },
//   ]
//
//   return (
//     <div style={{ display:'flex', height:'100vh', background:'#080810', fontFamily:"'DM Sans',sans-serif", overflow:'hidden' }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
//         @keyframes bar{0%,100%{margin-left:0;width:30%}50%{margin-left:30%;width:50%}}
//         @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
//         @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
//         @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
//         .hov-row:hover{background:rgba(255,255,255,0.025)!important}
//         ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#1e1e2e;border-radius:2px}
//       `}</style>
//
//       {/* SIDEBAR */}
//       <aside style={{ width:'228px', minWidth:'228px', background:'#0a0a14', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', padding:'1.25rem 0.875rem', overflowY:'auto' }}>
//
//         {/* Logo */}
//         <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'2rem', padding:'0 0.4rem' }}>
//           <div style={{ width:'32px', height:'32px', background:'linear-gradient(135deg,#a78bfa,#6366f1)', borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', boxShadow:'0 4px 14px rgba(167,139,250,0.4)' }}>🧠</div>
//           <div>
//             <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.88rem', color:'#f0eeff', letterSpacing:'-0.02em', display:'block' }}>Knowledge</span>
//             <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:'0.75rem', color:'#a78bfa', letterSpacing:'0.01em' }}>Vault</span>
//           </div>
//         </div>
//
//         <p style={{ fontSize:'0.62rem', color:'#4a4a60', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem', padding:'0 0.4rem' }}>Library</p>
//
//         {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
//           const TIcon = cfg.icon
//           const count = key === 'all' ? stats.total : (stats[key] || 0)
//           const active = filter === key
//           return (
//             <button key={key} onClick={() => setFilter(key)}
//               style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.55rem 0.75rem', borderRadius:'9px', border: active ? `1px solid ${cfg.color}33` : '1px solid transparent', cursor:'pointer', marginBottom:'2px', width:'100%', background: active ? cfg.bg : 'transparent', color: active ? cfg.color : '#8b8ba0', transition:'all 0.15s' }}
//               onMouseOver={e=>{ if(!active){ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#d4d4e8' } }}
//               onMouseOut={e=>{ if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#8b8ba0' } }}>
//               <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.83rem', fontWeight: active ? 600 : 400 }}>
//                 <span style={{ fontSize:'12px' }}>{cfg.emoji}</span>{cfg.label}
//               </div>
//               <span style={{ fontSize:'0.67rem', background: active ? `${cfg.color}22` : 'rgba(255,255,255,0.06)', color: active ? cfg.color : '#4a4a60', padding:'1px 7px', borderRadius:'10px', fontWeight:600 }}>{count}</span>
//             </button>
//           )
//         })}
//
//         <div style={{ flex:1 }} />
//
//         <p style={{ fontSize:'0.62rem', color:'#4a4a60', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0.4rem 0.5rem', marginTop:'0.5rem' }}>Tools</p>
//         {[
//           { to:'/graph',    emoji:'🕸️', label:'Knowledge Graph', color:'#a78bfa' },
//           { to:'/insights', emoji:'✨', label:'Insights',         color:'#fbbf24' },
//           { to:'/eval',     emoji:'📊', label:'RAG Eval',         color:'#34d399' },
//           { to:'/ml',       emoji:'🧪', label:'ML Classifier',    color:'#38bdf8' },
//         ].map(({ to, emoji, label, color }) => (
//           <Link key={to} to={to} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'0.55rem 0.75rem', borderRadius:'9px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', marginBottom:'3px', textDecoration:'none', color:'#8b8ba0', fontSize:'0.82rem', fontWeight:500, transition:'all 0.18s' }}
//             onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color=color;e.currentTarget.style.borderColor=color+'44'}}
//             onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)';e.currentTarget.style.color='#8b8ba0';e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}}>
//             <span style={{ fontSize:'13px' }}>{emoji}</span> {label}
//           </Link>
//         ))}
//
//         <Link to="/chat" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'0.6rem 0.75rem', borderRadius:'10px', background:'linear-gradient(135deg,rgba(167,139,250,0.2),rgba(99,102,241,0.12))', border:'1px solid rgba(167,139,250,0.3)', marginBottom:'0.75rem', marginTop:'3px', textDecoration:'none', color:'#c4b5fd', fontSize:'0.83rem', fontWeight:600, transition:'all 0.18s', boxShadow:'0 2px 12px rgba(167,139,250,0.1)' }}
//           onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 20px rgba(167,139,250,0.2)'}
//           onMouseOut={e=>e.currentTarget.style.boxShadow='0 2px 12px rgba(167,139,250,0.1)'}>
//           <span style={{ fontSize:'14px' }}>🤖</span> AI Chat (RAG)
//         </Link>
//
//         {/* User card */}
//         <div style={{ padding:'0.75rem', background:'rgba(255,255,255,0.03)', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.06)' }}>
//           <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
//             <div style={{ minWidth:0 }}>
//               <p style={{ fontSize:'0.82rem', fontWeight:500, color:'#f0eeff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name || 'User'}</p>
//               <p style={{ fontSize:'0.67rem', color:'#4a4a60', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'140px' }}>{user.email}</p>
//             </div>
//             <button onClick={logout} style={{ background:'transparent', border:'none', color:'#4a4a60', cursor:'pointer', padding:'4px', borderRadius:'6px', display:'flex', flexShrink:0, transition:'color 0.2s' }}
//               onMouseOver={e=>e.currentTarget.style.color='#fb7185'} onMouseOut={e=>e.currentTarget.style.color='#4a4a60'}>
//               <Icons.Logout />
//             </button>
//           </div>
//         </div>
//       </aside>
//
//       {/* MAIN */}
//       <main style={{ flex:1, overflowY:'auto', padding:'2rem 2.25rem' }}>
//         {/* Header */}
//         <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.75rem' }}>
//           <div>
//             <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1.5rem', color:'#f0eeff', letterSpacing:'-0.03em' }}>
//               {TYPE_CONFIG[filter]?.emoji} {TYPE_CONFIG[filter]?.label || 'All Files'}
//             </h1>
//             <p style={{ fontSize:'0.8rem', color:'#4a4a60', marginTop:'2px' }}>{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
//           </div>
//           <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
//             <div style={{ position:'relative' }}>
//               <span style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#4a4a60' }}><Icons.Search /></span>
//               <input value={rawSearch} onChange={e=>onSearch(e.target.value)} placeholder="Search…"
//                 style={{ padding:'0.55rem 0.75rem 0.55rem 2.1rem', background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', color:'#f0eeff', fontSize:'0.83rem', outline:'none', width:'200px', fontFamily:"'DM Sans',sans-serif", transition:'border-color 0.2s' }}
//                 onFocus={e=>e.target.style.borderColor='rgba(167,139,250,0.5)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'} />
//             </div>
//             <div style={{ display:'flex', background:'#0f0f1a', borderRadius:'9px', padding:'3px', border:'1px solid rgba(255,255,255,0.07)' }}>
//               {['grid','list'].map(m=>(
//                 <button key={m} onClick={()=>setView(m)} style={{ padding:'5px 9px', border:'none', borderRadius:'6px', cursor:'pointer', background: view===m ? 'rgba(167,139,250,0.18)' : 'transparent', color: view===m ? '#a78bfa' : '#4a4a60', display:'flex', alignItems:'center', transition:'all 0.15s' }}>
//                   {m==='grid' ? <Icons.Grid/> : <Icons.List/>}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//
//         <UploadZone onSuccess={onUpload} />
//
//         {/* Stats */}
//         <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'1.75rem' }}>
//           {STATS_ROW.map(s=>(
//             <div key={s.k} style={{ background:s.bg, border:`1px solid ${s.color}33`, borderRadius:'13px', padding:'0.9rem 1rem', transition:'transform 0.2s', cursor:'pointer' }}
//               onClick={()=>setFilter(s.k)}
//               onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'}
//               onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
//               <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'0.3rem' }}>
//                 <span style={{ fontSize:'14px' }}>{s.emoji}</span>
//                 <span style={{ fontSize:'0.7rem', color:s.color, fontWeight:500 }}>{s.label}</span>
//               </div>
//               <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1.6rem', color:s.color, lineHeight:1 }}>{stats[s.k]||0}</p>
//             </div>
//           ))}
//         </div>
//
//         {/* Documents */}
//         {loading ? (
//           <div style={{ textAlign:'center', padding:'5rem', color:'#4a4a60', fontSize:'0.875rem' }}>
//             <div style={{ fontSize:'1.5rem', animation:'spin 2s linear infinite', display:'inline-block', marginBottom:'1rem' }}>⚙</div>
//             <p>Loading…</p>
//           </div>
//         ) : docs.length === 0 ? (
//           <div style={{ textAlign:'center', padding:'5rem 2rem', color:'#4a4a60' }}>
//             <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>📂</div>
//             <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'1rem', color:'#8b8ba0', marginBottom:'0.3rem' }}>
//               {rawSearch ? `No results for "${rawSearch}"` : filter==='all' ? 'No documents yet' : `No ${filter} files yet`}
//             </p>
//             <p style={{ fontSize:'0.8rem' }}>Upload a file above to get started</p>
//           </div>
//         ) : view === 'grid' ? (
//           <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))', gap:'12px', animation:'fadeUp 0.25s ease' }}>
//             {docs.map(d => <DocCard key={d._id} doc={d} onDelete={onDelete} onClick={(doc) => openDoc(doc, 'view')} />)}
//           </div>
//         ) : (
//           <div style={{ display:'flex', flexDirection:'column', gap:'2px', animation:'fadeUp 0.25s ease' }}>
//             <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto auto', gap:'1rem', padding:'0.5rem 0.9rem', marginBottom:'0.25rem' }}>
//               {['Name','Type','Date','Size','Actions'].map(h=>(
//                 <span key={h} style={{ fontSize:'0.67rem', color:'#4a4a60', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</span>
//               ))}
//             </div>
//             {docs.map(d => {
//               const cfg = TYPE_CONFIG[d.type] || TYPE_CONFIG.pdf; const TIcon = cfg.icon
//               return (
//                 <div key={d._id} className="hov-row" style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto auto', gap:'1rem', alignItems:'center', padding:'0.75rem 0.9rem', borderRadius:'10px', cursor:'pointer', transition:'background 0.15s', border:'1px solid transparent' }}
//                   onMouseOver={e=>e.currentTarget.style.borderColor=cfg.color+'22'} onMouseOut={e=>e.currentTarget.style.borderColor='transparent'}>
//                   <div style={{ minWidth:0 }} onClick={() => openDoc(d,'view')}>
//                     <p style={{ fontSize:'0.875rem', fontWeight:500, color:'#f0eeff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.title}</p>
//                     <p style={{ fontSize:'0.74rem', color:'#8b8ba0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.summary?.slice(0,60)}…</p>
//                   </div>
//                   <span style={{ background:cfg.bg, color:cfg.color, padding:'2px 9px', borderRadius:'20px', fontSize:'0.67rem', fontWeight:600, textTransform:'uppercase', display:'flex', alignItems:'center', gap:'4px', whiteSpace:'nowrap' }}>{cfg.emoji} {d.type}</span>
//                   <span style={{ fontSize:'0.75rem', color:'#4a4a60', whiteSpace:'nowrap' }}>{fmt.ago(d.createdAt)}</span>
//                   <span style={{ fontSize:'0.75rem', color:'#4a4a60', whiteSpace:'nowrap' }}>{fmt.size(d.fileSize)}</span>
//                   <div style={{ display:'flex', gap:'5px' }}>
//                     {[['view', Icons.Eye], ['summary', Icons.Brain], ['explain', Icons.Spark]].map(([tab, Ico])=>(
//                       <button key={tab} onClick={()=>openDoc(d,tab)} title={tab}
//                         style={{ background:'rgba(255,255,255,0.04)', border:'none', color:'#4a4a60', cursor:'pointer', padding:'5px', display:'flex', borderRadius:'6px', transition:'all 0.15s' }}
//                         onMouseOver={e=>{ e.currentTarget.style.background=cfg.bg; e.currentTarget.style.color=cfg.color }}
//                         onMouseOut={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#4a4a60' }}>
//                         <Ico/>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </main>
//
//       {selected && (
//         <DocModal doc={selected} defaultTab={defaultTab}
//           onClose={() => setSelected(null)}
//           onDelete={(id) => { onDelete(id); setSelected(null) }} />
//       )}
//     </div>
//   )
// }