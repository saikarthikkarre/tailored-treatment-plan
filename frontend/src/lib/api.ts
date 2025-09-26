import axios from 'axios'
import { load_dotenv } from 'dotenv'
load_dotenv()


export type Medication = {
  name: string
  dosage: string
  adherence: string
}

export type Patient = {
  patientId: string
  age: number
  gender: string
  primaryCondition: string
  comorbidities: string[]
  geneticMarkers: Record<string, unknown>
  lifestyle: Record<string, unknown>
  currentMedications: Medication[]
}

export type SummaryResponse = {
  message: string
  data: {
    summary: string
    similarSymptoms: string[]
  }
}

export type PlanItem = { recommendation: string; justification: string }
export type PlanResponse = { plan: PlanItem[] }

export type ChatQuery = { question: string }
export type ChatResponse = { answer: string; sources: string[] }

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://tailored-treatment-plan.onrender.com',
})

export async function createPatient(patient: Patient) {
  const { data } = await api.post<{ message: string; patientId: string }>(`/patients`, patient)
  return data
}

export async function getPatient(patientId: string) {
  const { data } = await api.get(`/patients/${encodeURIComponent(patientId)}`)
  return data
}

export async function summarizePatient(patientId: string) {
  const { data } = await api.post<SummaryResponse>(`/patients/${encodeURIComponent(patientId)}/summarize`)
  return data
}

export async function getPlan(patientId: string) {
  const { data } = await api.get<PlanResponse>(`/patients/${encodeURIComponent(patientId)}/plan`)
  return data
}

export async function generatePlan(patientId: string) {
  const { data } = await api.post<PlanResponse>(`/patients/${encodeURIComponent(patientId)}/plan`)
  return data
}

export async function chat(query: ChatQuery) {
  const { data } = await api.post<ChatResponse>(`/chat`, query)
  return data
}


