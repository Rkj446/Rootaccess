from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any, Dict, Tuple

import joblib
import numpy as np
import pandas as pd
import requests
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / 'models'
MODEL_DIR.mkdir(exist_ok=True)

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
TARGET = 'riskLevel'
DEFAULT_URL = os.environ.get('ROOTACCESS_TRAINING_DATA_URL', 'http://127.0.0.1:5000/api/ml/training-data')


def fetch_training_data(authorization: str, base_url: str = DEFAULT_URL) -> pd.DataFrame:
    response = requests.get(base_url, headers={'Authorization': authorization}, timeout=60)
    response.raise_for_status()
    payload = response.json()
    rows = payload.get('data', {}).get('students', [])
    if not rows:
        raise ValueError('No student training rows returned by the API.')
    return pd.DataFrame(rows)


def prepare_dataset(frame: pd.DataFrame) -> pd.DataFrame:
    frame = frame.copy()
    required_columns = [*FEATURES, TARGET]
    missing_columns = [field for field in required_columns if field not in frame.columns]
    if missing_columns:
        raise ValueError(f'Training data is missing required fields: {", ".join(missing_columns)}.')
    if frame.empty:
        raise ValueError('Training data contains no student rows.')

    frame[TARGET] = frame[TARGET].astype(str).str.strip()
    frame = frame.dropna(subset=[TARGET]).copy()
    for field in FEATURES:
        frame[field] = pd.to_numeric(frame[field], errors='coerce')

    canonical_labels = {
        'Low': 'Low',
        'Medium': 'Medium',
        'High': 'High',
    }
    frame[TARGET] = frame[TARGET].map(lambda value: canonical_labels.get(value.title(), value))
    return frame


def build_pipeline() -> Pipeline:
    numeric_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler()),
    ])
    preprocessor = ColumnTransformer(
        transformers=[('numeric', numeric_transformer, FEATURES)],
        remainder='drop',
    )
    model = RandomForestClassifier(n_estimators=250, random_state=42, class_weight='balanced_subsample')
    return Pipeline([('preprocessor', preprocessor), ('model', model)])


def evaluate_model(y_true: Any, y_pred: Any) -> Dict[str, Any]:
    return {
        'accuracy': float(accuracy_score(y_true, y_pred)),
        'precision': float(precision_score(y_true, y_pred, average='weighted', zero_division=0)),
        'recall': float(recall_score(y_true, y_pred, average='weighted', zero_division=0)),
        'f1': float(f1_score(y_true, y_pred, average='weighted', zero_division=0)),
        'confusionMatrix': confusion_matrix(y_true, y_pred, labels=['Low', 'Medium', 'High']).tolist(),
    }


def train_and_save(force: bool = False, authorization: str | None = None) -> Dict[str, Any]:
    model_path = MODEL_DIR / 'risk_model.joblib'
    if model_path.exists() and not force:
        bundle = joblib.load(model_path)
        return {
            'status': 'existing',
            'message': 'Model already exists. Use force=true to retrain.',
            'modelVersion': bundle['metadata'].get('model_version', 'unknown'),
        }

    training_authorization = authorization or os.environ.get('ROOTACCESS_TRAINING_TOKEN')
    if not training_authorization:
        raise ValueError('Admin authorization is required to load training data.')

    frame = prepare_dataset(fetch_training_data(training_authorization))
    if frame.empty:
        raise ValueError('Dataset did not contain usable rows for model training.')

    X = frame[FEATURES]
    y = frame[TARGET]
    class_counts = y.value_counts()
    class_count = len(class_counts)
    test_rows = int(np.ceil(len(frame) * 0.2))
    train_rows = len(frame) - test_rows
    if class_count < 2 or class_counts.min() < 2 or test_rows < class_count or train_rows < class_count:
        raise ValueError('Insufficient labeled rows for a stratified train/test split; each class needs at least two rows and both splits must contain each class.')
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_test)
    metrics = evaluate_model(y_test, predictions)

    metadata = {
        'model_version': f'risk-v{int(time.time())}',
        'training_date': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'feature_names': FEATURES,
        'dataset_rows': int(len(frame)),
        'train_rows': int(len(X_train)),
        'test_rows': int(len(X_test)),
        'random_seed': 42,
        'model_type': 'RandomForestClassifier',
        'metrics': metrics,
    }

    model_bundle = {'model': pipeline, 'metadata': metadata}
    MODEL_DIR.mkdir(exist_ok=True)
    joblib.dump(model_bundle, model_path)

    return {
        'status': 'trained',
        'modelVersion': metadata['model_version'],
        'metrics': metrics,
        'datasetRows': metadata['dataset_rows'],
        'featureNames': FEATURES,
    }


if __name__ == '__main__':
    result = train_and_save(force=True)
    print(json.dumps(result, indent=2))
