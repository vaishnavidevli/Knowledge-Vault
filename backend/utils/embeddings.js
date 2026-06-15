const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

async function generateEmbedding(text) {
  try {
    const chunk = text.substring(0, 6000);
    const result = await ai.models.embedContent({
      model: "gemini-embedding-001", // 3072 dims
      contents: chunk,
    });
    return result.embeddings[0].values;
  } catch (err) {
    console.error("Embedding error:", err.message);
    return [];
  }
}

function retrieveTopK(docs, queryEmbedding, k = 10, threshold = 0.57) {
  if (!queryEmbedding?.length) return docs.slice(0, k);

  return docs
    .map((doc) => {
      const obj = doc.toObject ? doc.toObject() : { ...doc };
      const score = cosineSimilarity(queryEmbedding, obj.embedding || []);
      delete obj.embedding;
      delete obj.embeddingText;
      return { ...obj, _score: score };
    })
    .filter((d) => d._score >= threshold)
    .sort((a, b) => b._score - a._score)
    .slice(0, k);
}

module.exports = { cosineSimilarity, generateEmbedding, retrieveTopK };