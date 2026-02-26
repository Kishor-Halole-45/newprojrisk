import { useState, useMemo } from "react";
import { Filter, RotateCcw, X, MapPin, AlertTriangle } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useExtraPatients } from "@/context/ExtraPatientsContext";
import { getRegionData } from "@/data/dataset";

const regions = ["Urban", "Suburban", "Rural"] as const;

const riskColors = {
  low: "bg-risk-low",
  moderate: "bg-risk-moderate",
  high: "bg-risk-high",
};

const riskBadge = {
  low: "risk-badge-low",
  moderate: "risk-badge-moderate",
  high: "risk-badge-high",
};

const regionLatLng: { [key: string]: [number, number] } = {
  Urban: [19.076, 72.8777],
  Suburban: [19.2183, 72.9781],
  Rural: [19.1136, 72.8697],
};

const recommendations: { [key: string]: string } = {
  high: "Immediate intervention required. Deploy health workers for door-to-door screening. Prioritize iron supplementation and nutritional support programs.",
  moderate: "Increase monitoring frequency. Schedule monthly health camps. Strengthen nutrition programs.",
  low: "Continue current programs. Maintain quarterly monitoring. Focus on preventive education.",
};

const GeoMap = () => {
  const { combinedData } = useExtraPatients();
  const regionStats = useMemo(() => getRegionData(), []);
  const [selectedRegion, setSelectedRegion] = useState<(typeof regionStats)[0] | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [gender, setGender] = useState("All");
  const [riskFilter, setRiskFilter] = useState<string[]>([]);
  const [incomeFilter, setIncomeFilter] = useState<string[]>([]);

  const toggleRegion = (d: string) =>
    setSelectedRegions((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const toggleRisk = (r: string) =>
    setRiskFilter((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);

  const toggleIncome = (i: string) =>
    setIncomeFilter((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const reset = () => {
    setSelectedRegions([]);
    setGender("All");
    setRiskFilter([]);
    setIncomeFilter([]);
  };

  // Dynamically compute region stats based on filters
  const filteredData = useMemo(() => {
    return combinedData.filter((r) => {
      if (gender !== "All" && r.gender !== gender) return false;
      if (riskFilter.length && !riskFilter.includes(r.riskLevel.toLowerCase())) return false;
      if (incomeFilter.length) {
        const inc = r.incomeLevel < 50000 ? "Low" : r.incomeLevel < 100000 ? "Medium" : "High";
        if (!incomeFilter.includes(inc)) return false;
      }
      return true;
    });
  }, [combinedData, gender, riskFilter, incomeFilter]);

  const filteredRegionStats = useMemo(() => {
    return regions.map((name) => {
      const recs = filteredData.filter((r) => r.region === name);
      const total = recs.length;
      const high = recs.filter((r) => r.riskLevel === "High").length;
      const medium = recs.filter((r) => r.riskLevel === "Medium").length;
      const low = recs.filter((r) => r.riskLevel === "Low").length;
      const avgHb = total ? (recs.reduce((s, r) => s + r.hemoglobin, 0) / total).toFixed(1) : "0";
      const avgBmi = total ? (recs.reduce((s, r) => s + r.bmi, 0) / total).toFixed(1) : "0";
      const avgIncome = total ? Math.round(recs.reduce((s, r) => s + r.incomeLevel, 0) / total) : 0;
      const healthHistoryPct = total ? ((recs.filter((r) => r.healthHistory).length / total) * 100).toFixed(1) : "0";
      return {
        name,
        total,
        high,
        medium,
        low,
        highRiskPct: total ? ((high / total) * 100).toFixed(1) : "0",
        mediumRiskPct: total ? ((medium / total) * 100).toFixed(1) : "0",
        lowRiskPct: total ? ((low / total) * 100).toFixed(1) : "0",
        avgHb,
        avgBmi,
        avgIncome,
        healthHistoryPct,
      };
    });
  }, [filteredData]);

  const displayRegions = filteredRegionStats.filter((r) => {
    if (selectedRegions.length && !selectedRegions.includes(r.name)) return false;
    return true;
  });

  const getRisk = (pct: string): "low" | "moderate" | "high" => {
    const p = parseFloat(pct);
    return p >= 20 ? "high" : p >= 15 ? "moderate" : "low";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="filter-panel sticky top-24 space-y-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Filters</h3>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Region</label>
            <div className="space-y-1 bg-muted rounded-xl p-3">
              {regions.map((d) => (
                <label key={d} className="flex items-center gap-2 cursor-pointer py-1">
                  <input type="checkbox" checked={selectedRegions.includes(d)} onChange={() => toggleRegion(d)} className="rounded accent-primary" />
                  <span className="text-sm text-foreground">{d}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Gender</label>
            <div className="flex gap-2">
              {["All", "Male", "Female"].map((g) => (
                <button key={g} onClick={() => setGender(g)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${gender === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Risk Level</label>
            <div className="space-y-2">
              {[
                { key: "low", label: "Low Risk", color: "bg-risk-low" },
                { key: "medium", label: "Medium Risk", color: "bg-risk-moderate" },
                { key: "high", label: "High Risk", color: "bg-risk-high" },
              ].map((r) => (
                <label key={r.key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={riskFilter.includes(r.key)} onChange={() => toggleRisk(r.key)} className="rounded accent-primary" />
                  <span className={`w-3 h-3 rounded-sm ${r.color}`} />
                  <span className="text-sm text-foreground">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Income Level</label>
            <div className="space-y-2">
              {["Low", "Medium", "High"].map((i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={incomeFilter.includes(i)} onChange={() => toggleIncome(i)} className="rounded accent-primary" />
                  <span className="text-sm text-foreground">{i} {i === "Low" ? "(<50k)" : i === "Medium" ? "(50k-100k)" : "(>100k)"}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 px-4 py-3 border border-border rounded-2xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[600px]">
        <div className="stat-card h-full relative overflow-hidden">
          <div className="relative z-10 p-4">
            <h3 className="text-lg font-semibold text-foreground">Region Risk Map</h3>
            <p className="text-sm text-muted-foreground">
              Click on a region bubble to view details • {filteredData.length} records matched
            </p>
          </div>
          <div className="relative mx-4 mb-6 h-[420px] rounded-2xl overflow-hidden border border-border bg-muted">
            <MapContainer
              center={[19.076, 72.8777]}
              zoom={10}
              className="h-full w-full"
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {displayRegions.map((region) => {
                const risk = getRisk(region.highRiskPct);
                const pos = regionLatLng[region.name];
                if (!pos) return null;
                const pct = parseFloat(region.highRiskPct);
                const radius = 10 + pct / 3;
                const fillColor =
                  risk === "high"
                    ? "hsl(347,77%,50%)"
                    : risk === "moderate"
                    ? "hsl(38,92%,50%)"
                    : "hsl(160,84%,39%)";
                return (
                  <CircleMarker
                    key={region.name}
                    center={pos}
                    radius={radius}
                    pathOptions={{
                      fillColor,
                      color: "#ffffff",
                      weight: 1,
                      fillOpacity: 0.85,
                    }}
                    eventHandlers={{
                      click: () => setSelectedRegion(region),
                    }}
                  >
                    <Popup>
                      <div className="text-xs">
                        <p className="font-semibold mb-1">{region.name}</p>
                        <p>Total: {region.total}</p>
                        <p>High risk: {region.highRiskPct}%</p>
                        <p>Avg Hb: {region.avgHb} g/dL</p>
                        <p>Avg BMI: {region.avgBmi}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
          <div className="absolute bottom-6 right-6 z-10 bg-card/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Risk Legend</p>
            <div className="space-y-1.5">
              {[
                { label: "Low Risk", color: "bg-risk-low" },
                { label: "Moderate", color: "bg-risk-moderate" },
                { label: "High Risk", color: "bg-risk-high" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${l.color}`} />
                  <span className="text-xs text-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedRegion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 p-4" onClick={() => setSelectedRegion(null)}>
          <div className="bg-card rounded-3xl shadow-2xl p-8 max-w-lg w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{selectedRegion.name}</h2>
                <span className={`inline-flex mt-2 px-4 py-1.5 rounded-full text-sm font-semibold ${riskBadge[getRisk(selectedRegion.highRiskPct)]}`}>
                  {getRisk(selectedRegion.highRiskPct).charAt(0).toUpperCase() + getRisk(selectedRegion.highRiskPct).slice(1)} Risk
                </span>
              </div>
              <button onClick={() => setSelectedRegion(null)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: "Total Records", value: selectedRegion.total },
                { label: "High Risk %", value: `${selectedRegion.highRiskPct}%` },
                { label: "Avg Hemoglobin", value: `${selectedRegion.avgHb} g/dL` },
                { label: "Avg BMI", value: selectedRegion.avgBmi },
                { label: "Avg Income", value: `₹${selectedRegion.avgIncome.toLocaleString()}` },
                { label: "Health History %", value: `${selectedRegion.healthHistoryPct}%` },
              ].map((s) => (
                <div key={s.label} className="bg-muted rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-accent rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-accent-foreground" />
                <p className="text-sm font-semibold text-accent-foreground">Recommendation</p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {recommendations[getRisk(selectedRegion.highRiskPct)]}
              </p>
            </div>

            <button className="w-full py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity">
              View Detailed Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeoMap;
