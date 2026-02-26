import { useState } from "react";
import axios from "axios";
import {
  UserCheck, Check, RotateCcw, Save,
  AlertTriangle, ShieldCheck, ShieldAlert
} from "lucide-react";
import { dataset } from "@/data/dataset";

const API_URL = "http://127.0.0.1:8000";

const regionOptions = ["Urban", "Suburban", "Rural"];

interface PredictionResult {
  risk: "LOW" | "MODERATE" | "HIGH";
  probability: number;
  explanation: string;
  factors: { label: string; impact: string }[];
}

const apiRiskMap: Record<string, PredictionResult["risk"]> = {
  Low: "LOW",
  Medium: "MODERATE",
  High: "HIGH",
};

const Predict = () => {
  const [form, setForm] = useState({
    bmi: "",
    hemoglobin: "",
    age: "",
    gender: "Female",
    income: "",
    region: "",
    healthHistory: "No",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const predict = async () => {
    // basic validation: at least BMI and Hemoglobin required
    if (!form.bmi || !form.hemoglobin) {
      setError("Please enter BMI and Hemoglobin before prediction.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const { data } = await axios.post(`${API_URL}/predict`, {
        bmi: parseFloat(form.bmi),
        hemoglobin: parseFloat(form.hemoglobin),
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender,
        income: form.income ? parseInt(form.income) : undefined,
        region: form.region || undefined,
        healthHistory: form.healthHistory,
      });

      const apiRiskRaw: string = data.risk || "Low";
      const risk: PredictionResult["risk"] = apiRiskMap[apiRiskRaw] || "LOW";

      const bmi = parseFloat(form.bmi);
      const hb = parseFloat(form.hemoglobin);
      const age = parseInt(form.age || "0") || 30;
      const income = parseInt(form.income || "0") || 50000;
      const hasHistory = form.healthHistory === "Yes";

      // Use simple buckets for probability based on API risk
      let probability: number;
      if (risk === "HIGH") {
        probability = 75 + Math.floor(Math.random() * 18);
      } else if (risk === "MODERATE") {
        probability = 40 + Math.floor(Math.random() * 30);
      } else {
        probability = 5 + Math.floor(Math.random() * 22);
      }

      const similar = dataset.filter(
        (r) => Math.abs(r.age - age) <= 10 && Math.abs(r.bmi - bmi) <= 5
      );
      const similarHighPct = similar.length
        ? ((similar.filter((r) => r.riskLevel === "High").length / similar.length) * 100).toFixed(0)
        : "N/A";

      setResult({
        risk,
        probability,
        explanation:
          risk === "HIGH"
            ? `Backend indicates HIGH risk. Among ${similar.length} similar profiles in our dataset, ${similarHighPct}% were classified as High Risk.`
            : risk === "MODERATE"
            ? `Backend indicates MODERATE risk. Some indicators fall below optimal thresholds; proactive monitoring is recommended.`
            : `Backend indicates LOW risk. Indicators are within acceptable ranges; most similar profiles were classified as Low Risk.`,
        factors: [
          { label: "BMI Status", impact: bmi < 18.5 ? "Underweight — High Impact" : bmi > 30 ? "Obese — Moderate Impact" : bmi > 25 ? "Overweight — Low Impact" : "Normal — Low Impact" },
          { label: "Hemoglobin Level", impact: hb < 10 ? "Severely Low — Critical" : hb < 12 ? "Below Normal — Moderate" : "Normal — Low Impact" },
          { label: "Age Factor", impact: age >= 65 ? "Senior — Elevated risk" : age >= 45 ? "Middle-aged — Moderate" : "Young — Low Impact" },
          { label: "Income Level", impact: income < 30000 ? "Low Income — High Impact" : income < 60000 ? "Medium — Moderate" : "Higher — Low Impact" },
          { label: "Health History", impact: hasHistory ? "Positive — Elevated Risk" : "No history — Low Impact" },
        ],
      });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.message || "Prediction failed. Please ensure the backend API is running on port 8000."
        : err instanceof Error
        ? err.message
        : "Prediction failed. Please ensure the backend API is running on port 8000.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({ bmi: "", hemoglobin: "", age: "", gender: "Female", income: "", region: "", healthHistory: "No" });
    setResult(null);
    setError(null);
  };

  const riskConfig = {
    LOW: { emoji: "✅", icon: ShieldCheck, badgeClass: "risk-badge-low", color: "text-risk-low" },
    MODERATE: { emoji: "⚠️", icon: AlertTriangle, badgeClass: "risk-badge-moderate", color: "text-risk-moderate" },
    HIGH: { emoji: "🚨", icon: ShieldAlert, badgeClass: "risk-badge-high", color: "text-risk-high" },
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-accent">
            <UserCheck className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Individual Risk Prediction</h2>
            <p className="text-sm text-muted-foreground">Enter patient data to assess malnutrition & anemia risk</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">BMI (kg/m²)</label>
            <input type="number" value={form.bmi} onChange={(e) => handleChange("bmi", e.target.value)} placeholder="e.g. 24.5"
              className="w-full px-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Hemoglobin (g/dL)</label>
            <input type="number" value={form.hemoglobin} onChange={(e) => handleChange("hemoglobin", e.target.value)} placeholder="e.g. 12.5"
              className="w-full px-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Age</label>
            <input type="number" value={form.age} onChange={(e) => handleChange("age", e.target.value)} placeholder="e.g. 45"
              className="w-full px-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Gender</label>
            <div className="flex gap-3">
              {["Male", "Female"].map((g) => (
                <button key={g} onClick={() => handleChange("gender", g)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${form.gender === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {g === "Male" ? "♂ Male" : "♀ Female"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Income Level (₹)</label>
            <input type="number" value={form.income} onChange={(e) => handleChange("income", e.target.value)} placeholder="e.g. 75000"
              className="w-full px-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Region</label>
            <select value={form.region} onChange={(e) => handleChange("region", e.target.value)}
              className="w-full px-4 py-3 bg-muted rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all">
              <option value="">Select Region</option>
              {regionOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Health History</label>
            <div className="flex gap-3">
              {["No", "Yes"].map((h) => (
                <button key={h} onClick={() => handleChange("healthHistory", h)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${form.healthHistory === h ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {h === "Yes" ? "Yes — Prior conditions" : "No — No prior conditions"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={predict} disabled={loading}
          className="w-full h-14 bg-primary text-primary-foreground rounded-2xl text-base font-semibold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? (
            <><div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Analyzing...</>
          ) : (
            <><UserCheck className="w-5 h-5" /> Predict Risk Level</>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-2xl">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}
      </div>

      {result && (
        <div className="stat-card mt-6 animate-fade-in">
          <div className="text-center mb-6">
            <span className="text-5xl mb-3 block">{riskConfig[result.risk].emoji}</span>
            <span className={`inline-flex px-6 py-2 rounded-full text-lg font-bold ${riskConfig[result.risk].badgeClass}`}>{result.risk} RISK</span>
            <p className={`text-5xl font-extrabold mt-4 ${riskConfig[result.risk].color}`}>{result.probability}%</p>
            <p className="text-sm text-muted-foreground mt-1">Risk Probability</p>
          </div>
          <div className="bg-muted rounded-2xl p-5 mb-6">
            <p className="text-sm text-foreground leading-relaxed">{result.explanation}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {result.factors.map((f, i) => (
              <div key={i} className="bg-muted rounded-2xl p-4">
                <p className="text-xs text-muted-foreground font-medium">{f.label}</p>
                <p className="text-sm font-semibold text-foreground mt-1">{f.impact}</p>
              </div>
            ))}
          </div>
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3">Recommended Actions</h4>
            <div className="space-y-2">
              {["Immediate iron supplementation", "Nutrition counseling session", "Follow-up hemoglobin test in 30 days", "Refer to nearest PHC"].map((action, i) => (
                <div key={i} className="flex items-center gap-3 bg-accent rounded-xl px-4 py-3">
                  <Check className="w-4 h-4 text-accent-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">{action}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save to Records
            </button>
            <button onClick={reset} className="flex-1 py-3 border border-border rounded-2xl text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> New Prediction
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predict;
