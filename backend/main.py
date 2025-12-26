import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any



app = FastAPI()
origins = [
    "http://localhost:5173",  # Vite dev
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"  # during development only
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],   # important: lets FastAPI handle OPTIONS
    allow_headers=["*"],
)

model = joblib.load("models/recurrence_model.pkl")
encoders = joblib.load("models/encoders.pkl")
feature_names = joblib.load("models/feature_names.pkl")
frontend_mapping = joblib.load("models/frontend_mapping.pkl")


class PredictionInput(BaseModel):
    age_group: str
    sex: str
    race: str
    site_recode: str
    grade_recode: str
    total_malig_tumors: int
    total_benign_tumors: int
    rx_summ_surg_prim_site: int
    rx_summ_surg_rad_seq: str
    chemotherapy_recode: str
    radiation_recode: str

@app.post("/api/predict-recurrence")
def predict_recurrence(data: PredictionInput):
    # EXACT feature order + names from training
    X = pd.DataFrame([data.dict()], columns=feature_names)
    
    # Encode categoricals (exact same encoders)
    for col, encoder in encoders.items():
        X[col] = encoder.transform(X[col].astype(str))
    
    # Predict
    pred = model.predict_proba(X)[0][1] * 100
    
    return {
        "recurrence_risk_percentage": float(pred),
        "risk_level": "Red" if pred > 50 else "Yellow" if pred > 20 else "Green",
        "risk_category": "High" if pred > 50 else "Medium" if pred > 20 else "Low"
    }
