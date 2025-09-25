import requests
import json
import sys

# --- Configuration ---
API_URL = "http://127.0.0.1:8000/patients"

# --- Patient Data (Embedded directly in the script) ---
PATIENTS_DATA = [
  {
    "patientId": "P-Cardio-01",
    "age": 62,
    "gender": "Male",
    "primaryCondition": "Atrial Fribrillation",
    "comorbidities": [
      "Hypertension",
      "Sleep Apnea"
    ],
    "geneticMarkers": {
      "VKORC1": "High Sensitivity",
      "CYP2C9": "Intermediate Metabolizer"
    },
    "lifestyle": {
      "diet": "High-sodium, frequent alcohol consumption",
      "exercise": "Occasional walking",
      "stressLevel": "High",
      "smoker": False
    },
    "currentMedications": [
      {
        "name": "Lisinopril",
        "dosage": "20mg daily",
        "adherence": "Good"
      },
      {
        "name": "Metoprolol",
        "dosage": "50mg twice daily",
        "adherence": "Good"
      }
    ]
  },
  {
    "patientId": "P-Autoimmune-02",
    "age": 28,
    "gender": "Female",
    "primaryCondition": "Crohn's Disease",
    "comorbidities": [
      "Anemia",
      "Anxiety"
    ],
    "geneticMarkers": {
      "NOD2": "Risk Variant Present",
      "ATG16L1": "Risk Variant Present"
    },
    "lifestyle": {
      "diet": "Reported flare-ups with dairy and high-fiber foods",
      "exercise": "Limited due to fatigue",
      "stressLevel": "Moderate",
      "smoker": True
    },
    "currentMedications": [
      {
        "name": "Mesalamine",
        "dosage": "4.8g daily",
        "adherence": "Fair"
      },
      {
        "name": "Iron Supplement",
        "dosage": "65mg daily",
        "adherence": "Good"
      }
    ]
  },
  {
    "patientId": "P-Neuro-03",
    "age": 74,
    "gender": "Female",
    "primaryCondition": "Parkinson's Disease",
    "comorbidities": [
      "Osteoarthritis",
      "Depression",
      "Constipation"
    ],
    "geneticMarkers": {
      "LRRK2": "G2019S Mutation Not Present",
      "GBA": "N370S Variant Present"
    },
    "lifestyle": {
      "diet": "Normal, but reports difficulty swallowing",
      "exercise": "Physical therapy twice a week",
      "supportSystem": "Strong (family lives nearby)",
      "smoker": False
    },
    "currentMedications": [
      {
        "name": "Carbidopa-Levodopa",
        "dosage": "25-100mg three times daily",
        "adherence": "Good, but reports nausea"
      },
      {
        "name": "Sertraline",
        "dosage": "50mg daily",
        "adherence": "Good"
      }
    ]
  }
]

def insert_data():
    """Loops through the patient data and sends it to the API."""
    print(f"Found {len(PATIENTS_DATA)} patient records to insert. Starting...")
    
    for patient in PATIENTS_DATA:
        patient_id = patient.get("patientId")
        print(f"  -> Attempting to insert patient: {patient_id}...")
        try:
            response = requests.post(API_URL, json=patient)
            # Raises an exception for 4xx/5xx status codes
            response.raise_for_status() 
            print(f"     SUCCESS: {response.json().get('message')}")
        except requests.exceptions.HTTPError as e:
            print(f"     FAILED: Received status code {e.response.status_code}. Response: {e.response.text}")
        except requests.exceptions.RequestException as e:
            print(f"     FAILED: Could not connect to the API. Is the server running? Details: {e}")
            # Stop the script if the server is not running
            sys.exit(1)
            
    print("\nInsertion process complete.")

if __name__ == "__main__":
    insert_data()

