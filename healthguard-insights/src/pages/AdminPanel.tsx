import { useState } from "react";
import { Settings, Plus, Trash2, Users, Activity } from "lucide-react";
import { useExtraPatients } from "@/context/ExtraPatientsContext";
import type { DataRecord } from "@/data/dataset";

const AdminPanel = () => {
  const [patients, setPatients] = useState([
    { id: 1, name: "Test Patient", age: 35, bmi: 22, hemoglobin: 12, income: 45000 },
  ]);
  const [form, setForm] = useState({ name: "", age: "", bmi: "", hemoglobin: "", income: "" });
  const { combinedData, addExtraPatient } = useExtraPatients();

  const addPatient = () => {
    if (!form.name.trim()) return;
    const age = parseInt(form.age) || 0;
    const bmi = parseFloat(form.bmi) || 0;
    const hemoglobin = parseFloat(form.hemoglobin) || 0;
    const income = parseInt(form.income) || 0;

    setPatients((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: form.name,
        age,
        bmi,
        hemoglobin,
        income,
      },
    ]);

    // Derive a simple risk level for the added patient
    let riskLevel: DataRecord["riskLevel"];
    if (hemoglobin < 11) riskLevel = "High";
    else if (bmi < 18.5) riskLevel = "Medium";
    else riskLevel = "Low";

    const extraRecord: DataRecord = {
      age,
      gender: "Female",
      bmi,
      hemoglobin,
      incomeLevel: income,
      region: "Urban",
      healthHistory: false,
      riskLevel,
    };
    addExtraPatient(extraRecord);

    setForm({ name: "", age: "", bmi: "", hemoglobin: "", income: "" });
  };

  const deletePatient = (id: number) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  const totalRecords = combinedData.length;
  const highRisk = combinedData.filter((r) => r.riskLevel === "High").length;
  const lowHb = combinedData.filter((r) => r.hemoglobin < 12).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-accent">
            <Settings className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">Manage patients and view system stats</p>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-4">System Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-muted rounded-2xl p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{totalRecords}</p>
              <p className="text-xs text-muted-foreground">Total Records</p>
            </div>
          </div>
          <div className="bg-muted rounded-2xl p-4 flex items-center gap-3">
            <Activity className="w-5 h-5 text-risk-high" />
            <div>
              <p className="text-2xl font-bold text-foreground">{highRisk}</p>
              <p className="text-xs text-muted-foreground">High Risk</p>
            </div>
          </div>
          <div className="bg-muted rounded-2xl p-4 flex items-center gap-3">
            <Activity className="w-5 h-5 text-risk-moderate" />
            <div>
              <p className="text-2xl font-bold text-foreground">{lowHb}</p>
              <p className="text-xs text-muted-foreground">Low Hemoglobin</p>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-4">Add Patient</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Name"
            className="px-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="number"
            value={form.age}
            onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
            placeholder="Age"
            className="px-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="number"
            value={form.bmi}
            onChange={(e) => setForm((p) => ({ ...p, bmi: e.target.value }))}
            placeholder="BMI"
            className="px-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="number"
            value={form.hemoglobin}
            onChange={(e) => setForm((p) => ({ ...p, hemoglobin: e.target.value }))}
            placeholder="Hemoglobin"
            className="px-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="number"
            value={form.income}
            onChange={(e) => setForm((p) => ({ ...p, income: e.target.value }))}
            placeholder="Income"
            className="px-4 py-3 bg-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={addPatient}
          className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Patient
        </button>

        <h3 className="text-sm font-semibold text-foreground mt-8 mb-4">Patients (Local)</h3>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Age</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">BMI</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Hb</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Income</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-foreground">{p.age}</td>
                  <td className="px-4 py-3 text-foreground">{p.bmi}</td>
                  <td className="px-4 py-3 text-foreground">{p.hemoglobin}</td>
                  <td className="px-4 py-3 text-foreground">₹{p.income.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deletePatient(p.id)}
                      className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

export default AdminPanel;
