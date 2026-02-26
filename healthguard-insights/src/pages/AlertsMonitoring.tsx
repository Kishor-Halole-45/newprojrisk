import { useState } from "react";
import { Bell, AlertCircle, Check } from "lucide-react";

const initialAlerts = [
  { id: 1, title: "Hemoglobin check due", patient: "Ramesh Kumar", time: "2 hours ago", read: false },
  { id: 2, title: "Iron supplement reminder", patient: "Sita Devi", time: "5 hours ago", read: false },
  { id: 3, title: "Follow-up visit scheduled", patient: "Vijay Singh", time: "1 day ago", read: true },
  { id: 4, title: "Low hemoglobin alert", patient: "Lakshmi Nair", time: "2 days ago", read: false },
  { id: 5, title: "Nutrition counseling due", patient: "Rajesh Patel", time: "3 days ago", read: true },
];

const AlertsMonitoring = () => {
  const [alerts, setAlerts] = useState(initialAlerts);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markRead = (id: number) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="stat-card">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative p-3 rounded-2xl bg-accent">
              <Bell className="w-6 h-6 text-accent-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Alerts & Monitoring</h2>
              <p className="text-sm text-muted-foreground">Notification cards and reminders</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl p-4 border transition-all ${
                a.read ? "bg-muted border-border" : "bg-accent/50 border-accent-foreground/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.patient}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.time}</p>
                  </div>
                </div>
                {!a.read && (
                  <button
                    onClick={() => markRead(a.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsMonitoring;
