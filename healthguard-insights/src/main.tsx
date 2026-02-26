import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ExtraPatientsProvider } from "./context/ExtraPatientsContext";

createRoot(document.getElementById("root")!).render(
  <ExtraPatientsProvider>
    <App />
  </ExtraPatientsProvider>,
);
