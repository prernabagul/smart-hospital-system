# backend/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI(title="Smart Hospital AI Backend")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Schemas ---
class ChatMessage(BaseModel):
    message: str

class RiskData(BaseModel):
    age: int
    bmi: float
    glucose: float
    blood_pressure: float

class BookingRequest(BaseModel):
    doctor_name: str
    patient_name: str
    date: str
    time: str

DOCTORS = [
    {"id": 1, "name": "Dr. Sarah Jenkins", "specialty": "Cardiology", "rating": 4.9, "fee": "Rs.1000"},
    {"id": 2, "name": "Dr. Marcus Chen", "specialty": "General Medicine", "rating": 4.8, "fee": "Rs.1500"},
    {"id": 3, "name": "Dr. Elena Rostova", "specialty": "Neurology", "rating": 4.9, "fee": "Rs.2000"},
    {"id": 4, "name": "Dr. Amit Patel", "specialty": "Endocrinology", "rating": 4.7, "fee": "Rs.1200"}
]

# 1. Chatbot & Recommendation Endpoint
@app.post("/api/chatbot")
async def chat_triage(data: ChatMessage):
    user_input = data.message.lower()
    
    if any(w in user_input for w in ["chest pain", "shortness of breath", "heart", "chest tightness"]):
        triage, specialty = "🔴 EMERGENCY", "Cardiology"
        reply = "Your symptoms suggest potential cardiac stress. Please visit the ER immediately or see a Specialist."
    elif any(w in user_input for w in ["headache", "dizziness", "migraine", "numbness"]):
        triage, specialty = "🟡 URGENT", "Neurology"
        reply = "You are describing neurological symptoms. An early assessment is recommended."
    elif any(w in user_input for w in ["thirst", "frequent urination", "fatigue", "sugar"]):
        triage, specialty = "🟢 ROUTINE", "Endocrinology"
        reply = "These symptoms can be linked to blood sugar fluctuations. Consider a routine checkup."
    else:
        triage, specialty = "🟢 ROUTINE", "General Medicine"
        reply = "Thank you for sharing. I recommend starting with a General Practitioner."

    recommended = [doc for doc in DOCTORS if doc["specialty"] == specialty] or [DOCTORS[1]]

    return {"reply": reply, "triage": triage, "recommended_doctors": recommended}

# 2. Appointment Booking & No-Show Predictor Endpoint
@app.post("/api/book")
async def book_appointment(booking: BookingRequest):
    no_show_risk = round(random.uniform(5.0, 35.0), 1)
    return {
        "status": "Confirmed",
        "booking_details": booking,
        "ai_insights": {
            "no_show_risk": f"{no_show_risk}%",
            "reminder_strategy": "Send SMS reminder 2 hours prior" if no_show_risk > 20 else "Standard email reminder"
        }
    }

# 3. Report Analysis Endpoint
@app.post("/api/analyze-report")
async def analyze_report(file: UploadFile = File(...)):
    filename = file.filename.lower()
    if "xray" in filename or "chest" in filename or "scan" in filename:
        finding = "Mild opacity detected in lower right lobe."
        recommendation = "Possible early stage Pneumonia. Clinical correlation recommended."
    else:
        finding = "Glucose levels elevated at 145 mg/dL. Hemoglobin A1c: 6.7%."
        recommendation = "Results suggest pre-diabetic levels. Reduce simple carbs and retest in 60 days."

    return {
        "file_processed": file.filename,
        "ai_findings": finding,
        "simplified_explanation": recommendation,
        "confidence_score": "94.2%"
    }

# 4. Disease Risk Prediction Endpoint
@app.post("/api/predict-risk")
async def predict_health_risk(data: RiskData):
    score = (data.age * 0.2) + (data.bmi * 0.5) + (data.glucose * 0.4)
    if score > 100:
        risk_level, advice = "High Risk", "Schedule a preventive cardiac and metabolic screening."
    elif score > 70:
        risk_level, advice = "Moderate Risk", "Increase weekly physical activity and monitor fasting glucose."
    else:
        risk_level, advice = "Low Risk", "Maintain current lifestyle choices and annual checkups."

    return {"risk_score": round(score, 1), "risk_level": risk_level, "recommendation": advice}