const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");
const { protect } = require("../middleware/auth");
const Document = require("../models/Document");
const EvalResult = require("../models/EvalResult2");
const { generateEmbedding, retrieveTopK } = require("../utils/embeddings");

const ai = new GoogleGenAI({});

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

//Helper: safely normalize retrievedDocs to array of objects
function safeRetrievedDocs(docs) {
  if (!Array.isArray(docs)) return [];
  return docs.map((d) => {
    if (typeof d === "string") return { title: d, type: "", score: null };
    return {
      title:  String(d?.title  || ""),
      type:   String(d?.type   || ""),
      score:  typeof d?.score === "number" ? d.score : null,
    };
  });
}

// ─── POST /api/eval/run ───────────────────────────────────────────────────────
router.post("/run", protect, async (req, res) => {
  try {
    const allDocs = await Document.find({ user: req.user._id }).select(
      "title type summary keywords content embedding",
    );

    if (allDocs.length === 0) {
      return res.status(400).json({ message: "Upload at least one document first" });
    }

    const docList = allDocs
      .slice(0, 8)
      .map((d, i) => `${i + 1}. "${d.title}" — ${(d.summary || "").substring(0, 120)}`)
      .join("\n");

    // ── GEMINI CALL 1: Generate 3 test queries ────────────────────────────────
    const q1Response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        `You are a RAG evaluation expert. Given this document library:\n${docList}\n\n` +
        `Generate exactly 3 test questions. Each should test a DIFFERENT scenario:\n` +
        `Q1 — a specific factual question answerable from ONE document\n` +
        `Q2 — a summary/overview question spanning MULTIPLE documents\n` +
        `Q3 — a conceptual "explain this topic" question\n\n` +
        `Return ONLY a valid JSON array of 3 strings. No markdown, no explanation:\n` +
        `["question one","question two","question three"]`,
    });

    let testQueries;
    try {
      const raw = q1Response.text.replace(/```json|```/g, "").trim();
      testQueries = JSON.parse(raw);
      if (!Array.isArray(testQueries)) throw new Error("not array");
      testQueries = testQueries.slice(0, 3);
    } catch {
      testQueries = [
        `What is the main topic covered in "${allDocs[0]?.title || "my first document"}"?`,
        `Give me an overview of all the subjects in my knowledge base`,
        `What are the most important concepts across my uploaded documents?`,
      ];
    }

    // ── RAG retrieval for each query ──────────────────────────────────────────
    const retrievalResults = [];
    for (const query of testQueries) {
      const qEmbed = await generateEmbedding(query);
      const topDocs = retrieveTopK(allDocs, qEmbed, 3);
      const context = topDocs
        .map(
          (d, i) =>
            `[Doc${i + 1}] "${d.title}" (${d._score ? (d._score * 100).toFixed(0) + "% match" : "retrieved"}):\n` +
            `${d.summary || ""}.\n${(d.content || "").substring(0, 600)}`,
        )
        .join("\n---\n");
      retrievalResults.push({ query, topDocs, context });
      await delay(150);
    }

    // ── GEMINI CALL 2: Answer ALL queries in ONE prompt ───────────────────────
    await delay(4000);

    const batchAnswerPrompt =
      retrievalResults
        .map(
          (r, i) =>
            `=== QUERY ${i + 1} ===\nQuestion: ${r.query}\n\nRetrieved context:\n${r.context}`,
        )
        .join("\n\n") +
      `\n\nAnswer all ${testQueries.length} queries above. ` +
      `For each, write a 2-3 sentence answer using ONLY the retrieved context. ` +
      `Return ONLY a JSON array of ${testQueries.length} answer strings, no markdown:\n` +
      `["answer to query 1","answer to query 2","answer to query 3"]`;

    const q2Response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: batchAnswerPrompt,
    });

    let answers;
    try {
      const raw2 = q2Response.text.replace(/```json|```/g, "").trim();
      answers = JSON.parse(raw2);
      if (!Array.isArray(answers)) throw new Error("not array");
    } catch {
      answers = testQueries.map((_, i) => `Answer ${i + 1} could not be parsed`);
    }

    // ── GEMINI CALL 3: Score ALL answers in ONE judge prompt ──────────────────
    await delay(4000);

    const batchScorePrompt =
      `You are a RAG evaluation judge. Score each query-answer pair below.\n\n` +
      retrievalResults
        .map(
          (r, i) =>
            `=== PAIR ${i + 1} ===\n` +
            `Query: ${r.query}\n` +
            `Retrieved docs: ${r.topDocs.map((d) => `"${d.title}"`).join(", ")}\n` +
            `Answer: ${(answers[i] || "").substring(0, 300)}`,
        )
        .join("\n\n") +
      `\n\nFor each of the ${testQueries.length} pairs, give scores 0-10 for:\n` +
      `- retrieval_accuracy\n- answer_relevance\n- groundedness\n- completeness\n- overall\n- feedback (one short sentence)\n\n` +
      `Return ONLY a JSON array of ${testQueries.length} score objects, no markdown:\n` +
      `[{"retrieval_accuracy":8,"answer_relevance":7,"groundedness":9,"completeness":7,"overall":8,"feedback":"brief comment"},...]`;

    const q3Response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: batchScorePrompt,
    });

    let allScores;
    try {
      const raw3 = q3Response.text.replace(/```json|```/g, "").trim();
      allScores = JSON.parse(raw3);
      if (!Array.isArray(allScores)) throw new Error("not array");
    } catch {
      allScores = testQueries.map(() => ({
        retrieval_accuracy: 7, answer_relevance: 7, groundedness: 7,
        completeness: 7, overall: 7,
        feedback: "Scoring response could not be parsed — scores are estimates",
      }));
    }

    const results = testQueries.map((query, i) => {
  const topDocs = retrievalResults[i]?.topDocs || [];
  console.log('DEBUG topDocs type:', typeof topDocs, Array.isArray(topDocs));
  console.log('DEBUG topDocs[0]:', typeof topDocs[0], topDocs[0]);
  const retrievedDocs = safeRetrievedDocs(
    topDocs.map((d) => ({
      title: d.title,
      type:  d.type,
      score: d._score ? parseFloat((d._score * 100).toFixed(1)) : null,
    }))
  );
  console.log('DEBUG retrievedDocs[0]:', typeof retrievedDocs[0], retrievedDocs[0]);
  return { query, retrievedDocs, answer: (answers[i] || "").substring(0, 600), scores: allScores[i] };
});
    // ── Assemble final results ────────────────────────────────────────────────
//    const results = testQueries.map((query, i) => ({
//      query,
//      retrievedDocs: safeRetrievedDocs(          // ← always safe objects
//        (retrievalResults[i]?.topDocs || []).map((d) => ({
//          title: d.title,
//          type:  d.type,
//          score: d._score ? parseFloat((d._score * 100).toFixed(1)) : null,
//        }))
//      ),
//      answer: (answers[i] || "").substring(0, 600),
//      scores: allScores[i] || {
//        retrieval_accuracy: 7, answer_relevance: 7, groundedness: 7,
//        completeness: 7, overall: 7, feedback: "N/A",
//      },
//    }));

    // ── Average scores ────────────────────────────────────────────────────────
    const avg = (key) =>
      +(results.reduce((s, r) => s + (r.scores[key] || 0), 0) / results.length).toFixed(1);

    const avgScores = {
      retrieval_accuracy: avg("retrieval_accuracy"),
      answer_relevance:   avg("answer_relevance"),
      groundedness:       avg("groundedness"),
      completeness:       avg("completeness"),
      overall:            avg("overall"),
    };

    // ── Save to DB — use lean plain objects, not mongoose docs ────────────────
    const evalRun = await EvalResult.create({
      user:      req.user._id,
      results:   results.map((r) => ({
        query:        r.query,
        answer:       r.answer,
        scores:       r.scores,
        retrievedDocs: r.retrievedDocs,   // already safeRetrievedDocs output
      })),
      avgScores,
      docCount:  allDocs.length,
    });

    res.json({
      evalId:      evalRun._id,
      results,
      avgScores,
      docCount:    allDocs.length,
      runAt:       evalRun.createdAt,
      geminiCalls: 3,
    });
  } catch (err) {
    console.error("Eval error:", err);
    const isRateLimit =
      err.message?.includes("429") ||
      err.message?.toLowerCase().includes("quota") ||
      err.message?.toLowerCase().includes("rate");
    res.status(500).json({
      message: isRateLimit
        ? "Gemini rate limit hit. Wait 60 seconds and try again."
        : "Evaluation failed: " + err.message,
    });
  }
});

// ─── POST /api/eval/feedback ──────────────────────────────────────────────────
router.post("/feedback", protect, async (req, res) => {
  const { question, response, rating, docTitles } = req.body;
  try {
    let rawDocs = [];
    if (Array.isArray(docTitles))          rawDocs = docTitles;
    else if (typeof docTitles === "string") {
      try { rawDocs = JSON.parse(docTitles); } catch { rawDocs = docTitles ? [{ title: docTitles }] : []; }
    }

    const normalizedDocs = safeRetrievedDocs(rawDocs);

    await EvalResult.create({
      user: req.user._id,
      type: "feedback",
      results: [{
        query:        question,
        answer:       response,
        scores:       { overall: rating === "up" ? 10 : 0 },
        retrievedDocs: normalizedDocs,
      }],
      avgScores: { overall: rating === "up" ? 10 : 0 },
      docCount:  0,
    });

    res.json({ message: "Feedback saved" });
  } catch (err) {
    console.error("Feedback save error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/eval/history ────────────────────────────────────────────────────
router.get("/history", protect, async (req, res) => {
  try {
    const runs = await EvalResult.find({ user: req.user._id, type: { $ne: "feedback" } })
      .select("avgScores docCount createdAt")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(runs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;