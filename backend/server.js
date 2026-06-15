const express = require("express");
// Clear all mongoose model cache on startup
const mongoose = require('mongoose');
Object.keys(mongoose.models).forEach(key => {
  delete mongoose.models[key];
});
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/documents", require("./routes/documents"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/insights", require("./routes/Insights"));
app.use("/api/eval", require("./routes/Eval"));
app.use("/api/ml", require("./routes/ml"));

app.get("/", (req, res) =>
  res.json({ message: "🧠 Knowledge Vault API running" }),
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server on port ${process.env.PORT || 5000}`),
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });
