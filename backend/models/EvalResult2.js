const mongoose = require("mongoose");

const evalResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, default: "run" },
    results: [
      {
        query:  String,
        answer: String,
        retrievedDocs: { type: mongoose.Schema.Types.Mixed, default: [] },
        scores: {
          retrieval_accuracy: Number,
          answer_relevance:   Number,
          groundedness:       Number,
          completeness:       Number,
          overall:            Number,
          feedback:           String,
        },
      },
    ],
    avgScores: {
      retrieval_accuracy: Number,
      answer_relevance:   Number,
      groundedness:       Number,
      completeness:       Number,
      overall:            Number,
    },
    docCount: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("EvalResult", evalResultSchema);