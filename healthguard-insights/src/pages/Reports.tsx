import { FileDown, FileText } from "lucide-react";
import { dataset } from "@/data/dataset";

const Reports = () => {
  const downloadCSV = () => {
    const headers = ["age", "gender", "bmi", "hemoglobin", "incomeLevel", "region", "healthHistory", "riskLevel"];
    const rows = dataset.map((r) =>
      [r.age, r.gender, r.bmi, r.hemoglobin, r.incomeLevel, r.region, r.healthHistory ? "Yes" : "No", r.riskLevel].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nutriguard-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const summary = `NutriGuard AI Report\nGenerated: ${new Date().toLocaleString()}\n\nTotal Records: ${dataset.length}\nLow Risk: ${dataset.filter((r) => r.riskLevel === "Low").length}\nMedium Risk: ${dataset.filter((r) => r.riskLevel === "Medium").length}\nHigh Risk: ${dataset.filter((r) => r.riskLevel === "High").length}`;
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nutriguard-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-accent">
            <FileDown className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Reports</h2>
            <p className="text-sm text-muted-foreground">Export data and generate reports</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-4 p-6 bg-muted rounded-2xl hover:bg-muted/80 transition-colors text-left"
          >
            <div className="p-3 rounded-2xl bg-primary/10">
              <FileDown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Download CSV</p>
              <p className="text-sm text-muted-foreground">Export dataset as CSV file</p>
            </div>
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-4 p-6 bg-muted rounded-2xl hover:bg-muted/80 transition-colors text-left"
          >
            <div className="p-3 rounded-2xl bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Export PDF</p>
              <p className="text-sm text-muted-foreground">Generate summary report</p>
            </div>
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">{dataset.length} records available for export</p>
      </div>
    </div>
  );
};

export default Reports;
