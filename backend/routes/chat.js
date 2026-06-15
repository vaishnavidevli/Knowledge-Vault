const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");
const { protect } = require("../middleware/auth");
const Document = require("../models/Document");
const { generateEmbedding, retrieveTopK } = require("../utils/embeddings");

const ai = new GoogleGenAI({});

//POST /api/chat
router.post("/", protect, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message?.trim())
    return res.status(400).json({ message: "Message is required" });

  try {
    // Embed the user's question
    const queryEmbedding = await generateEmbedding(message);

    // Fetch all docs WITH embeddings for similarity search
    const allDocs = await Document.find({ user: req.user._id }).select(
      "title type summary keywords content embedding createdAt",
    );

    // Retrieve top-4 most semantically relevant documents
    const topDocs = retrieveTopK(allDocs, queryEmbedding, 4);

    // Build focused context from ONLY the retrieved docs
    let context = "";

    if (topDocs.length > 0) {
      context = topDocs
        .map((d, i) => {
          const score = d._score
            ? ` [relevance: ${(d._score * 100).toFixed(0)}%]`
            : "";
          return `[Document ${i + 1}]${score}
Title: "${d.title}" | Type: ${d.type}
Summary: ${d.summary}
Keywords: ${(d.keywords || []).join(", ")}
Full Content:
${(d.content || "").substring(0, 2000)}`;
        })
        .join("\n\n────────────────────\n\n");
    } else {
      context = "No relevant documents found in the knowledge base.";
    }

    //RAG system prompt
    const systemPrompt = `You are an intelligent knowledge assistant for "Knowledge Vault."

You have been given ${topDocs.length} document(s) retrieved from the user's knowledge base that are most relevant to their question. These were selected using semantic similarity — they are the BEST matches for what the user is asking.

RETRIEVED DOCUMENTS:
${context}

INSTRUCTIONS:
- Answer the question using ONLY the content from these documents
- Be specific — quote exact details, examples, and explanations from the documents
- If the answer spans multiple documents, synthesise them
- If the retrieved documents don't contain the answer, say so clearly and answer from general knowledge
- When referencing content, mention the document title
- Be thorough but structured — use formatting when helpful
- At the end, if relevant, suggest what else from these documents the user might want to explore`;

    // ── STEP 6: Build conversation history for multi-turn context ─────────────
    // Format: [system setup exchange, ...prior turns, current user message]
    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [
          {
            text: `Understood. I have retrieved the ${topDocs.length} most relevant document(s) for this query and will answer based on their content.`,
          },
        ],
      },
      // Inject prior conversation turns
      ...history.map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      // Current user message
      { role: "user", parts: [{ text: message }] },
    ];

    // Call Gemini via new SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    const reply = response.text;

    res.json({
      reply,
      // Return retrieval metadata so the frontend can show "Sources used"
      retrievedDocs: topDocs.map((d) => ({
        _id: d._id,
        title: d.title,
        type: d.type,
        score: d._score ? parseFloat((d._score * 100).toFixed(1)) : null,
      })),
      totalDocs: allDocs.length,
    });
  } catch (err) {
    console.error("Chat RAG error:", err);
    res.status(500).json({ message: "Chat failed: " + err.message });
  }
});

module.exports = router;
