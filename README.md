<<<<<<< HEAD
# NutriGuard AI

Health analytics and risk prediction platform.

## How to Run in VS Code

### 1. Start the FastAPI Backend (Port 8000)

Open a terminal in VS Code (`Ctrl+``) and run:

```powershell
cd c:\Users\KISHOR\proj
pip install -r api\requirements.txt
uvicorn api.main:app --reload --port 8000
```

The API runs at **http://localhost:8000**.

### 2. Start the Frontend

Open a **second** terminal and run:

```powershell
cd c:\Users\KISHOR\proj\healthguard-insights
npm install
npm run dev
```

The app runs at **http://localhost:8080** (or **http://localhost:5173** if using default Vite port).

### 3. Use the App

1. Open the app URL in your browser
2. Go to **Individual Risk Prediction** — enter BMI, Hemoglobin, etc. and click **Predict Risk Level**
3. Navigate other pages: Vulnerable Groups, Hotspot Detection, Doctor Recommendation, Financial Aid, Manual Delivery, Alerts, AI Translator, Reports, Admin Panel

---

## Project Structure

```
proj/
├── api/
│   ├── main.py             # FastAPI – POST /predict on port 8000
│   └── requirements.txt    # fastapi, uvicorn
├── healthguard-insights/   # React frontend (Vite, Tailwind)
│   └── src/
│       ├── pages/          # Dashboard, GeoMap, Predict + 9 new pages
│       └── components/
└── README.md
```

## Prediction Logic (API)

- Hemoglobin < 11 → **High** risk  
- BMI < 18.5 → **Medium** risk  
- Otherwise → **Low** risk
=======
# Final_risk_pred
>>>>>>> 279b7418f290bc30c3d73a5561a2bd33ef367c54
