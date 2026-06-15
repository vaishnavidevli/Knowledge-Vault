import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Send: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  Back: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  File: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Copy: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Logout: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Dots: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  ),
};

// ─── Suggested prompts ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: "📚", text: "Summarize all my documents" },
  { icon: "🔗", text: "What topics are connected across my notes?" },
  { icon: "🔍", text: "Find the most important keywords in my knowledge base" },
  { icon: "📊", text: "Compare the themes in my uploaded PDFs" },
  { icon: "💡", text: "What should I study next based on my notes?" },
  { icon: "🗂️", text: "List all my documents with a one-line description each" },
];

// ─── Inline text renderer: bold, italic, code, quoted ────────────────────────
function InlineText({ text }) {
  if (!text) return null;
  const parts = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|"[^"]+")/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith("**")) parts.push({ type: "bold", value: raw.slice(2, -2) });
    else if (raw.startsWith("`")) parts.push({ type: "code", value: raw.slice(1, -1) });
    else if (raw.startsWith("*")) parts.push({ type: "italic", value: raw.slice(1, -1) });
    else if (raw.startsWith('"')) parts.push({ type: "quote", value: raw.slice(1, -1) });
    lastIndex = match.index + raw.length;
  }
  if (lastIndex < text.length) parts.push({ type: "text", value: text.slice(lastIndex) });

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "bold") return <strong key={i} style={{ color: "#f0eeff", fontWeight: 600 }}>{part.value}</strong>;
        if (part.type === "code") return <code key={i} style={{ background: "#0d0d14", color: "#c4b5fd", padding: "1px 5px", borderRadius: "4px", fontFamily: "monospace", fontSize: "0.82em" }}>{part.value}</code>;
        if (part.type === "italic") return <em key={i} style={{ color: "#d4d4e8" }}>{part.value}</em>;
        if (part.type === "quote") return <span key={i} style={{ color: "#a78bfa" }}>"{part.value}"</span>;
        return <span key={i}>{part.value}</span>;
      })}
    </>
  );
}

// ─── Block markdown renderer (React elements, no dangerouslySetInnerHTML) ─────
function MarkdownRenderer({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={`cb-${i}`} style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.75rem 1rem", overflowX: "auto", margin: "0.5rem 0", fontFamily: "monospace", fontSize: "0.8rem", color: "#c4b5fd", whiteSpace: "pre-wrap" }}>
          {codeLines.join("\n")}
        </pre>
      );
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(<p key={`h3-${i}`} style={{ fontWeight: 600, fontSize: "0.95rem", color: "#f0eeff", margin: "1rem 0 0.3rem", fontFamily: "'Syne',sans-serif" }}><InlineText text={line.slice(4)} /></p>);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<p key={`h2-${i}`} style={{ fontWeight: 700, fontSize: "1.05rem", color: "#f0eeff", margin: "1.2rem 0 0.4rem", fontFamily: "'Syne',sans-serif" }}><InlineText text={line.slice(3)} /></p>);
      i++; continue;
    }
    if (line.startsWith("# ")) {
      elements.push(<p key={`h1-${i}`} style={{ fontWeight: 700, fontSize: "1.15rem", color: "#f0eeff", margin: "1.2rem 0 0.4rem", fontFamily: "'Syne',sans-serif" }}><InlineText text={line.slice(2)} /></p>);
      i++; continue;
    }

    // Unordered list — collect consecutive items
    if (line.match(/^[-*•]\s/)) {
      const startI = i;
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*•]\s/)) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${startI}`} style={{ listStyle: "none", padding: 0, margin: "0.4rem 0" }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: "flex", gap: "8px", alignItems: "baseline", padding: "2px 0", fontSize: "0.875rem", color: "#c4c4d4", lineHeight: 1.65 }}>
              <span style={{ color: "#8b5cf6", flexShrink: 0 }}>▸</span>
              <span><InlineText text={item} /></span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list — collect consecutive items
    if (line.match(/^\d+\.\s/)) {
      const startI = i;
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        const num = lines[i].match(/^(\d+)\./)[1];
        const content = lines[i].replace(/^\d+\.\s/, "");
        items.push({ num, content });
        i++;
      }
      elements.push(
        <ol key={`ol-${startI}`} style={{ listStyle: "none", padding: 0, margin: "0.4rem 0" }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: "flex", gap: "8px", alignItems: "baseline", padding: "2px 0", fontSize: "0.875rem", color: "#c4c4d4", lineHeight: 1.65 }}>
              <span style={{ color: "#8b5cf6", fontWeight: 600, flexShrink: 0, minWidth: "16px" }}>{item.num}.</span>
              <span><InlineText text={item.content} /></span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<br key={`br-${i}`} />);
      i++; continue;
    }

    // Normal paragraph
    elements.push(
      <p key={`p-${i}`} style={{ fontSize: "0.875rem", color: "#c4c4d4", lineHeight: 1.75, margin: "0.2rem 0" }}>
        <InlineText text={line} />
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Message({ msg, onFeedback }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showSources, setShowSources] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFeedbackClick = (rating) => {
    setFeedback(rating);
    if (onFeedback) onFeedback(msg, rating);
  };

  const hasSources = !isUser && msg.retrievedDocs?.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", gap: "10px", marginBottom: "1.25rem", alignItems: "flex-start", animation: "msgIn 0.2s ease" }}>
      {/* Avatar */}
      <div style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, background: isUser ? "linear-gradient(135deg,#8b5cf6,#6366f1)" : "rgba(255,255,255,0.06)", border: isUser ? "none" : "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
        {isUser ? "👤" : "🧠"}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: "78%", minWidth: "60px" }}>
        <div style={{ background: isUser ? "linear-gradient(135deg,rgba(139,92,246,0.22),rgba(99,102,241,0.18))" : "rgba(255,255,255,0.04)", border: isUser ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.08)", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "0.85rem 1.1rem" }}>
          {isUser
            ? <p style={{ fontSize: "0.875rem", color: "#e8e0ff", lineHeight: 1.65, margin: 0 }}>{msg.content}</p>
            : <MarkdownRenderer text={msg.content} />
          }
        </div>

        {/* Sources */}
        {hasSources && (
          <div style={{ marginTop: "6px" }}>
            <button
              onClick={() => setShowSources((s) => !s)}
              style={{ background: "transparent", border: "none", color: "#4a4a60", cursor: "pointer", fontSize: "0.68rem", display: "flex", alignItems: "center", gap: "4px", padding: "2px 0", transition: "color 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#a78bfa")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#4a4a60")}
            >
              <span style={{ fontSize: "10px" }}>{showSources ? "▾" : "▸"}</span>
              Sources ({msg.retrievedDocs.length} retrieved)
            </button>
            {showSources && (
              <div style={{ marginTop: "5px", display: "flex", flexDirection: "column", gap: "4px", animation: "fadeUp 0.15s ease" }}>
                {msg.retrievedDocs.map((d, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "8px", padding: "5px 9px" }}>
                    <span style={{ fontSize: "10px", color: d.type === "pdf" ? "#f87171" : d.type === "image" ? "#34d399" : d.type === "audio" ? "#fbbf24" : "#60a5fa" }}>●</span>
                    <span style={{ fontSize: "0.73rem", color: "#c4b5fd", fontWeight: 500 }}>{d.title}</span>
                    {d.score != null && <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: "#4a4a60" }}>{d.score}% match</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Time + Copy + Feedback */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px", justifyContent: isUser ? "flex-end" : "flex-start" }}>
          <span style={{ fontSize: "0.68rem", color: "#4a4a60" }}>
            {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {!isUser && (
            <>
              <button onClick={copy} style={{ background: "transparent", border: "none", color: copied ? "#34d399" : "#4a4a60", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center", gap: "3px", fontSize: "0.68rem", transition: "color 0.2s" }}>
                {copied ? <><Icons.Check /> Copied</> : <><Icons.Copy /> Copy</>}
              </button>
              <div style={{ display: "flex", gap: "3px", marginLeft: "4px" }}>
                <button
                  onClick={() => handleFeedbackClick("up")}
                  title="Good answer"
                  style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", opacity: feedback === "up" ? 1 : 0.35, transition: "opacity 0.2s", lineHeight: 1 }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = feedback === "up" ? "1" : "0.35")}
                >👍</button>
                <button
                  onClick={() => handleFeedbackClick("down")}
                  title="Bad answer"
                  style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", opacity: feedback === "down" ? 1 : 0.35, transition: "opacity 0.2s", lineHeight: 1 }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = feedback === "down" ? "1" : "0.35")}
                >👎</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "1.25rem", alignItems: "flex-start" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🧠</div>
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px 18px 18px 4px", padding: "0.85rem 1.1rem" }}>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#8b5cf6", animation: `dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Chatbot Page ────────────────────────────────────────────────────────
export default function Chatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [docCount, setDocCount] = useState(0);
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    api.get("/documents/stats")
      .then((r) => setDocCount(r.data.total || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const prefill = sessionStorage.getItem("chatPrefill");
    sessionStorage.removeItem("chatPrefill");

    setMessages([{
      role: "assistant",
      content: `Hello! I'm your **Knowledge Vault assistant** powered by Gemini.\n\nI have access to all **${docCount || "your"} uploaded documents** — PDFs, images, audio transcripts, and videos. You can ask me to:\n\n- **Summarize** any document or your entire library\n- **Find connections** between topics across your notes\n- **Answer questions** based on your uploaded content\n- **Suggest** what to study or explore next\n\nWhat would you like to know?`,
      ts: Date.now(),
    }]);

    if (prefill) {
      setTimeout(() => {
        setInput(prefill);
        inputRef.current?.focus();
      }, 300);
    }
  }, [docCount]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg = { role: "user", content: msg, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = messages
      .filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await api.post("/chat", { message: msg, history });
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: res.data.reply,
        ts: Date.now(),
        retrievedDocs: res.data.retrievedDocs || [],
        totalDocs: res.data.totalDocs || 0,
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `Sorry, something went wrong: ${err.response?.data?.message || err.message}. Make sure your Gemini API key is set in the backend .env file.`,
        ts: Date.now(),
        retrievedDocs: [],
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, messages, loading]);

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: `Chat cleared! I still have access to all **${docCount}** documents. Ask me anything.`,
      ts: Date.now(),
    }]);
  };

  const handleFeedback = async (msg, rating) => {
    try {
      await api.post("/eval/feedback", {
        question: messages[messages.indexOf(msg) - 1]?.content || "",
        response: msg.content,
        rating,
        docTitles: (msg.retrievedDocs || []).map((d) => ({ title: d.title, type: d.type, score: d.score })),
      });
    } catch { /* silent fail */ }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length <= 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans',sans-serif", overflow: "hidden" }}>
      <style>{`
        @keyframes msgIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes dot { 0%,60%,100% { transform:translateY(0); opacity:0.4 } 30% { transform:translateY(-6px); opacity:1 } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        textarea:focus { outline:none }
        textarea::placeholder { color:#4a4a60 }
        textarea { resize:none; scrollbar-width:none }
        textarea::-webkit-scrollbar { display:none }
      `}</style>

      {/* ── TOP BAR ── */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0.9rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#0d0d14" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link to="/dashboard"
            style={{ color: "#8b8ba0", display: "flex", alignItems: "center", textDecoration: "none", padding: "5px", borderRadius: "8px", transition: "color 0.2s" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#f0eeff")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#8b8ba0")}
          ><Icons.Back /></Link>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🧠</div>
            <div>
              <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#f0eeff", letterSpacing: "-0.01em", margin: 0 }}>Knowledge Assistant</p>
              <p style={{ fontSize: "0.7rem", color: "#4a4a60", margin: 0 }}>Powered by Gemini · {docCount} doc{docCount !== 1 ? "s" : ""} in context</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", padding: "3px 10px", borderRadius: "20px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", animation: "dot 2s ease-in-out infinite" }} />
            <span style={{ fontSize: "0.7rem", color: "#34d399", fontWeight: 500 }}>Gemini Active</span>
          </div>
          <button onClick={clearChat} title="Clear chat"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#8b8ba0", cursor: "pointer", borderRadius: "8px", padding: "6px 10px", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.78rem", transition: "all 0.2s" }}
            onMouseOver={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; }}
            onMouseOut={(e) => { e.currentTarget.style.color = "#8b8ba0"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          ><Icons.Trash /> Clear</button>
          <button onClick={() => { localStorage.clear(); navigate("/login"); }}
            style={{ background: "transparent", border: "none", color: "#4a4a60", cursor: "pointer", padding: "6px", display: "flex", borderRadius: "7px", transition: "color 0.2s" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#f87171")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#4a4a60")}
          ><Icons.Logout /></button>
        </div>
      </header>

      {/* ── MESSAGES AREA ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.75rem", scrollbarWidth: "thin", scrollbarColor: "#2a2a3a transparent" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          {messages.map((msg, i) => <Message key={i} msg={msg} onFeedback={handleFeedback} />)}
          {loading && <TypingIndicator />}

          {isEmpty && !loading && (
            <div style={{ marginTop: "1.5rem", animation: "fadeUp 0.3s ease 0.2s both" }}>
              <p style={{ fontSize: "0.72rem", color: "#4a4a60", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem", textAlign: "center" }}>Try asking</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "8px" }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s.text} onClick={() => sendMessage(s.text)}
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "0.75rem 1rem", cursor: "pointer", textAlign: "left", color: "#8b8ba0", fontSize: "0.82rem", lineHeight: 1.4, transition: "all 0.18s", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "flex-start", gap: "8px" }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.08)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; e.currentTarget.style.color = "#c4b5fd"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#8b8ba0"; }}
                  >
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── INPUT AREA ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "1rem 1.75rem 1.25rem", background: "#0d0d14", flexShrink: 0 }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          {docCount > 0 && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", padding: "2px 9px", borderRadius: "20px", fontSize: "0.7rem", color: "#a78bfa" }}>
                <Icons.File /> {docCount} docs indexed
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)", padding: "2px 9px", borderRadius: "20px", fontSize: "0.7rem", color: "#34d399" }}>
                ⚡ RAG — top 4 retrieved per query
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <div
              style={{ flex: 1, background: "#16161f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "0.75rem 1rem", transition: "border-color 0.2s", display: "flex", alignItems: "flex-end", gap: "8px" }}
              onFocusCapture={(e) => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)")}
              onBlurCapture={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about your knowledge base…"
                rows={1}
                style={{ flex: 1, background: "transparent", border: "none", color: "#f0eeff", fontSize: "0.9rem", lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif", maxHeight: "140px", overflowY: "auto" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ width: "44px", height: "44px", borderRadius: "12px", border: "none", cursor: loading || !input.trim() ? "not-allowed" : "pointer", background: loading || !input.trim() ? "rgba(139,92,246,0.2)" : "linear-gradient(135deg,#8b5cf6,#6366f1)", color: loading || !input.trim() ? "#8b5cf6" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}
              onMouseOver={(e) => { if (!loading && input.trim()) e.currentTarget.style.opacity = "0.9"; }}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {loading ? <Icons.Dots /> : <Icons.Send />}
            </button>
          </div>
          <p style={{ fontSize: "0.7rem", color: "#4a4a60", marginTop: "0.5rem", textAlign: "center" }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}