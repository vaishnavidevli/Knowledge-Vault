/**
 * ml.js — Node.js route that talks to the Python ML microservice
 *
 * All endpoints proxy to http://localhost:5001 (predict.py Flask server)
 * The frontend calls /api/ml/* and never needs to know about Python directly.
 */

const express = require('express');
const router  = express.Router();
const http    = require('http');
const { protect } = require('../middleware/auth');
const Document    = require('../models/Document');

const ML_HOST = process.env.ML_HOST || 'localhost';
const ML_PORT = process.env.ML_PORT || 5001;

// ─── Helper: call Python microservice ────────────────────────────────────────
function callML(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const data    = body ? JSON.stringify(body) : null;
    const options = {
      hostname: ML_HOST,
      port:     ML_PORT,
      path,
      method,
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': data ? Buffer.byteLength(data) : 0,
      },
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try   { resolve({ status: res.statusCode, data: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, data: { raw } }); }
      });
    });

    req.on('error', err => reject(err));
    if (data) req.write(data);
    req.end();
  });
}

// ─── GET /api/ml/health ───────────────────────────────────────────────────────
router.get('/health', async (req, res) => {
  try {
    const r = await callML('/health');
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(503).json({
      status: 'error',
      message: 'ML server not running. Start it with: cd ml && python3 predict.py',
    });
  }
});

// ─── GET /api/ml/results ──────────────────────────────────────────────────────
// Returns training results — accuracy, per-class metrics, confusion matrix
router.get('/results', async (req, res) => {
  try {
    const r = await callML('/results');
    res.status(r.status).json(r.data);
  } catch {
    res.status(503).json({ message: 'ML server not running' });
  }
});

// ─── POST /api/ml/predict ─────────────────────────────────────────────────────
// Body: { text: "..." }
// Returns: { subject, confidence, all_scores }
router.post('/predict', protect, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ message: 'text is required' });
  try {
    const r = await callML('/predict', 'POST', { text });
    res.status(r.status).json(r.data);
  } catch {
    res.status(503).json({ message: 'ML server not running. Run: cd ml && python3 predict.py' });
  }
});

// ─── POST /api/ml/classify-doc/:id ───────────────────────────────────────────
// Classifies an existing document and saves the subject to MongoDB
router.post('/classify-doc/:id', protect, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    // Build text for classification: title + keywords + content snippet
    const text = [
      doc.title,
      (doc.keywords || []).join(' '),
      (doc.content || '').substring(0, 1000),
    ].join(' ').trim();

    const r = await callML('/predict', 'POST', { text });

    if (r.status !== 200) {
      return res.status(r.status).json(r.data);
    }

    // Save predicted subject back to the document
    await Document.updateOne(
      { _id: doc._id },
      { subject: r.data.subject, subjectConfidence: r.data.confidence }
    );

    res.json({
      docId:      doc._id,
      title:      doc.title,
      subject:    r.data.subject,
      confidence: r.data.confidence,
      all_scores: r.data.all_scores,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/ml/classify-all ────────────────────────────────────────────────
// Classify all user documents and save subjects
router.post('/classify-all', protect, async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user._id })
      .select('title keywords content subject');

    const results = [];
    for (const doc of docs) {
      const text = [
        doc.title,
        (doc.keywords || []).join(' '),
        (doc.content || '').substring(0, 800),
      ].join(' ').trim();

      try {
        const r = await callML('/predict', 'POST', { text });
        if (r.status === 200) {
          await Document.updateOne(
            { _id: doc._id },
            { subject: r.data.subject, subjectConfidence: r.data.confidence }
          );
          results.push({ id: doc._id, title: doc.title, subject: r.data.subject, confidence: r.data.confidence });
        }
      } catch { /* skip failed docs */ }
    }

    res.json({ classified: results.length, total: docs.length, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/ml/retrain ─────────────────────────────────────────────────────
router.post('/retrain', protect, async (req, res) => {
  try {
    const r = await callML('/retrain', 'POST', {});
    res.status(r.status).json(r.data);
  } catch {
    res.status(503).json({ message: 'ML server not running' });
  }
});

module.exports = router;