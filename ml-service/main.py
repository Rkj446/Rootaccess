from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

import joblib
import pandas as pd
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

MODEL_DIR = Path(__file__).resolve().parent / 'models'
MODEL_PATH = MODEL_DIR / 'risk_model.joblib'
FEATURES = [
    'attendancePct',
    'studyHoursPerDay',
    'previousCgpa',
    'sleepHoursPerDay',
    'classParticipationPct',
    'backlogs',
    'internalMarks',
    'assignmentAvg',
    'midtermMarks',
    'labMarks',
]

app = FastAPI(title='Rootaccess ML Service', version='1.0.0')


class PredictionRequest(BaseModel):
    attendancePct: float
    studyHoursPerDay: float
    previousCgpa: float
    sleepHoursPerDay: float
    classParticipationPct: float
    backlogs: float
    internalMarks: float
    assignmentAvg: float
    midtermMarks: float
    labMarks: float


@app.get('/health')
def health() -> Dict[str, Any]:
    metadata = {}
    if MODEL_PATH.exists():
        bundle = joblib.load(MODEL_PATH)
        metadata = bundle.get('metadata', {})

    return {
        'status': 'ok',
        'model_available': MODEL_PATH.exists(),
        'model_version': metadata.get('model_version'),
        'training_date': metadata.get('training_date'),
        'model_type': metadata.get('model_type'),
        'dataset_rows': metadata.get('dataset_rows'),
        'train_rows': metadata.get('train_rows'),
        'test_rows': metadata.get('test_rows'),
        'metrics': metadata.get('metrics'),
        'features': metadata.get('feature_names', FEATURES),
    }


@app.post('/predict/risk')
def predict_risk(payload: PredictionRequest):
    if not MODEL_PATH.exists():
        raise HTTPException(status_code=503, detail='Model is not available yet. Train the model first.')

    bundle = joblib.load(MODEL_PATH)
    model = bundle['model']
    metadata = bundle['metadata']
    feature_order = metadata.get('feature_names', FEATURES)
    row = pd.DataFrame([{feature: getattr(payload, feature) for feature in feature_order}])
    pred = model.predict(row)[0]
    probs = model.predict_proba(row)[0]
    classes = model.classes_
    probability_map = {label: float(prob) for label, prob in zip(classes, probs)}
    return {
        'prediction': str(pred),
        'probabilities': probability_map,
        'modelVersion': metadata.get('model_version', 'unknown'),
    }


@app.post('/train')
def train(payload: Dict[str, Any] | None = None, authorization: str | None = Header(default=None)):
    payload = payload or {}
    if not authorization:
        raise HTTPException(status_code=401, detail='Admin authorization is required.')
    from train_model import train_and_save

    try:
        return train_and_save(force=bool(payload.get('force', False)), authorization=authorization)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
