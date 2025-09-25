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
    description="API for ingesting data, generating summaries with IBM, and plans with AWS.",
    version="1.5.5" # Final working version
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

@app.post("/patients/{patient_id}/plan", summary="Generate Treatment Plan with AWS Bedrock")
async def generate_plan(patient_id: str):
    try:
        response = table.get_item(Key={'patientId': patient_id})
        patient_data = response.get('Item')
        if not patient_data:
            raise HTTPException(status_code=404, detail="Patient not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DynamoDB Error: {str(e)}")

    prompt = f"""Task: Analyze the following patient data and generate exactly three treatment recommendations.
Constraint: Your entire output must be a single, valid JSON object. Do not include any text, conversation, or explanation before or after the JSON object.

Patient Data:
{json.dumps(patient_data, indent=2, cls=DecimalEncoder)}

Required JSON Format:
{{
  "plan": [
    {{
      "recommendation": "First treatment recommendation.",
      "justification": "Justification for the first recommendation."
    }},
    {{
      "recommendation": "Second treatment recommendation.",
      "justification": "Justification for the second recommendation."
    }},
    {{
      "recommendation": "Third treatment recommendation.",
      "justification": "Justification for the third recommendation."
    }}
  ]
}}

JSON Response:
"""
    
    try:
        body = json.dumps({
            "inputText": prompt,
            "textGenerationConfig": {
                "maxTokenCount": 2048,
                "temperature": 0.1,  # Lower temperature for more deterministic output
                "topP": 0.9
            }
        })

        response = bedrock_runtime.invoke_model(
            body=body, modelId=BEDROCK_MODEL_ID, accept='application/json', contentType='application/json'
        )
        response_body = json.loads(response.get('body').read())
        plan_text = response_body.get('results')[0].get('outputText').strip()
        
        json_start = plan_text.find('{')
        json_end = plan_text.rfind('}') + 1
        if json_start == -1 or json_end == 0:
             raise HTTPException(status_code=500, detail=f"Failed to parse valid JSON from Bedrock response: {plan_text}")
        
        plan_json_str = plan_text[json_start:json_end]
        plan_data = json.loads(plan_json_str)
        
        table.update_item(
            Key={'patientId': patient_id},
            UpdateExpression="SET treatmentPlan = :p",
            ExpressionAttributeValues={':p': plan_data.get('plan')}
        )
        return plan_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bedrock Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

