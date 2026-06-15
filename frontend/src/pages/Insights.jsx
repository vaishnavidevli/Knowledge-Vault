import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../style/Insights.css";

import spiderIcon   from "../assets/icons/icons8-spider-man-new-50.png";
import yodaIcon     from "../assets/icons/icons8-baby-yoda-50.png";
import empireIcon   from "../assets/icons/icons8-empire-50.png";
import fileIcon     from "../assets/icons/pages.png";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

// ─── PNG icon helper (matches Dashboard) ─────────────────────────────────────
const PngIcon = ({ src, size = 14, style = {} }) => (
  <img
    src={src}
    alt=""
    width={size}
    height={size}
    style={{ objectFit: "contain", display: "inline-block", verticalAlign: "middle", ...style }}
  />
);

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  Back: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Spark: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Refresh: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  Brain: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3z"/>
    </svg>
  ),
};

// ─── Strength / Priority colour maps ─────────────────────────────────────────
const STRENGTH_COLOR = {
  strong:   { color: "#15803d", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.25)"  },
  moderate: { color: "#92400e", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.25)"  },
  weak:     { color: "#9f1239", bg: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.25)" },
};
const PRIORITY_COLOR = {
  high:   { color: "#fb7185", border: "rgba(251,113,133,0.3)",  left: "#fb7185"  },
  medium: { color: "#92400e", border: "rgba(251,191,36,0.2)",   left: "#fbbf24"  },
  low:    { color: "#15803d", border: "rgba(52,211,153,0.2)",   left: "#34d399"  },
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ h = "1rem", w = "100%", mb = "0.5rem" }) {
  return (
    <div className="skeleton-line" style={{ height: h, width: w, marginBottom: mb }} />
  );
}

// ─── Loading state ────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="insights-loading">
      <div className="insights-loading-header">
        <div className="insights-loading-icon">🧠</div>
        <p className="insights-loading-title">Analysing your knowledge base…</p>
        <p className="insights-loading-subtitle">
          Gemini is reading all your documents and finding patterns
        </p>
      </div>
      <div className="insights-skeleton-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="insights-skeleton-card">
            <Skeleton h="0.7rem" w="40%" mb="0.75rem" />
            <Skeleton h="1rem"   w="70%" mb="0.5rem"  />
            <Skeleton h="0.8rem" w="90%" mb="0.4rem"  />
            <Skeleton h="0.8rem" w="60%" mb="0"       />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ emoji, title, subtitle, children }) {
  return (
    <div className="insights-section">
      <div className="insights-section-header">
        <span className="insights-section-emoji">{emoji}</span>
        <div>
          <h2 className="insights-section-title">{title}</h2>
          {subtitle && <p className="insights-section-subtitle">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Insights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await api.post("/insights/generate");
      setData(res.data);
      setGenerated(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="insights-wrapper">

      {/* ── Header ── */}
      <header className="insights-header">
        <div className="insights-header-left">
          <Link to="/dashboard" className="insights-back-btn">
            <Icons.Back />
          </Link>
          <PngIcon src={yodaIcon} size={26} style={{ borderRadius: "6px" }} />
          <div>
            <p className="insights-header-title">Knowledge Insights</p>
            <p className="insights-header-subtitle">AI-powered pattern analysis across your entire library</p>
          </div>
        </div>

        <div className="insights-header-actions">
          {generated && (
            <button className="insights-btn-ghost" onClick={generate}>
              <Icons.Refresh /> Regenerate
            </button>
          )}
          <Link to="/chat" className="insights-btn-ai">
            <PngIcon src={spiderIcon} size={15} style={{ opacity: 0.9 }} />
            Ask AI
          </Link>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="insights-body">

        {/* Empty CTA — shown before first run */}
        {!generated && !loading && (
          <div className="insights-empty">
            <span className="insights-empty-icon">🔭</span>
            <h1 className="insights-empty-title">Discover what's in your knowledge base</h1>
            <p className="insights-empty-desc">
              Gemini will analyse all your uploaded documents and surface hidden
              patterns, knowledge gaps, and a recommended study sequence — all in one shot.
            </p>

            <div className="insights-feature-list">
              {[
                ["🗂️", "Recurring themes across your documents"],
                ["🔍", "Knowledge gaps you should fill"],
                ["📋", "Optimal study sequence"],
                ["💡", "Surprising connections and observations"],
              ].map(([icon, label]) => (
                <div key={label} className="insights-feature-item">
                  <span>{icon}</span> {label}
                </div>
              ))}
            </div>

            <button className="insights-generate-btn" onClick={generate}>
              <Icons.Spark /> Generate Insights
            </button>
          </div>
        )}

        {loading && <LoadingState />}

        {error && (
          <div className="insights-error">
            <PngIcon src={empireIcon} size={16} style={{ opacity: 0.8 }} />
            {error}
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="insights-results">

            {/* Overview card */}
            <div className="insights-overview-card">
              <div className="insights-overview-row">
                <PngIcon src={fileIcon} size={16} style={{ opacity: 0.85 }} />
                <p className="insights-overview-label">
                  Overview · {data.docCount} documents analysed
                </p>
                <span className="insights-overview-time">
                  {data.generatedAt
                    ? new Date(data.generatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
              <p className="insights-overview-text">{data.overview}</p>
            </div>

            {/* Themes */}
            {data.themes?.length > 0 && (
              <Section
                emoji="🗂️"
                title="Recurring Themes"
                subtitle="Major topic clusters found across your documents"
              >
                <div className="insights-themes-grid">
                  {data.themes.map((theme, i) => {
                    const s = STRENGTH_COLOR[theme.strength] || STRENGTH_COLOR.weak;
                    return (
                      <div key={i} className="insights-theme-card">
                        <div className="insights-theme-card-header">
                          <h3 className="insights-theme-name">{theme.name}</h3>
                          <span
                            className="insights-strength-badge"
                            style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
                          >
                            {theme.strength}
                          </span>
                        </div>
                        <p className="insights-theme-desc">{theme.description}</p>
                        {theme.documents?.length > 0 && (
                          <div className="insights-theme-docs">
                            {theme.documents.map((d) => (
                              <span key={d} className="insights-doc-tag">{d}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Gaps */}
            {data.gaps?.length > 0 && (
              <Section
                emoji="🔍"
                title="Knowledge Gaps"
                subtitle="Topics implied by your notes but not yet covered"
              >
                <div className="insights-gaps-list">
                  {data.gaps.map((gap, i) => {
                    const p = PRIORITY_COLOR[gap.priority] || PRIORITY_COLOR.low;
                    return (
                      <div
                        key={i}
                        className="insights-gap-card"
                        style={{
                          border: `1px solid ${p.border}`,
                          borderLeft: `3px solid ${p.left}`,
                        }}
                      >
                        <div className="insights-gap-content">
                          <div className="insights-gap-title-row">
                            <h3 className="insights-gap-topic">{gap.topic}</h3>
                            <span
                              className="insights-priority-badge"
                              style={{
                                color: p.color,
                                background: `${p.left}18`,
                                border: `1px solid ${p.border}`,
                              }}
                            >
                              {gap.priority} priority
                            </span>
                          </div>
                          <p className="insights-gap-reason">{gap.reason}</p>
                        </div>
                        <button
                          className="insights-learn-btn"
                          onClick={() => {
                            const msg = `I want to learn about "${gap.topic}". Based on my existing notes, can you explain this topic in detail and show how it connects to what I already know?`;
                            sessionStorage.setItem("chatPrefill", msg);
                            window.location.href = "/chat";
                          }}
                        >
                          Learn with AI →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Study Sequence */}
            {data.sequence?.length > 0 && (
              <Section
                emoji="📋"
                title="Recommended Study Sequence"
                subtitle="Optimal order based on topic dependencies"
              >
                <div className="insights-sequence-list">
                  {data.sequence.map((step, i) => (
                    <div key={i} className="insights-sequence-item">
                      <div className="insights-sequence-connector">
                        <div className="insights-sequence-dot">{step.step}</div>
                        {i < data.sequence.length - 1 && (
                          <div className="insights-sequence-line" />
                        )}
                      </div>
                      <div
                        className="insights-sequence-content"
                        style={{ paddingBottom: i < data.sequence.length - 1 ? "16px" : "0" }}
                      >
                        <div className="insights-sequence-card">
                          <p className="insights-sequence-title">{step.title}</p>
                          <p className="insights-sequence-reason">{step.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Key Observations */}
            {data.insights?.length > 0 && (
              <Section
                emoji="💡"
                title="Key Observations"
                subtitle="Specific patterns Gemini found in your knowledge base"
              >
                <div className="insights-observations-list">
                  {data.insights.map((insight, i) => (
                    <div key={i} className="insights-observation-item">
                      <span className="insights-observation-star">✦</span>
                      <p className="insights-observation-text">{insight}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Bottom CTA */}
            <div className="insights-cta">
              <p className="insights-cta-text">
                Want to explore these insights deeper? Ask the AI directly.
              </p>
              <div className="insights-cta-buttons">
                {[
                  "Tell me more about my knowledge gaps",
                  "What should I focus on next?",
                  "Explain the connections between my topics",
                ].map((q) => (
                  <button
                    key={q}
                    className="insights-cta-btn"
                    onClick={() => {
                      sessionStorage.setItem("chatPrefill", q);
                      window.location.href = "/chat";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}