import { useState } from "react";
import { Truck } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const initialDeliveries = [
  { id: 1, patientName: "Ramesh Kumar", medicine: "Ferrous Sulfate 325mg", status: "Pending" as const },
  { id: 2, patientName: "Sita Devi", medicine: "Folic Acid 5mg", status: "Delivered" as const },
  { id: 3, patientName: "Vijay Singh", medicine: "Iron + Folic Acid Combo", status: "Pending" as const },
  { id: 4, patientName: "Lakshmi Nair", medicine: "Ferrous Sulfate 325mg", status: "Delivered" as const },
  { id: 5, patientName: "Rajesh Patel", medicine: "Folic Acid 5mg", status: "Pending" as const },
];

const ManualDelivery = () => {
  const [deliveries, setDeliveries] = useState(initialDeliveries);

  const toggleStatus = (id: number) => {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: d.status === "Pending" ? "Delivered" : "Pending" } : d
      )
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-accent">
            <Truck className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Manual Delivery</h2>
            <p className="text-sm text-muted-foreground">Track and update medicine delivery status</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide">Patient Name</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide">Medicine</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground uppercase tracking-wide">Toggle</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{d.patientName}</td>
                  <td className="px-4 py-3 text-foreground">{d.medicine}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        d.status === "Delivered" ? "risk-badge-low" : "risk-badge-moderate"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={d.status === "Delivered"}
                      onCheckedChange={() => toggleStatus(d.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManualDelivery;
