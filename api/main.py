"""
FastAPI backend for NutriGuard AI - Risk Prediction.
Runs on port 8000.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="NutriGuard AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    bmi: Optional[float] = None
    hemoglobin: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    income: Optional[float] = None
    region: Optional[str] = None
    healthHistory: Optional[str] = None


class PredictResponse(BaseModel):
    risk: str
    message: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(data: PredictRequest):
    hb = float(data.hemoglobin) if data.hemoglobin is not None else 13.0
    bmi_val = float(data.bmi) if data.bmi is not None else 22.0

    if hb < 11:
        risk = "High"
    elif bmi_val < 18.5:
        risk = "Medium"
    else:
        risk = "Low"

    return PredictResponse(risk=risk, message="Risk calculated successfully")
