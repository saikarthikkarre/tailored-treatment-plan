import requests
import json

# The URL of your running FastAPI application's endpoint
API_URL = "http://127.0.0.1:8000/patients"

# A list of 10 diverse patient records to insert
PATIENTS_DATA = [
    {
      "patientId": "P-003", "age": 28, "gender": "Female", "primaryCondition": "Crohn's Disease",
      "comorbidities": ["Anemia"], "geneticMarkers": {"NOD2": "Risk Variant"}, "lifestyle": {"smoker": False, "diet": "Low-FODMAP"},
      "currentMedications": [{"name": "Adalimumab", "dosage": "40mg every 2 weeks", "adherence": "Good"}]
    },
    {
      "patientId": "P-004", "age": 55, "gender": "Male", "primaryCondition": "Atrial Fibrillation",
      "comorbidities": ["Hypertension"], "geneticMarkers": {"PITX2": "Risk Variant"}, "lifestyle": {"exercise": "Moderate", "alcohol": "Occasional"},
      "currentMedications": [{"name": "Apixaban", "dosage": "5mg twice daily", "adherence": "Excellent"}, {"name": "Metoprolol", "dosage": "50mg daily", "adherence": "Excellent"}]
    },
    {
      "patientId": "P-005", "age": 78, "gender": "Female", "primaryCondition": "Macular Degeneration",
      "comorbidities": ["Cataracts"], "geneticMarkers": {"CFH": "High Risk"}, "lifestyle": {"diet": "Rich in antioxidants"},
      "currentMedications": [{"name": "AREDS 2 Supplement", "dosage": "Once daily", "adherence": "Good"}]
    },
    {
      "patientId": "P-006", "age": 9, "gender": "Male", "primaryCondition": "Asthma",
      "comorbidities": ["Allergic Rhinitis"], "geneticMarkers": {"ORMDL3": "Associated Variant"}, "lifestyle": {"environment": "Urban"},
      "currentMedications": [{"name": "Albuterol Inhaler", "dosage": "As needed", "adherence": "Fair"}, {"name": "Fluticasone Inhaler", "dosage": "1 puff twice daily", "adherence": "Good"}]
    },
    {
      "patientId": "P-007", "age": 62, "gender": "Male", "primaryCondition": "Chronic Kidney Disease",
      "comorbidities": ["Type 2 Diabetes"], "geneticMarkers": {"APOL1": "G1/G2 Variant"}, "lifestyle": {"diet": "Low protein, low sodium"},
      "currentMedications": [{"name": "Lisinopril", "dosage": "20mg daily", "adherence": "Good"}, {"name": "Insulin Glargine", "dosage": "10 units daily", "adherence": "Good"}]
    },
    {
      "patientId": "P-008", "age": 45, "gender": "Female", "primaryCondition": "Hypothyroidism",
      "comorbidities": ["Depression"], "geneticMarkers": {"TSHR": "Normal"}, "lifestyle": {"stress_level": "High"},
      "currentMedications": [{"name": "Levothyroxine", "dosage": "75mcg daily", "adherence": "Excellent"}, {"name": "Sertraline", "dosage": "50mg daily", "adherence": "Good"}]
    },
    {
      "patientId": "P-009", "age": 72, "gender": "Male", "primaryCondition": "Parkinson's Disease",
      "comorbidities": ["Constipation", "Insomnia"], "geneticMarkers": {"LRRK2": "G2019S Mutation"}, "lifestyle": {"activity": "Assisted daily walks"},
      "currentMedications": [{"name": "Carbidopa-Levodopa", "dosage": "25/100mg three times daily", "adherence": "Good"}]
    },
    {
      "patientId": "P-010", "age": 38, "gender": "Female", "primaryCondition": "Chronic Migraines",
      "comorbidities": [], "geneticMarkers": {"MTHFR": "C677T Variant"}, "lifestyle": {"triggers": "Stress, lack of sleep"},
      "currentMedications": [{"name": "Sumatriptan", "dosage": "50mg as needed", "adherence": "Fair"}, {"name": "Topiramate", "dosage": "25mg twice daily", "adherence": "Good"}]
    },
    {
      "patientId": "P-011", "age": 24, "gender": "Male", "primaryCondition": "Psoriasis",
      "comorbidities": ["Psoriatic Arthritis"], "geneticMarkers": {"HLA-C": "Risk Allele"}, "lifestyle": {"smoker": "Yes"},
      "currentMedications": [{"name": "Methotrexate", "dosage": "15mg weekly", "adherence": "Good"}]
    },
    {
      "patientId": "P-012", "age": 59, "gender": "Male", "primaryCondition": "Gout",
      "comorbidities": ["Obesity", "Metabolic Syndrome"], "geneticMarkers": {"SLC2A9": "Risk Variant"}, "lifestyle": {"diet": "High in purines"},
      "currentMedications": [{"name": "Allopurinol", "dosage": "300mg daily", "adherence": "Fair"}]
    }
]

def insert_all_patients():
    """Loops through the patient data and sends a POST request for each one."""
    print(f"Starting to insert {len(PATIENTS_DATA)} patient records...")
    
    for patient in PATIENTS_DATA:
        try:
            response = requests.post(API_URL, json=patient)
            
            # Check if the request was successful
            if response.status_code == 201:
                print(f"Successfully inserted patient: {patient['patientId']}")
            else:
                print(f"Failed to insert patient: {patient['patientId']}. Status: {response.status_code}, Response: {response.text}")

        except requests.exceptions.ConnectionError as e:
            print(f"\nConnection Error: Could not connect to the API at {API_URL}.")
            print("Please make sure your FastAPI server is running in another terminal.")
            break # Stop the script if the server isn't running
        except Exception as e:
            print(f"An unexpected error occurred for patient {patient['patientId']}: {e}")

    print("\nBulk insert process finished.")

if __name__ == "__main__":
    insert_all_patients()
