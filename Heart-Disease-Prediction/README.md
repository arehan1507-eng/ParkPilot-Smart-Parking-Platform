# ❤️ Heart Disease Prediction Using Machine Learning

A machine-learning classification project that predicts whether a patient is likely to have heart disease using the UCI Heart Disease dataset.

## ⚠️ Disclaimer
This project is for educational and research purposes only. It is **not a medical diagnostic tool** and must not be used to make healthcare decisions.

## Features
- Data loading and cleaning
- Exploratory data analysis
- Train/test split
- Feature scaling
- Logistic Regression
- K-Nearest Neighbors
- Decision Tree
- Random Forest
- Support Vector Machine
- Accuracy, precision, recall and F1-score
- Confusion matrices
- Model comparison
- Saved best model
- Optional Streamlit prediction interface

## Project Structure

```text
Heart-Disease-Prediction/
├── README.md
├── requirements.txt
├── train.py
├── app.py
├── heart_disease_prediction.ipynb
├── data/
│   └── README.md
└── models/
    └── .gitkeep
```

## Dataset

The project uses the Cleveland subset of the UCI Heart Disease dataset.

The original dataset contains 76 attributes, while the commonly used version contains 14 selected attributes including the target.

The target is converted to a binary classification problem:

- `0` → no presence of heart disease
- `1` → presence of heart disease

The original target values `1, 2, 3, 4` are treated as presence of disease.

## Input Features

| Feature | Description |
|---|---|
| age | Age in years |
| sex | Biological sex code used in the dataset |
| cp | Chest pain type |
| trestbps | Resting blood pressure |
| chol | Serum cholesterol |
| fbs | Fasting blood sugar |
| restecg | Resting ECG result |
| thalach | Maximum heart rate achieved |
| exang | Exercise-induced angina |
| oldpeak | ST depression |
| slope | Slope of peak exercise ST segment |
| ca | Number of major vessels |
| thal | Thalassemia-related categorical value |

## Machine Learning Workflow

```text
UCI Dataset
     ↓
Data Cleaning
     ↓
Missing Value Handling
     ↓
Exploratory Data Analysis
     ↓
Train / Test Split
     ↓
Feature Scaling
     ↓
Model Training
     ↓
Model Evaluation
     ↓
Best Model Saved
     ↓
Optional Web Interface
```

## Installation

```bash
git clone https://github.com/YOUR-USERNAME/Heart-Disease-Prediction.git
cd Heart-Disease-Prediction

pip install -r requirements.txt
```

## Train the Models

```bash
python train.py
```

This downloads the UCI Cleveland dataset, cleans it, trains several classifiers, prints evaluation metrics, and saves the best model to `models/best_model.joblib`.

## Run the Notebook

Open:

```text
heart_disease_prediction.ipynb
```

with Jupyter Notebook, JupyterLab, or Google Colab.

## Run the Streamlit App

After running `train.py`:

```bash
streamlit run app.py
```

The app provides a simple educational interface for entering feature values and viewing the model's predicted class.

## Technologies

- Python
- Pandas
- NumPy
- Matplotlib
- Seaborn
- Scikit-learn
- Joblib
- Jupyter
- Streamlit

## Future Improvements

- Hyperparameter tuning
- Cross-validation
- Explainable AI with SHAP
- Better categorical feature handling
- Model deployment
- More extensive external validation

## Author

**Rehan Ansari**

B.Tech Computer Science & Engineering

Interests: Machine Learning, Data Science, Cybersecurity and Python.
