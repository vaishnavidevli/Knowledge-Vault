import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/kg.css";

import spiderIcon   from "../assets/icons/icons8-spider-man-new-50.png";
import empireIcon   from "../assets/icons/icons8-empire-50.png";
import musicIcon    from "../assets/icons/music-maker-app.png";
import cameraIcon   from "../assets/icons/camera.png";
import fileIcon     from "../assets/icons/pages.png";
import walletIcon   from "../assets/icons/wallet-passes-app.png";

import logo from "../assets/logo.png";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const PngIcon = ({ src, size = 14, style = {} }) => (
  <img src={src} alt="" width={size} height={size}
    style={{ objectFit: "contain", display: "inline-block", verticalAlign: "middle", ...style }} />
);

const Icons = {
  Back:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
  Search:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  Close:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Eye:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  Clock:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Layers:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Plus:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Minus:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Refresh:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  // ── NEW: expand / collapse arrows ──────────────────────────────────────────
  Expand:   () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  ),
  Collapse: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
      <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
    </svg>
  ),
};

const TYPE_CONFIG = {
  pdf:   { color: "#e05cb5", bg: "rgba(224,92,181,0.15)",  glow: "rgba(224,92,181,0.3)",  pngIcon: empireIcon  },
  image: { color: "#34d399", bg: "rgba(52,211,153,0.15)",  glow: "rgba(52,211,153,0.3)",  pngIcon: cameraIcon  },
  audio: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  glow: "rgba(245,158,11,0.3)",  pngIcon: musicIcon   },
  video: { color: "#38bdf8", bg: "rgba(56,189,248,0.15)",  glow: "rgba(56,189,248,0.25)", pngIcon: walletIcon  },
};

const fmt = {
  size: (b) => !b ? "—" : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`,
  date: (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
  ago:  (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    return s < 60 ? "just now" : s < 3600 ? `${Math.floor(s / 60)}m ago`
      : s < 86400 ? `${Math.floor(s / 3600)}h ago` : `${Math.floor(s / 86400)}d ago`;
  },
};

const CONCEPT_GROUPS = {
  "Object Oriented Programming": [
    "object oriented","object-oriented","oops","inheritance","polymorphism",
    "encapsulation","abstraction","overloading","overriding","superclass","subclass",
    "derived class","base class","virtual function","abstract class","access modifier",
    "constructor","destructor","solid principles","design pattern",
  ],
  "Data Structures": [
    "linked list","binary tree","binary search tree","hash table","hash map",
    "data structure","traversal","inorder","preorder","postorder","depth first",
    "breadth first","adjacency matrix","adjacency list",
  ],
  Algorithms: [
    "algorithm","time complexity","space complexity","dynamic programming",
    "divide and conquer","backtracking","memoization","binary search",
    "bubble sort","merge sort","quick sort","insertion sort","greedy algorithm",
  ],
  Database: [
    "database","dbms","normalization","primary key","foreign key","transaction",
    "acid properties","sql query","nosql","mongodb","postgresql","mysql",
    "relational database","schema design",
  ],
  "Machine Learning": [
    "machine learning","neural network","deep learning","classification","regression",
    "clustering","gradient descent","overfitting","underfitting","random forest",
    "decision tree","support vector","convolutional","recurrent neural",
    "natural language processing","computer vision","training dataset",
  ],
  "Operating Systems": [
    "operating system","process scheduling","deadlock","memory management",
    "virtual memory","semaphore","mutex","inter process","file system",
    "cpu scheduling","kernel","paging","segmentation",
  ],
  "Computer Networks": [
    "computer network","tcp ip","http protocol","dns server","osi model",
    "subnet mask","network topology","packet switching","ethernet","firewall",
    "client server","bandwidth","latency",
  ],
  "Web Development": [
    "react","express","frontend","backend","rest api","graphql",
    "html css","javascript","dom manipulation","web framework","node.js",
    "web application","responsive design",
  ],
  "Software Engineering": [
    "software development","design pattern","singleton","factory pattern",
    "agile methodology","scrum","sdlc","unit testing","microservices",
    "continuous integration","version control","software architecture",
  ],
  Mathematics: [
    "calculus","derivative","integral","linear algebra","matrix multiplication",
    "probability","statistics","discrete mathematics","fourier transform",
    "differential equation","eigenvalue","eigenvector","combinatorics",
  ],
};

function fuzzyMatch(a, b) {
  const la = a.toLowerCase().replace(/[^a-z0-9]/g, "");
  const lb = b.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (la.length < 5 || lb.length < 5) return false;
  const shorter = Math.min(la.length, lb.length);
  const longer  = Math.max(la.length, lb.length);
  if (shorter / longer < 0.6) return false;
  return la.includes(lb) || lb.includes(la);
}

function getConceptGroups(keyword) {
  const k = keyword.toLowerCase().trim();
  if (k.length < 5) return [];
  const groups = [];
  for (const [group, terms] of Object.entries(CONCEPT_GROUPS)) {
    if (terms.some((t) => k === t || (t.length >= 8 && k.includes(t)))) groups.push(group);
  }
  return groups;
}

function getDocConceptGroups(doc) {
  const groups = new Set();
  for (const kw of doc.keywords || []) {
    for (const g of getConceptGroups(kw)) groups.add(g);
  }
  return groups;
}

function computeKeywordConnection(a, b) {
  const kA = (a.keywords || []).map((k) => k.toLowerCase().trim());
  const kB = (b.keywords || []).map((k) => k.toLowerCase().trim());
  const setA  = new Set(kA);
  const exact = kB.filter((k) => setA.has(k));
  if (exact.length > 0) return { connected: true, sharedLabels: exact.slice(0, 2), reason: "exact", sharedGroups: [] };
  const fuzzy = [];
  for (const ka of kA) {
    for (const kb of kB) {
      if (!setA.has(kb) && fuzzyMatch(ka, kb)) fuzzy.push(kb);
    }
  }
  if (fuzzy.length > 0) return { connected: true, sharedLabels: fuzzy.slice(0, 2), reason: "fuzzy", sharedGroups: [] };
  const groupsA      = getDocConceptGroups(a);
  const groupsB      = getDocConceptGroups(b);
  const sharedGroups = [...groupsA].filter((g) => groupsB.has(g));
  if (sharedGroups.length >= 2) {
    const confirmed = sharedGroups.filter((group) => {
      const terms = CONCEPT_GROUPS[group] || [];
      return kA.some((k) => terms.some((t) => k === t)) &&
             kB.some((k) => terms.some((t) => k === t));
    });
    if (confirmed.length >= 2) return { connected: true, sharedLabels: confirmed.slice(0, 2), reason: "concept", sharedGroups: confirmed };
  }
  return { connected: false, sharedLabels: [], reason: null, sharedGroups: [] };
}

function computeConnection(a, b, semanticEdgeMap = new Map()) {
  const key1 = `${a._id}:${b._id}`;
  const key2 = `${b._id}:${a._id}`;
  const sem  = semanticEdgeMap.get(key1) || semanticEdgeMap.get(key2);

  if (!sem) return { connected: false, sharedLabels: [], reason: null, sharedGroups: [] };

  if (sem.sharedKeywords?.length) {
    return { connected: true, reason: "semantic", score: sem.score, sharedLabels: sem.sharedKeywords.slice(0, 2), sharedGroups: [] };
  }
  if (sem.topic) {
    return { connected: true, reason: "semantic", score: sem.score, sharedLabels: [sem.topic], sharedGroups: [] };
  }

  const kw = computeKeywordConnection(a, b);
  if (kw.sharedLabels.length) {
    return { connected: true, reason: "semantic", score: sem.score, sharedLabels: kw.sharedLabels, sharedGroups: kw.sharedGroups };
  }

  const kA = (a.keywords || []);
  const kB = (b.keywords || []);
  for (const ka of kA) {
    for (const kb of kB) {
      if (fuzzyMatch(ka, kb)) {
        return { connected: true, reason: "semantic", score: sem.score, sharedLabels: [ka], sharedGroups: [] };
      }
    }
  }

  const groupsA      = getDocConceptGroups(a);
  const groupsB      = getDocConceptGroups(b);
  const sharedGroups = [...groupsA].filter(g => groupsB.has(g));
  if (sharedGroups.length) {
    return { connected: true, reason: "semantic", score: sem.score, sharedLabels: [sharedGroups[0]], sharedGroups };
  }

  return { connected: true, reason: "semantic", score: sem.score, sharedLabels: [`${Math.round(sem.score * 100)}% similar`], sharedGroups: [] };
}

function getNeighborIds(docId, allEdges) {
  const ids = new Set();
  for (const e of allEdges) {
    if (e.from === docId) ids.add(e.to);
    if (e.to   === docId) ids.add(e.from);
  }
  return ids;
}

function getVisibleNodeIds(rootIds, allEdges, maxDepth) {
  const visited  = new Set(rootIds);
  let   frontier = new Set(rootIds);
  for (let depth = 0; depth < maxDepth; depth++) {
    const next = new Set();
    for (const id of frontier) {
      for (const nid of getNeighborIds(id, allEdges)) {
        if (!visited.has(nid)) { next.add(nid); visited.add(nid); }
      }
    }
    frontier = next;
    if (frontier.size === 0) break;
  }
  return visited;
}

function assignDepths(rootIds, allEdges) {
  const depths   = new Map();
  const queue    = [];
  for (const id of rootIds) { depths.set(id, 0); queue.push(id); }
  let qi = 0;
  while (qi < queue.length) {
    const cur   = queue[qi++];
    const depth = depths.get(cur);
    for (const nid of getNeighborIds(cur, allEdges)) {
      if (!depths.has(nid)) { depths.set(nid, depth + 1); queue.push(nid); }
    }
  }
  return depths;
}

function getSameWeekIds(rootDoc, docs) {
  const rootTime = new Date(rootDoc.createdAt).getTime();
  const WEEK     = 7 * 24 * 60 * 60 * 1000;
  return new Set(
    docs
      .filter((d) => Math.abs(new Date(d.createdAt).getTime() - rootTime) <= WEEK)
      .map((d) => d._id)
  );
}

function buildAllEdges(docs, semanticEdgeMap) {
  const rawEdges = [];
  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const conn = computeConnection(docs[i], docs[j], semanticEdgeMap);
      if (conn.connected) {
        rawEdges.push({ from: docs[i]._id, to: docs[j]._id, shared: conn.sharedLabels, reason: conn.reason, sharedGroups: conn.sharedGroups, score: conn.score });
      }
    }
  }
  rawEdges.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const countPerNode = new Map();
  return rawEdges.filter((edge) => {
    const fc = countPerNode.get(edge.from) || 0;
    const tc = countPerNode.get(edge.to)   || 0;
    if (fc >= 4 || tc >= 4) return false;
    countPerNode.set(edge.from, fc + 1);
    countPerNode.set(edge.to,   tc + 1);
    return true;
  });
}

function buildGraph(docs, canvasW, canvasH, semanticEdgeMap, rootDocId, maxDepth, expandedRoots) {
  if (!docs.length) return { nodes: [], edges: [] };

  const allEdges = buildAllEdges(docs, semanticEdgeMap);
  const rootDoc  = docs.find((d) => d._id === rootDocId) || docs[0];

  const depthSeeds = new Set([rootDoc._id]);
  for (const id of expandedRoots) depthSeeds.add(id);

  const depths     = assignDepths(depthSeeds, allEdges);
  const visibleIds = getVisibleNodeIds(depthSeeds, allEdges, maxDepth);

  const rootSet  = new Set([rootDoc._id, ...expandedRoots]);
  const sameWeek = getSameWeekIds(rootDoc, docs);
  for (const id of sameWeek) {
    if (allEdges.some((e) =>
      (e.from === id || e.to === id) &&
      (e.from === rootDoc._id || e.to === rootDoc._id)
    )) rootSet.add(id);
  }

  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const NODE_R     = 38;
  const MIN_SPACING = NODE_R * 2 + 18;

  const byDepth = new Map();
  for (const doc of docs) {
    const rawDepth = depths.get(doc._id) ?? 999;
    const bucket   = rawDepth === 999 ? 5 : Math.min(rawDepth, 5);
    if (!byDepth.has(bucket)) byDepth.set(bucket, []);
    byDepth.get(bucket).push(doc);
  }

  const ringRadii = new Map();
  for (const [bucket, docsInRing] of byDepth.entries()) {
    const n = docsInRing.length;
    if (bucket === 0) {
      ringRadii.set(0, Math.max(80, (n * MIN_SPACING) / (2 * Math.PI)));
    } else {
      const prevR = ringRadii.get(bucket - 1) || 80;
      ringRadii.set(bucket, Math.max(prevR + NODE_R * 2 + 40, (n * MIN_SPACING) / (2 * Math.PI)));
    }
  }

  const nodes = docs.map((doc) => {
    const rawDepth    = depths.get(doc._id) ?? 999;
    const bucket      = rawDepth === 999 ? 5 : Math.min(rawDepth, 5);
    const docsInRing  = byDepth.get(bucket) || [doc];
    const idxInRing   = docsInRing.indexOf(doc);
    const countInRing = docsInRing.length;
    const ringR       = ringRadii.get(bucket) || 80;
    const angle       = (idxInRing / countInRing) * 2 * Math.PI - Math.PI / 2 + bucket * 0.3;
    const x = (bucket === 0 && countInRing === 1) ? cx : cx + ringR * Math.cos(angle);
    const y = (bucket === 0 && countInRing === 1) ? cy : cy + ringR * Math.sin(angle);
    return { id: doc._id, doc, x, y, r: NODE_R, depth: rawDepth, bucket, visible: visibleIds.has(doc._id) };
  });

  const visibleEdges = allEdges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to));
  return { nodes, edges: visibleEdges, rootSet, depths };
}

// ─── Graph Canvas ─────────────────────────────────────────────────────────────
function GraphCanvas({ docs, onNodeClick, rootDocId, semanticEdgeMap, maxDepth, expandedRoots, onExpandNode, isExpanded, onToggleExpand }) {
  const svgRef       = useRef();
  const containerRef = useRef();
  const [pan, setPan]             = useState({ x: 0, y: 0 });
  const [scale, setScale]         = useState(1);
  const [dragging, setDragging]   = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [tooltip, setTooltip]     = useState(null);

  const W = 1200, H = 580;
  const { nodes, edges, rootSet } = buildGraph(docs, W, H, semanticEdgeMap, rootDocId, maxDepth, expandedRoots);

  const getSvgRatio = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { rx: 1, ry: 1 };
    return { rx: rect.width / W, ry: rect.height / H };
  }, [W, H]);


  const zoomTowardContainerPoint = useCallback((pointX, pointY, factor) => {
    const { rx, ry } = getSvgRatio();
    setScale((prevScale) => {
      const newScale = Math.min(3, Math.max(0.3, prevScale * factor));
      const ratio    = newScale / prevScale;

      const pivotX = (pointX / rx - W / 2) / prevScale;
      const pivotY = (pointY / ry - H / 2) / prevScale;
      setPan((prevPan) => ({
        x: pivotX * prevScale - (pivotX * prevScale - prevPan.x) * ratio,
        y: pivotY * prevScale - (pivotY * prevScale - prevPan.y) * ratio,
      }));
      return newScale;
    });
  }, [getSvgRatio, W, H]);


  const zoomCenter = useCallback((factor) => {
    setScale((prev) => Math.min(3, Math.max(0.3, prev * factor)));
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect   = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    zoomTowardContainerPoint(mouseX, mouseY, factor);
  }, [zoomTowardContainerPoint]);

  const handleMouseDown = (e) => {
    // Don't start a pan-drag when clicking nodes, buttons, or any control overlay
    if (e.target.closest(".graph-node")) return;
    if (e.target.closest("button"))      return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e) => {
    if (!dragging || !dragStart) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => { setDragging(false); setDragStart(null); };

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  if (!docs.length) {
    return (
      <div className="kg-empty">
        <div className="kg-empty-icon">🕸️</div>
        <p className="kg-empty-title">No documents to graph</p>
        <p className="kg-empty-hint">Upload files or try a different search</p>
      </div>
    );
  }

  const { rx, ry } = getSvgRatio();

  return (
    <div className="kg-canvas-wrap" ref={containerRef}>
      {/* Zoom controls + expand button stacked together */}
      <div className="kg-zoom-controls">
        {[
          ["＋", () => zoomCenter(1.1)],
          ["－", () => zoomCenter(0.9)],
          ["⊙",  () => { setScale(1); setPan({ x: 0, y: 0 }); }],
        ].map(([label, fn]) => (
          <button
            key={label}
            type="button"
            className="kg-zoom-btn"
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); fn(); }}
          >{label}</button>
        ))}
        {/* Divider */}
        <div className="kg-zoom-divider" />
        {/* Expand / collapse sits below the zoom buttons */}
        <button
          type="button"
          className={`kg-zoom-btn kg-zoom-expand-btn${isExpanded ? " expanded" : ""}`}
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onToggleExpand(); }}
          title={isExpanded ? "Exit fullscreen (Esc)" : "Expand to fullscreen"}
        >
          {isExpanded ? <Icons.Collapse /> : <Icons.Expand />}
        </button>
      </div>

      {/* Depth indicator badge */}
      <div className="kg-depth-badge">
        <Icons.Layers />
        <span>Depth {maxDepth}</span>
      </div>

      {/* Legend */}
      <div className="kg-legend">
        <span className="kg-legend-hint">Scroll to zoom · Drag to pan · Click node to expand</span>
        <div className="kg-legend-items">
          {[
            { color: "rgba(52,211,153,0.9)",  dash: "none",    label: "Shared keyword" },
            { color: "rgba(52,211,153,0.9)",  dash: "4px 2px", label: "AI similarity"  },
          ].map((l) => (
            <div key={l.label} className="kg-legend-item">
              <svg width="20" height="8">
                <line x1="0" y1="4" x2="20" y2="4" stroke={l.color} strokeWidth="1.5" strokeDasharray={l.dash} />
              </svg>
              <span className="kg-legend-label">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: dragging ? "grabbing" : "grab", display: "block" }}
      >
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor="#1a1035" />
            <stop offset="100%" stopColor="#0d0820" />
          </radialGradient>
          <filter id="glow-purple"   x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"  result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glow-selected" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"  result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glow-root"     x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        <rect width={W} height={H} fill="#000000" />

        <g transform={`translate(${W / 2 + pan.x}, ${H / 2 + pan.y}) scale(${scale}) translate(${-W / 2}, ${-H / 2})`}>
          {/* Grid dots */}
          {Array.from({ length: 12 }, (_, row) =>
            Array.from({ length: 18 }, (_, col) => (
              <circle key={`${row}-${col}`} cx={col * 60 + 30} cy={row * 60 + 30} r="1" fill="rgba(167,139,250,0.12)" />
            ))
          )}

          {/* Depth rings */}
          {[100, 200, 310, 430].map((r) => (
            <circle key={r} cx={W / 2} cy={H / 2} r={r} fill="none" stroke="rgba(167,139,250,0.05)" strokeWidth="1" strokeDasharray="4,10" />
          ))}

          {/* Edges */}
          {edges.map((edge, i) => {
            const from = nodes.find((n) => n.id === edge.from);
            const to   = nodes.find((n) => n.id === edge.to);
            if (!from || !to) return null;
            const opacity    = 0.4 + (edge.score ?? 0.65) * 0.5;
            const edgeColor  = `rgba(52,211,153,${opacity.toFixed(2)})`;
            const hasTopic   = edge.shared?.length > 0 && !edge.shared[0]?.includes("% similar");
            const dashArray  = hasTopic ? "none" : "4,3";
            const strokeW    = rootSet?.has(edge.from) && rootSet?.has(edge.to) ? 2 : 1.2;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            const labelText  = edge.shared?.[0] || "";
            const isSimilar  = labelText.includes("% similar");
            return (
              <g key={i}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={edgeColor} strokeWidth={strokeW} strokeDasharray={dashArray} />
                {labelText && (
                  <g>
                    <rect x={midX - 34} y={midY - 10} width={68} height={14} rx={7}
                      fill={isSimilar ? "rgba(52,211,153,0.08)" : "rgba(52,211,153,0.15)"}
                      stroke="rgba(52,211,153,0.35)" strokeWidth={0.8} />
                    <text x={midX} y={midY} textAnchor="middle" dominantBaseline="middle"
                      fill={isSimilar ? "rgba(52,211,153,0.7)" : "rgba(100,240,180,0.95)"}
                      fontSize="7.5" fontFamily="DM Sans, sans-serif">
                      {labelText.length > 16 ? labelText.slice(0, 15) + "…" : labelText}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const cfg        = TYPE_CONFIG[node.doc.type] || TYPE_CONFIG.pdf;
            const isRoot     = node.id === rootDocId;
            const inRootSet  = rootSet?.has(node.id);
            const isExpanded = expandedRoots.has(node.id);
            const opacity    = node.visible ? 1 : 0.08;
            const nodeFill   = isRoot ? "rgba(255,255,255,0.96)" : inRootSet ? "rgba(248,242,255,0.90)" : node.visible ? "rgba(220,210,255,0.70)" : "rgba(180,165,220,0.40)";
            const nodeStroke = isRoot ? cfg.color : inRootSet ? cfg.color : node.visible ? "rgba(180,160,255,0.45)" : "rgba(120,100,180,0.2)";
            const textFill   = isRoot ? cfg.color : inRootSet ? "#3d1f7a" : "#2d1a5e";
            const filterAttr = isRoot ? "url(#glow-root)" : inRootSet ? "url(#glow-selected)" : "url(#glow-purple)";
            const shortTitle = node.doc.title.length > 14 ? node.doc.title.slice(0, 13) + "…" : node.doc.title;
            return (
              <g key={node.id} className="graph-node"
                transform={`translate(${node.x},${node.y})`}
                style={{ cursor: node.visible ? "pointer" : "default", opacity, transition: "opacity 0.4s" }}
                onClick={() => { if (!node.visible) return; onNodeClick(node.doc); onExpandNode(node.id); }}
                onMouseEnter={() => node.visible && setTooltip({ id: node.id, title: node.doc.title, depth: node.depth })}
                onMouseLeave={() => setTooltip(null)}
                filter={filterAttr}
              >
                {isRoot && <circle r={node.r + 16} fill="none" stroke={cfg.color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2,4" />}
                {isRoot && <circle r={node.r + 10} fill="none" stroke={cfg.color} strokeWidth="1.5" strokeOpacity="0.5" />}
                {inRootSet && !isRoot && <circle r={node.r + 8} fill="none" stroke={cfg.color} strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3,3" />}
                {isExpanded && !isRoot && <circle r={node.r + 5} fill="none" stroke="rgba(52,211,153,0.6)" strokeWidth="1.5" />}
                <circle r={node.r} fill={nodeFill} stroke={nodeStroke} strokeWidth={isRoot ? 2.5 : inRootSet ? 1.8 : 1.2} />
                <circle cx={0} cy={-node.r + 7} r={5} fill={cfg.color} />
                <text y={2} textAnchor="middle" dominantBaseline="middle" fill={textFill} fontSize="9.5" fontFamily="DM Sans, sans-serif" fontWeight={isRoot || inRootSet ? "700" : "500"} style={{ pointerEvents: "none" }}>
                  {shortTitle}
                </text>
                {node.depth > 0 && node.depth < 999 && node.visible && !inRootSet && (
                  <text y={node.r + 10} textAnchor="middle" fill="rgba(167,139,250,0.7)" fontSize="7" fontFamily="DM Sans, sans-serif" style={{ pointerEvents: "none" }}>{`L${node.bucket}`}</text>
                )}
                <text y={17} textAnchor="middle" fill="rgba(80,50,140,0.65)" fontSize="8" fontFamily="DM Sans, sans-serif" style={{ pointerEvents: "none" }}>
                  {fmt.date(node.doc.createdAt).split(" ").slice(0, 2).join(" ")}
                </text>
                {isRoot && (
                  <text y={-node.r - 6} textAnchor="middle" fill={cfg.color} fontSize="7" fontFamily="DM Sans, sans-serif" fontWeight="700" style={{ pointerEvents: "none" }}>ROOT</text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (() => {
        const node = nodes.find((n) => n.id === tooltip.id);
        if (!node) return null;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return null;
        const { rx, ry } = getSvgRatio();
        const px = (node.x - W / 2) * scale * rx + rect.width  / 2 + pan.x * rx;
        const py = (node.y - H / 2) * scale * ry + rect.height / 2 + pan.y * ry;
        return (
          <div className="kg-tooltip" style={{ left: px, top: py - 64 }}>
            <p className="kg-tooltip-title">{tooltip.title}</p>
            <p className="kg-tooltip-hint">{tooltip.depth === 0 ? "Root cluster" : `Depth ${tooltip.depth} · Click to expand`}</p>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Node Info Panel ──────────────────────────────────────────────────────────
function NodePanel({ doc, allDocs, onClose, navigate, semanticEdgeMap }) {
  if (!doc) {
    return (
      <div className="kg-panel-empty">
        <div className="kg-panel-empty-icon">👆</div>
        <p className="kg-panel-empty-title">Click any node</p>
        <p className="kg-panel-empty-hint">Select a document to see its details, connections, and AI summary.</p>
      </div>
    );
  }

  const cfg = TYPE_CONFIG[doc.type] || TYPE_CONFIG.pdf;

  const connected = allDocs
    .filter((d) => d._id !== doc._id)
    .map((d) => { const conn = computeConnection(doc, d, semanticEdgeMap); return { doc: d, ...conn }; })
    .filter((x) => x.connected)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const handleExplainWithAI = () => {
    const msg = `Give me a detailed explanation of the document titled "${doc.title}".\n\nSummary: ${doc.summary}\n\nKeywords: ${(doc.keywords || []).join(", ")}\n\nPlease expand on these topics in detail.`;
    sessionStorage.setItem("chatPrefill", msg);
    navigate("/chat");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="kg-panel-header">
        <div className="kg-panel-header-top">
          <span className="kg-panel-type-badge" style={{ background: cfg.bg, color: cfg.color }}>
            <PngIcon src={cfg.pngIcon} size={13} style={{ marginRight: "4px", opacity: 0.9 }} />
            {doc.type}
          </span>
          <button className="kg-panel-close-btn" onClick={onClose}><Icons.Close /></button>
        </div>
        {/* ── FIX 2: Panel title now uses dark purple instead of white ──── */}
        <h2 className="kg-panel-title" style={{ color: "#3d1f7a" }}>{doc.title}</h2>
        <p className="kg-panel-meta"><Icons.Clock /> {fmt.date(doc.createdAt)} · {fmt.size(doc.fileSize)}</p>
      </div>

      <div className="kg-panel-body">
        <div className="kg-ai-summary">
          <p className="kg-ai-summary-label">✦ AI Summary</p>
          <p className="kg-ai-summary-text" style={{ color: "#3d1f7a" }}>{doc.summary || "No summary available."}</p>
        </div>

        {doc.keywords?.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <p className="kg-section-label">Keywords</p>
            <div className="kg-keywords">
              {doc.keywords.map((k) => (
                <span key={k} className="kg-keyword-tag" style={{ background: cfg.bg, color: cfg.color }}>{k}</span>
              ))}
            </div>
          </div>
        )}

        {connected.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <p className="kg-section-label">Connected Documents ({connected.length})</p>
            <div className="kg-connections">
              {connected.slice(0, 6).map((conn) => {
                const ccfg = TYPE_CONFIG[conn.doc.type] || TYPE_CONFIG.pdf;
                return (
                  <div key={conn.doc._id} className="kg-connection-card" style={{ borderColor: "rgba(52,211,153,0.25)" }}>
                    <div className="kg-connection-card-top">
                      <p className="kg-connection-title">{conn.doc.title}</p>
                      <div className="kg-connection-badges">
                        {conn.score && (
                          <span className="kg-badge" style={{ background: "rgba(52,211,153,0.1)", color: "#059669" }}>
                            {Math.round(conn.score * 100)}%
                          </span>
                        )}
                        <span className="kg-badge" style={{ color: ccfg.color, background: ccfg.bg }}>
                          <PngIcon src={ccfg.pngIcon} size={11} style={{ marginRight: "3px", opacity: 0.85 }} />{conn.doc.type}
                        </span>
                      </div>
                    </div>
                    <p className="kg-connection-shared">
                      {conn.sharedLabels?.[0]?.includes("% similar")
                        ? `AI similarity · ${conn.sharedLabels[0]}`
                        : conn.sharedLabels?.length ? `Topic: ${conn.sharedLabels.slice(0, 2).join(", ")}` : "Semantically related"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {connected.length === 0 && (
          <div className="kg-no-connections">
            <p>No connected documents found.</p>
            <p>Upload more files on the same topic to see links appear.</p>
          </div>
        )}
      </div>

      <div className="kg-panel-actions">
        <button className="kg-btn-view" onClick={() => window.open(`http://localhost:5000/uploads/${doc.filename}`, "_blank")}>
          <Icons.Eye /> View File
        </button>
        <button className="kg-btn-ai" onClick={handleExplainWithAI}>
          <PngIcon src={spiderIcon} size={14} style={{ marginRight: "5px" }} /> Explain with AI
        </button>
      </div>
    </div>
  );
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ allDocs, selectedDate, onSelectDate, onSelectMonth }) {
  const uploadDates  = new Set(allDocs.map((d) => new Date(d.createdAt).toDateString()));
  const dateCountMap = {};
  allDocs.forEach((d) => {
    const key = new Date(d.createdAt).toDateString();
    dateCountMap[key] = (dateCountMap[key] || 0) + 1;
  });

  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="kg-calendar">
      <div className="kg-cal-header">
        <button className="kg-cal-nav" onClick={prevMonth}>‹</button>
        <button className="kg-cal-month-btn" onClick={() => onSelectMonth(viewYear, viewMonth)} title="Show all files this month">
          {MONTHS[viewMonth]} {viewYear}
        </button>
        <button className="kg-cal-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="kg-cal-grid">
        {DAYS.map((d) => <div key={d} className="kg-cal-dayname">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateObj = new Date(viewYear, viewMonth, day);
          const key     = dateObj.toDateString();
          const hasFile = uploadDates.has(key);
          const count   = dateCountMap[key] || 0;
          const isSel   = selectedDate && new Date(selectedDate).toDateString() === key;
          const isToday = today.toDateString() === key;
          return (
            <button key={day}
              className={`kg-cal-day${hasFile ? " has-file" : ""}${isSel ? " selected" : ""}${isToday ? " today" : ""}`}
              onClick={() => hasFile && onSelectDate(dateObj)}
              title={hasFile ? `${count} file${count > 1 ? "s" : ""} uploaded` : undefined}>
              {day}
              {hasFile && <span className="kg-cal-dot" style={{ opacity: count > 1 ? 1 : 0.7 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Timeline Strip ───────────────────────────────────────────────────────────
function Timeline({ allDocs, docs, selectedId, onSelect, onDateSelect, onMonthSelect, selectedDate }) {
  const [height, setHeight]     = useState(160);
  const [dragging, setDragging] = useState(false);
  const [calOpen, setCalOpen]   = useState(false);
  const dragStartY = useRef(null);
  const dragStartH = useRef(null);

  const handleDragStart = (e) => { setDragging(true); dragStartY.current = e.clientY; dragStartH.current = height; };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => { const delta = dragStartY.current - e.clientY; setHeight(Math.min(420, Math.max(80, dragStartH.current + delta))); };
    const onUp   = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  const sorted = [...docs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const groups = {};
  sorted.forEach((d) => {
    const key = new Date(d.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(d);
  });

  return (
    <div className="kg-bottom" style={{ height: `${height}px` }}>
      <div className={`kg-drag-handle${dragging ? " dragging" : ""}`} onMouseDown={handleDragStart} title="Drag to resize">
        <div className="kg-drag-grip" />
      </div>
      <div className="kg-bottom-inner">
        <div className="kg-timeline-area">
          <div className="kg-timeline-scroll">
            {Object.entries(groups).map(([month, mdocs]) => (
              <div key={month} className="kg-timeline-group">
                <p className="kg-timeline-month">{month}</p>
                <div className="kg-timeline-items">
                  {mdocs.map((d) => {
                    const cfg        = TYPE_CONFIG[d.type] || TYPE_CONFIG.pdf;
                    const isSelected = selectedId === d._id;
                    return (
                      <button key={d._id} onClick={() => onSelect(d)} title={d.title}
                        className={`kg-timeline-card${isSelected ? " active" : ""}`}
                        style={{ borderColor: isSelected ? cfg.color : undefined, background: isSelected ? cfg.bg : undefined }}>
                        <div className="kg-timeline-type" style={{ color: cfg.color, display: "flex", alignItems: "center", gap: "4px" }}>
                          <PngIcon src={cfg.pngIcon} size={11} style={{ opacity: 0.85 }} />{d.type}
                        </div>
                        <div className="kg-timeline-name">{d.title}</div>
                        <div className="kg-timeline-ago">{fmt.ago(d.createdAt)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="kg-cal-panel">
          <button className="kg-cal-toggle" onClick={() => setCalOpen(o => !o)}>{calOpen ? "✕ Close" : "📅 Calendar"}</button>
          {calOpen && <MiniCalendar allDocs={allDocs} selectedDate={selectedDate} onSelectDate={onDateSelect} onSelectMonth={onMonthSelect} />}
        </div>
      </div>
    </div>
  );
}

// ─── Level Control Widget ─────────────────────────────────────────────────────
function LevelControl({ maxDepth, onChange, oldestVisibleDate }) {
  return (
    <div className="kg-level-control">
      <Icons.Layers />
      <span className="kg-level-label">Depth</span>
      <button
        type="button"
        className="kg-level-btn"
        onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onChange(Math.max(0, maxDepth - 1)); }}
        disabled={maxDepth <= 0}
      ><Icons.Minus /></button>
      <span className="kg-level-value">{maxDepth}</span>
      <button
        type="button"
        className="kg-level-btn"
        onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onChange(maxDepth + 1); }}
      ><Icons.Plus /></button>
      {oldestVisibleDate && maxDepth > 0 && (
        <span className="kg-level-time-hint" title="Oldest file visible at this depth"><Icons.Clock /> {oldestVisibleDate}</span>
      )}
    </div>
  );
}

// ─── Time Filter Buttons ──────────────────────────────────────────────────────
const TIME_FILTERS = [{ k: "7d", label: "7d" }, { k: "30d", label: "30d" }, { k: "all", label: "All" }];

function applyTimeFilter(docs, timeFilter) {
  if (timeFilter === "all") return docs;
  const days   = timeFilter === "7d" ? 7 : 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return docs.filter((d) => new Date(d.createdAt).getTime() >= cutoff);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KnowledgeGraph() {
  const navigate = useNavigate();
  const [allDocs, setAllDocs]                   = useState([]);
  const [filteredDocs, setFilteredDocs]         = useState([]);
  const [search, setSearch]                     = useState("");
  const [rawSearch, setRawSearch]               = useState("");
  const [loading, setLoading]                   = useState(true);
  const [selectedDoc, setSelectedDoc]           = useState(null);
  const [activeFilter, setActiveFilter]         = useState("all");
  const [timeFilter, setTimeFilter]             = useState("all");
  const [maxDepth, setMaxDepth]                 = useState(1);
  const [expandedRoots, setExpandedRoots]       = useState(new Set());
  const [rootDocId, setRootDocId]               = useState(null);
  const [semanticEdgeMap, setSemanticEdgeMap]   = useState(new Map());
  const [selectedDate, setSelectedDate]         = useState(null);
  const [dateFilterMode, setDateFilterMode]     = useState(null);
  const [dateFilterValue, setDateFilterValue]   = useState(null);
  const [refreshing, setRefreshing]             = useState(false);

  const [graphExpanded, setGraphExpanded]       = useState(false);
  const searchTimer = useRef();


  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && graphExpanded) setGraphExpanded(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [graphExpanded]);

  const refreshEdges = useCallback(async () => {
    setRefreshing(true);
    try {
      const edgesRes = await api.get("/documents/graph-edges?threshold=0.65");
      const edgeMap  = new Map();
      for (const edge of edgesRes.data.edges || []) {
        edgeMap.set(`${edge.from}:${edge.to}`, { score: edge.score, sharedKeywords: edge.sharedKeywords || [], topic: edge.topic || null });
      }
      setSemanticEdgeMap(edgeMap);
    } catch (err) { console.error("Refresh error:", err); }
    setRefreshing(false);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [docsRes, edgesRes] = await Promise.all([
        api.get("/documents"),
        api.get("/documents/graph-edges?threshold=0.65"),
      ]);
      const sorted = docsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllDocs(sorted);
      setFilteredDocs(sorted);
      if (sorted.length > 0) { setSelectedDoc(sorted[0]); setRootDocId(sorted[0]._id); }
      const edgeMap = new Map();
      for (const edge of edgesRes.data.edges || []) {
        edgeMap.set(`${edge.from}:${edge.to}`, { score: edge.score, sharedKeywords: edge.sharedKeywords || [], topic: edge.topic || null });
      }
      setSemanticEdgeMap(edgeMap);
    } catch (err) { console.error("Load error:", err); }
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    let results = allDocs;
    if (activeFilter !== "all") results = results.filter((d) => d.type === activeFilter);
    results = applyTimeFilter(results, timeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter((d) =>
        d.title.toLowerCase().includes(q) ||
        (d.keywords || []).some((k) => k.toLowerCase().includes(q)) ||
        (d.summary  || "").toLowerCase().includes(q)
      );
    }
    if (dateFilterMode === "day" && dateFilterValue) {
      const dayStr = dateFilterValue.toDateString();
      results = allDocs.filter((d) => new Date(d.createdAt).toDateString() === dayStr);
    } else if (dateFilterMode === "month" && dateFilterValue) {
      results = allDocs.filter((d) => {
        const dd = new Date(d.createdAt);
        return dd.getFullYear() === dateFilterValue.getFullYear() && dd.getMonth() === dateFilterValue.getMonth();
      });
    }
    setFilteredDocs(results);
    if (results.length > 0) { setRootDocId(results[0]._id); setSelectedDoc(results[0]); }
    setExpandedRoots(new Set());
  }, [search, activeFilter, timeFilter, allDocs, dateFilterMode, dateFilterValue]);

  const handleSearch = (v) => {
    setRawSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(v), 300);
  };

  const handleNodeClick      = (doc) => setSelectedDoc(doc);
  const handleExpandNode     = (nodeId) => setExpandedRoots((prev) => { const n = new Set(prev); n.add(nodeId); return n; });
  const handleTimelineSelect = (doc) => { setSelectedDoc(doc); setRootDocId(doc._id); setExpandedRoots(new Set()); setDateFilterMode(null); setDateFilterValue(null); setSelectedDate(null); };
  const handleDateSelect     = (dateObj) => { setSelectedDate(dateObj); setDateFilterMode("day"); setDateFilterValue(dateObj); setMaxDepth(1); setExpandedRoots(new Set()); };
  const handleMonthSelect    = (year, month) => { const d = new Date(year, month, 1); setSelectedDate(d); setDateFilterMode("month"); setDateFilterValue(d); setMaxDepth(1); setExpandedRoots(new Set()); };

  const getOldestVisibleDate = () => {
    if (!filteredDocs.length) return null;
    const sorted = [...filteredDocs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return fmt.date(sorted[0].createdAt);
  };

  const FILTERS = [
    { k: "all",   label: "All",   pngIcon: fileIcon,   color: "#7c5cbf" },
    { k: "pdf",   label: "PDF",   pngIcon: empireIcon,  color: "#e05cb5" },
    { k: "image", label: "Image", pngIcon: cameraIcon,  color: "#34d399" },
    { k: "audio", label: "Audio", pngIcon: musicIcon,   color: "#f59e0b" },
    { k: "video", label: "Video", pngIcon: walletIcon,  color: "#38bdf8" },
  ];

  return (

    <div className={`kg-wrapper${graphExpanded ? " kg-wrapper--expanded" : ""}`}>
      <header className="kg-header">
        <div className="kg-header-left">
          <Link to="/dashboard" className="kg-back-btn"><Icons.Back /></Link>
          <div className="kg-title-block">
            <span className="kg-title-icon">🕸️</span>
            <div>
              <p className="kg-title-name">Knowledge Graph</p>
              <p className="kg-title-sub">
                {allDocs.length} documents · {filteredDocs.length} shown
                {semanticEdgeMap.size > 0 && <span style={{ color: "#34d399", marginLeft: "6px" }}>· {semanticEdgeMap.size} AI edges</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="kg-header-right">
          <div className="kg-time-filters">
            {TIME_FILTERS.map((f) => (
              <button key={f.k} className={`kg-time-btn${timeFilter === f.k ? " active" : ""}`} onClick={() => setTimeFilter(f.k)}>{f.label}</button>
            ))}
          </div>

          <LevelControl maxDepth={maxDepth} onChange={setMaxDepth} oldestVisibleDate={getOldestVisibleDate()} />

          <div className="kg-search-wrap">
            <span className="kg-search-icon"><Icons.Search /></span>
            <input className="kg-search-input" value={rawSearch} onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search concepts, e.g. OOP, ML…" style={{ color: "#3d1f7a" }} />
            {rawSearch && <button className="kg-search-clear" onClick={() => handleSearch("")}><Icons.Close /></button>}
          </div>

          <div className="kg-filters">
            {FILTERS.map((f) => (
              <button key={f.k} onClick={() => setActiveFilter(f.k)}
                className={`kg-filter-btn${activeFilter === f.k ? " active" : ""}`}
                style={activeFilter === f.k ? { background: `${f.color}1a`, color: f.color } : undefined}>
                <PngIcon src={f.pngIcon} size={12} style={{ marginRight: "4px", opacity: 0.85 }} />{f.label}
              </button>
            ))}
          </div>

          <button className={`kg-refresh-btn${refreshing ? " refreshing" : ""}`} onClick={refreshEdges} disabled={refreshing} title="Re-fetch AI edges between all docs">
            <Icons.Refresh />{refreshing ? "Updating…" : "Reconnect"}
          </button>

          <Link to="/chat" className="kg-chat-link">
            <PngIcon src={spiderIcon} size={14} style={{ marginRight: "5px", opacity: 0.9 }} />AI Chat
          </Link>
        </div>
      </header>

      {search && (
        <div className="kg-search-banner">
          <span className="kg-search-banner-text" style={{ color: "#3d1f7a" }}>
            {filteredDocs.length === 0
              ? `No documents found for "${search}"`
              : `${filteredDocs.length} document${filteredDocs.length !== 1 ? "s" : ""} matching "${search}" · most recent is root`}
          </span>
          <button className="kg-search-banner-clear" onClick={() => handleSearch("")}>Clear</button>
        </div>
      )}

      {/* ── NEW: when expanded the graph pane covers the whole screen ───────── */}
      <div className={`kg-main${graphExpanded ? " kg-main--graph-fullscreen" : ""}`}>
        <div className="kg-graph-pane">
          {loading ? (
            <div className="kg-loading">Loading graph…</div>
          ) : (
            <GraphCanvas
              docs={filteredDocs}
              onNodeClick={handleNodeClick}
              rootDocId={rootDocId}
              semanticEdgeMap={semanticEdgeMap}
              maxDepth={maxDepth}
              expandedRoots={expandedRoots}
              onExpandNode={handleExpandNode}
              isExpanded={graphExpanded}
              onToggleExpand={() => setGraphExpanded((v) => !v)}
            />
          )}
        </div>


        {!graphExpanded && (
          <div className="kg-panel">
            <NodePanel doc={selectedDoc} allDocs={allDocs} onClose={() => setSelectedDoc(null)} navigate={navigate} semanticEdgeMap={semanticEdgeMap} />
          </div>
        )}
      </div>

      {dateFilterMode && (
        <div className="kg-date-banner">
          <span className="kg-date-banner-text">
            {dateFilterMode === "day"
              ? `📅 Showing files from ${fmt.date(dateFilterValue)}`
              : `📅 Showing files from ${dateFilterValue.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`}
            · {filteredDocs.length} file{filteredDocs.length !== 1 ? "s" : ""}
          </span>
          <button className="kg-date-banner-clear" onClick={() => { setDateFilterMode(null); setDateFilterValue(null); setSelectedDate(null); }}>✕ Clear</button>
        </div>
      )}

      {/* Timeline is hidden in fullscreen */}
      {!graphExpanded && (
        <Timeline allDocs={allDocs} docs={filteredDocs} selectedId={selectedDoc?._id}
          onSelect={handleTimelineSelect} onDateSelect={handleDateSelect}
          onMonthSelect={handleMonthSelect} selectedDate={selectedDate} />
      )}
    </div>
  );
}