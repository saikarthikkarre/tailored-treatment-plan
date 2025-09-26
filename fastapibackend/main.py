import os
import boto3
import json
import requests
import datetime
from decimal import Decimal
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from dotenv import load_dotenv
import uvicorn

# --- Configuration ---
load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
DYNAMODB_TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME")
BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID")
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")

# --- IBM Configuration ---
IBM_API_KEY = os.getenv("IBM_API_KEY")
IBM_API_URL = os.getenv("IBM_API_URL")
IBM_MODEL_ID = "ibm/granite-13b-instruct-v2"
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")

# --- Helper Class for Decimal to JSON conversion ---
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return int(o) if o % 1 == 0 else float(o)
        return super(DecimalEncoder, self).default(o)

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Personalized Treatment Planner API",
    description="API for ingesting data, generating plans, summaries, and providing RAG-based chat.",
    version="2.1.0" # Two-Step RAG Fix
)

# --- Pydantic Data Models ---
class Medication(BaseModel):
    name: str
    dosage: str
    adherence: str

class Patient(BaseModel):
    patientId: str
    age: int
    gender: str
    primaryCondition: str
    comorbidities: List[str]
    geneticMarkers: Dict[str, Any]
    lifestyle: Dict[str, Any]
    currentMedications: List[Medication]

class ChatQuery(BaseModel):
    question: str = Field(..., example="What are the side effects of Lisinopril?")

# --- AWS Service Connections ---
aws_session = boto3.Session(
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)
dynamodb = aws_session.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

bedrock_agent_runtime = boto3.client(
    "bedrock-agent-runtime",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION,
)


# --- Helper function for IBM watsonx.ai Authentication ---
def get_ibm_iam_token():
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = f"apikey={IBM_API_KEY}&grant_type=urn:ibm:params:oauth:grant-type:apikey"
    try:
        response = requests.post("https://iam.cloud.ibm.com/identity/token", headers=headers, data=data)
        response.raise_for_status()
        return response.json()["access_token"]
    except Exception as e:
        print(f"Error getting IBM IAM token: {e}")
        return None

# --- API Endpoints ---
@app.get("/", summary="Root Endpoint", include_in_schema=False)
async def read_root():
    return {"status": "API is running"}

@app.post("/patients", status_code=status.HTTP_201_CREATED, summary="Ingest Patient Data")
async def ingest_patient_data(patient: Patient):
    try:
        table.put_item(Item=patient.dict())
        return {"message": "Patient data stored successfully!", "patientId": patient.patientId}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DynamoDB Error: {str(e)}")

@app.get("/patients/{patient_id}", summary="Get Patient Data")
async def get_patient_data(patient_id: str):
    try:
        response = table.get_item(Key={'patientId': patient_id})
        patient_data = response.get('Item')
        if not patient_data:
            raise HTTPException(status_code=404, detail="Patient not found")
        return patient_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DynamoDB Error: {str(e)}")

@app.post("/patients/{patient_id}/summarize", summary="Generate Summary with IBM Granite")
async def generate_summary(patient_id: str):
    try:
        response = table.get_item(Key={'patientId': patient_id})
        patient_data = response.get('Item')
        if not patient_data:
            raise HTTPException(status_code=404, detail="Patient not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DynamoDB Error: {str(e)}")

    primary_condition = patient_data.get("primaryCondition", "the disease")
    prompt_text = f"""Human: You are an expert AI medical assistant that ALWAYS responds in a specific JSON format. Your task is to analyze the following patient data and provide a concise clinical summary and a list of possible similar symptoms for the patient's primary condition ({primary_condition}).

Patient Data:
{json.dumps(patient_data, indent=2, cls=DecimalEncoder)}

IMPORTANT: Your entire response MUST be a single, valid JSON object, with no text or explanations before or after it. Use this exact format:
{{
  "summary": "A concise, well-written clinical summary of the patient goes here.",
  "similarSymptoms": ["Symptom 1", "Symptom 2", "Symptom 3"]
}}

Assistant:
"""

    try:
        iam_token = get_ibm_iam_token()
        if not iam_token:
            raise HTTPException(status_code=500, detail="Could not authenticate with IBM Cloud.")

        headers = {"Authorization": f"Bearer {iam_token}", "Content-Type": "application/json", "Accept": "application/json"}
        payload = {
            "model_id": IBM_MODEL_ID,
            "input": prompt_text,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 350,
                "repetition_penalty": 1.1
            },
            "project_id": WATSONX_PROJECT_ID
        }
        
        api_version = datetime.date.today().strftime("%Y-%m-%d")
        full_url = f"{IBM_API_URL}?version={api_version}"
        
        response = requests.post(full_url, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        generated_text = result['results'][0]['generated_text'].strip()
        
        json_start = generated_text.find('{')
        json_end = generated_text.rfind('}') + 1
        if json_start == -1 or json_end == 0:
            raise HTTPException(status_code=500, detail=f"Model returned a non-JSON response: {generated_text}")
        
        summary_data_str = generated_text[json_start:json_end]
        summary_data = json.loads(summary_data_str)

        table.update_item(
            Key={'patientId': patient_id},
            UpdateExpression="SET summary = :s, similarSymptoms = :sym",
            ExpressionAttributeValues={':s': summary_data.get('summary'), ':sym': summary_data.get('similarSymptoms')}
        )
        return {"message": f"Summary generated and stored for patient {patient_id}.", "data": summary_data}
        
    except requests.exceptions.HTTPError as e:
        error_detail = e.response.json() if e.response.text else "No further details."
        raise HTTPException(status_code=e.response.status_code, detail=f"IBM watsonx.ai API Error: {error_detail}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/patients/{patient_id}/plan", summary="Get Existing Treatment Plan")
async def get_plan(patient_id: str):
    try:
        response = table.get_item(Key={'patientId': patient_id})
        patient_data = response.get('Item')
        if not patient_data:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Return 200 with an empty plan if not present so clients can decide to generate
        if 'treatmentPlan' in patient_data and patient_data['treatmentPlan']:
            return {"plan": patient_data['treatmentPlan']}
        return {"plan": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DynamoDB Error: {str(e)}")






@app.post("/patients/{patient_id}/plan", summary="Generate Treatment Plan with AWS Bedrock")
async def generate_plan(patient_id: str):
    try:
        response = table.get_item(Key={'patientId': patient_id})
        patient_data = response.get('Item')
        if not patient_data:
            raise HTTPException(status_code=404, detail="Patient not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DynamoDB Error: {str(e)}")

    # --- STEP 1: RETRIEVE CONTEXT FROM KNOWLEDGE BASE (NEW) ---
    try:
        retrieval_query = (
            f"Treatment guidelines and risk factors for cataracts, "
            f"especially concerning young patients and smokers."
        )
        
        retrieval_response = bedrock_agent_runtime.retrieve(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            retrievalQuery={'text': retrieval_query},
            retrievalConfiguration={
                'vectorSearchConfiguration': {'numberOfResults': 3}
            }
        )
        retrieved_chunks = retrieval_response.get('retrievalResults', [])
        
        context = ""
        for chunk in retrieved_chunks:
            context += chunk['content']['text'] + "\n---\n"
            
    except Exception as e:
        # If retrieval fails, you can proceed without context or raise an error
        print(f"Warning: Knowledge Base retrieval failed: {e}")
        context = "No specific clinical guidelines were available."


    # --- STEP 2: GENERATE PLAN USING THE IMPROVED PROMPT + CONTEXT ---
    prompt = f"""
You are an expert AI medical assistant specializing in ophthalmology. Your task is to create a personalized and clinically relevant treatment plan.
First, review the established clinical guidelines provided. Then, analyze the patient's data to generate three distinct recommendations.

**Clinical Guidelines Context:**
{context}

**Analysis Task:**
Analyze the provided patient data carefully. The patient is a {patient_data.get('age')}-year-old {patient_data.get('gender')} diagnosed with a {patient_data.get('primaryCondition')}. Pay close attention to their lifestyle factors, such as daily smoking.

**Patient Data:**
{json.dumps(patient_data, indent=2, cls=DecimalEncoder)}

**Instructions & Constraints:**
1.  Base your recommendations on the provided Clinical Guidelines Context and the patient's specific data.
2.  Provide a balanced plan covering surgical options, lifestyle modifications, and monitoring.
3.  Justifications must explain *why* a recommendation is appropriate for this patient.
4.  Your entire output MUST be a single, valid JSON object, with no text before or after it.

**JSON Response:**
"""
    
    try:
        body = json.dumps({
            "inputText": prompt,
            "textGenerationConfig": {
                "maxTokenCount": 2048,
                "temperature": 0.2, # Slightly higher temp for more nuanced language
                "topP": 0.9
            }
        })

        response = bedrock_runtime.invoke_model(
            body=body, modelId=BEDROCK_MODEL_ID, accept='application/json', contentType='application/json'
        )
        # ... (rest of your JSON parsing logic remains the same) ...
        response_body = json.loads(response.get('body').read())
        plan_text = response_body.get('results')[0]['outputText'].strip()

        # Extract JSON more robustly: handle either a JSON object with a "plan" field
        # or a raw JSON array of recommendations.
        plan_data: dict
        parsed_any = False

        # 1) Try to parse the entire string as JSON directly
        try:
            direct = json.loads(plan_text)
            if isinstance(direct, dict) and 'plan' in direct:
                plan_data = direct
            elif isinstance(direct, list):
                plan_data = { 'plan': direct }
            else:
                plan_data = { 'plan': direct.get('plan', []) } if isinstance(direct, dict) else { 'plan': [] }
            parsed_any = True
        except Exception:
            parsed_any = False

        if not parsed_any:
            # 2) Look for a JSON array and parse it
            arr_start = plan_text.find('[')
            arr_end = plan_text.rfind(']') + 1
            if arr_start != -1 and arr_end > arr_start:
                try:
                    arr = json.loads(plan_text[arr_start:arr_end])
                    if isinstance(arr, list):
                        plan_data = { 'plan': arr }
                        parsed_any = True
                except Exception:
                    parsed_any = False

        if not parsed_any:
            # 3) Fallback: extract the first JSON object and wrap into plan if it's a single recommendation
            json_start = plan_text.find('{')
            json_end = plan_text.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                try:
                    obj = json.loads(plan_text[json_start:json_end])
                    if isinstance(obj, dict) and ('recommendation' in obj or 'justification' in obj):
                        plan_data = { 'plan': [obj] }
                        parsed_any = True
                    elif isinstance(obj, dict) and 'plan' in obj:
                        plan_data = obj
                        parsed_any = True
                except Exception:
                    parsed_any = False

        if not parsed_any:
            raise HTTPException(status_code=500, detail=f"JSON parsing failed: Could not extract a valid plan. Response: {plan_text[:200]}...")
        
        table.update_item(
            Key={'patientId': patient_id},
            UpdateExpression="SET treatmentPlan = :p",
            ExpressionAttributeValues={':p': plan_data.get('plan')}
        )
        return plan_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bedrock Error: {str(e)}")



        

# --- RAG CHATBOT ENDPOINT (REWRITTEN FOR ROBUSTNESS) ---
@app.post("/chat", summary="Chat with RAG Knowledge Base")
async def chat_with_knowledge_base(query: ChatQuery):
    if not KNOWLEDGE_BASE_ID or not BEDROCK_MODEL_ID:
        raise HTTPException(status_code=500, detail="Knowledge Base or Bedrock Model ID is not configured.")

    try:
        # Step 1: Retrieve relevant document chunks
        retrieval_response = bedrock_agent_runtime.retrieve(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            retrievalQuery={'text': query.question},
            retrievalConfiguration={'vectorSearchConfiguration': {'numberOfResults': 3}}
        )

        retrieved_chunks = retrieval_response.get('retrievalResults', [])
        if not retrieved_chunks:
            return {"answer": "I could not find relevant information.", "sources": []}

        # Step 2: Generate answer
        context = ""
        sources = []
        for chunk in retrieved_chunks:
            context += chunk['content']['text'] + "\n"
            source_uri = chunk.get('location', {}).get('s3Location', {}).get('uri')
            if source_uri:
                sources.append(source_uri)

        generation_prompt = f"""Human: You are a helpful medical chatbot. Using ONLY the following context, answer the user's question.

Context:
{context}

User Question: {query.question}

Assistant:
"""
        body = json.dumps({
            "inputText": generation_prompt,
            "textGenerationConfig": {"maxTokenCount":1024,"temperature":0.1,"topP":0.9}
        })

        generation_response = bedrock_runtime.invoke_model(
            body=body, modelId=BEDROCK_MODEL_ID, accept='application/json', contentType='application/json'
        )

        response_body = json.loads(generation_response.get('body').read())
        answer = response_body.get('results')[0].get('outputText').strip()

        return {"answer": answer, "sources": list(set(sources))}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG Chatbot Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

