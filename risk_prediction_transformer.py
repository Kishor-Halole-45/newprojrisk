import json
import math
import os
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
DATA_FILE = "synthetic_risk_data_transformer.csv"

# =========================
# Data generation / loading
# =========================

def load_data() -> pd.DataFrame:
    """
    Load or generate synthetic risk dataset with tabular features.
    """
    if os.path.exists(DATA_FILE):
        return pd.read_csv(DATA_FILE)

    n_samples = 1500
    rng = np.random.default_rng(42)

    ages = rng.integers(18, 80, size=n_samples)
    genders = rng.choice(["Male", "Female"], size=n_samples, p=[0.5, 0.5])
    bmi = rng.normal(loc=26, scale=4.5, size=n_samples).clip(16, 45)
    hemoglobin = rng.normal(loc=13.5, scale=2.0, size=n_samples).clip(7, 19)
    income = rng.integers(15000, 150000, size=n_samples)
    regions = rng.choice(["Urban", "Suburban", "Rural"], size=n_samples, p=[0.4, 0.35, 0.25])
    health_history = rng.choice(["Yes", "No"], size=n_samples, p=[0.35, 0.65])

    base_risk = np.zeros(n_samples)
    base_risk += (ages > 55) * 1.5
    base_risk += (bmi > 30) * 1.0
    base_risk += (hemoglobin < 11) * 1.2
    base_risk += (income < 30000) * 0.7
    base_risk += (health_history == "Yes") * 1.5
    base_risk += (regions == "Rural") * 0.3
    base_risk += rng.normal(0, 0.4, size=n_samples)

    risk_level = np.where(
        base_risk < 1.2,
        "Low",
        np.where(base_risk < 2.6, "Medium", "High"),
    )

    df = pd.DataFrame(
        {
            "Age": ages,
            "Gender": genders,
            "BMI": bmi,
            "HemoglobinLevel": hemoglobin,
            "IncomeLevel": income,
            "Region": regions,
            "HealthHistory": health_history,
            "RiskLevel": risk_level,
        }
    )

    df.to_csv(DATA_FILE, index=False)
    return df

# ======================
# Tabular Transformer NN
# ======================

@dataclass
class TabularConfig:
    num_features: List[str]
    cat_features: List[str]
    cat_cardinalities: List[int]
    d_model: int = 32
    n_heads: int = 4
    n_layers: int = 2
    dim_feedforward: int = 64
    dropout: float = 0.1
    num_classes: int = 3

class TabTransformer(nn.Module):
    """
    Simple Transformer encoder for tabular data.

    Each feature is treated as a token:
      - Categorical: embedding lookup.
      - Numerical: projected via linear layer.
    """

    def __init__(self, config: TabularConfig):
        super().__init__()
        self.config = config

        # Embeddings for categorical features
        self.cat_embeddings = nn.ModuleList(
            [
                nn.Embedding(cardinality, config.d_model)
                for cardinality in config.cat_cardinalities
            ]
        )

        # Projection for numerical features (one Linear per numeric)
        self.num_linears = nn.ModuleList(
            [nn.Linear(1, config.d_model) for _ in config.num_features]
        )

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=config.d_model,
            nhead=config.n_heads,
            dim_feedforward=config.dim_feedforward,
            dropout=config.dropout,
            batch_first=True,
        )
        self.transformer = nn.TransformerEncoder(
            encoder_layer,
            num_layers=config.n_layers,
        )

        self.cls_head = nn.Sequential(
            nn.LayerNorm(config.d_model),
            nn.Linear(config.d_model, config.num_classes),
        )

    def forward(self, x_num: torch.Tensor, x_cat: torch.Tensor) -> torch.Tensor:
        """
        x_num: (batch, n_num)
        x_cat: (batch, n_cat)
        """
        tokens: List[torch.Tensor] = []

        # Numerical tokens
        for i, linear in enumerate(self.num_linears):
            col = x_num[:, i : i + 1]
            tokens.append(linear(col))

        # Categorical tokens
        for i, emb in enumerate(self.cat_embeddings):
            col = x_cat[:, i]
            tokens.append(emb(col))

        # Stack tokens into (batch, seq_len, d_model)
        x = torch.stack(tokens, dim=1)

        # Transformer encoder
        x = self.transformer(x)

        # Simple mean pooling over tokens
        pooled = x.mean(dim=1)
        logits = self.cls_head(pooled)
        return logits

# =====================
# Preprocessing helpers
# =====================

def build_encoders(df: pd.DataFrame) -> Tuple[Dict[str, Dict[str, int]], Dict[str, Tuple[float, float]]]:
    """
    Build categorical label encoders and numeric standardization stats.
    """
    cat_cols = ["Gender", "Region", "HealthHistory"]
    num_cols = ["Age", "BMI", "HemoglobinLevel", "IncomeLevel"]

    cat_maps: Dict[str, Dict[str, int]] = {}
    for col in cat_cols:
        uniques = sorted(df[col].dropna().unique().tolist())
        cat_maps[col] = {val: idx for idx, val in enumerate(uniques)}

    num_stats: Dict[str, Tuple[float, float]] = {}
    for col in num_cols:
        col_vals = df[col].astype(float)
        mean = float(col_vals.mean())
        std = float(col_vals.std() or 1.0)
        num_stats[col] = (mean, std)

    return cat_maps, num_stats

def encode_dataframe(
    df: pd.DataFrame,
    cat_maps: Dict[str, Dict[str, int]],
    num_stats: Dict[str, Tuple[float, float]],
) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
    """
    Encode dataframe into tensors for Transformer.
    """
    label_map = {"Low": 0, "Medium": 1, "High": 2}

    num_cols = ["Age", "BMI", "HemoglobinLevel", "IncomeLevel"]
    cat_cols = ["Gender", "Region", "HealthHistory"]

    # Numerical matrix
    num_arr = []
    for col in num_cols:
        mean, std = num_stats[col]
        vals = df[col].astype(float).fillna(mean).to_numpy()
        vals = (vals - mean) / std
        num_arr.append(vals)
    num_mat = np.stack(num_arr, axis=1)

    # Categorical matrix
    cat_arr = []
    for col in cat_cols:
        mapping = cat_maps[col]
        vals = (
            df[col]
            .fillna(next(iter(mapping)))
            .apply(lambda v: mapping.get(v, 0))
            .to_numpy()
        )
        cat_arr.append(vals)
    cat_mat = np.stack(cat_arr, axis=1)

    # Labels
    y = df["RiskLevel"].map(label_map).to_numpy()

    x_num = torch.tensor(num_mat, dtype=torch.float32)
    x_cat = torch.tensor(cat_mat, dtype=torch.long)
    y_t = torch.tensor(y, dtype=torch.long)

    return x_num, x_cat, y_t

# =============
# Training loop
# =============

def train_transformer(
    model: TabTransformer,
    x_num_train: torch.Tensor,
    x_cat_train: torch.Tensor,
    y_train: torch.Tensor,
    x_num_val: torch.Tensor,
    x_cat_val: torch.Tensor,
    y_val: torch.Tensor,
    epochs: int = 20,
    batch_size: int = 64,
    lr: float = 1e-3,
) -> None:
    """
    Basic supervised training loop for the Transformer.
    """
    model.to(DEVICE)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    n_train = x_num_train.size(0)

    for epoch in range(1, epochs + 1):
        model.train()
        perm = torch.randperm(n_train)
        x_num_train = x_num_train[perm]
        x_cat_train = x_cat_train[perm]
        y_train = y_train[perm]

        total_loss = 0.0
        n_batches = math.ceil(n_train / batch_size)

        for i in range(0, n_train, batch_size):
            xnum_batch = x_num_train[i : i + batch_size].to(DEVICE)
            xcat_batch = x_cat_train[i : i + batch_size].to(DEVICE)
            y_batch = y_train[i : i + batch_size].to(DEVICE)

            optimizer.zero_grad()
            logits = model(xnum_batch, xcat_batch)
            loss = criterion(logits, y_batch)
            loss.backward()
            optimizer.step()

            total_loss += float(loss.item())

        # Simple validation accuracy each epoch
        model.eval()
        with torch.no_grad():
            logits_val = model(x_num_val.to(DEVICE), x_cat_val.to(DEVICE))
            preds_val = logits_val.argmax(dim=1).cpu().numpy()
            acc_val = accuracy_score(y_val.numpy(), preds_val)

        print(f"Epoch {epoch:02d}/{epochs} - train_loss: {total_loss / n_batches:.4f} - val_acc: {acc_val:.3f}")

def evaluate_model(
    model: TabTransformer,
    x_num_test: torch.Tensor,
    x_cat_test: torch.Tensor,
    y_test: torch.Tensor,
) -> None:
    """
    Evaluate Transformer on held-out test set.
    """
    model.eval()
    with torch.no_grad():
        logits = model(x_num_test.to(DEVICE), x_cat_test.to(DEVICE))
        probs = torch.softmax(logits, dim=1)
        preds = probs.argmax(dim=1).cpu().numpy()
        y_true = y_test.numpy()

    print("\n=== Transformer Evaluation on Test Set ===")
    print(f"Accuracy: {accuracy_score(y_true, preds):.3f}")
    print("Confusion Matrix (rows: true, cols: pred; 0=Low,1=Med,2=High):")
    print(confusion_matrix(y_true, preds))
    print("\nClassification Report:")
    print(classification_report(y_true, preds, target_names=["Low", "Medium", "High"]))

# ==========================
# Save / Load model for API
# ==========================

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "model_state.pt")
ENCODERS_PATH = os.path.join(MODEL_DIR, "encoders.json")


def save_model_and_encoders(
    model: TabTransformer,
    cat_maps: Dict[str, Dict[str, int]],
    num_stats: Dict[str, Tuple[float, float]],
) -> None:
    """Save model state and encoders to disk."""
    torch.save(model.state_dict(), MODEL_PATH)
    encoders_serial = {
        "cat_maps": cat_maps,
        "num_stats": {k: list(v) for k, v in num_stats.items()},
    }
    with open(ENCODERS_PATH, "w") as f:
        json.dump(encoders_serial, f, indent=2)


def load_model_and_encoders() -> Tuple[TabTransformer, Dict[str, Dict[str, int]], Dict[str, Tuple[float, float]]]:
    """Load model and encoders from disk."""
    df = load_data()
    cat_maps, num_stats = build_encoders(df)
    cat_cols = ["Gender", "Region", "HealthHistory"]
    cat_cardinalities = [len(cat_maps[col]) for col in cat_cols]
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
    model = TabTransformer(config)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.eval()

    with open(ENCODERS_PATH) as f:
        enc = json.load(f)
    num_stats_loaded = {k: (v[0], v[1]) for k, v in enc["num_stats"].items()}
    return model, enc["cat_maps"], num_stats_loaded


def predict_from_dict(
    model: TabTransformer,
    cat_maps: Dict[str, Dict[str, int]],
    num_stats: Dict[str, Tuple[float, float]],
    user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Predict risk for a single user dict. Returns API-ready structure.
    user keys: Age, Gender, BMI, HemoglobinLevel, IncomeLevel, Region, HealthHistory
    """
    df = pd.DataFrame([user])
    x_num, x_cat, _ = encode_dataframe(df.assign(RiskLevel="Low"), cat_maps, num_stats)

    model.eval()
    with torch.no_grad():
        logits = model(x_num.to(DEVICE), x_cat.to(DEVICE))
        probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

    classes = ["Low", "Medium", "High"]
    pred_idx = int(np.argmax(probs))
    pred_label = classes[pred_idx]
    confidence = float(probs[pred_idx]) * 100.0

    prob_dict = {cls: float(p * 100.0) for cls, p in zip(classes, probs)}

    num_cols = ["Age", "BMI", "HemoglobinLevel", "IncomeLevel"]
    contrib = {}
    for col in num_cols:
        mean, std = num_stats[col]
        val = float(user[col]) if isinstance(user[col], (int, float)) else float(user[col])
        z = abs((val - mean) / std) if std else 0.0
        contrib[col] = float(z)
    s = sum(contrib.values()) or 1.0
    contrib = {k: v / s * 100.0 for k, v in contrib.items()}

    # Map to API format (LOW, MODERATE, HIGH)
    api_risk_map = {"Low": "LOW", "Medium": "MODERATE", "High": "HIGH"}
    api_risk = api_risk_map[pred_label]

    # Build factor impacts for API
    factors = []
    bmi = float(user.get("BMI", 22))
    hb = float(user.get("HemoglobinLevel", 13))
    age = int(user.get("Age", 30))
    income = float(user.get("IncomeLevel", 50000))
    has_history = str(user.get("HealthHistory", "No")).lower() in ("yes", "y")

    factors.append({
        "label": "BMI Status",
        "impact": "Underweight — High Impact" if bmi < 18.5 else "Obese — Moderate Impact" if bmi > 30 else "Overweight — Low Impact" if bmi > 25 else "Normal — Low Impact",
    })
    factors.append({
        "label": "Hemoglobin Level",
        "impact": "Severely Low — Critical" if hb < 10 else "Below Normal — Moderate" if hb < 12 else "Normal — Low Impact",
    })
    factors.append({
        "label": "Age Factor",
        "impact": "Senior — Elevated risk" if age >= 65 else "Middle-aged — Moderate" if age >= 45 else "Young — Low Impact",
    })
    factors.append({
        "label": "Income Level",
        "impact": "Low Income — High Impact" if income < 30000 else "Medium — Moderate" if income < 60000 else "Higher — Low Impact",
    })
    factors.append({
        "label": "Health History",
        "impact": "Positive — Elevated Risk" if has_history else "No history — Low Impact",
    })

    explanation = (
        f"Transformer model prediction: {pred_label} risk with {confidence:.1f}% confidence. "
        f"Probabilities: Low {prob_dict['Low']:.1f}%, Medium {prob_dict['Medium']:.1f}%, High {prob_dict['High']:.1f}%."
    )

    return {
        "risk": api_risk,
        "probability": round(confidence, 1),
        "explanation": explanation,
        "factors": factors,
        "probabilities": {api_risk_map[k]: v for k, v in prob_dict.items()},
    }


# ==========================
# Real-time CLI interaction
# ==========================

def collect_user_input() -> Dict[str, str]:
    """
    Collect raw string inputs from user via CLI, with simple validation.
    """
    def ask(prompt: str, validate):
        while True:
            val = input(prompt).strip()
            if val.lower() in {"q", "quit", "exit"}:
                raise KeyboardInterrupt
            ok, msg = validate(val)
            if ok:
                return val
            print(f"Invalid input: {msg}")

    age = ask("Age (years): ", lambda v: (v.isdigit() and 0 < int(v) < 120, "Age must be 1–119."))
    gender = ask(
        "Gender (Male/Female): ",
        lambda v: (v.lower() in {"male", "female", "m", "f"}, "Enter Male/Female or M/F."),
    )
    bmi = ask(
        "BMI: ",
        lambda v: (v.replace(".", "", 1).isdigit(), "BMI must be numeric."),
    )
    hb = ask(
        "Hemoglobin level (g/dL): ",
        lambda v: (v.replace(".", "", 1).isdigit(), "Hemoglobin must be numeric."),
    )
    income = ask(
        "Income level (numeric): ",
        lambda v: (v.replace(".", "", 1).isdigit(), "Income must be numeric."),
    )
    region = ask(
        "Region (Urban/Suburban/Rural): ",
        lambda v: (v.lower() in {"urban", "suburban", "rural", "u", "s", "r"}, "Enter Urban/Suburban/Rural."),
    )
    history = ask(
        "Health history of chronic illness (Yes/No): ",
        lambda v: (v.lower() in {"yes", "no", "y", "n"}, "Enter Yes/No."),
    )

    return {
        "Age": int(age),
        "Gender": "Male" if gender.lower() in {"male", "m"} else "Female",
        "BMI": float(bmi),
        "HemoglobinLevel": float(hb),
        "IncomeLevel": float(income),
        "Region": "Urban" if region.lower() in {"urban", "u"} else ("Suburban" if region.lower() in {"suburban", "s"} else "Rural"),
        "HealthHistory": "Yes" if history.lower() in {"yes", "y"} else "No",
    }

def predict_single(
    model: TabTransformer,
    cat_maps: Dict[str, Dict[str, int]],
    num_stats: Dict[str, Tuple[float, float]],
    history: List[Dict],
) -> None:
    """
    Run one prediction for user input and update / print real-time stats.
    """
    user = collect_user_input()
    df = pd.DataFrame([user])

    x_num, x_cat, _ = encode_dataframe(df.assign(RiskLevel="Low"), cat_maps, num_stats)

    model.eval()
    with torch.no_grad():
        logits = model(x_num.to(DEVICE), x_cat.to(DEVICE))
        probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

    classes = ["Low", "Medium", "High"]
    pred_idx = int(np.argmax(probs))
    pred_label = classes[pred_idx]
    confidence = float(probs[pred_idx]) * 100.0

    prob_dict = {cls: float(p * 100.0) for cls, p in zip(classes, probs)}

    # Simple feature contribution proxy: use absolute standardized values
    num_cols = ["Age", "BMI", "HemoglobinLevel", "IncomeLevel"]
    contrib = {}
    for col in num_cols:
        mean, std = num_stats[col]
        z = abs((user[col] - mean) / std)
        contrib[col] = float(z)

    # Normalize to percentages
    s = sum(contrib.values()) or 1.0
    contrib = {k: v / s * 100.0 for k, v in contrib.items()}

    history.append({"label": pred_label})

    print("\n--- Transformer Prediction Result ---")
    print(f"Predicted Risk Level: {pred_label}")
    print("Class Probabilities (%):")
    for cls, p in prob_dict.items():
        print(f"  {cls}: {p:.2f}%")
    print(f"Confidence: {confidence:.2f}%")

    print("\nApproximate numeric feature contribution (by z-score %):")
    for feat, val in contrib.items():
        print(f"  {feat}: {val:.2f}%")

    # Real-time stats
    label_map = {"Low": 0.0, "Medium": 0.5, "High": 1.0}
    total = len(history)
    counts = {"Low": 0, "Medium": 0, "High": 0}
    scores = []
    for h in history:
        lbl = h["label"]
        counts[lbl] += 1
        scores.append(label_map.get(lbl, 0.0))

    avg_score = float(np.mean(scores)) if scores else 0.0

    print("\n--- Real-Time Statistics ---")
    print(f"Total predictions: {total}")
    print(f"Low risk: {counts['Low']}")
    print(f"Medium risk: {counts['Medium']}")
    print(f"High risk: {counts['High']}")
    print(f"Running average risk score (0=Low,1=High): {avg_score:.3f}")

def main() -> None:
    """
    End-to-end pipeline using a Transformer for tabular risk prediction.
    """
    print("Loading data...")
    df = load_data()

    print("Building encoders and statistics...")
    cat_maps, num_stats = build_encoders(df)

    print("Encoding dataset...")
    x_num, x_cat, y = encode_dataframe(df, cat_maps, num_stats)

    x_num_train, x_num_test, x_cat_train, x_cat_test, y_train, y_test = train_test_split(
        x_num, x_cat, y, test_size=0.2, random_state=42, stratify=y
    )

    # Build Transformer config and model
    cat_cols = ["Gender", "Region", "HealthHistory"]
    cat_cardinalities = [len(cat_maps[col]) for col in cat_cols]

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

    model = TabTransformer(config)

    print("Training Transformer model...")
    train_transformer(
        model,
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

    evaluate_model(model, x_num_test, x_cat_test, y_test)

    print("\nSaving model and encoders for API...")
    save_model_and_encoders(model, cat_maps, num_stats)
    print("Saved to", MODEL_PATH, "and", ENCODERS_PATH)

    print("\n=== Real-time Transformer-based Risk Prediction ===")
    print("Enter patient details to get predictions. Type 'q' to exit.\n")

    history: List[Dict] = []
    try:
        while True:
            predict_single(model, cat_maps, num_stats, history)
            cont = input("\nPress Enter for another prediction, or type 'q' to quit: ").strip().lower()
            if cont in {"q", "quit", "exit"}:
                break
    except KeyboardInterrupt:
        print("\nInterrupted by user.")

    print("Exiting.")

if __name__ == "__main__":
    main()


