"""
Heart Disease Prediction - Model Training

Educational project using the UCI Heart Disease Cleveland dataset.
Run:
    python train.py
"""

from pathlib import Path
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

DATA_URL = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases/"
    "heart-disease/processed.cleveland.data"
)

COLUMNS = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
    "thalach", "exang", "oldpeak", "slope", "ca", "thal", "target"
]

FEATURES = COLUMNS[:-1]

def load_data():
    df = pd.read_csv(DATA_URL, header=None, names=COLUMNS, na_values="?")
    for col in COLUMNS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Original UCI target: 0 = no disease, 1-4 = disease.
    df["target"] = (df["target"] > 0).astype(int)
    return df

def build_models():
    def pipeline(model):
        return Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("model", model),
        ])

    return {
        "Logistic Regression": pipeline(
            LogisticRegression(max_iter=2000, random_state=42)
        ),
        "K-Nearest Neighbors": pipeline(
            KNeighborsClassifier(n_neighbors=5)
        ),
        "Decision Tree": pipeline(
            DecisionTreeClassifier(max_depth=5, random_state=42)
        ),
        "Random Forest": pipeline(
            RandomForestClassifier(n_estimators=200, random_state=42)
        ),
        "Support Vector Machine": pipeline(
            SVC(kernel="rbf", probability=True, random_state=42)
        ),
    }

def main():
    print("Loading UCI Heart Disease dataset...")
    df = load_data()

    X = df[FEATURES]
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    models = build_models()
    results = []
    trained_models = {}

    for name, model in models.items():
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)

        result = {
            "Model": name,
            "Accuracy": accuracy_score(y_test, predictions),
            "Precision": precision_score(y_test, predictions, zero_division=0),
            "Recall": recall_score(y_test, predictions, zero_division=0),
            "F1": f1_score(y_test, predictions, zero_division=0),
        }
        results.append(result)
        trained_models[name] = model

        print(f"\n{name}")
        print(classification_report(y_test, predictions, zero_division=0))

    results_df = pd.DataFrame(results).sort_values("F1", ascending=False)
    print("\nModel comparison:")
    print(results_df.to_string(index=False))

    best_name = results_df.iloc[0]["Model"]
    best_model = trained_models[best_name]

    Path("models").mkdir(exist_ok=True)
    joblib.dump(
        {
            "model": best_model,
            "features": FEATURES,
            "model_name": best_name,
        },
        "models/best_model.joblib",
    )

    results_df.to_csv("model_results.csv", index=False)

    print(f"\nBest model by F1-score: {best_name}")
    print("Saved: models/best_model.joblib")
    print("Saved: model_results.csv")

if __name__ == "__main__":
    main()
