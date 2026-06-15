

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../style/mlclassifier.css'

// ─── PNG icon imports — same assets as dashboard ──────────────────────────────
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
import logo         from '../assets/logo.png'

const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('token')
  if (t) c.headers.Authorization = `Bearer ${t}`
  return c
})

// ─── PNG icon helper — identical to dashboard's PngIcon ───────────────────────
const PngIcon = ({ src, size = 14, style = {} }) => (
  <img src={src} alt="" width={size} height={size}
    style={{ objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', ...style }} />
)

// ─── SVG Icons — structural/utility only, matching dashboard SVG style ─────────
const Icons = {
  Back:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Refresh: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Spark:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Brain:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3z"/></svg>,
  Check:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Eye:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Info:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Download:() => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
}

// ─── Color config per classifier (matching dashboard accent palette) ───────────
const CLF_COLORS = {
  'SVM (LinearSVC)':     { bar: '#7c5cbf', bg: 'rgba(124,92,191,0.15)', text: '#a78bfa', border: 'rgba(124,92,191,0.35)', glow: 'rgba(124,92,191,0.2)' },
  'Naive Bayes':         { bar: '#34d399', bg: 'rgba(52,211,153,0.12)',  text: '#34d399', border: 'rgba(52,211,153,0.3)',  glow: 'rgba(52,211,153,0.15)' },
  'Logistic Regression': { bar: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  text: '#38bdf8', border: 'rgba(56,189,248,0.3)',  glow: 'rgba(56,189,248,0.15)' },
  'Random Forest':       { bar: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24', border: 'rgba(251,191,36,0.3)',  glow: 'rgba(251,191,36,0.15)' },
}

const scoreColor = (v) =>
  v >= 80 ? '#34d399' : v >= 60 ? '#fbbf24' : v >= 40 ? '#f97316' : '#f87171'

// ─── Animated progress bar (CSS class-driven) ─────────────────────────────────
function Bar({ value, color, max = 100, height = 8 }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW(value), 100)
    return () => clearTimeout(t)
  }, [value])
  return (
    <div className="ml-bar-track" style={{ height }}>
      <div
        className="ml-bar-fill"
        style={{ width: `${(w / max) * 100}%`, background: color, height: '100%' }}
      />
    </div>
  )
}

// ─── Radar / Spider chart (pure SVG) ─────────────────────────────────────────
function RadarChart({ classifiers, metrics }) {
  const cx = 160, cy = 160, r = 120
  const n = metrics.length
  const angleStep = (2 * Math.PI) / n
  const angleOffset = -Math.PI / 2

  const toXY = (angle, radius) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  })

  const gridLevels = [0.25, 0.5, 0.75, 1]

  return (
    <svg viewBox="0 0 320 320" className="ml-radar-svg">
      {/* Grid rings */}
      {gridLevels.map((lvl) => {
        const pts = metrics.map((_, i) => {
          const a = angleOffset + i * angleStep
          const p = toXY(a, r * lvl)
          return `${p.x},${p.y}`
        }).join(' ')
        return <polygon key={lvl} points={pts} fill="none" stroke="rgba(91,63,166,0.12)" strokeWidth="1" />
      })}

      {/* Axis lines */}
      {metrics.map((_, i) => {
        const a = angleOffset + i * angleStep
        const end = toXY(a, r)
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(91,63,166,0.15)" strokeWidth="1" />
      })}

      {/* Axis labels */}
      {metrics.map((m, i) => {
        const a = angleOffset + i * angleStep
        const p = toXY(a, r + 20)
        return (
          <text key={m} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="var(--text-muted)" fontFamily="DM Sans, sans-serif">
            {m}
          </text>
        )
      })}

      {/* Data polygons per classifier */}
      {classifiers.map((clf) => {
        const c = CLF_COLORS[clf.name] || CLF_COLORS['Logistic Regression']
        const vals = [clf.accuracy, clf.precision, clf.recall, clf.f1_score, clf.cv_mean]
        const pts = vals.map((v, i) => {
          const a = angleOffset + i * angleStep
          const p = toXY(a, r * (v / 100))
          return `${p.x},${p.y}`
        }).join(' ')
        return (
          <g key={clf.name}>
            <polygon points={pts} fill={c.bg} stroke={c.bar} strokeWidth="1.5" opacity="0.85" />
            {vals.map((v, i) => {
              const a = angleOffset + i * angleStep
              const p = toXY(a, r * (v / 100))
              return <circle key={i} cx={p.x} cy={p.y} r="3" fill={c.bar} />
            })}
          </g>
        )
      })}
    </svg>
  )
}

// ─── Grouped bar chart (SVG) ──────────────────────────────────────────────────
function GroupedBarChart({ classifiers, metric, label }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t) }, [])

  const W = 520, H = 180, padL = 10, padB = 30, padT = 16, padR = 10
  const chartW = W - padL - padR
  const chartH = H - padB - padT
  const barW = (chartW / classifiers.length) * 0.55
  const gap = chartW / classifiers.length

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {/* Y-axis grid lines */}
      {[0, 25, 50, 75, 100].map((v) => {
        const y = padT + chartH - (v / 100) * chartH
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(91,63,166,0.1)" strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 2} y={y + 4} fontSize="8" fill="var(--text-muted)" textAnchor="end" fontFamily="DM Sans">{v}</text>
          </g>
        )
      })}

      {classifiers.map((clf, i) => {
        const c = CLF_COLORS[clf.name] || CLF_COLORS['Logistic Regression']
        const val = clf[metric] ?? 0
        const barH = animated ? (val / 100) * chartH : 0
        const x = padL + i * gap + (gap - barW) / 2
        const y = padT + chartH - barH
        return (
          <g key={clf.name}>
            <rect
              x={x} y={y} width={barW} height={barH} rx="4"
              fill={c.bar} opacity="0.85"
              style={{ transition: 'height 0.7s cubic-bezier(0.4,0,0.2,1), y 0.7s cubic-bezier(0.4,0,0.2,1)' }}
            />
            <text x={x + barW / 2} y={padT + chartH + 14} fontSize="9" fill="var(--text-secondary)" textAnchor="middle" fontFamily="DM Sans">
              {clf.name.split(' ')[0]}
            </text>
            <text x={x + barW / 2} y={y - 4} fontSize="9" fill={c.text} textAnchor="middle" fontFamily="DM Sans" fontWeight="600">
              {val}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Mini sparkline for CV stability ─────────────────────────────────────────
function CvStabilityDot({ mean, std, color }) {
  const radius = 28
  const cx = 32, cy = 32
  const circumference = 2 * Math.PI * radius
  const [dash, setDash] = useState(0)
  useEffect(() => { const t = setTimeout(() => setDash((mean / 100) * circumference), 120); return () => clearTimeout(t) }, [mean])
  return (
    <svg viewBox="0 0 64 64" width="64" height="64">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(91,63,166,0.1)" strokeWidth="5" />
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${circumference}`}
        strokeDashoffset={circumference * 0.25}
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill={color} fontFamily="DM Sans">
        {mean}%
      </text>
    </svg>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ data }) {
  const sorted = [...data.classifiers].sort((a, b) => b.accuracy - a.accuracy)
  const [activeMetric, setActiveMetric] = useState('accuracy')
  const [hoveredClf, setHoveredClf] = useState(null)
  const metrics = ['accuracy', 'precision', 'recall', 'f1_score', 'cv_mean']
  const metricLabels = { accuracy: 'Accuracy', precision: 'Precision', recall: 'Recall', f1_score: 'F1 Score', cv_mean: 'CV Mean' }

  return (
    <div className="ml-tab-content">
      {/* Stats row — matching dashboard stat cards style */}
      <div className="ml-stats-grid">
        {[
          { label: 'Best Accuracy', value: `${data.best_accuracy}%`, color: 'var(--purple-mid)', sub: data.best },
          { label: 'Train Samples', value: data.train_size, color: 'var(--accent-green)', sub: 'samples used' },
          { label: 'Test Samples', value: data.test_size, color: 'var(--accent-blue)', sub: 'for evaluation' },
          { label: 'Classes', value: data.subjects.length, color: 'var(--accent-yellow)', sub: 'subject categories' },
        ].map(s => (
          <div key={s.label} className="ml-stat-card" style={{ borderColor: s.color + '33' }}>
            <p className="ml-stat-label">{s.label}</p>
            <p className="ml-stat-value" style={{ color: s.color }}>{s.value}</p>
            <p className="ml-stat-sub">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Two column: Radar + Metric bar selector */}
      <div className="ml-graph-row">
        {/* Radar chart */}
        <div className="ml-card">
          <div className="ml-card-header">
            <PngIcon src={walletIcon} size={15} style={{ opacity: 0.85 }} />
            <span>Multi-Metric Radar</span>
          </div>
          <RadarChart classifiers={data.classifiers} metrics={['Acc', 'Prec', 'Recall', 'F1', 'CV']} />
          {/* Legend */}
          <div className="ml-radar-legend">
            {data.classifiers.map(clf => {
              const c = CLF_COLORS[clf.name] || CLF_COLORS['Logistic Regression']
              return (
                <div key={clf.name} className="ml-legend-item">
                  <div className="ml-legend-dot" style={{ background: c.bar }} />
                  <span style={{ color: c.text, fontSize: '0.72rem' }}>{clf.name.split(' ')[0]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bar chart with metric switcher */}
        <div className="ml-card">
          <div className="ml-card-header">
            <PngIcon src={empireIcon} size={15} style={{ opacity: 0.85 }} />
            <span>Metric Comparison</span>
          </div>
          <div className="ml-metric-pills">
            {metrics.map(m => (
              <button
                key={m}
                className={`ml-metric-pill${activeMetric === m ? ' active' : ''}`}
                onClick={() => setActiveMetric(m)}
              >
                {metricLabels[m]}
              </button>
            ))}
          </div>
          <GroupedBarChart classifiers={data.classifiers} metric={activeMetric} label={metricLabels[activeMetric]} />
        </div>
      </div>

      {/* Classifier comparison cards */}
      <div className="ml-section-label">
        <PngIcon src={princessIcon} size={14} style={{ opacity: 0.8 }} /> Classifier Rankings
      </div>
      <div className="ml-clf-list">
        {sorted.map((clf, i) => {
          const c = CLF_COLORS[clf.name] || CLF_COLORS['Logistic Regression']
          const isBest = clf.name === data.best
          const isHovered = hoveredClf === clf.name
          return (
            <div
              key={clf.name}
              className={`ml-clf-card${isBest ? ' best' : ''}${isHovered ? ' hovered' : ''}`}
              style={{ borderColor: (isBest || isHovered) ? c.border : 'var(--border-soft)', '--clf-glow': c.glow }}
              onMouseEnter={() => setHoveredClf(clf.name)}
              onMouseLeave={() => setHoveredClf(null)}
            >
              <div className="ml-clf-header">
                <div className="ml-clf-identity">
                  <span className="ml-rank-badge" style={{ background: c.bg, color: c.text }}>#{i + 1}</span>
                  <div className="ml-clf-dot" style={{ background: c.bar }} />
                  <span className="ml-clf-name">{clf.name}</span>
                  {isBest && (
                    <span className="ml-best-badge" style={{ background: c.bg, color: c.text, borderColor: c.border }}>
                      ★ BEST
                    </span>
                  )}
                </div>
                <div className="ml-clf-accuracy" style={{ color: c.text }}>
                  {clf.accuracy}%
                </div>
              </div>

              {/* Metric bars */}
              <div className="ml-metrics-grid">
                {metrics.map(m => (
                  <div key={m} className="ml-metric-row-item">
                    <div className="ml-metric-labels">
                      <span className="ml-metric-name">{metricLabels[m]}</span>
                      <span className="ml-metric-val" style={{ color: scoreColor(clf[m]) }}>{clf[m]}%</span>
                    </div>
                    <Bar value={clf[m]} color={m === 'accuracy' ? c.bar : scoreColor(clf[m])} height={6} />
                  </div>
                ))}
              </div>

              {/* CV stability ring */}
              <div className="ml-cv-row">
                <CvStabilityDot mean={clf.cv_mean} std={clf.cv_std} color={c.bar} />
                <div className="ml-cv-info">
                  <p className="ml-cv-label">5-Fold Cross-Validation</p>
                  <p className="ml-cv-val" style={{ color: c.text }}>{clf.cv_mean}% <span>± {clf.cv_std}%</span></p>
                  <p className="ml-cv-note">{clf.cv_std < 3 ? '✓ Stable generalisation' : clf.cv_std < 6 ? '⚡ Moderate variance' : '⚠ High variance'}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

// ─── Per-Class Tab ────────────────────────────────────────────────────────────
function PerClassTab({ data }) {
  const sorted = [...data.per_class].sort((a, b) => b.f1 - a.f1)
  const [sortKey, setSortKey] = useState('f1')
  const [sortedData, setSortedData] = useState(sorted)

  const handleSort = (key) => {
    setSortKey(key)
    setSortedData([...data.per_class].sort((a, b) => b[key] - a[key]))
  }

  // Mini F1 bar chart
  const maxF1 = Math.max(...data.per_class.map(d => d.f1))

  return (
    <div className="ml-tab-content">
      <p className="ml-desc-text">
        Per-subject breakdown for the best model ({data.best}). Sorted by F1 score — the harmonic mean of precision and recall.
      </p>

      {/* Mini visual bar chart of F1 scores */}
      <div className="ml-card" style={{ marginBottom: '1.25rem' }}>
        <div className="ml-card-header">
          <PngIcon src={fileIcon} size={15} style={{ opacity: 0.85 }} /> <span>F1 Score by Subject</span>
        </div>
        <div className="ml-perclass-bars">
          {[...data.per_class].sort((a, b) => b.f1 - a.f1).map((row) => (
            <div key={row.subject} className="ml-perclass-bar-row">
              <span className="ml-perclass-subject">{row.subject}</span>
              <div className="ml-perclass-track">
                <Bar value={row.f1} color={scoreColor(row.f1)} height={10} />
              </div>
              <span className="ml-perclass-val" style={{ color: scoreColor(row.f1) }}>{row.f1}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sortable table */}
      <div className="ml-card">
        <div className="ml-table-header">
          <span className="ml-th-subject">Subject</span>
          {['precision', 'recall', 'f1'].map(k => (
            <button key={k} className={`ml-th-btn${sortKey === k ? ' active' : ''}`} onClick={() => handleSort(k)}>
              {k === 'f1' ? 'F1 Score' : k.charAt(0).toUpperCase() + k.slice(1)} {sortKey === k ? '↓' : ''}
            </button>
          ))}
          <span className="ml-th-support">Support</span>
        </div>

        <div className="ml-table-body">
          {sortedData.map((row, i) => (
            <div key={row.subject} className="ml-table-row" style={{ animationDelay: `${i * 0.03}s` }}>
              <span className="ml-td-subject">{row.subject}</span>
              {['precision', 'recall', 'f1'].map(k => (
                <div key={k} className="ml-td-metric">
                  <span style={{ color: scoreColor(row[k]), fontWeight: 600, fontSize: '0.82rem', minWidth: '36px' }}>{row[k]}%</span>
                  <Bar value={row[k]} color={scoreColor(row[k])} height={5} />
                </div>
              ))}
              <span className="ml-td-support">{row.support}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ml-score-legend">
        {[['#34d399', '≥ 80% Excellent'], ['#fbbf24', '60–79% Good'], ['#f97316', '40–59% Fair'], ['#f87171', '< 40% Poor']].map(([color, label]) => (
          <div key={label} className="ml-legend-item">
            <div className="ml-legend-dot" style={{ background: color }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Confusion Matrix Tab ─────────────────────────────────────────────────────
function ConfusionTab({ data }) {
  const { labels, matrix } = data.confusion_matrix
  const [hoveredCell, setHoveredCell] = useState(null)
  const maxVal = Math.max(...matrix.flat().filter(v => v > 0))

  // Compute per-row accuracy
  const rowAcc = matrix.map(row => {
    const total = row.reduce((s, v) => s + v, 0)
    const diag = row[matrix.indexOf(row)]
    return total > 0 ? Math.round((diag / total) * 100) : 0
  })

  return (
    <div className="ml-tab-content">
      <p className="ml-desc-text">
        Rows = actual subjects · Columns = predicted subjects · Diagonal (purple) = correct · Off-diagonal (red) = misclassifications
      </p>

      <div className="ml-card">
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'inline-block', minWidth: '100%' }}>
            {/* Column labels */}
            <div className="ml-cm-col-labels">
              <div style={{ width: '100px' }} />
              {labels.map(l => (
                <div key={l} className="ml-cm-col-label">
                  {l.length > 8 ? l.slice(0, 7) + '…' : l}
                </div>
              ))}
              <div style={{ width: '52px' }} />
            </div>

            {/* Rows */}
            {matrix.map((row, ri) => (
              <div key={labels[ri]} className="ml-cm-row">
                <div className="ml-cm-row-label">{labels[ri]}</div>
                {row.map((val, ci) => {
                  const isDiag = ri === ci
                  const opacity = val === 0 ? 0.04 : 0.15 + (val / maxVal) * 0.75
                  const isHovered = hoveredCell && (hoveredCell.r === ri || hoveredCell.c === ci)
                  const bg = isDiag
                    ? `rgba(124,92,191,${opacity})`
                    : val > 0 ? `rgba(251,113,133,${opacity})` : 'rgba(91,63,166,0.04)'
                  const textColor = isDiag && val > 0 ? 'var(--purple-light)' : val > 0 ? 'var(--accent-pink)' : 'var(--border-mid)'
                  return (
                    <div
                      key={ci}
                      className={`ml-cm-cell${isDiag && val > 0 ? ' diag' : ''}${val > 0 && !isDiag ? ' error' : ''}`}
                      style={{
                        background: bg,
                        borderColor: isDiag && val > 0 ? 'rgba(124,92,191,0.35)' : 'rgba(91,63,166,0.06)',
                        outline: hoveredCell?.r === ri && hoveredCell?.c === ci ? '2px solid var(--purple-mid)' : 'none',
                        transform: hoveredCell?.r === ri && hoveredCell?.c === ci ? 'scale(1.08)' : 'scale(1)',
                      }}
                      onMouseEnter={() => setHoveredCell({ r: ri, c: ci })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${labels[ri]} → ${labels[ci]}: ${val}`}
                    >
                      <span style={{ color: textColor, fontWeight: val > 0 ? 600 : 400 }}>{val}</span>
                    </div>
                  )
                })}
                {/* Row accuracy */}
                <div className="ml-cm-row-acc" style={{ color: scoreColor(rowAcc[ri]) }}>
                  {rowAcc[ri]}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {hoveredCell && (
          <div className="ml-cm-tooltip">
            <Icons.Info />
            <span>
              Actual: <strong>{labels[hoveredCell.r]}</strong> → Predicted: <strong>{labels[hoveredCell.c]}</strong> — <strong>{matrix[hoveredCell.r][hoveredCell.c]}</strong> samples
              {hoveredCell.r === hoveredCell.c ? ' ✓ Correct' : ' ✗ Misclassified'}
            </span>
          </div>
        )}
      </div>

      <div className="ml-legend-row">
        <div className="ml-legend-item"><div className="ml-legend-swatch" style={{ background: 'rgba(124,92,191,0.55)', borderColor: 'rgba(124,92,191,0.4)' }} /><span>Correct (diagonal)</span></div>
        <div className="ml-legend-item"><div className="ml-legend-swatch" style={{ background: 'rgba(251,113,133,0.55)' }} /><span>Misclassified</span></div>
        <div className="ml-legend-item"><div className="ml-legend-swatch" style={{ background: 'rgba(91,63,166,0.06)' }} /><span>Zero predictions</span></div>
      </div>
    </div>
  )
}

// ─── Live Predictor Tab ───────────────────────────────────────────────────────
function PredictTab({ serverOnline }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [classifyAll, setClassifyAll] = useState(null)
  const [classifying, setClassifying] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const textareaRef = useRef()

  const EXAMPLES = [
    { label: 'OOP', text: 'inheritance polymorphism encapsulation abstract class method overriding virtual function interface' },
    { label: 'ML', text: 'neural network gradient descent backpropagation training accuracy loss function overfitting regularization' },
    { label: 'Data Structures', text: 'binary search tree AVL rotation insertion deletion traversal inorder preorder postorder balanced' },
    { label: 'Networks', text: 'TCP IP protocol routing DNS HTTP request response socket connection three way handshake subnet' },
  ]

  const predict = async (inputText) => {
    const t = (inputText || text).trim()
    if (!t) return
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/ml/predict', { text: t })
      setResult(res.data)
    } catch (err) {
      setResult({ error: err.response?.data?.message || 'Prediction failed. Is the ML server running?' })
    }
    setLoading(false)
  }

  const classifyAllDocs = async () => {
    setClassifying(true)
    setClassifyAll(null)
    try {
      const res = await api.post('/ml/classify-all')
      setClassifyAll(res.data)
    } catch (err) {
      setClassifyAll({ error: err.response?.data?.message || 'Failed to classify documents.' })
    }
    setClassifying(false)
  }

  const handleTextChange = (e) => {
    setText(e.target.value)
    setCharCount(e.target.value.length)
  }

  return (
    <div className="ml-tab-content">
      <div className="ml-predict-layout">
        {/* Input panel */}
        <div className="ml-predict-panel">
          <div className="ml-card">
            <div className="ml-card-header">
              <PngIcon src={spiderIcon} size={15} style={{ opacity: 0.9 }} /> <span>Live Text Classifier</span>
              {!serverOnline && (
                <span className="ml-offline-badge">● ML Offline</span>
              )}
            </div>

            {/* Quick example pills */}
            <div className="ml-example-row">
              <span className="ml-example-label">Try example:</span>
              {EXAMPLES.map(ex => (
                <button key={ex.label} className="ml-example-pill" onClick={() => { setText(ex.text); setCharCount(ex.text.length); predict(ex.text) }}>
                  {ex.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div className="ml-textarea-wrap">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) predict() }}
                placeholder="Paste document text or keywords here to classify its subject…"
                className="ml-textarea"
                rows={5}
              />
              <span className="ml-char-count">{charCount} chars</span>
            </div>

            <div className="ml-predict-actions">
              <button
                onClick={() => predict()}
                disabled={loading || !text.trim()}
                className={`ml-btn-primary${loading || !text.trim() ? ' disabled' : ''}`}
              >
                {loading ? <><span className="ml-spin">⚙</span> Classifying…</> : <><PngIcon src={spiderIcon} size={13} style={{ marginRight: '4px' }} /> Classify Text</>}
              </button>
              <button onClick={() => { setText(''); setResult(null); setCharCount(0) }} className="ml-btn-ghost">
                Clear
              </button>
              <span className="ml-hint">Ctrl+Enter</span>
            </div>
          </div>
        </div>

        {/* Result panel */}
        <div className="ml-result-panel">
          {result && !result.error && (
            <div className="ml-card ml-result-card">
              <div className="ml-result-header">
                <div className="ml-result-badge" style={{ background: 'linear-gradient(135deg, var(--purple-mid), var(--purple-deep))' }}>
                  <span className="ml-result-subject">{result.subject}</span>
                </div>
                <div className="ml-result-meta">
                  {result.confidence != null && (
                    <div className="ml-result-meta-item">
                      <span className="ml-meta-label">Confidence</span>
                      <span className="ml-meta-val" style={{ color: scoreColor(result.confidence) }}>{result.confidence?.toFixed(1)}%</span>
                    </div>
                  )}
                  <div className="ml-result-meta-item">
                    <span className="ml-meta-label">Model</span>
                    <span className="ml-meta-val-sm">{result.model_used}</span>
                  </div>
                </div>
              </div>

              {/* Confidence gauge */}
              {result.confidence != null && (
                <div className="ml-confidence-bar">
                  <div className="ml-confidence-label">
                    <span>Confidence</span>
                    <span style={{ color: scoreColor(result.confidence) }}>{result.confidence?.toFixed(1)}%</span>
                  </div>
                  <Bar value={result.confidence} color={scoreColor(result.confidence)} height={10} />
                </div>
              )}

              {/* Score distribution chart */}
              {result.all_scores && Object.keys(result.all_scores).length > 0 && (
                <div className="ml-scores-section">
                  <p className="ml-scores-title">Score Distribution</p>
                  <div className="ml-scores-list">
                    {Object.entries(result.all_scores).slice(0, 8).map(([subj, score]) => (
                      <div key={subj} className="ml-score-row">
                        <span className={`ml-score-label${subj === result.subject ? ' winner' : ''}`}>{subj}</span>
                        <div className="ml-score-track">
                          <Bar value={score} color={subj === result.subject ? 'var(--purple-mid)' : 'rgba(124,92,191,0.25)'} height={8} />
                        </div>
                        <span className="ml-score-val" style={{ color: subj === result.subject ? 'var(--purple-light)' : 'var(--text-muted)' }}>{score.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {result?.error && (
            <div className="ml-card ml-error-card">
              <p className="ml-error-icon">⚠️</p>
              <p className="ml-error-msg">{result.error}</p>
            </div>
          )}

          {!result && !loading && (
            <div className="ml-card ml-empty-result">
              <PngIcon src={yodaIcon} size={36} style={{ opacity: 0.35, marginBottom: '0.5rem' }} />
              <p>Enter text and click Classify to see results here</p>
            </div>
          )}
        </div>
      </div>

      {/* Auto-classify all */}
      <div className="ml-card ml-auto-classify">
        <div className="ml-card-header">
          <PngIcon src={uploadIcon} size={15} style={{ opacity: 0.85 }} /> <span>Auto-classify Library</span>
        </div>
        <p className="ml-auto-desc">
          Runs the trained classifier on every document in your library and saves the predicted subject. This powers automatic grouping in the Knowledge Graph.
        </p>
        <button onClick={classifyAllDocs} disabled={classifying} className={`ml-btn-outline${classifying ? ' disabled' : ''}`}>
          {classifying ? <><span className="ml-spin">⚙</span> Classifying…</> : <><PngIcon src={uploadIcon} size={13} style={{ marginRight: '4px' }} /> Classify All Documents</>}
        </button>

        {classifyAll && !classifyAll.error && (
          <div className="ml-classify-results">
            <p className="ml-classify-count">
              <Icons.Check /> Classified {classifyAll.classified}/{classifyAll.total} documents
            </p>
            <div className="ml-classify-tags">
              {classifyAll.results?.slice(0, 12).map(r => (
                <span key={r.id} className="ml-classify-tag">
                  {r.title.slice(0, 18)} → <span style={{ color: 'var(--purple-light)' }}>{r.subject}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        {classifyAll?.error && (
          <p className="ml-error-inline">{classifyAll.error}</p>
        )}
      </div>
    </div>
  )
}

// ─── Main MLClassifier Page ───────────────────────────────────────────────────
export default function MLClassifier() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')
  const [serverOnline, setServerOnline] = useState(false)
  const [retraining, setRetraining] = useState(false)

  const loadResults = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/ml/results')
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load results. Make sure predict.py is running.')
    } finally {
      setLoading(false)
    }
  }

  const checkHealth = async () => {
    try {
      await api.get('/ml/health')
      setServerOnline(true)
    } catch {
      setServerOnline(false)
    }
  }

  const retrain = async () => {
    setRetraining(true)
    try {
      await api.post('/ml/retrain')
      await loadResults()
    } catch { /* handled by loadResults */ }
    setRetraining(false)
  }

  useEffect(() => {
    loadResults()
    checkHealth()
    const interval = setInterval(checkHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  const TABS = [
    { id: 'overview', label: 'Classifier Comparison', pngIcon: empireIcon   },
    { id: 'perclass', label: 'Per-Class Metrics',     pngIcon: fileIcon     },
    { id: 'confusion', label: 'Confusion Matrix',     pngIcon: yodaIcon     },
    { id: 'predict',  label: 'Live Predictor',        pngIcon: spiderIcon   },
  ]

  return (
    <div className="ml-wrapper">
      {/* Header — matching dashboard sidebar visual style */}
      <header className="ml-header">
        <div className="ml-header-left">
          <Link to="/dashboard" className="ml-back-btn">
            <Icons.Back />
          </Link>
          <img src={logo} alt="logo" className="ml-header-logo" />
          <div>
            <p className="ml-header-title">ML Document Classifier</p>
            <p className="ml-header-sub">TF-IDF · SVM · Logistic Regression · Naive Bayes · Random Forest</p>
          </div>
        </div>

        <div className="ml-header-right">
          <div className={`ml-server-badge${serverOnline ? ' online' : ' offline'}`}>
            <div className="ml-server-dot" />
            <span>{serverOnline ? 'ML Online' : 'ML Offline'}</span>
          </div>
          <button onClick={retrain} disabled={retraining} className={`ml-retrain-btn${retraining ? ' disabled' : ''}`}>
            <Icons.Refresh /> {retraining ? 'Retraining…' : 'Retrain'}
          </button>
          <Link to="/eval" className="ml-eval-link">
            <PngIcon src={princessIcon} size={14} style={{ opacity: 0.9 }} /> RAG Eval
          </Link>
        </div>
      </header>

      <div className="ml-content">
        {/* Loading */}
        {loading && (
          <div className="ml-loading">
            <div className="ml-loading-spin">⚙</div>
            <p>Loading classifier results…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="ml-error-banner">
            <p className="ml-error-emoji">⚠️</p>
            <p className="ml-error-title">ML server not reachable</p>
            <p className="ml-error-detail">{error}</p>
            <div className="ml-error-code">
              <p className="ml-code-label">Start the ML server:</p>
              <code>cd ml &amp;&amp; python3 predict.py</code>
            </div>
          </div>
        )}

        {/* Tabs + content */}
        {(data || !loading) && (
          <>
            <div className="ml-tab-bar">
              {TABS.map(t => {
                const active = tab === t.id
                const canShow = t.id === 'predict' || data
                if (!canShow) return null
                return (
                  <button
                    key={t.id}
                    className={`ml-tab-btn${active ? ' active' : ''}`}
                    onClick={() => setTab(t.id)}
                  >
                    <PngIcon src={t.pngIcon} size={14} style={{ opacity: active ? 1 : 0.6 }} />
                    {t.label}
                  </button>
                )
              })}
            </div>

            {data && tab === 'overview'  && <OverviewTab  data={data} />}
            {data && tab === 'perclass'  && <PerClassTab  data={data} />}
            {data && tab === 'confusion' && <ConfusionTab data={data} />}
            {tab === 'predict'           && <PredictTab   serverOnline={serverOnline} />}
          </>
        )}
      </div>
    </div>
  )
}