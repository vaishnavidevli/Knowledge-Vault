# Knowledge Vault

Knowledge Vault is an AI-powered personal knowledge management system that helps users store, organize, search, and interact with their documents using Artificial Intelligence.

It converts documents into an intelligent knowledge base by using LLMs, semantic embeddings, Retrieval-Augmented Generation (RAG), Knowledge Graphs, and Machine Learning.

## Features

- User authentication with JWT and bcrypt
- Upload and process multiple file types:
  - PDF
  - Images
  - Audio
  - Video

- AI-based document understanding:
  - Text extraction
  - OCR processing
  - Audio transcription
  - Video transcription
  - Automatic summaries
  - Keyword extraction

- AI Chat with documents using RAG:
  - Natural language queries
  - Context-aware answers
  - Source references
  - Conversation memory

- Knowledge Graph:
  - Connects related documents
  - Shows concept relationships
  - Interactive visualization

- Machine Learning Classification:
  - Logistic Regression
  - SVM
  - Naive Bayes
  - Random Forest

- AI Insights:
  - Detects common topics
  - Finds knowledge gaps
  - Suggests learning paths

- RAG Evaluation:
  - Retrieval accuracy
  - Answer relevance
  - Groundedness
  - Completeness


## Tech Stack

### Frontend
- React.js 18
- HTML/CSS
- JavaScript

### Backend
- Node.js
- Express.js
- MongoDB

### AI / ML
- Google Gemini API
- Gemini Embeddings
- OpenAI Whisper
- Tesseract OCR
- Scikit-learn
- Flask

### Tools
- pdf-parse
- ffmpeg
- JWT
- bcrypt


## Backend
- cd backend
- npm install
- npm start

## Frontend
- cd frontend
- npm install
- npm start

## ML Service
- cd ml-service
- pip install -r requirements.txt
- python app.py

## Environment Variables

- Create a .env file in backend:

- MONGO_URI=your_mongodb_url
- JWT_SECRET=your_secret
- GEMINI_API_KEY=your_key
- OPENAI_API_KEY=your_key



