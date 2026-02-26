import { useState, useMemo } from "react";
import { Search, Users } from "lucide-react";
import { useExtraPatients } from "@/context/ExtraPatientsContext";

type SortKey = "age" | "bmi" | "hemoglobin" | "incomeLevel" | "riskLevel";
type SortDir = "asc" | "desc";

const VulnerableGroups = () => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("riskLevel");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const { combinedData } = useExtraPatients();

  const grouped = useMemo(() => {
    const filtered = combinedData.filter(
      (r) =>
        r.gender.toLowerCase().includes(search.toLowerCase()) ||
        r.region.toLowerCase().includes(search.toLowerCase()) ||
        r.riskLevel.toLowerCase().includes(search.toLowerCase()) ||
        r.age.toString().includes(search) ||
        r.incomeLevel.toString().includes(search)
    );
    const sorted = [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const diff = (av as number) - (bv as number);
      return sortDir === "asc" ? diff : -diff;
    });
    const byRisk: Record<string, typeof sorted> = { High: [], Medium: [], Low: [] };
    const byIncome: Record<string, typeof sorted> = { Low: [], Medium: [], High: [] };
    sorted.forEach((r) => {
      byRisk[r.riskLevel].push(r);
      const inc = r.incomeLevel < 50000 ? "Low" : r.incomeLevel < 100000 ? "Medium" : "High";
      byIncome[inc].push(r);
    });
    return { byRisk, byIncome, sorted };
  }, [combinedData, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else setSortKey(key);
  };

  const riskBadge = (r: string) =>
    r === "High" ? "risk-badge-high" : r === "Medium" ? "risk-badge-moderate" : "risk-badge-low";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-accent">
            <Users className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Vulnerable Groups</h2>
            <p className="text-sm text-muted-foreground">Table grouped by Risk and Income</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by risk, region, age, income..."
            className="w-full pl-12 pr-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b border-border">
                {(["age", "gender", "bmi", "hemoglobin", "incomeLevel", "region", "riskLevel"] as const).map((k) => (
                  <th key={k} className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide">
                    <button onClick={() => toggleSort(k)} className="hover:text-foreground transition-colors">
                      {k === "incomeLevel" ? "Income" : k === "riskLevel" ? "Risk" : k}
                      {sortKey === k && (sortDir === "asc" ? " ↑" : " ↓")}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped.sorted.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-foreground">{r.age}</td>
                  <td className="px-4 py-3 text-foreground">{r.gender}</td>
                  <td className="px-4 py-3 text-foreground">{r.bmi.toFixed(1)}</td>
                  <td className="px-4 py-3 text-foreground">{r.hemoglobin.toFixed(1)}</td>
                  <td className="px-4 py-3 text-foreground">₹{r.incomeLevel.toLocaleString()}</td>
                  <td className="px-4 py-3 text-foreground">{r.region}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${riskBadge(r.riskLevel)}`}>
                      {r.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4">{grouped.sorted.length} records</p>
      </div>
    </div>
  );
};

export default VulnerableGroups;
