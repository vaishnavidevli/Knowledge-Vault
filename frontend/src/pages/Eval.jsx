import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const Icons = {
  Back: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Run: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  History: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, label, size = 80 }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / 10, 1);
  const color = score >= 8 ? "#34d399" : score >= 6 ? "#fbbf24" : "#f87171";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="14"
          fontWeight="700"
          fontFamily="Syne, sans-serif"
          style={{
            transform: "rotate(90deg)",
            transformOrigin: `${size / 2}px ${size / 2}px`,
          }}
        >
          {score.toFixed(1)}
        </text>
      </svg>
      <span
        style={{
          fontSize: "0.68rem",
          color: "#8b8ba0",
          textAlign: "center",
          maxWidth: `${size}px`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Single test result card ──────────────────────────────────────────────────
function ResultCard({ result, index }) {
  const [open, setOpen] = useState(index === 0);
  const overall = result.scores?.overall || 0;
  const color = overall >= 8 ? "#34d399" : overall >= 6 ? "#fbbf24" : "#f87171";

  return (
    <div
      style={{
        background: "#111118",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "13px",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)")
      }
      onMouseOut={(e) =>
        (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")
      }
    >
      {/* Header — always visible */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "1rem 1.1rem",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: `${color}18`,
            border: `1px solid ${color}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color,
              fontFamily: "'Syne',sans-serif",
            }}
          >
            {overall.toFixed(0)}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "#f0eeff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Q{index + 1}: {result.query}
          </p>
          <p
            style={{ fontSize: "0.72rem", color: "#4a4a60", marginTop: "1px" }}
          >
            Retrieved:{" "}
            {(result.retrievedDocs || []).map((d) => d.title).join(", ") || "—"}
          </p>
        </div>
        <span style={{ fontSize: "0.7rem", color: "#4a4a60", flexShrink: 0 }}>
          {open ? "▾" : "▸"}
        </span>
      </div>

      {/* Expanded detail */}
      {open && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "1rem 1.1rem",
            animation: "fadeUp 0.15s ease",
          }}
        >
          {/* Score breakdown */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            {[
              ["Retrieval", result.scores?.retrieval_accuracy],
              ["Relevance", result.scores?.answer_relevance],
              ["Grounded", result.scores?.groundedness],
              ["Complete", result.scores?.completeness],
            ].map(([label, score]) => {
              const s = score || 0;
              const clr = s >= 8 ? "#34d399" : s >= 6 ? "#fbbf24" : "#f87171";
              return (
                <div
                  key={label}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "10px",
                    padding: "0.65rem",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: clr,
                      fontFamily: "'Syne',sans-serif",
                    }}
                  >
                    {s}/10
                  </p>
                  <p
                    style={{
                      fontSize: "0.67rem",
                      color: "#4a4a60",
                      marginTop: "2px",
                    }}
                  >
                    {label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Retrieved docs */}
          {result.retrievedDocs?.length > 0 && (
            <div style={{ marginBottom: "0.85rem" }}>
              <p
                style={{
                  fontSize: "0.68rem",
                  color: "#4a4a60",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: "0.4rem",
                }}
              >
                Retrieved Documents
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {result.retrievedDocs.map((d, i) => (
                  <span
                    key={i}
                    style={{
                      background: "rgba(139,92,246,0.1)",
                      color: "#a78bfa",
                      padding: "2px 9px",
                      borderRadius: "20px",
                      fontSize: "0.72rem",
                    }}
                  >
                    {d.title}
                    {d.score != null ? ` · ${d.score}%` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Answer preview */}
          <div style={{ marginBottom: "0.85rem" }}>
            <p
              style={{
                fontSize: "0.68rem",
                color: "#4a4a60",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: "0.4rem",
              }}
            >
              Generated Answer
            </p>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
                padding: "0.75rem 0.9rem",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#c4c4d4",
                  lineHeight: 1.65,
                }}
              >
                {result.answer}
              </p>
            </div>
          </div>

          {/* Judge feedback */}
          {result.scores?.feedback && (
            <div
              style={{
                background: "rgba(251,191,36,0.06)",
                border: "1px solid rgba(251,191,36,0.18)",
                borderRadius: "9px",
                padding: "0.65rem 0.9rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#fbbf24",
                  fontWeight: 500,
                  marginBottom: "2px",
                }}
              >
                Judge Feedback
              </p>
              <p style={{ fontSize: "0.78rem", color: "#d4d4e8" }}>
                {result.scores.feedback}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Eval() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("run");

  useEffect(() => {
    api
      .get("/eval/history")
      .then((r) => setHistory(r.data))
      .catch(() => {});
  }, []);

  const runEval = async () => {
    setRunning(true);
    setError("");
    setResults(null);
    try {
      const res = await api.post("/eval/run");
      setResults(res.data);
      const hist = await api.get("/eval/history");
      setHistory(hist.data);
    } catch (err) {
      setError(err.response?.data?.message || "Evaluation failed");
    } finally {
      setRunning(false);
    }
  };

  const avg = results?.avgScores;

  // ✅ Derive query count dynamically from actual results
  const queryCount = results?.results?.length ?? 3;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>

      {/* Header */}
      <header
        style={{
          background: "#0d0d14",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "0.85rem 1.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            to="/dashboard"
            style={{
              color: "#8b8ba0",
              display: "flex",
              textDecoration: "none",
              padding: "4px",
              borderRadius: "7px",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#f0eeff")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#8b8ba0")}
          >
            <Icons.Back />
          </Link>
          <span style={{ fontSize: "1.2rem" }}>📊</span>
          <div>
            <p
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "#f0eeff",
              }}
            >
              RAG Evaluation
            </p>
            <p style={{ fontSize: "0.7rem", color: "#4a4a60" }}>
              Gemini-as-judge scoring · auto-generated test queries
            </p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "10px",
            padding: "3px",
          }}
        >
          {[
            ["run", "▶  Run Eval"],
            ["history", "History"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: "5px 14px",
                borderRadius: "7px",
                border: "none",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: tab === id ? 600 : 400,
                background: tab === id ? "rgba(139,92,246,0.2)" : "transparent",
                color: tab === id ? "#a78bfa" : "#8b8ba0",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
        {/* ── RUN TAB ── */}
        {tab === "run" && (
          <div style={{ animation: "fadeUp 0.2s ease" }}>
            {/* Explainer */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "1.25rem 1.5rem",
                marginBottom: "1.75rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#f0eeff",
                  marginBottom: "0.5rem",
                }}
              >
                How it works
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: "0.75rem",
                }}
              >
                {[
                  [
                    "01",
                    "Gemini generates 3 realistic test questions from your actual documents",
                  ],
                  [
                    "02",
                    "Each question runs through the full RAG pipeline (embed → retrieve → generate)",
                  ],
                  [
                    "03",
                    "Gemini-as-judge scores each response on 4 metrics (0–10 each)",
                  ],
                  [
                    "04",
                    "Results are saved so you can track improvement over time",
                  ],
                ].map(([n, text]) => (
                  <div
                    key={n}
                    style={{
                      background: "rgba(139,92,246,0.05)",
                      borderRadius: "10px",
                      padding: "0.75rem",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "#8b5cf6",
                        marginBottom: "0.35rem",
                      }}
                    >
                      {n}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#8b8ba0",
                        lineHeight: 1.55,
                      }}
                    >
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Run button */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <button
                onClick={runEval}
                disabled={running}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0.85rem 2.25rem",
                  borderRadius: "12px",
                  border: "none",
                  background: running
                    ? "rgba(139,92,246,0.3)"
                    : "linear-gradient(135deg,#8b5cf6,#6366f1)",
                  color: "#fff",
                  cursor: running ? "not-allowed" : "pointer",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  fontFamily: "'Syne',sans-serif",
                  transition: "opacity 0.2s",
                }}
                onMouseOver={(e) => {
                  if (!running) e.currentTarget.style.opacity = "0.88";
                }}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {running ? (
                  <>
                    <span
                      style={{
                        animation: "spin 1s linear infinite",
                        display: "inline-block",
                      }}
                    >
                      ⚙
                    </span>{" "}
                    {/* ✅ Fixed: was "Running 5 tests…" but backend runs 3 */}
                    Running 3 tests…
                  </>
                ) : (
                  <>
                    <Icons.Run /> Run Evaluation
                  </>
                )}
              </button>
              {running && (
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#4a4a60",
                    marginTop: "0.75rem",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                >
                  This takes ~30 seconds — Gemini is generating questions,
                  running RAG, and scoring answers
                </p>
              )}
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.25)",
                  borderRadius: "12px",
                  padding: "1rem",
                  color: "#f87171",
                  fontSize: "0.875rem",
                  marginBottom: "1.5rem",
                }}
              >
                {error}
              </div>
            )}

            {/* Results */}
            {results && (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                {/* Score overview */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(139,92,246,0.1),rgba(99,102,241,0.06))",
                    border: "1px solid rgba(139,92,246,0.2)",
                    borderRadius: "16px",
                    padding: "1.75rem",
                    marginBottom: "1.75rem",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: "#a78bfa",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "1.25rem",
                      textAlign: "center",
                    }}
                  >
                    Overall RAG Performance — {results.docCount} documents
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "2rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <ScoreRing
                      score={avg?.overall || 0}
                      label="Overall"
                      size={90}
                    />
                    <ScoreRing
                      score={avg?.retrieval_accuracy || 0}
                      label="Retrieval"
                      size={80}
                    />
                    <ScoreRing
                      score={avg?.answer_relevance || 0}
                      label="Relevance"
                      size={80}
                    />
                    <ScoreRing
                      score={avg?.groundedness || 0}
                      label="Grounded"
                      size={80}
                    />
                    <ScoreRing
                      score={avg?.completeness || 0}
                      label="Complete"
                      size={80}
                    />
                  </div>
                  <p
                    style={{
                      textAlign: "center",
                      marginTop: "1.25rem",
                      fontSize: "0.8rem",
                      color: "#8b8ba0",
                    }}
                  >
                    {avg?.overall >= 8
                      ? "🟢 Excellent — your RAG pipeline is performing well"
                      : avg?.overall >= 6
                        ? "🟡 Good — a few improvements possible"
                        : "🔴 Needs work — consider uploading more detailed documents"}
                  </p>
                </div>

                {/* Individual results */}
                <p
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: "#f0eeff",
                    marginBottom: "0.75rem",
                  }}
                >
                  Test Results (click to expand)
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {results.results?.map((r, i) => (
                    <ResultCard key={i} result={r} index={i} />
                  ))}
                </div>

                {/* Viva note */}
                <div
                  style={{
                    marginTop: "1.5rem",
                    background: "rgba(52,211,153,0.06)",
                    border: "1px solid rgba(52,211,153,0.18)",
                    borderRadius: "12px",
                    padding: "1rem 1.25rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#34d399",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  ></p>

                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "history" && (
          <div style={{ animation: "fadeUp 0.2s ease" }}>
            {history.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "5rem 2rem",
                  color: "#4a4a60",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                  📋
                </div>
                <p
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    color: "#8b8ba0",
                    fontSize: "0.95rem",
                    marginBottom: "0.3rem",
                  }}
                >
                  No evaluation runs yet
                </p>
                <p style={{ fontSize: "0.82rem" }}>
                  Run your first evaluation to track performance over time
                </p>
              </div>
            ) : (
              <>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#4a4a60",
                    marginBottom: "1rem",
                  }}
                >
                  Showing last {history.length} evaluation run
                  {history.length !== 1 ? "s" : ""}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {history.map((run) => {
                    const avg = run.avgScores;
                    const color =
                      avg?.overall >= 8
                        ? "#34d399"
                        : avg?.overall >= 6
                          ? "#fbbf24"
                          : "#f87171";
                    return (
                      <div
                        key={run._id}
                        style={{
                          background: "#111118",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "12px",
                          padding: "1rem 1.1rem",
                          display: "grid",
                          gridTemplateColumns: "auto 1fr repeat(4,auto)",
                          gap: "1rem",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: `${color}18`,
                            border: `1px solid ${color}40`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'Syne',sans-serif",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              color,
                            }}
                          >
                            {avg?.overall?.toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: "0.85rem",
                              color: "#d4d4e8",
                              fontWeight: 500,
                            }}
                          >
                            {new Date(run.createdAt).toLocaleDateString(
                              "en-IN",
                              { dateStyle: "long" },
                            )}{" "}
                            ·{" "}
                            {new Date(run.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p
                            style={{
                              fontSize: "0.72rem",
                              color: "#4a4a60",
                              marginTop: "1px",
                            }}
                          >
                            {run.docCount} documents in library
                          </p>
                        </div>
                        {[
                          ["R", avg?.retrieval_accuracy],
                          ["Rel", avg?.answer_relevance],
                          ["G", avg?.groundedness],
                          ["C", avg?.completeness],
                        ].map(([l, s]) => (
                          <div key={l} style={{ textAlign: "center" }}>
                            <p
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color:
                                  s >= 8
                                    ? "#34d399"
                                    : s >= 6
                                      ? "#fbbf24"
                                      : "#f87171",
                                fontFamily: "'Syne',sans-serif",
                              }}
                            >
                              {s?.toFixed(1)}
                            </p>
                            <p
                              style={{ fontSize: "0.63rem", color: "#4a4a60" }}
                            >
                              {l}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
