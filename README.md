# Network Security Phishing Detection

Network Security Phishing Detection is a machine learning web application that analyzes website URLs and CSV feature datasets to predict whether a target is legitimate or phishing. The project includes a FastAPI backend, MongoDB storage, MLflow/DagsHub experiment tracking, model comparison, Gemini-powered result summaries, and a modern React dashboard.

## 🌐 Live Demo

**Frontend:** [https://frontend-eight-kappa-99.vercel.app](https://frontend-eight-kappa-99.vercel.app)

> Frontend is deployed on **Vercel** and backend API is deployed on **Render** (Docker).

## Screenshots

### Home Page
![Home Page](screenshots/homepage.png)

### Analyze — URL & CSV Prediction
![Analyze Page](screenshots/analyze.png)

### Dashboard — Operational Monitoring
![Dashboard](screenshots/dashboard.png)

### Models — Algorithm Leaderboard
![Models Comparison](screenshots/models.png)

## What The Project Does

- Predicts phishing or legitimate websites from URL input.
- Converts a URL into model-ready phishing detection features.
- Supports batch CSV prediction using the same trained model schema.
- Stores logged-in users and their URL prediction history in MongoDB.
- Shows user-specific history, dashboard metrics, and prediction summaries.
- Compares multiple ML algorithms:
  - Random Forest
  - XGBoost
  - Logistic Regression
  - Decision Tree
- Saves the best model and exposes model comparison results in the UI.
- Uses Gemini API to generate a short human-readable explanation for URL predictions.

## Tech Stack

Backend:

- Python
- FastAPI
- MongoDB / MongoDB Atlas
- pandas, NumPy, scikit-learn, XGBoost
- MLflow and DagsHub

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn-style UI components
- Framer Motion
- Recharts

## Project Structure

```text
networksecurity/
  components/          ML pipeline components
  entity/              Config and artifact entities
  pipeline/            Training and prediction pipelines
  utils/               Model utilities and URL feature extraction
frontend/
  src/                 React frontend source
  src/pages/           App pages
  src/components/      Reusable UI components
final_model/           Saved model, preprocessor, comparison report
Network_Data/          Sample phishing feature dataset
app.py                 FastAPI backend application
main.py                Training pipeline runner
push_data.py           Load CSV data into MongoDB
requirements.txt       Backend dependencies
```

## Prerequisites

Install these before setup:

- Python 3.10 recommended
- Conda
- Node.js and npm
- MongoDB local server or MongoDB Atlas
- Git

## Backend Setup

From the project root:

```powershell
conda create --name .env python=3.10
conda activate E:\conda-envs\.env
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If `xgboost` is missing later:

```powershell
pip install xgboost
```

## Environment Variables

Create a `.env` file in the project root.

```env
MONGODB_URL_KEY=mongodb://localhost:27017
MONGO_DB_URL=mongodb://localhost:27017
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
DAGSHUB_REPO_OWNER=Sahilpatil009
DAGSHUB_REPO_NAME=network-security-edi
URL_PREDICTION_COLLECTION_NAME=url_prediction_history
AUTH_USER_COLLECTION_NAME=users
AUTH_SESSION_COLLECTION_NAME=user_sessions
AUTH_SESSION_DAYS=7
```

For MongoDB Atlas, replace both Mongo URLs with your Atlas connection string:

```env
MONGODB_URL_KEY=mongodb+srv://username:password@cluster-url/...
MONGO_DB_URL=mongodb+srv://username:password@cluster-url/...
```

Do not commit `.env`. It is ignored by Git.

## MongoDB Setup

Start MongoDB locally, or configure MongoDB Atlas.

To push the sample dataset into MongoDB:

```powershell
python push_data.py
```

This loads `Network_Data/phisingData.csv` into the configured MongoDB database.

## Train The Model

Run:

```powershell
python main.py
```

This runs:

- Data ingestion
- Data validation
- Data transformation
- Model comparison
- Best model saving
- MLflow tracking

Generated outputs include:

```text
final_model/model.pkl
final_model/preprocessor.pkl
final_model/model_comparison.json
final_model/model_comparison.csv
```

## Run Backend

From the project root:

```powershell
python app.py
```

Backend runs at:

```text
http://127.0.0.1:8000
```

API docs:

```text
http://127.0.0.1:8000/docs
```

If port `8000` is already in use:

```powershell
Get-NetTCPConnection -LocalPort 8000 -State Listen | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force
}
```

Then run:

```powershell
python app.py
```

## Run Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Login And Demo Flow

1. Open `http://localhost:5173/auth`.
2. Create an account or login.
3. Go to Analyze.
4. Enter a URL or upload a CSV.
5. View the result.
6. Open History to see user-specific saved predictions.
7. Open Models to see the model comparison leaderboard.

Sample account for local demo:

```text
Name: Test User
Email: testuser@example.com
Password: test1234
```

## Safe Demo URLs

Use controlled demo URLs instead of real phishing links.

Suspicious examples:

```text
http://192.168.1.10/login
http://https-secure-login.example.test/verify-account
http://bank-account-update.example.test/login
http://security-alert.verify-user.example.test/password-reset
http://free-reward-login.example.test/claim-now
http://login.example.test@192.168.1.10/verify
```

Legitimate comparison examples:

```text
https://example.com
https://github.com/login
https://www.google.com
```

## CSV Prediction

Use the sample dataset:

```text
Network_Data/phisingData.csv
```

The CSV should follow the same feature schema used during training. The backend drops the target column when present and appends `predicted_column` to the output.

Download the latest scored CSV from:

```text
http://127.0.0.1:8000/download-output
```

## Useful Commands

Check frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Check Python syntax:

```powershell
python -m py_compile app.py
```

Check current Git state:

```powershell
git status
```

## Deployment

### Frontend (Vercel)

The React frontend is deployed on Vercel.

- Set `VITE_API_BASE_URL` to the backend URL in Vercel Environment Variables.
- Vercel auto-deploys on push to `main`.

### Backend (Render)

The FastAPI backend is deployed on Render using Docker.

- Runtime: Docker (uses the `Dockerfile` in the repo root).
- Set `MONGODB_URL_KEY` and `GEMINI_API_KEY` as environment variables in Render.
- Render auto-deploys on push to `main`.
- Free tier services spin down after 15 minutes of inactivity — first request after idle takes ~30-60 seconds.

## Notes

- API routes under `/api/*` require login where user data or model dashboard data is involved.
- `.env` must be configured before running the backend.
- The Gemini summary is optional. If no key is configured, the backend uses a local fallback summary.
- Use safe demo URLs for presentations. Do not open real malicious phishing links.
