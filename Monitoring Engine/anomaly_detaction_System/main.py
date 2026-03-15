import pandas as pd
import numpy as np
from pathlib import Path

# model loading using pkl (not for production)
import pickle as pkl

from fastapi import FastAPI, HTTPException

app = FastAPI()

# Load model once at startup
MODEL_PATH = Path(__file__).parent / "models" / "anomaly_model.pkl"
_model = None


def get_model():
    global _model
    if _model is None:
        with open(MODEL_PATH, "rb") as f:
            _model = pkl.load(f)
    return _model


def score_to_anomaly_probability(score: float) -> float:
    """Convert IsolationForest score_samples to anomaly probability [0, 1].
    Lower score = more anomalous. Uses sigmoid-like transform."""
    return float(1 / (1 + np.exp(float(score))))


@app.get("/")
async def root():
    return {"message": "Travira Anomaly Detection API", "status": "ready"}


@app.post("/predict")
async def predict(body: dict):
    """
    Predict if movement is normal (1) or abnormal (-1).
    Input: { "lat": float, "lng": float, "speed": float } (speed in km/h)
    Output: { "prediction": 1|-1, "anomaly_score": float, "is_anomaly": bool }
    """
    lat = body.get("lat")
    lng = body.get("lng")
    speed = body.get("speed", 0)

    if lat is None or lng is None:
        raise HTTPException(status_code=422, detail="lat and lng are required")

    try:
        lat, lng = float(lat), float(lng)
        speed = float(speed) if speed is not None else 0.0
    except (TypeError, ValueError):
        raise HTTPException(status_code=422, detail="lat, lng, speed must be numeric")

    X = np.array([[lat, lng, speed]], dtype=np.float64)
    model = get_model()

    prediction = int(model.predict(X)[0])  # 1 = normal, -1 = anomaly
    raw_score = float(model.score_samples(X)[0])
    anomaly_score = score_to_anomaly_probability(raw_score)
    is_anomaly = prediction == -1

    return {
        "prediction": prediction,
        "anomaly_score": round(anomaly_score, 4),
        "is_anomaly": is_anomaly,
    }







