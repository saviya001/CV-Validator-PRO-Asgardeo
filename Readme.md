# Vision Front Insights – AI CV Verification System

## Overview

Vision Front Insights is an enterprise-grade AI-powered CV verification and candidate analysis system.
It enables HR teams to analyze candidate CVs, verify credentials, generate interview questions, and produce detailed intelligence reports using advanced AI models.

This system consists of two main components:

* Backend: FastAPI (Python)
* Frontend: Next.js (React)

---

# System Requirements

Please ensure the following software is installed before setup:

* Node.js (v18 or newer)
* Python (v3.10 or newer)
* Internet connection (required for AI and verification APIs)

---

# Project Structure

```
CV-Verification-Project/

backend/
    main.py
    ai_logic.py
    utils.py
    requirements.txt
    .env.example

frontend/
    package.json
    src/
    public/

README.md
LICENSE.txt
```

---

# Backend Installation

Step 1: Open terminal

Navigate to backend folder:

```
cd backend
```

Step 2: Create virtual environment

```
python -m venv .venv
```

Step 3: Activate virtual environment

Windows:

```
.venv\Scripts\activate
```

Mac/Linux:

```
source .venv/bin/activate
```

Step 4: Install dependencies

```
pip install -r requirements.txt
```

---

# Configure Environment Variables

Copy the example file:

```
.env.example
```

Rename it to:

```
.env
```

Then add your API keys:

```
GEMINI_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here
GOOGLE_CSE_ID=your_id_here
```

---

# Run Backend Server

```
uvicorn main:app --reload --port 8000
```

Backend will run at:

```
http://localhost:8000
```

Test API:

```
http://localhost:8000/docs
```

---

# Frontend Installation

Open new terminal.

Navigate to frontend folder:

```
cd frontend
```

Install dependencies:

```
npm install
```

Run frontend:

```
npm run dev
```

Frontend will run at:

```
http://localhost:3000
```

---

# How to Use the System

1. Open browser
2. Go to:

```
http://localhost:3000
```

3. Paste Job Description

4. Upload CV files (PDF)

5. Click:

Launch AI Verification

6. View results:

* Match score
* Candidate analysis
* Smart interview questions
* Full verification report

---

# Features

* AI-powered CV analysis
* Match scoring system
* Education verification
* Experience verification
* Certification verification
* Phone and email validation
* Interview question generation
* Professional dashboard

---

# API Endpoints

Backend provides the following endpoints:

Analyze CVs:

```
POST /analyze-multiple
```

Generate detailed report:

```
POST /generate-report
```

Generate interview questions:

```
POST /get-quiz
```

---

# Troubleshooting

If backend does not connect:

Ensure backend is running:

```
http://localhost:8000
```

If frontend shows connection error:

Restart backend server.

---

# License

This software is proprietary.

Unauthorized distribution is prohibited.

---

# Support

For installation or technical support, please contact the software provider.

---


