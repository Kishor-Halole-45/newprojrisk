import { useState } from "react";
import { Stethoscope, Pill, MapPin, Check } from "lucide-react";

const dummyHospitals = [
  { name: "City General Hospital", distance: "2.3 km", address: "123 Health Ave" },
  { name: "District Medical Center", distance: "5.1 km", address: "456 Care Rd" },
  { name: "Rural Health Clinic", distance: "8.7 km", address: "789 Wellness St" },
];

const DoctorRecommendation = () => {
  const [riskLevel, setRiskLevel] = useState<"Low" | "Medium" | "High">("High");

  const isHighRisk = riskLevel === "High";
  const isMediumRisk = riskLevel === "Medium";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-accent">
            <Stethoscope className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Doctor Recommendations</h2>
            <p className="text-sm text-muted-foreground">Treatment guidance based on risk level</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Current Risk Level</label>
          <div className="flex gap-3">
            {(["Low", "Medium", "High"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRiskLevel(r)}
                className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${
                  riskLevel === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {isHighRisk && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Pill className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-foreground">Iron Supplements</h3>
                </div>
                <p className="text-sm text-muted-foreground">Ferrous Sulfate 325mg — Take twice daily with meals. Consult doctor before use.</p>
              </div>
              <div className="bg-muted rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Pill className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-foreground">Folic Acid</h3>
                </div>
                <p className="text-sm text-muted-foreground">Folic Acid 5mg — One tablet daily. Supports hemoglobin production.</p>
              </div>
            </div>

            <div className="bg-accent rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-accent-foreground" />
                <h3 className="font-semibold text-accent-foreground">Nearby Hospitals</h3>
              </div>
              <div className="space-y-3">
                {dummyHospitals.map((h, i) => (
                  <div key={i} className="flex items-center justify-between bg-card rounded-xl p-4">
                    <div>
                      <p className="font-medium text-foreground">{h.name}</p>
                      <p className="text-xs text-muted-foreground">{h.address}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{h.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {isMediumRisk && !isHighRisk && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Pill className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-foreground">Diet & Lifestyle</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Encourage iron-rich diet (green leafy vegetables, lentils, jaggery) and regular meals. Advise reduction of tea/coffee around meal times to improve iron absorption.
                </p>
              </div>
              <div className="bg-muted rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Pill className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold text-foreground">Follow-up Plan</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Schedule follow-up hemoglobin testing in 3 months. If symptoms worsen (fatigue, breathlessness), advise earlier clinical review.
                </p>
              </div>
            </div>
            <div className="bg-accent rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 text-accent-foreground" />
                <div>
                  <h3 className="font-semibold text-foreground">Moderate Risk Management</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Continue close monitoring and counselling. Escalate to high-risk protocol if hemoglobin falls below 11 g/dL or new comorbidities appear.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isHighRisk && !isMediumRisk && (
          <div className="bg-muted rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 text-risk-low" />
              <div>
                <h3 className="font-semibold text-foreground">No urgent intervention required</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Maintain regular monitoring and healthy nutrition. If risk level increases, revisit this page for supplement and hospital recommendations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorRecommendation;
