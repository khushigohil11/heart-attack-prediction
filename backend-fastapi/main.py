
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import joblib

# Initialize app
app = FastAPI(title="Heart Risk Predictor", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML model
MODEL_PATH = "heart_attack_risk_model.pkl"
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    model = None
    print(f"[WARN] Could not load model from {MODEL_PATH}: {e}")

# Input schema
class HeartInput(BaseModel):
    age: int
    Systolic_BP_mmHg: float
    Diastolic_BP_mmHg: float
    Heart_Rate_bpm: float
    Blood_Oxygen_Level_SpO2_percent: float
    Temperature_C: float
    height_cm: float
    weight_kg: float
    BMI_kg_per_m2: float
    ecg_heart_rate_bpm: float
    ecg_qrs_duration_ms: float
    ecg_st_deviation_mV: float
    ecg_r_peak_mV: float
    ecg_abnormal: int = Field(..., ge=0, le=1)
    blood_sugar_mg_dL: float
    family_history: int = Field(..., ge=0, le=1)
    sex_encoded: int = Field(..., ge=0, le=1)
    ecg_label_encoded: int = Field(..., ge=0, le=1)
    smoking_status_Former: int = Field(..., ge=0, le=1)
    smoking_status_Never: int = Field(..., ge=0, le=1)
    physical_activity_level_Low: int = Field(..., ge=0, le=1)
    physical_activity_level_Medium: int = Field(..., ge=0, le=1)
    diet_quality_Good: int = Field(..., ge=0, le=1)
    diet_quality_Poor: int = Field(..., ge=0, le=1)
    stress_level_Low: int = Field(..., ge=0, le=1)
    stress_level_Medium: int = Field(..., ge=0, le=1)

# Motivation message based on score
def motivation(score: float) -> str:
    if score < 30:
        return "💚 Great going! Keep up your healthy habits."
    if score < 60:
        return "⚠️ You’re on the edge—add a little more movement and mindful eating."
    return "🚨 Prioritize your heart—consult a doctor and make small daily changes."

# Root route
@app.get("/")
def root():
    return {"message": "✅ Heart Risk Predictor API is running"}

# Health check route
@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

# Prediction route
@app.post("/predict")
def predict(payload: HeartInput):
    if model is None:
        return {"error": "Model not loaded. Place heart_attack_risk_model.pkl next to main.py and restart."}
    
    df = pd.DataFrame([payload.model_dump()])
    
    try:
        raw = model.predict(df)[0]
    except Exception as e:
        return {"error": f"Model prediction failed: {e}"}
    
    try:
        score = float(raw)
    except Exception:
        try:
            score = float(raw) * 100.0
        except Exception:
            score = 0.0
    
    score = max(0.0, min(100.0, score))  # clamp between 0-100
    
    return {"score": round(score, 2), "message": motivation(score)}
