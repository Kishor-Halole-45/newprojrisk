import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, MapPin, UserCheck, Shield, X, Users, Thermometer, Stethoscope, Banknote, Truck, Bell, Activity, FileDown, Settings } from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Geospatial Risk Map", path: "/map", icon: MapPin },
  { title: "Individual Risk Prediction", path: "/predict", icon: UserCheck },
  { title: "BMI Calculator", path: "/bmi-calculator", icon: Activity },
  { title: "Vulnerable Groups", path: "/vulnerable", icon: Users },
  { title: "Hotspot Detection", path: "/hotspots", icon: Thermometer },
  { title: "Doctor Recommendation", path: "/doctors", icon: Stethoscope },
  { title: "Financial Aid", path: "/financial-aid", icon: Banknote },
  { title: "Manual Delivery", path: "/manual-delivery", icon: Truck },
  { title: "Alerts Monitoring", path: "/alerts", icon: Bell },
  { title: "Reports", path: "/reports", icon: FileDown },
  { title: "Admin Panel", path: "/admin", icon: Settings },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

const AppSidebar = ({ open, onClose }: AppSidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-foreground/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[280px] bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-2xl bg-sidebar-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-sidebar-primary tracking-tight">NutriGuard AI</h1>
            <p className="text-xs text-sidebar-muted">Health Analytics</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-sidebar-accent">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted px-3 mb-4">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === "/dashboard" && location.pathname === "/");
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-sidebar-accent/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-muted">
            © 2026 NutriGuard AI
          </p>
          <p className="text-xs text-sidebar-muted mt-0.5">
            Ministry of Health & Family Welfare
          </p>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
