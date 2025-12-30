import joblib
import pandas as pd
import os
import json
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import tensorflow as tf
import numpy as np
from PIL import Image
import io

# =============================================================================
# APP SETUP
# =============================================================================
app = FastAPI(title="Oral Cancer AI Suite")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# MODEL CONSTANTS - ADD THESE DEFINITIONS
# =============================================================================
DETECTION_INPUT_SIZE = (224, 224)  # MobileNet standard input size [web:41]

# =============================================================================
# RECURRENCE MODEL (UNCHANGED - WORKING)
# =============================================================================
print("🔄 Loading recurrence models...")
model = joblib.load("models/recurrence_model.pkl")
encoders = joblib.load("models/encoders.pkl")
feature_names = joblib.load("models/feature_names.pkl")
frontend_mapping = joblib.load("models/frontend_mapping.pkl")
print("✅ Recurrence models loaded!")

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
    X = pd.DataFrame([data.dict()], columns=feature_names)
    for col, encoder in encoders.items():
        X[col] = encoder.transform(X[col].astype(str))
    pred = model.predict_proba(X)[0][1] * 100
    return {
        "recurrence_risk_percentage": float(pred),
        "risk_level": "Red" if pred > 50 else "Yellow" if pred > 20 else "Green",
        "risk_category": "High" if pred > 50 else "Medium" if pred > 20 else "Low"
    }

# =============================================================================
# DETECTION MODEL - FIXED: Load model BEFORE endpoint definition
# =============================================================================
print("🔄 Loading detection model...")
try:
    detection_model = tf.keras.models.load_model("models/final_mobilenet_model.keras")
    print("✅ Detection model loaded!")
except Exception as e:
    print(f"❌ Failed to load detection model: {e}")
    detection_model = None

@app.post("/api/detect-cancer")
async def detect_lesion(file: UploadFile = File(...)):
    if detection_model is None:
        raise HTTPException(status_code=500, detail="Detection model not loaded")
    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image = image.resize(DETECTION_INPUT_SIZE)  # Now defined!
    image_arr = np.array(image, dtype=np.float32) / 255.0
    image_arr = np.expand_dims(image_arr, axis=0)
    
    probability = detection_model.predict(image_arr, verbose=0)[0][0]
    return {
        "prediction": "Cancerous" if probability >= 0.5 else "Non-cancerous",
        "confidence": float(probability),
        "cancer_probability": float(probability)
    }

# =============================================================================
# HEALTH CHECK & ROOT - FIXED: Now references defined constant
# =============================================================================
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "recurrence_model": True,
        "detection_model": detection_model is not None,
        "input_size": DETECTION_INPUT_SIZE  # Now defined!
    }

@app.get("/")
async def root():
    return {
        "message": "Oral Cancer AI Suite v2.0 ✅",
        "endpoints": {
            "recurrence": "/api/predict-recurrence (POST JSON)",
            "detection": "/api/detect-cancer (POST image)",
            "docs": "/docs (Swagger UI)",
            "health": "/health"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
