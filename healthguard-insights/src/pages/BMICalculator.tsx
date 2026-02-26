import { useState } from "react";
import { Activity } from "lucide-react";

const BMICalculator = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const calculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!h || !w) {
      setBmi(null);
      setCategory(null);
      return;
    }

    const heightMeters = h / 100;
    const value = w / (heightMeters * heightMeters);
    const rounded = parseFloat(value.toFixed(2));
    setBmi(rounded);

    let cat = "";
    if (rounded < 18.5) cat = "Underweight";
    else if (rounded < 25) cat = "Normal";
    else if (rounded < 30) cat = "Overweight";
    else cat = "Obese";
    setCategory(cat);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-accent">
            <Activity className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">BMI Calculator</h2>
            <p className="text-sm text-muted-foreground">
              Calculate Body Mass Index based on height and weight
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Height (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 170"
              className="w-full px-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 65"
              className="w-full px-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 30"
              className="w-full px-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        </div>

        <button
          onClick={calculate}
          className="w-full h-14 bg-primary text-primary-foreground rounded-2xl text-base font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          Calculate BMI
        </button>
      </div>

      {bmi !== null && category && (
        <div className="stat-card mt-6 animate-fade-in">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">Your BMI</p>
            <p className="text-4xl font-extrabold text-foreground mt-1">{bmi}</p>
          </div>
          <div className="bg-muted rounded-2xl p-5 mb-4">
            <p className="text-sm text-foreground leading-relaxed">
              Category:{" "}
              <span className="font-semibold">
                {category}
              </span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Underweight (&lt;18.5) • Normal (18.5–24.9) • Overweight (25–29.9) • Obese (30+)
          </p>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;

