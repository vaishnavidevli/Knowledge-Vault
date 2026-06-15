const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title:    { type: String, required: true, trim: true },
    type:     { type: String, enum: ['pdf', 'image', 'audio', 'video'], required: true },
    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    content:  { type: String, default: '' },
    summary:  { type: String, default: '' },
    keywords: { type: [String], default: [] },
    fileSize: { type: Number, default: 0 },

    // Gemini text-embedding-004 produces 768-dim vectors
    embedding: {
      type: [Number],
      default: [],
    },
    embeddingText: {
      type: String,
      default: '',
    },

    // ML Classification
    subject: {
      type: String,
      default: '',  // e.g. 'OOP', 'Data Structures', 'Machine Learning'
    },
    subjectConfidence: {
      type: Number,
      default: null, // 0-100 confidence score from the ML classifier
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);