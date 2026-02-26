"""
Flask API for Risk Prediction Transformer model.
Serves predictions to the HealthGuard Insights frontend.
"""
import os
import sys

# Add parent directory for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:8080", "http://127.0.0.1:8080"])

_model = None
_cat_maps = None
_num_stats = None


def get_model():
    """Lazy load model and encoders."""
    global _model, _cat_maps, _num_stats
    if _model is None:
        from risk_prediction_transformer import (
            load_model_and_encoders,
            load_data,
            build_encoders,
            encode_dataframe,
            train_test_split,
            train_transformer,
            save_model_and_encoders,
            TabTransformer,
            TabularConfig,
        )
        import torch

        model_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "model_state.pt",
        )
        encoders_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "encoders.json",
        )

        if os.path.exists(model_path) and os.path.exists(encoders_path):
            _model, _cat_maps, _num_stats = load_model_and_encoders()
        else:
            # Train and save on first run
            df = load_data()
            _cat_maps, _num_stats = build_encoders(df)
            x_num, x_cat, y = encode_dataframe(df, _cat_maps, _num_stats)
            x_num_train, x_num_test, x_cat_train, x_cat_test, y_train, y_test = (
                train_test_split(x_num, x_cat, y, test_size=0.2, random_state=42, stratify=y)
            )
            cat_cols = ["Gender", "Region", "HealthHistory"]
            cat_cardinalities = [len(_cat_maps[col]) for col in cat_cols]
            config = TabularConfig(
                num_features=["Age", "BMI", "HemoglobinLevel", "IncomeLevel"],
                cat_features=cat_cols,
                cat_cardinalities=cat_cardinalities,
                d_model=32,
                n_heads=4,
                n_layers=2,
                dim_feedforward=64,
                dropout=0.1,
                num_classes=3,
            )
            _model = TabTransformer(config)
            train_transformer(
                _model,
                x_num_train,
                x_cat_train,
                y_train,
                x_num_test,
                x_cat_test,
                y_test,
                epochs=20,
                batch_size=64,
                lr=1e-3,
            )
            save_model_and_encoders(_model, _cat_maps, _num_stats)

    return _model, _cat_maps, _num_stats


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json() or {}
        # Map frontend fields to model fields
        bmi = float(data.get("bmi") or 22)
        hemoglobin = float(data.get("hemoglobin") or 13)
        age = int(data.get("age") or 30)
        gender = str(data.get("gender") or "Female").strip()
        income = float(data.get("income") or 50000)
        region_raw = str(data.get("region") or "Urban").strip()
        region = region_raw if region_raw in ("Urban", "Suburban", "Rural") else "Urban"
        health_history = str(data.get("healthHistory") or "No").strip()

        if gender.lower() not in ("male", "female"):
            gender = "Female"
        if health_history.lower() not in ("yes", "no"):
            health_history = "No"
        else:
            health_history = "Yes" if health_history.lower() in ("yes", "y") else "No"

        user = {
            "Age": age,
            "Gender": "Male" if gender.lower() == "male" else "Female",
            "BMI": bmi,
            "HemoglobinLevel": hemoglobin,
            "IncomeLevel": income,
            "Region": region,
            "HealthHistory": health_history,
        }

        model, cat_maps, num_stats = get_model()
        from risk_prediction_transformer import predict_from_dict

        result = predict_from_dict(model, cat_maps, num_stats, user)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    print("Starting Risk Prediction API...")
    print("Train model on first request if not already saved.")
    app.run(host="0.0.0.0", port=5000, debug=False)
