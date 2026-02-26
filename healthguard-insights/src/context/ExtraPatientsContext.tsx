import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { dataset, type DataRecord } from "@/data/dataset";

interface ExtraPatientsContextValue {
  extraPatients: DataRecord[];
  addExtraPatient: (patient: DataRecord) => void;
  combinedData: DataRecord[];
}

const ExtraPatientsContext = createContext<ExtraPatientsContextValue | undefined>(undefined);

export const ExtraPatientsProvider = ({ children }: { children: ReactNode }) => {
  const [extraPatients, setExtraPatients] = useState<DataRecord[]>([]);

  const addExtraPatient = (patient: DataRecord) => {
    setExtraPatients((prev) => [...prev, patient]);
  };

  const combinedData = useMemo(() => {
    if (!extraPatients.length) return dataset;
    return [...dataset, ...extraPatients];
  }, [extraPatients]);

  const value: ExtraPatientsContextValue = {
    extraPatients,
    addExtraPatient,
    combinedData,
  };

  return <ExtraPatientsContext.Provider value={value}>{children}</ExtraPatientsContext.Provider>;
};

export const useExtraPatients = () => {
  const ctx = useContext(ExtraPatientsContext);
  if (!ctx) {
    throw new Error("useExtraPatients must be used within ExtraPatientsProvider");
  }
  return ctx;
};

