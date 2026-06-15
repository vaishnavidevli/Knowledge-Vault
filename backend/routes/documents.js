const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const Groq = require("groq-sdk");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const { GoogleGenAI } = require("@google/genai");
const { protect } = require("../middleware/auth");
const Document = require("../models/Document");
const http = require("http");
const { generateEmbedding, retrieveTopK, cosineSimilarity } = require("../utils/embeddings");

const ai = new GoogleGenAI({});
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = [
    "application/pdf",
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/tiff", "image/bmp",
    "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/flac", "audio/webm",
    "video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo",
  ];
  ok.includes(file.mimetype) ? cb(null, true) : cb(new Error("Unsupported file type"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

//Gemini summary + keywords
const getGeminiMeta = async (content, type) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a knowledge management assistant.

Given the following extracted text from a ${type} file, provide:
1. A concise summary (2-3 sentences max)
2. A list of 5-8 important keywords

Respond ONLY in this exact JSON format with no markdown:
{"summary":"your summary here","keywords":["keyword1","keyword2","keyword3"]}

Text:
${content.substring(0, 3000)}`,
            },
          ],
        },
      ],
    });
    const cleaned = response.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      summary: parsed.summary || "Summary not available",
      keywords: parsed.keywords || [],
    };
  } catch (e) {
    console.error("Gemini meta error:", e.message);
    return { summary: "AI summary unavailable", keywords: [] };
  }
};

// OCR via Tesseract.js
const extractImageContent = async (filepath) => {
  try {
    console.log("Running Tesseract OCR on image…");
    const { data } = await Tesseract.recognize(filepath, "eng");
    const ocrText = (data.text || "").trim();
    return [
      "TEXT CONTENT:",
      ocrText || "(no text detected)",
      "",
      "OCR CONFIDENCE:",
      `${(data.confidence || 0).toFixed(1)}%`,
    ].join("\n");
  } catch (e) {
    console.error("Tesseract OCR error:", e.message);
    return `[Image uploaded — OCR failed: ${e.message}]`;
  }
};

// Audio → mp3 conversion helper
const convertToMp3 = (inputPath) => {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath + "_converted.mp3";
    ffmpeg(inputPath)
      .toFormat("mp3")
      .audioCodec("libmp3lame")
      .audioBitrate("128k")
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
};

//  Extract audio from video
const extractAudioFromVideo = (inputPath) => {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath + "_audio.mp3";
    ffmpeg(inputPath)
      .noVideo()
      .toFormat("mp3")
      .audioCodec("libmp3lame")
      .audioBitrate("128k")
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
};

// Whisper via Groq
const transcribeWithGroq = async (audioPath, originalName = "audio.mp3") => {
  try {
    console.log(`Sending audio to Groq Whisper: ${audioPath}`);
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-large-v3",
      response_format: "verbose_json",
      language: "en",
    });
    const text = transcription.text || "";
    const language = transcription.language || "unknown";
    const duration = transcription.duration ? `${Math.round(transcription.duration)}s` : "unknown";
    return [
      `TRANSCRIPTION (language: ${language}, duration: ${duration}):`,
      text || "(no speech detected)",
    ].join("\n");
  } catch (e) {
    console.error("Groq Whisper error:", e.message);
    if (e.message?.includes("API key") || e.message?.includes("401")) {
      return "[Transcription failed: Set GROQ_API_KEY in your .env — get a free key at https://console.groq.com]";
    }
    return `[Audio transcription failed: ${e.message}]`;
  }
};

// Audio extraction
const extractAudioContent = async (filepath, mimetype) => {
  let tempPath = null;
  try {
    const needsConversion = !["audio/mpeg", "audio/wav", "audio/flac", "audio/mp4"].includes(mimetype);
    if (needsConversion) {
      console.log("Converting audio to mp3 for Whisper…");
      tempPath = await convertToMp3(filepath);
    }
    const audioPath = tempPath || filepath;
    return await transcribeWithGroq(audioPath, path.basename(filepath));
  } catch (e) {
    console.error("Audio extraction error:", e.message);
    return `[Audio uploaded — extraction failed: ${e.message}]`;
  } finally {
    if (tempPath && fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch {}
    }
  }
};

// Video extraction
const extractVideoContent = async (filepath, mimetype) => {
  let audioPath = null;
  try {
    console.log("Extracting audio track from video…");
    audioPath = await extractAudioFromVideo(filepath);
    const transcript = await transcribeWithGroq(audioPath, path.basename(filepath));
    return ["VIDEO TRANSCRIPT:", transcript].join("\n");
  } catch (e) {
    console.error("Video extraction error:", e.message);
    return `[Video uploaded — transcription failed: ${e.message}]`;
  } finally {
    if (audioPath && fs.existsSync(audioPath)) {
      try { fs.unlinkSync(audioPath); } catch {}
    }
  }
};

// Helpers
const getFileType = (mime) => {
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  return "pdf";
};

const extractContent = async (filepath, mime) => {
  if (mime === "application/pdf") {
    const buf = fs.readFileSync(filepath);
    const data = await pdfParse(buf);
    return data.text || "";
  }
  if (mime.startsWith("image/")) return await extractImageContent(filepath);
  if (mime.startsWith("audio/")) return await extractAudioContent(filepath, mime);
  if (mime.startsWith("video/")) return await extractVideoContent(filepath, mime);
  return "";
};

// ML subject prediction
const predictSubject = (text) => {
  return new Promise((resolve) => {
    const data = JSON.stringify({ text: text.substring(0, 1000) });
    const req = http.request(
      {
        hostname: "localhost",
        port: 5001,
        path: "/predict",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try { resolve(JSON.parse(raw)); } catch { resolve(null); }
        });
      },
    );
    req.on("error", () => resolve(null));
    req.setTimeout(3000, () => { req.destroy(); resolve(null); });
    req.write(data);
    req.end();
  });
};

// POST /api/documents/upload
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const { originalname, mimetype, path: filepath, size } = req.file;
    const fileType = getFileType(mimetype);

    console.log(`Processing ${fileType}: ${originalname}`);
    const content = await extractContent(filepath, mimetype);
    console.log(`Content extracted (${content.length} chars)`);

    let summary = `${fileType} file uploaded.`;
    let keywords = [];

    const hasRealContent =
      content &&
      content.length > 50 &&
      !content.includes("transcription failed") &&
      !content.includes("OCR failed") &&
      !content.includes("extraction failed");

    if (hasRealContent) {
      const meta = await getGeminiMeta(content, fileType);
      summary = meta.summary;
      keywords = meta.keywords;
    }

    const titleClean = originalname.replace(/\.[^/.]+$/, "");
    const embeddingText = [
  titleClean,
  summary,
  keywords.join(", "),
].join("\n\n");
    const embedding = await generateEmbedding(embeddingText);
    console.log(`🔢 Embedding dimension: ${embedding?.length} for "${titleClean}"`);

    let subject = "";
    let subjectConfidence = null;
    try {
      const mlText = [titleClean, keywords.join(" "), content.substring(0, 800)].join(" ");
      const mlResult = await predictSubject(mlText);
      if (mlResult?.subject) {
        subject = mlResult.subject;
        subjectConfidence = mlResult.confidence ?? null;
      }
    } catch {}

    // Auto-assign to best existing folder by embedding similarity
    if (embedding?.length) {
      try {
        const ASSIGN_THRESHOLD = 0.75;  // higher than graph-edges — centroids are diluted
        const MARGIN = 0.04;            // best folder must beat 2nd best by this margin

        const existingDocs = await Document.find({
          user: req.user._id,
          subject: { $exists: true, $ne: "", $nin: ["Unsorted"] },
          $expr: { $gt: [{ $size: "$embedding" }, 0] }
        }).select("embedding subject");

        console.log(`📂 Found ${existingDocs.length} existing docs with folders for comparison`);

        if (existingDocs.length > 0) {
          // Group by folder and compute centroid per folder
          const folderEmbeddings = {};
          existingDocs.forEach(d => {
            if (!folderEmbeddings[d.subject]) folderEmbeddings[d.subject] = [];
            folderEmbeddings[d.subject].push(d.embedding);
          });

          const dim = embedding.length;
          const folderScores = [];

          for (const [folderName, embeddings] of Object.entries(folderEmbeddings)) {
            const centroid = new Array(dim).fill(0);
            embeddings.forEach(e => e.forEach((v, i) => { centroid[i] += v; }));
            centroid.forEach((_, i) => { centroid[i] /= embeddings.length; });
            const sim = cosineSimilarity(embedding, centroid);
            folderScores.push({ name: folderName, sim });
          }

          // Sort descending by similarity
          folderScores.sort((a, b) => b.sim - a.sim);

          const best   = folderScores[0];
          const second = folderScores[1];

          // Must beat threshold AND must be clearly better than second-best
          const clearWinner = !second || (best.sim - second.sim) >= MARGIN;

          if (best && best.sim >= ASSIGN_THRESHOLD && clearWinner) {
            subject = best.name;
            console.log(`📁 Auto-assigned "${titleClean}" → "${best.name}" (sim: ${best.sim.toFixed(3)}, margin: ${second ? (best.sim - second.sim).toFixed(3) : "only folder"})`);
          } else {
            subject = "Unsorted";
            console.log(`📁 No clear folder match for "${titleClean}" (best: ${best?.sim.toFixed(3)} "${best?.name}", 2nd: ${second?.sim.toFixed(3)} "${second?.name}") → Unsorted`);
          }
        }
      } catch (e) {
        console.error("Auto-folder assignment error:", e.message);
      }
    }

    const doc = await Document.create({
      user: req.user._id,
      title: titleClean,
      type: fileType,
      filename: req.file.filename,
      filepath,
      content,
      summary,
      keywords,
      fileSize: size,
      embedding,
      embeddingText,
      subject,
      subjectConfidence,
    });

    const docObj = doc.toObject();
    delete docObj.embedding;
    res.status(201).json(docObj);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed: " + err.message });
  }
});

//// ─── POST /api/documents/embed-all ───────────────────────────────────────────
//router.post("/embed-all", protect, async (req, res) => {
//  try {
////    const docs = await Document.find({
////      user: req.user._id,
////      $or: [{ embedding: { $size: 0 } }, { embedding: { $exists: false } }],
////    });
// const docs = await Document.find({ user: req.user._id })
//    let count = 0;
//    for (const doc of docs) {
//      const text = [
//  doc.title,
//  doc.summary,
//  doc.keywords.join(", "),
//].join("\n\n");
//      const embedding = await generateEmbedding(text);
//      if (embedding.length) {
//        await Document.updateOne({ _id: doc._id }, { embedding, embeddingText: text });
//        count++;
//      }
//      await new Promise((r) => setTimeout(r, 300));
//    }
//    res.json({ message: `Re-embedded ${count} documents successfully` });
//    for (const doc of docs) {
//  const text = [
//    doc.title,
//    doc.summary,
//    doc.keywords.join(", "),
//  ].join("\n\n");
//
//  console.log("📄 Embedding:", doc.title);
//  console.log("📝 Text:", text.substring(0, 100));
//
//  const embedding = await generateEmbedding(text);
//  console.log("🔢 Embedding length:", embedding.length);
//
//  if (embedding.length) {
//    const result = await Document.updateOne({ _id: doc._id }, { embedding, embeddingText: text });
//    console.log("💾 Update result:", result);
//    count++;
//  }
//  await new Promise((r) => setTimeout(r, 300));
//}
//  } catch (err) {
//    res.status(500).json({ message: err.message });
//  }
//});

router.get("/", protect, async (req, res) => {
  try {
    const { type, search } = req.query;

    let query = { user: req.user._id };
    if (type && type !== "all") query.type = type;

    // Fetch all docs (with embeddings)
    let docs = await Document.find(query);

    // Semantic search
    if (search && search.trim().length > 2) {
      const cleanSearch = search.trim();

      const queryEmbedding = await generateEmbedding(cleanSearch);
      const docsWithEmbeddings = docs.filter(d => d.embedding?.length);

      // 🔍 Debug similarity scores
      const raw = docsWithEmbeddings.map(d => ({
        title: d.title,
        score: cosineSimilarity(queryEmbedding, d.embedding)
      }));
      console.log("🔍 Raw scores:", raw);

      const results = retrieveTopK(docsWithEmbeddings, queryEmbedding, 10);

      console.log("✅ Returning", results.length, "results for:", cleanSearch);

      // Strip embeddings but keep all other fields including filename
      const cleaned = results.map(d => {
        const obj = d.toObject ? d.toObject() : { ...d };
        delete obj.embedding;
        delete obj.embeddingText;
        return obj;
      });
      return res.json(cleaned);
    }

    // ── Normal listing (no search) ────────────────────────────────────
    docs = docs
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((d) => {
        const obj = d.toObject();
        delete obj.embedding;
        delete obj.embeddingText;
        return obj;
      });

    res.json(docs);

  } catch (err) {
    console.error("Fetch/search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

// GET /api/documents/graph-edges
router.get("/graph-edges", protect, async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold) || 0.65;
    const docs = await Document.find({ user: req.user._id })
      .select("_id title embedding"); // only fetch what we need

    const edges = [];
    for (let i = 0; i < docs.length; i++) {
      for (let j = i + 1; j < docs.length; j++) {
        const a = docs[i];
        const b = docs[j];
        if (!a.embedding?.length || !b.embedding?.length) continue;
        if (a.embedding.length !== b.embedding.length) continue;

        const score = cosineSimilarity(a.embedding, b.embedding);
        if (score >= threshold) {
          edges.push({
            from:  a._id,
            to:    b._id,
            score: parseFloat(score.toFixed(4)),
          });
        }
      }
    }

    // Sort strongest first
    edges.sort((a, b) => b.score - a.score);
    res.json({ edges, count: edges.length });
  } catch (err) {
    console.error("Graph edges error:", err);
    res.status(500).json({ message: "Failed to compute graph edges" });
  }
});


// GET /api/documents/stats
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, pdf, image, audio, video] = await Promise.all([
      Document.countDocuments({ user: userId }),
      Document.countDocuments({ user: userId, type: "pdf"   }),
      Document.countDocuments({ user: userId, type: "image" }),
      Document.countDocuments({ user: userId, type: "audio" }),
      Document.countDocuments({ user: userId, type: "video" }),
    ]);
    res.json({ total, pdf, image, audio, video });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to get stats" });
  }
});

// POST /api/documents/auto-organize
router.post("/auto-organize", protect, async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold) || 0.65;

    const docs = await Document.find({
      user: req.user._id,
      $expr: { $gt: [{ $size: "$embedding" }, 0] }
    });

    if (docs.length < 2) {
      return res.json({ folders: [], message: "Need at least 2 documents with embeddings" });
    }


    // Build adjacency: docId → Set of docIds it's similar to above threshold
    const adjacency = new Map();
    docs.forEach(d => adjacency.set(d._id.toString(), new Set()));

    for (let i = 0; i < docs.length; i++) {
      for (let j = i + 1; j < docs.length; j++) {
        const a = docs[i], b = docs[j];
        if (!a.embedding?.length || !b.embedding?.length) continue;
        if (a.embedding.length !== b.embedding.length) continue;

        const score = cosineSimilarity(a.embedding, b.embedding);
        if (score >= threshold) {
          adjacency.get(a._id.toString()).add(b._id.toString());
          adjacency.get(b._id.toString()).add(a._id.toString());
        }
      }
    }

    // Union-Find: group connected docs into clusters
    const parent = new Map();
    docs.forEach(d => parent.set(d._id.toString(), d._id.toString()));

    const find = (x) => {
      if (parent.get(x) !== x) parent.set(x, find(parent.get(x)));
      return parent.get(x);
    };
    const union = (x, y) => parent.set(find(x), find(y));

    for (const [id, neighbors] of adjacency.entries()) {
      for (const nid of neighbors) union(id, nid);
    }

    // Group docs by root
    const clusters = new Map();
    docs.forEach(d => {
      const root = find(d._id.toString());
      if (!clusters.has(root)) clusters.set(root, []);
      clusters.get(root).push(d);
    });

    // Name each cluster using Gemini
    const nameClusterWithGemini = async (clusterDocs) => {
      try {
        const lines = clusterDocs.map(d =>
          `- "${d.title}" | keywords: ${(d.keywords || []).slice(0, 6).join(", ")} | summary: ${(d.summary || "").slice(0, 120)}`
        ).join("\n");

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{
            role: "user",
            parts: [{
              text: `You are organizing files into a folder. Look at these documents and give the folder a short, specific name (2-4 words max) that captures what they are ALL about — prefer the language or technology name if all files share one (e.g. "Java OOP", "Python ML", "C++ STL"), otherwise use the topic.

Documents:
${lines}

Respond with ONLY the folder name. No quotes, no explanation, no punctuation at the end.`
            }]
          }]
        });

        const name = (response.text || "").trim().replace(/^["']|["']$/g, "");
        return name || "General";
      } catch (e) {
        console.error("Gemini folder naming failed, falling back to embedding centroid:", e.message);

        // ── Embedding centroid fallback ───────────────────────────────────────
        // 1. Compute centroid = average of all embeddings in cluster
        const dim = clusterDocs[0].embedding.length;
        const centroid = new Array(dim).fill(0);
        clusterDocs.forEach(d => d.embedding.forEach((v, i) => { centroid[i] += v; }));
        centroid.forEach((_, i) => { centroid[i] /= clusterDocs.length; });

        // 2. Find doc closest to centroid by cosine similarity
        let bestDoc = clusterDocs[0], bestSim = -Infinity;
        clusterDocs.forEach(d => {
          const sim = cosineSimilarity(d.embedding, centroid);
          if (sim > bestSim) { bestSim = sim; bestDoc = d; }
        });

        // 3. Use that doc's most distinctive keyword as folder name
        //    (prefer longer, more specific keywords over generic ones)
        const stopwords = new Set(["the","and","for","with","from","this","that","are","was","has","have","been","its","into","than","more","also","can","will","which","when","they","their","these","some","each","most","over","such","used","use","using","based","type","types","data","file","note","notes","chapter","section","part","unit","module"]);
        const keywords = (bestDoc.keywords || [])
          .map(k => k.toLowerCase().trim())
          .filter(k => k.length > 3 && !stopwords.has(k))
          .sort((a, b) => b.length - a.length); // prefer specific terms

        if (keywords.length) {
          const name = keywords[0];
          return name.charAt(0).toUpperCase() + name.slice(1);
        }

        // Last resort: use the representative doc's title (trimmed)
        const title = bestDoc.title.replace(/chapter\s*\d+|unit\s*\d+|\(\w+\)/gi, "").trim();
        return title.slice(0, 30) || "General";
      }
    };

    const COLORS = ["#7c5cbf","#e05cb5","#34d399","#f59e0b","#38bdf8","#f87171","#a78bfa","#fb923c"];
    const folderList = [];
    let colorIdx = 0;

    // Separate isolated docs (no connections above threshold) into "Unsorted"
    const unsorted = [];

    for (const [, clusterDocs] of clusters.entries()) {
      if (clusterDocs.length === 1) {
        // Single isolated doc — check if it has ANY neighbor at all
        const id = clusterDocs[0]._id.toString();
        if (adjacency.get(id).size === 0) {
          unsorted.push(clusterDocs[0]);
          continue;
        }
      }
      const folderName = await nameClusterWithGemini(clusterDocs);
      folderList.push({
        name:    folderName,
        color:   COLORS[colorIdx++ % COLORS.length],
        docIds:  clusterDocs.map(d => d._id.toString()),
        docCount: clusterDocs.length,
      });
    }

    // Merge folders with same name
    const merged = {};
    folderList.forEach(f => {
      if (!merged[f.name]) {
        merged[f.name] = { ...f };
      } else {
        merged[f.name].docIds  = [...new Set([...merged[f.name].docIds, ...f.docIds])];
        merged[f.name].docCount = merged[f.name].docIds.length;
      }
    });

    if (unsorted.length) {
      merged["Unsorted"] = {
        name:     "Unsorted",
        color:    "#94a3b8",
        docIds:   unsorted.map(d => d._id.toString()),
        docCount: unsorted.length,
      };
    }

    // Save subject back to each doc
    for (const folder of Object.values(merged)) {
      await Document.updateMany(
        { _id: { $in: folder.docIds } },
        { $set: { subject: folder.name } }
      );
    }

    res.json({
      folders:   Object.values(merged),
      threshold,
      total:     docs.length,
      clusters:  clusters.size,
    });

  } catch (err) {
    console.error("Auto-organize error:", err);
    res.status(500).json({ message: "Auto-organize failed", error: err.message });
  }
});

// ─── GET /api/documents/folders ──────────────────────────────────────────────
// Returns current folder grouping based on subject field
router.get("/folders", protect, async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user._id })
      .select("_id title type subject summary createdAt fileSize filename keywords");

    const folderMap = {};
    const COLORS = ["#7c5cbf","#e05cb5","#34d399","#f59e0b","#38bdf8","#f87171","#a78bfa","#fb923c"];
    let colorIdx = 0;

    docs.forEach(doc => {
      const name = doc.subject || "Unsorted";
      if (!folderMap[name]) {
        folderMap[name] = {
          name,
          color: COLORS[colorIdx++ % COLORS.length],
          docs: [],
        };
      }
      folderMap[name].docs.push(doc);
    });

    res.json({ folders: Object.values(folderMap) });
  } catch (err) {
    res.status(500).json({ message: "Failed to get folders" });
  }
});


// ─── DELETE /api/documents/:id ────────────────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ message: "Document not found" });
    const fs = require("fs");
    if (doc.filepath && fs.existsSync(doc.filepath)) fs.unlinkSync(doc.filepath);
    await Document.deleteOne({ _id: doc._id });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;