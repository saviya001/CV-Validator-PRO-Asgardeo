# CV Validator PRO
### AI-Powered CV Analysis and Recruitment Support Platform

**Secured with WSO2 Asgardeo | Built with Next.js and FastAPI**

## About the Project

Recruiters often spend a considerable amount of time reviewing CVs, comparing candidates against job requirements, and identifying information that needs further verification.

I developed **CV Validator PRO** to explore how AI can make this process more efficient while keeping human judgment at the center of recruitment decisions.

The application allows recruiters to upload multiple CVs, evaluate their relevance to a job description, identify potential inconsistencies, and generate structured candidate reports and interview questions.

A major part of this project was integrating **WSO2 Asgardeo** to introduce secure user authentication and API access control. This allowed me to work with a real identity and access management platform and understand how authentication can be implemented across a modern full-stack application.

## Key Features

### Multi-CV Analysis

Recruiters can upload multiple PDF CVs and compare candidates against a provided job description.

The analysis includes candidate matching scores, explanations of the results, identification of missing skills, and support for additional recruitment requirements.

### AI-Assisted Candidate Reports

The application generates structured reports containing information such as work experience, education, technical skills, certifications, and areas that may require clarification.

These reports are intended to support recruiters, rather than make final hiring decisions automatically.

### CV Consistency Checks

The system examines extracted CV information to flag possible inconsistencies, including gaps or overlaps in employment history and claims that may warrant further review.

A flagged issue is not treated as proof that a candidate has provided false information.

### Interview Question Generation

Based on the candidate's CV and the job description, the application can generate relevant interview questions to help recruiters explore a candidate's experience and suitability.

### ATS and Job Description Analysis

The application provides CV structure feedback and estimates how closely a candidate's profile aligns with the position's requirements.

### PDF Processing

CV information is extracted from PDF documents, with text extraction and OCR-related processing used to support different document formats.

## WSO2 Asgardeo Integration

One of my main objectives was to secure the application using a proper identity and access management solution.

For this, I integrated **WSO2 Asgardeo** with the Next.js frontend and FastAPI backend.

The integration includes:

- User authentication through Asgardeo, including configured sign-in methods
- Session handling within the Next.js application
- Server-side access token handling through a Next.js API proxy
- JWT validation in FastAPI using Asgardeo's public signing keys
- Token issuer, audience, expiration, and signature validation
- Scope-based authorization using `cv:use`
- Protected API endpoints for CV analysis, report generation, and interview question generation

### Authentication Flow

```text
User
  |
  v
Next.js Frontend
  |
  v
WSO2 Asgardeo Login
  |
  v
Authenticated Session
  |
  v
Next.js API Proxy
  |
  | Access Token
  v
FastAPI Backend
  |
  | JWT and Scope Validation
  v
CV Analysis Services
  |
  v
Response to Frontend
```

Instead of directly exposing the access token through application code running in the browser, the frontend communicates with a Next.js server-side API route.

This route obtains the authenticated user's access token and forwards requests to the protected FastAPI endpoints.

The backend independently validates the token before allowing access to the requested operation.

### Protected API Endpoints

| Endpoint | Purpose |
|---|---|
| `POST /analyze-multiple` | Analyze uploaded CVs against job requirements |
| `POST /get-quiz` | Generate interview questions |
| `POST /generate-report` | Generate a detailed candidate report |

All three endpoints require a valid Asgardeo access token with the configured authorization scope.

### Authentication Tests

During development, I tested the authentication and access-control flow using browser requests and command-line HTTP requests.

The completed checks included:

| Test Case | Observed Result |
|---|---|
| Request without an access token | `401 Unauthorized` |
| Request with a malformed token | `401 Unauthorized` |
| Unauthenticated request through the Next.js API proxy | `401 Unauthorized` |
| Unsupported API operation | `404 Not Found` |
| Authenticated request with missing required form fields | `422 Unprocessable Entity` |

These tests verify important parts of the authentication flow. They do not represent a complete security audit.

Additional work, including request-size controls, rate limiting, production deployment configuration, and data access isolation, is planned before handling live recruitment data.

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Python, FastAPI |
| Identity & Access Management | WSO2 Asgardeo |
| AI Processing | Google Gemini |
| Database | PostgreSQL |
| Database and File Storage | Supabase |
| PDF Processing | PDF extraction and OCR tooling |
| Containerization | Docker |
| Version Control | Git and GitHub |

## Project Structure

```text
CV-Validator-PRO-WSO2-Asgardeo/
|
|-- backend/
|   |-- main.py
|   |-- auth.py
|   |-- ai_logic.py
|   |-- database.py
|   |-- models.py
|   |-- storage_utils.py
|   |-- supabase_client.py
|   |-- requirements.txt
|
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |   |-- page.tsx
|   |   |   |-- analysis/
|   |   |   |-- interview/
|   |   |   |-- api/cv/
|   |   |-- components/
|   |-- package.json
|
|-- docker-compose.yml
|-- .gitignore
|-- Readme.md
```

## Running the Project Locally

This project currently runs in a local development environment. It requires a configured Asgardeo application, access to the required external services, and valid environment variables.

### Prerequisites

- Python
- Node.js and npm
- Git
- WSO2 Asgardeo application configuration
- PostgreSQL/Supabase configuration
- Gemini API credentials
- Required PDF processing tools

### Backend Setup

From the project root, create and activate a Python virtual environment, then install the backend dependencies.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1

cd backend
pip install -r requirements.txt
```

Configure the backend environment variables for the database, AI services, Supabase, and Asgardeo authentication.

Start the backend:

```powershell
python -m uvicorn main:app --reload --env-file .env --host 127.0.0.1 --port 8000
```

### Frontend Setup

Open a separate terminal:

```powershell
cd frontend
npm install
```

Configure the frontend environment variables required for the Asgardeo integration and the internal FastAPI connection.

Start the frontend:

```powershell
npm run dev
```

Open:

`http://localhost:3000`

**Note:** The application will not work with placeholder credentials. Environment variable names and redirect settings must match the locally configured Asgardeo application. Never commit real API keys, database credentials, session secrets, or access tokens.

## Screenshots and Demonstration

The project demonstration is intended to cover the following workflow:

1. Signing in using WSO2 Asgardeo
2. Accessing the authenticated CV Validator dashboard
3. Uploading CVs and providing a job description
4. Reviewing candidate analysis results
5. Generating candidate reports and interview questions
6. Demonstrating protected API responses

Screenshots and a short walkthrough video will be added to the project documentation.

Only synthetic or explicitly authorized sample CVs should be used for demonstrations.

## What I Learned

Working on this project helped me understand that building an AI application involves more than connecting a model to a user interface.

I gained hands-on experience in connecting a Next.js frontend to a Python backend, handling document-processing workflows, designing structured AI responses, and managing application data.

Integrating WSO2 Asgardeo introduced another important part of application development: protecting access to services and user data.

In particular, I learned how OAuth-based authentication, JWT validation, authorization scopes, and server-side API communication fit together in a full-stack application.

The project also helped me identify areas that need further improvement, especially around sensitive data handling, access isolation, operational security, and reliable AI responses.

## Limitations and Future Improvements

CV Validator PRO is a development-stage project and is not presented as a production-ready recruitment verification service.

AI-generated scores and warnings are advisory. They are not evidence of dishonesty, proof of qualifications, or a substitute for independent reference checks and human assessment.

Future improvements include stronger document validation, better handling of AI service failures, per-user data isolation, security hardening, improved evaluation using representative CV datasets, and privacy-conscious data retention controls.

## Why I Built This Project

I built CV Validator PRO because I wanted to work on a practical problem that combines AI, backend engineering, and real-world application development.

Integrating WSO2 Asgardeo gave me an opportunity to learn how a dedicated identity platform can secure an application instead of relying entirely on custom authentication logic.

This project reflects my interest in learning new technologies by building and testing working solutions.

## Author

**Savindu Wijesinghe**

GitHub: [saviya001](https://github.com/saviya001)

**Project Repository:** [CV-Validator-PRO-WSO2-Asgardeo](https://github.com/saviya001/CV-Validator-PRO-WSO2-Asgardeo)

---

