"""
train.py — Knowledge Vault ML Classifier
=========================================
Trains 4 classifiers on academic subject data:
  1. Logistic Regression
  2. Support Vector Machine (SVM)
  3. Naive Bayes
  4. Random Forest

Saves the best model + TF-IDF vectorizer as .pkl files.
Outputs a JSON results file for the frontend to display.

Run: python3 train.py
"""

import os
import json
import pickle
import warnings
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings('ignore')

# ─── Config ──────────────────────────────────────────────────────────────────
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_FILE    = os.path.join(SCRIPT_DIR, 'training_data.csv')
MODEL_FILE   = os.path.join(SCRIPT_DIR, 'model.pkl')
RESULTS_FILE = os.path.join(SCRIPT_DIR, 'results.json')

# Load data
print("📂 Loading training data...")
df = pd.read_csv(DATA_FILE)
df.columns = df.columns.str.strip()
df['text']    = df['text'].astype(str).str.strip()
df['subject'] = df['subject'].astype(str).str.strip()

print(f"   {len(df)} samples | {df['subject'].nunique()} subjects")
print(f"   Subjects: {sorted(df['subject'].unique())}")

X = df['text'].values
y = df['subject'].values

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"\n📊 Train: {len(X_train)} | Test: {len(X_test)}")

# TF-IDF Vectorizer
tfidf = TfidfVectorizer(
    ngram_range=(1, 2),   # unigrams + bigrams
    max_features=8000,
    sublinear_tf=True,    # log normalization
    strip_accents='unicode',
    analyzer='word',
    token_pattern=r'\b[a-zA-Z][a-zA-Z0-9]*\b',
    min_df=1,
)

X_train_vec = tfidf.fit_transform(X_train)
X_test_vec  = tfidf.transform(X_test)

# 4 Classifiers
classifiers = {
    'Logistic Regression': LogisticRegression(
        max_iter=1000, C=1.0, solver='lbfgs', multi_class='auto'
    ),
    'SVM (LinearSVC)': LinearSVC(
        C=1.0, max_iter=2000
    ),
    'Naive Bayes': MultinomialNB(
        alpha=0.05
    ),
    'Random Forest': RandomForestClassifier(
        n_estimators=300, max_depth=None, random_state=42, n_jobs=-1
    ),
}

# Train and evaluate each
print("\n  Training all classifiers...\n")

results     = []
best_model  = None
best_acc    = 0.0
best_name   = ''

for name, clf in classifiers.items():
    print(f"   Training {name}...")

    # Fit
    clf.fit(X_train_vec, y_train)

    # Test set metrics
    y_pred = clf.predict(X_test_vec)
    acc    = accuracy_score(y_test, y_pred)
    prec   = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec    = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1     = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    # 5-fold cross validation on full dataset for robust estimate
    X_full_vec = tfidf.transform(X)
    cv_scores  = cross_val_score(clf, X_full_vec, y, cv=5, scoring='accuracy')
    cv_mean    = float(cv_scores.mean())
    cv_std     = float(cv_scores.std())

    result = {
        'name':        name,
        'accuracy':    round(float(acc) * 100, 2),
        'precision':   round(float(prec) * 100, 2),
        'recall':      round(float(rec) * 100, 2),
        'f1_score':    round(float(f1) * 100, 2),
        'cv_mean':     round(cv_mean * 100, 2),
        'cv_std':      round(cv_std * 100, 2),
    }
    results.append(result)

    print(f"   ✅ {name}: acc={acc*100:.1f}%  F1={f1*100:.1f}%  CV={cv_mean*100:.1f}%±{cv_std*100:.1f}%")

    if acc > best_acc:
        best_acc   = acc
        best_model = clf
        best_name  = name

# Per-class breakdown for best model
y_pred_best = best_model.predict(tfidf.transform(X_test))
report_dict = classification_report(
    y_test, y_pred_best, output_dict=True, zero_division=0
)

per_class = []
for label in sorted(df['subject'].unique()):
    if label in report_dict:
        m = report_dict[label]
        per_class.append({
            'subject':   label,
            'precision': round(m['precision'] * 100, 1),
            'recall':    round(m['recall'] * 100, 1),
            'f1':        round(m['f1-score'] * 100, 1),
            'support':   int(m['support']),
        })

# Confusion matrix for best model
labels_sorted = sorted(df['subject'].unique())
cm = confusion_matrix(y_test, y_pred_best, labels=labels_sorted)

#  Save the best model + vectorizer as a single bundle
bundle = {
    'model':       best_model,
    'vectorizer':  tfidf,
    'labels':      sorted(df['subject'].unique()),
    'best_name':   best_name,
}
with open(MODEL_FILE, 'wb') as f:
    pickle.dump(bundle, f)
print(f"\n💾 Model saved → {MODEL_FILE}")

# Save results JSON for frontend
output = {
    'classifiers':   results,
    'best':          best_name,
    'best_accuracy': round(best_acc * 100, 2),
    'per_class':     per_class,
    'confusion_matrix': {
        'labels': labels_sorted,
        'matrix': cm.tolist(),
    },
    'subjects':      sorted(df['subject'].unique()),
    'train_size':    len(X_train),
    'test_size':     len(X_test),
    'features':      tfidf.max_features,
}

with open(RESULTS_FILE, 'w') as f:
    json.dump(output, f, indent=2)
print(f"📊 Results saved → {RESULTS_FILE}")

# ─── Print summary ────────────────────────────────────────────────────────────
print("\n" + "="*55)
print("🏆 FINAL RESULTS SUMMARY")
print("="*55)
print(f"{'Classifier':<25} {'Accuracy':>10} {'F1 Score':>10} {'CV Mean':>10}")
print("-"*55)
for r in sorted(results, key=lambda x: x['accuracy'], reverse=True):
    star = " ← BEST" if r['name'] == best_name else ""
    print(f"{r['name']:<25} {r['accuracy']:>9.1f}% {r['f1_score']:>9.1f}% {r['cv_mean']:>9.1f}%{star}")
print("="*55)
print(f"\n✅ Done! Best model: {best_name} ({best_acc*100:.1f}% accuracy)")