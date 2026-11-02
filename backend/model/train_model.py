"""
Train Random Forest Classifier for Elevator Fault Detection & Isolation
Evaluates model accuracy, precision, recall, F1-score, and confusion matrix.
Saves elevator_rf_model.pkl and label_encoder.pkl for the Flask backend.

DISCLAIMER: High synthetic classification scores only validate that the model
learned the simulated mathematical rules. It does NOT validate real-world
elevator hardware reliability or functional safety.
"""

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


def train_model(data_path='elevator_sensor_data.csv'):
    # 1. Load dataset
    print(f"Loading dataset from '{data_path}'...")
    df = pd.read_csv(data_path)

    features = [
        'motor_temperature',
        'vibration',
        'motor_current',
        'elevator_load',
        'door_closing_time',
        'door_sensor_status'
    ]
    target = 'fault_category'

    X = df[features]
    y = df[target]

    # 2. Encode target labels to integers
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # 3. Train / Test Split (80% training, 20% validation)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.20, random_state=42, stratify=y_encoded
    )

    print(f"Training samples: {len(X_train)}, Testing samples: {len(X_test)}")

    # 4. Initialize and Train Random Forest Classifier
    rf_classifier = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        random_state=42
    )
    rf_classifier.fit(X_train, y_train)

    # 5. Evaluate Performance
    y_pred = rf_classifier.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    class_names = label_encoder.classes_

    print("\n" + "=" * 50)
    print(f"MODEL PERFORMANCE EVALUATION (Synthetic Data)")
    print("=" * 50)
    print(f"Overall Accuracy: {accuracy * 100:.2f}%\n")

    print("Detailed Classification Report (Precision, Recall, F1-Score):")
    print(classification_report(y_test, y_pred, target_names=class_names))

    print("Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    cm_df = pd.DataFrame(cm, index=class_names, columns=class_names)
    print(cm_df)

    # 6. Feature Importances (Critical for Root Cause Analysis)
    print("\nFeature Importances (Top drivers of fault identification):")
    importances = rf_classifier.feature_importances_
    for feat, imp in sorted(zip(features, importances), key=lambda x: x[1], reverse=True):
        print(f" - {feat:20s}: {imp * 100:.2f}%")

    # 7. Save Model Artifacts
    model_bundle = {
        'model': rf_classifier,
        'label_encoder': label_encoder,
        'feature_names': features,
        'class_names': list(class_names)
    }

    joblib.dump(model_bundle, 'elevator_rf_model.pkl')
    print("\nArtifact saved successfully as 'elevator_rf_model.pkl'!")
    return model_bundle


if __name__ == '__main__':
    train_model()
