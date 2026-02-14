# AI Document Analyzer

An AI-powered document analysis tool built with React, Node.js, and Google Gemini.

## Features

- **Multi-format Support**: Process PDFs (text & scanned), Images, DOCX, and Text files.
- **AI Summaries**: Get concise summaries, key topics, and insights powered by Gemini 1.5 Pro.
- **Contextual Chat**: Ask questions about your documents using RAG (Retrieval Augmented Generation) with Gemini 1.5 Flash.
- **OCR Integration**: Hybrid OCR using Tesseract.js (local) and Gemini Vision (fallback) for scanned docs.
- **Secure Auth**: JWT-based authentication for user accounts.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, React PDF Viewer
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **AI**: Google Gemini API (gemini-1.5-pro, gemini-1.5-flash)
- **Processing**: pdf-parse, mammoth, tesseract.js, multer

## Setup & Running

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (running locally or Atlas URI)
- Google Gemini API Key

### 2. Environment Setup

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/doc-analyzer
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Run the Application

You can run both servers concurrently:

**Backend (Terminal 1):**
```bash
cd server
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd client
npm run dev
```

Open your browser at `http://localhost:5173`.

## Usage Guide

1. **Register** a new account.
2. **Upload** a document (PDF, DOCX, Image, TXT).
3. Wait for the **Processing** status to change to **Ready**.
4. Click the document to view the **AI Analysis** and **Chat** with it.
