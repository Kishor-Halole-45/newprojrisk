import { useState } from "react";
import { Banknote, CheckCircle, XCircle } from "lucide-react";

const schemes = [
  { name: "National Nutrition Mission", desc: "Supplementary nutrition for women and children", amount: "Up to ₹1,500/month" },
  { name: "Anemia Mukt Bharat", desc: "Iron-folic acid supplementation program", amount: "Free supplementation" },
  { name: "Ayushman Bharat", desc: "Health coverage for eligible families", amount: "₹5 lakh/year cover" },
];

const FinancialAid = () => {
  const [income, setIncome] = useState<string>("45000");
  const incomeNum = parseFloat(income) || 0;
  const eligible = incomeNum < 50000;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-accent">
            <Banknote className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Financial Aid</h2>
            <p className="text-sm text-muted-foreground">Check eligibility for government schemes</p>
          </div>
        </div>

        <div className="mb-8">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Annual Income (₹)</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="e.g. 45000"
            className="w-full px-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        <div className={`rounded-2xl p-6 mb-8 ${eligible ? "bg-emerald-50 border border-emerald-200" : "bg-muted"}`}>
          <div className="flex items-center gap-3">
            {eligible ? (
              <>
                <CheckCircle className="w-8 h-8 text-risk-low" />
                <div>
                  <h3 className="font-bold text-foreground">Eligible</h3>
                  <p className="text-sm text-muted-foreground">Income &lt; ₹50,000 — You qualify for financial aid schemes.</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8 text-muted-foreground" />
                <div>
                  <h3 className="font-bold text-foreground">Not Eligible</h3>
                  <p className="text-sm text-muted-foreground">Income ≥ ₹50,000 — View schemes for reference only.</p>
                </div>
              </>
            )}
          </div>
        </div>

        <h4 className="text-sm font-semibold text-foreground mb-4">Government Schemes</h4>
        <div className="space-y-4">
          {schemes.map((s, i) => (
            <div key={i} className="bg-muted rounded-2xl p-6">
              <p className="font-semibold text-foreground">{s.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
              <p className="text-sm font-medium text-primary mt-2">{s.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialAid;
