const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");
const { protect } = require("../middleware/auth");
const Document = require("../models/Document");

const ai = new GoogleGenAI({});

// ─── POST /api/insights/generate ─────────────────────────────────────────────
router.post("/generate", protect, async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user._id })
      .select("title type summary keywords createdAt")
      .sort({ createdAt: -1 });

    if (docs.length === 0) {
      return res.json({
        themes: [],
        gaps: [],
        sequence: [],
        overview: "No documents uploaded yet.",
      });
    }

    const docList = docs
      .map(
        (d, i) =>
          `${i + 1}. "${d.title}" (${d.type}) — ${d.summary} | Keywords: ${(d.keywords || []).join(", ")}`,
      )
      .join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert learning advisor and knowledge analyst.

Analyze this collection of ${docs.length} documents from a student's personal knowledge base:

${docList}

Provide a deep analysis in this EXACT JSON format (no markdown, no backticks):
{
  "overview": "2-3 sentence high-level description of the entire knowledge base",
  "themes": [
    {
      "name": "Theme name",
      "description": "What this theme covers",
      "documents": ["doc title 1", "doc title 2"],
      "strength": "strong|moderate|weak"
    }
  ],
  "gaps": [
    {
      "topic": "Missing topic name",
      "reason": "Why this gap exists / what documents hint at it",
      "priority": "high|medium|low"
    }
  ],
  "sequence": [
    {
      "step": 1,
      "title": "Document or topic title",
      "reason": "Why study this first / dependency"
    }
  ],
  "insights": [
    "One surprising or interesting observation about the knowledge base"
  ]
}

Rules:
- themes: identify 2-5 major topic clusters
- gaps: identify 2-4 topics that are implied but missing
- sequence: optimal study order for all documents (1 entry per doc)
- insights: 3 sharp, specific observations (not generic)
- Be specific to the actual content, not generic advice`,
    });

    const rawText = response.text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      parsed = match
        ? JSON.parse(match[0])
        : {
            overview: rawText,
            themes: [],
            gaps: [],
            sequence: [],
            insights: [],
          };
    }

    res.json({
      ...parsed,
      docCount: docs.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Insights error:", err);
    res
      .status(500)
      .json({ message: "Insights generation failed: " + err.message });
  }
});

module.exports = router;
