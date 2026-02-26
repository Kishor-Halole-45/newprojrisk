import { useMemo } from "react";
import {
  Users, AlertTriangle, ShieldAlert, ShieldCheck,
  Droplets, Activity, TrendingUp, TrendingDown
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useExtraPatients } from "@/context/ExtraPatientsContext";

const Dashboard = () => {
  const { combinedData } = useExtraPatients();

  const {
    total,
    risk,
    ageData,
    genderData,
    regions,
    anemiaCount,
    healthHistoryCount,
  } = useMemo(() => {
    const total = combinedData.length;

    const risk = { Low: 0, Medium: 0, High: 0 };

    const ageData = [
      { age: "18-25", Low: 0, Medium: 0, High: 0 },
      { age: "26-35", Low: 0, Medium: 0, High: 0 },
      { age: "36-45", Low: 0, Medium: 0, High: 0 },
      { age: "46-55", Low: 0, Medium: 0, High: 0 },
      { age: "56-65", Low: 0, Medium: 0, High: 0 },
      { age: "66-79", Low: 0, Medium: 0, High: 0 },
    ];

    const genderData = [
      { gender: "Male", Low: 0, Medium: 0, High: 0 },
      { gender: "Female", Low: 0, Medium: 0, High: 0 },
    ];

    const regionsAgg: {
      [key: string]: {
        total: number;
        Low: number;
        Medium: number;
        High: number;
        avgBmi: number;
        avgHb: number;
        avgIncome: number;
        healthHistoryYes: number;
      };
    } = {};

    let anemiaCount = 0;
    let healthHistoryCount = 0;

    combinedData.forEach((r) => {
      // risk counts
      risk[r.riskLevel]++;

      // age buckets
      let idx = 0;
      if (r.age <= 25) idx = 0;
      else if (r.age <= 35) idx = 1;
      else if (r.age <= 45) idx = 2;
      else if (r.age <= 55) idx = 3;
      else if (r.age <= 65) idx = 4;
      else idx = 5;
      ageData[idx][r.riskLevel]++;

      // gender buckets
      const gIdx = r.gender === "Male" ? 0 : 1;
      genderData[gIdx][r.riskLevel]++;

      // region aggregation
      if (!regionsAgg[r.region]) {
        regionsAgg[r.region] = {
          total: 0,
          Low: 0,
          Medium: 0,
          High: 0,
          avgBmi: 0,
          avgHb: 0,
          avgIncome: 0,
          healthHistoryYes: 0,
        };
      }
      const reg = regionsAgg[r.region];
      reg.total++;
      reg[r.riskLevel]++;
      reg.avgBmi += r.bmi;
      reg.avgHb += r.hemoglobin;
      reg.avgIncome += r.incomeLevel;
      if (r.healthHistory) reg.healthHistoryYes++;

      if (r.hemoglobin < 12) anemiaCount++;
      if (r.healthHistory) healthHistoryCount++;
    });

    const regions = Object.entries(regionsAgg).map(([name, d]) => ({
      name,
      total: d.total,
      low: d.Low,
      medium: d.Medium,
      high: d.High,
      highRiskPct: ((d.High / d.total) * 100).toFixed(1),
      mediumRiskPct: ((d.Medium / d.total) * 100).toFixed(1),
      lowRiskPct: ((d.Low / d.total) * 100).toFixed(1),
      avgBmi: (d.avgBmi / d.total).toFixed(1),
      avgHb: (d.avgHb / d.total).toFixed(1),
      avgIncome: Math.round(d.avgIncome / d.total),
      healthHistoryPct: ((d.healthHistoryYes / d.total) * 100).toFixed(1),
    }));

    return {
      total,
      risk,
      ageData,
      genderData,
      regions,
      anemiaCount,
      healthHistoryCount,
    };
  }, [combinedData]);

  const highPct = ((risk.High / total) * 100).toFixed(1);
  const medPct = ((risk.Medium / total) * 100).toFixed(1);
  const lowPct = ((risk.Low / total) * 100).toFixed(1);

  const stats = [
    { title: "Total Records", value: total.toLocaleString(), trend: `${total}`, up: true, icon: Users, accent: "bg-primary" },
    { title: "High Risk %", value: `${highPct}%`, trend: `${risk.High} cases`, up: true, icon: ShieldAlert, accent: "bg-risk-high" },
    { title: "Moderate Risk %", value: `${medPct}%`, trend: `${risk.Medium} cases`, up: false, icon: AlertTriangle, accent: "bg-risk-moderate" },
    { title: "Low Risk %", value: `${lowPct}%`, trend: `${risk.Low} cases`, up: false, icon: ShieldCheck, accent: "bg-risk-low" },
    { title: "Low Hemoglobin (<12)", value: anemiaCount.toLocaleString(), trend: `${((anemiaCount / total) * 100).toFixed(1)}%`, up: true, icon: Droplets, accent: "bg-risk-high" },
    { title: "Health History +", value: healthHistoryCount.toLocaleString(), trend: `${((healthHistoryCount / total) * 100).toFixed(1)}%`, up: false, icon: Activity, accent: "bg-risk-moderate" },
  ];

  const pieData = [
    { name: "Low Risk", value: parseFloat(lowPct), color: "hsl(160, 84%, 39%)" },
    { name: "Moderate Risk", value: parseFloat(medPct), color: "hsl(38, 92%, 50%)" },
    { name: "High Risk", value: parseFloat(highPct), color: "hsl(347, 77%, 50%)" },
  ];

  const sortedRegions = [...regions].sort((a, b) => parseFloat(b.highRiskPct) - parseFloat(a.highRiskPct));

  const statusConfig = {
    high: { label: "High Risk", className: "risk-badge-high" },
    moderate: { label: "Moderate", className: "risk-badge-moderate" },
    low: { label: "Low Risk", className: "risk-badge-low" },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl ${stat.accent}`} />
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${stat.accent}/10`}>
                <stat.icon className="w-5 h-5 text-foreground" />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.title}</p>
            <p className="text-3xl xl:text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            <div className="flex items-center gap-1 mt-2">
              {stat.up ? (
                <TrendingUp className="w-3.5 h-3.5 text-risk-low" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-risk-high" />
              )}
              <span className={`text-xs font-semibold ${stat.up ? "text-risk-low" : "text-risk-high"}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 stat-card">
          <h3 className="text-base font-semibold text-foreground mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => `${val}%`} />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="stat-card">
            <h3 className="text-base font-semibold text-foreground mb-4">Risk by Age Group</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" />
                <XAxis dataKey="age" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Low" fill="hsl(160, 84%, 39%)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Medium" fill="hsl(38, 92%, 50%)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="High" fill="hsl(347, 77%, 50%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="stat-card">
            <h3 className="text-base font-semibold text-foreground mb-4">Risk by Gender</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={genderData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 92%)" />
                <XAxis dataKey="gender" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Low" fill="hsl(160, 84%, 39%)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Medium" fill="hsl(38, 92%, 50%)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="High" fill="hsl(347, 77%, 50%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-foreground">Region Risk Breakdown</h3>
          <a href="/map" className="text-sm font-medium text-primary hover:underline">View map →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Region</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">High Risk %</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Avg Hemoglobin</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Avg BMI</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedRegions.map((r, i) => {
                const pct = parseFloat(r.highRiskPct);
                const status = pct >= 20 ? "high" : pct >= 15 ? "moderate" : "low";
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{r.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.total}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.highRiskPct}%</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.avgHb} g/dL</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.avgBmi}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[status].className}`}>
                        {statusConfig[status].label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
