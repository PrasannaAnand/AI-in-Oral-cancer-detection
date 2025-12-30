AI-Based Oral Cancer Detection & Recurrence Prediction System
RVCE Capstone Project | Information Science & Engineering | Dec 2025

[![Backend Status](https://img.shields.io/badge/Backend-Fast![Frontend Status](https://img.shields.io/badge/Frontend-Vue![Accuracy](https://img.shields.io/badge/Detection-87https://github.com/yourusername/AI-in-Oralhttps://img.shields.io/badge/Recurrence-79https://github.com/yourusername/AI-in-Oral 🎯 Project Overview
End-to-end clinical AI system for oral cancer detection (EfficientNetB3) and recurrence risk prediction (LightGBM) using SEER dataset. Deployed as fullstack web app with FastAPI backend + Vue.js frontend.

Clinical Workflow:

📸 Upload oral lesion image → 87.3% cancer probability

🩺 Enter clinical data → 67.2% recurrence risk

🎨 SHAP explanations + risk badges (Red/Yellow/Green)

🚀 Quick Start (Development)
Backend (FastAPI)
bash
cd backend
# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
Endpoints: http://127.0.0.1:8000/docs (Swagger UI)

Frontend (Vue.js)
bash
cd frontend
npm install
npm run dev
App: http://localhost:5173

🏗️ Architecture
text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vue.js UI     │───▶│   FastAPI REST   │───▶│   AI Models     │
│                 │    │   (CORS Enabled) │    │                 │
│ • Image Upload  │    │                  │    │ • EfficientNetB3│
│ • Clinical Form │    │ /api/detect-     │    │   (Detection)   │
│ • Risk Badges   │    │ cancer (POST)    │    │                 │
└─────────────────┘    │                  │    │ • LightGBM      │
                       │ /api/predict-    │    │   (Recurrence)  │
                       │ recurrence (POST)│    └─────────────────┘
                       └──────────────────┘
📁 Folder Structure
text
AI-in-Oral-cancer-detection/
├── backend/
│   ├── main.py                 # FastAPI dual endpoints + CORS + Swagger
│   ├── requirements.txt        # TF2.17 + LightGBM + FastAPI
│   └── models/                 # 6 AI model files (~150MB total)
│       ├── recurrence_model.pkl
│       ├── encoders.pkl
│       ├── feature_names.pkl
│       ├── frontend_mapping.pkl
│       └── model.weights.h5    # EfficientNetB3 trained weights
├── frontend/
│   ├── src/
│   │   ├── services/apiService.ts  # Type-safe API calls
│   │   ├── views/DetectionView.tsx
│   │   └── views/RecurrenceView.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
🔬 Technical Specifications
Component	Model	Dataset	Performance	Input	Output
Detection	EfficientNetB3	Oral lesions	87.3% Acc	300x300 RGB image	Cancer probability (0-1)
Recurrence	LightGBM	SEER 2023	73.9% Acc, 79.6% AUC	11 clinical features	Risk % + Category
SEER Features: Age group, site, grade, RX codes, chemo/radiation, tumor counts

🧪 API Endpoints
bash
# Detection (Image → Probability)
POST /api/detect-cancer
Content-Type: multipart/form-data
Key: image (File)

# Response
{
  "cancer_probability": 0.873,
  "confidence": 0.873,
  "risk_level": "High",
  "weights_loaded": true
}

# Recurrence (Clinical → Risk %)
POST /api/predict-recurrence
Content-Type: application/json
{
  "age_group": "55-59", "site_recode": "Tongue", ...
}

# Health Check
GET /health → {"status": "healthy", "detection_model": true}
⚙️ Production Deployment
Backend (Docker + Cloud)
text
# Dockerfile
FROM python:3.10-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker"]
Platforms: Render, Railway, Google Cloud Run, AWS Lambda

Frontend (Static Hosting)
bash
npm run build  # → dist/
Platforms: Vercel, Netlify, GitHub Pages

📈 Model Training (Reproducible)
python
# Detection (EfficientNetB3)
base = EfficientNetB3(weights=None, include_top=False)
model = Sequential([base, GlobalAveragePooling2D(), Dense(1, 'sigmoid')])
model.compile('adam', 'binary_crossentropy')
model.fit(train_ds, epochs=50, callbacks=[EarlyStopping(patience=10)])

# Recurrence (LightGBM)
gbm = LGBMClassifier(n_estimators=500, learning_rate=0.05)
gbm.fit(X_train, y_train)
🔒 Clinical Safety
Disclaimer: Decision-support prototype, not diagnostic device

Input validation: Age bounds, SEER categories, image constraints

Calibrated outputs: Probability + risk band + clinician guidance

No PHI storage: Stateless predictions only

📚 References
SEER Dataset: seer.cancer.gov

EfficientNetB3: Tan & Le (2019), arxiv.org/abs/1905.11946

LightGBM: Microsoft (2017), lightgbm.readthedocs.io

👨‍🎓 Student Details
Prasanna A | Ravi R Naidu | Tentan M S | Yash Shah | 
Department of Information Science and Engineering | RV College of Engineering
