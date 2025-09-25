# Personalized Treatment Planner - Frontend (React + Vite + TS)

Minimal, aesthetic UI to interact with the FastAPI backend:
- Create patients
- Generate clinical summaries (IBM Granite via backend)
- Generate treatment plans (AWS Bedrock via backend)
- Ask questions with RAG chat (Bedrock Knowledge Base via backend)

## Prerequisites
- Node.js 18+
- Backend running on `http://127.0.0.1:8000`

The dev server proxies `/api` to the backend, so no CORS config is needed during development.

## Setup (Windows PowerShell)
```powershell
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## Config
- Dev proxy: `/api -> http://127.0.0.1:8000`
- Backend endpoints used:
  - `POST /patients`
  - `POST /patients/{patient_id}/summarize`
  - `POST /patients/{patient_id}/plan`
  - `POST /chat`

## Building
```powershell
npm run build
npm run preview
```

## Notes
- For production deployments across domains, enable CORS on the FastAPI server or serve the frontend from the same origin (adjust proxy/baseURL accordingly).
- Patient schema in the UI matches backend `Patient` model (including `geneticMarkers`, `lifestyle`, and `currentMedications`).
