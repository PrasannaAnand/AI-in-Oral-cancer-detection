from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

# Load at startup
model = joblib.load("models/lightgbm_recurrence_model.joblib")
encoders = joblib.load("models/label_encoders.joblib")
metadata = joblib.load("models/model_metadata.joblib")

FEATURE_COLUMNS = metadata["feature_names"]

class RecurrenceInput(BaseModel):
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

def preprocess(payload: RecurrenceInput):
    x = {}
    x["sex"] = payload.sex
    x["race"] = payload.race
    x["Site recode ICD-O-3/WHO 2008"] = payload.site_recode
    x["Grade Recode (thru 2017)"] = payload.grade_recode
    x["Total number of in situ/malignant tumors for patient"] = payload.total_malig_tumors
    x["Total number of benign/borderline tumors for patient"] = payload.total_benign_tumors
    x["RX Summ--Surg Prim Site (1998+)"] = payload.rx_summ_surg_prim_site
    x["RX Summ--Surg/Rad Seq"] = payload.rx_summ_surg_rad_seq
    x["Chemotherapy recode (yes, no/unk)"] = payload.chemotherapy_recode
    x["Radiation recode"] = payload.radiation_recode

    # apply encoders in same way as in training
    for col, enc in encoders.items():
        if col in x:
            x[col] = enc.transform([str(x[col])])[0]

    row = np.array([[x[c] for c in FEATURE_COLUMNS]])
    return row

def categorize(risk_percent: float):
    if risk_percent < 20:
        return "Low Risk", "Green"
    elif risk_percent < 50:
        return "Intermediate Risk", "Yellow"
    else:
        return "High Risk", "Red"

@app.post("/api/predict-recurrence")
def predict_recurrence(data: RecurrenceInput):
    X = preprocess(data)
    prob = model.predict_proba(X)[0, 1]
    risk_percent = float(prob * 100.0)
    risk_category, risk_level = categorize(risk_percent)
    return {
        "recurrence_risk_percentage": round(risk_percent, 1),
        "risk_category": risk_category,
        "risk_level": risk_level
    }
