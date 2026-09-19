import streamlit as st
import pandas as pd
import joblib
from pathlib import Path

st.set_page_config(
    page_title="Heart Disease Prediction",
    page_icon="❤️",
    layout="centered"
)

MODEL_PATH = Path("models/best_model.joblib")

st.title("❤️ Heart Disease Prediction")
st.caption("Educational machine-learning demonstration — not a medical diagnostic tool.")

if not MODEL_PATH.exists():
    st.error("Model not found. Run `python train.py` first.")
    st.stop()

bundle = joblib.load(MODEL_PATH)
model = bundle["model"]
features = bundle["features"]
model_name = bundle["model_name"]

st.info(f"Loaded model: {model_name}")

with st.form("prediction_form"):
    age = st.number_input("Age", min_value=1, max_value=120, value=50)
    sex = st.selectbox("Sex code", [0, 1], help="Use the coding defined by the dataset.")
    cp = st.selectbox("Chest pain type (cp)", [1, 2, 3, 4])
    trestbps = st.number_input("Resting blood pressure", min_value=50, max_value=250, value=120)
    chol = st.number_input("Cholesterol", min_value=50, max_value=700, value=200)
    fbs = st.selectbox("Fasting blood sugar > 120 mg/dl (fbs)", [0, 1])
    restecg = st.selectbox("Resting ECG (restecg)", [0, 1, 2])
    thalach = st.number_input("Maximum heart rate (thalach)", min_value=50, max_value=250, value=150)
    exang = st.selectbox("Exercise-induced angina (exang)", [0, 1])
    oldpeak = st.number_input("ST depression (oldpeak)", min_value=0.0, max_value=10.0, value=1.0, step=0.1)
    slope = st.selectbox("Slope", [1, 2, 3])
    ca = st.selectbox("Number of major vessels (ca)", [0, 1, 2, 3])
    thal = st.selectbox("Thalassemia code (thal)", [3, 6, 7])

    submitted = st.form_submit_button("Predict")

if submitted:
    input_df = pd.DataFrame([[
        age, sex, cp, trestbps, chol, fbs, restecg,
        thalach, exang, oldpeak, slope, ca, thal
    ]], columns=features)

    prediction = int(model.predict(input_df)[0])

    if hasattr(model, "predict_proba"):
        probability = float(model.predict_proba(input_df)[0][1])
        st.write(f"Model probability for class 1: **{probability:.2%}**")

    if prediction == 1:
        st.warning("The model classified this input as: presence of heart disease.")
    else:
        st.success("The model classified this input as: no presence of heart disease.")

    st.caption(
        "This output is a machine-learning prediction for an educational project "
        "and should not be interpreted as a medical diagnosis."
    )
