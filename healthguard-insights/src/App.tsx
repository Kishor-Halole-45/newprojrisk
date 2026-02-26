import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import GeoMap from "./pages/GeoMap";
import Predict from "./pages/Predict";
import VulnerableGroups from "./pages/VulnerableGroups";
import HotspotDetection from "./pages/HotspotDetection";
import DoctorRecommendation from "./pages/DoctorRecommendation";
import FinancialAid from "./pages/FinancialAid";
import ManualDelivery from "./pages/ManualDelivery";
import AlertsMonitoring from "./pages/AlertsMonitoring";
import BMICalculator from "./pages/BMICalculator.tsx";
import Reports from "./pages/Reports";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<GeoMap />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/bmi-calculator" element={<BMICalculator />} />
            <Route path="/vulnerable" element={<VulnerableGroups />} />
            <Route path="/hotspots" element={<HotspotDetection />} />
            <Route path="/doctors" element={<DoctorRecommendation />} />
            <Route path="/financial-aid" element={<FinancialAid />} />
            <Route path="/manual-delivery" element={<ManualDelivery />} />
            <Route path="/alerts" element={<AlertsMonitoring />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
