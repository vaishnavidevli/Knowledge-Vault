"""
predict.py — Knowledge Vault ML Prediction Server
===================================================
Tiny Flask microservice that:
  - Loads the trained model on startup
  - POST /predict  → returns subject label + confidence
  - POST /predict-batch → bulk classify multiple texts
  - GET  /results  → return training results JSON
  - GET  /health   → liveness check

Run: python3 predict.py
Runs on: http://localhost:5001
"""

import os
import json
import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE   = os.path.join(SCRIPT_DIR, 'model.pkl')
RESULTS_FILE = os.path.join(SCRIPT_DIR, 'results.json')

# ─── Load model on startup ────────────────────────────────────────────────────
bundle     = None
model      = None
vectorizer = None
labels     = None

def load_model():
    global bundle, model, vectorizer, labels
    if not os.path.exists(MODEL_FILE):
        print(f"⚠️  model.pkl not found at {MODEL_FILE}")
        print("   Run: python3 train.py  first!")
        return False
    with open(MODEL_FILE, 'rb') as f:
        bundle = pickle.load(f)
    model      = bundle['model']
    vectorizer = bundle['vectorizer']
    labels     = bundle['labels']
    print(f"✅ Model loaded: {bundle['best_name']} | {len(labels)} subjects")
    return True

load_model()

# ─── GET /health ──────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status':     'ok',
        'model_loaded': model is not None,
        'model_name': bundle.get('best_name', 'unknown') if bundle else 'none',
        'subjects':   labels or [],
    })

# ─── POST /predict ────────────────────────────────────────────────────────────
# Body: { "text": "some document text here..." }
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Run train.py first.'}), 503

    data = request.get_json(silent=True) or {}
    text = data.get('text', '').strip()

    if not text:
        return jsonify({'error': 'text field is required'}), 400

    # Vectorise + predict
    vec   = vectorizer.transform([text])
    pred  = model.predict(vec)[0]

    # Get confidence scores if available (not all models have predict_proba)
    confidence_scores = {}
    try:
        probs = model.predict_proba(vec)[0]
        confidence_scores = {
            labels[i]: round(float(p) * 100, 1)
            for i, p in enumerate(probs)
        }
        # Sort by confidence descending
        confidence_scores = dict(
            sorted(confidence_scores.items(), key=lambda x: x[1], reverse=True)
        )
        top_confidence = confidence_scores.get(pred, 0)
    except AttributeError:
        # LinearSVC doesn't have predict_proba — use decision function
        try:
            decisions = model.decision_function(vec)[0]
            # Softmax-style normalisation for display
            exp_d   = np.exp(decisions - np.max(decisions))
            softmax = (exp_d / exp_d.sum() * 100).tolist()
            confidence_scores = {
                labels[i]: round(float(s), 1)
                for i, s in enumerate(softmax)
            }
            confidence_scores = dict(
                sorted(confidence_scores.items(), key=lambda x: x[1], reverse=True)
            )
            top_confidence = confidence_scores.get(pred, 0)
        except Exception:
            top_confidence = None

    return jsonify({
        'subject':    pred,
        'confidence': top_confidence,
        'all_scores': confidence_scores,
        'model_used': bundle.get('best_name', 'unknown'),
    })

# ─── POST /predict-batch ──────────────────────────────────────────────────────
# Body: { "texts": ["text1", "text2", ...] }
@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 503

    data  = request.get_json(silent=True) or {}
    texts = data.get('texts', [])
    if not texts:
        return jsonify({'error': 'texts array is required'}), 400

    vecs  = vectorizer.transform(texts)
    preds = model.predict(vecs)

    results = []
    for i, (text, pred) in enumerate(zip(texts, preds)):
        results.append({'index': i, 'subject': pred})

    return jsonify({'predictions': results, 'count': len(results)})

# ─── GET /results ─────────────────────────────────────────────────────────────
@app.route('/results', methods=['GET'])
def results():
    if not os.path.exists(RESULTS_FILE):
        return jsonify({'error': 'results.json not found. Run train.py first.'}), 404
    with open(RESULTS_FILE, 'r') as f:
        data = json.load(f)
    return jsonify(data)

# ─── POST /retrain ────────────────────────────────────────────────────────────
@app.route('/retrain', methods=['POST'])
def retrain():
    """Trigger retraining — runs train.py and reloads model"""
    import subprocess
    train_path = os.path.join(SCRIPT_DIR, 'train.py')
    try:
        result = subprocess.run(
            ['python3', train_path],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            load_model()
            return jsonify({'status': 'success', 'output': result.stdout[-1000:]})
        else:
            return jsonify({'status': 'error', 'output': result.stderr[-500:]}), 500
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    print("🚀 ML Prediction Server starting on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=False)