import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { MapPin } from "lucide-react";
import { dataset, getRegionData } from "@/data/dataset";
import "leaflet/dist/leaflet.css";

const regions = ["Urban", "Suburban", "Rural"] as const;
const regionPositions: { [key: string]: [number, number] } = {
  Urban: [19.076, 72.8777],
  Suburban: [19.2183, 72.9781],
  Rural: [19.1136, 72.8697],
};

const HotspotDetection = () => {
  const regionStats = useMemo(() => getRegionData(), []);
  const highRiskClusters = useMemo(() => {
    return regionStats.filter((r) => parseFloat(r.highRiskPct) >= 15);
  }, [regionStats]);

  const highRiskData = useMemo(() => {
    return dataset.filter((r) => r.riskLevel === "High");
  }, []);

  const clusterPoints = useMemo(() => {
    return highRiskClusters.map((r) => ({
      ...r,
      pos: regionPositions[r.name] || [19.076, 72.8777],
    }));
  }, [highRiskClusters]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-accent">
            <MapPin className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Hotspot Detection</h2>
            <p className="text-sm text-muted-foreground">High-risk clusters only — Same map style as Geospatial Risk Map</p>
          </div>
        </div>

        <div className="h-[500px] rounded-2xl overflow-hidden border border-border bg-muted">
          <MapContainer
            center={[19.076, 72.8777]}
            zoom={10}
            className="h-full w-full"
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {clusterPoints.map((c) => (
              <CircleMarker
                key={c.name}
                center={c.pos}
                radius={12 + parseFloat(c.highRiskPct) / 3}
                pathOptions={{
                  fillColor: "hsl(347, 77%, 50%)",
                  color: "hsl(347, 77%, 35%)",
                  weight: 2,
                  fillOpacity: 0.7,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{c.name}</p>
                    <p>High Risk: {c.highRiskPct}%</p>
                    <p>Total: {c.total} records</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {highRiskClusters.map((c) => (
            <div key={c.name} className="bg-muted rounded-2xl p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase">{c.name}</p>
              <p className="text-lg font-bold text-risk-high mt-1">{c.highRiskPct}% High Risk</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.total} records</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotspotDetection;
