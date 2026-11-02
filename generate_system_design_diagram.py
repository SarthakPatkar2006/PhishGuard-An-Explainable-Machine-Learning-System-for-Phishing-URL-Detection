import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Set writable cache dir
os.environ['MPLCONFIGDIR'] = os.path.join(os.getcwd(), 'tmp_mpl')
os.makedirs('tmp_mpl', exist_ok=True)

output_dir = os.path.join(os.getcwd(), 'docs', 'diagrams')
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, 'system_design_architecture.png')

# Color palette: Dark High-Tech Cyber Theme
BG_COLOR = "#040c18"
CONTAINER_BG = "#08162b"
CARD_BG = "#0c203b"
CARD_BG_SECONDARY = "#07172b"

# Accent colors
CYAN = "#00d2ff"
EMERALD = "#10b981"
AMBER = "#f59e0b"
ROSE = "#f43f5e"
PURPLE = "#a855f7"
BLUE = "#3b82f6"

TEXT_TITLE = "#ffffff"
TEXT_SUBTITLE = "#94a3b8"
TEXT_BODY = "#cbd5e1"
TEXT_MUTED = "#64748b"

fig, ax = plt.subplots(figsize=(24, 14.5), facecolor=BG_COLOR)
ax.set_facecolor(BG_COLOR)
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

# -------------------------------------------------------------
# 0. HEADER SECTION
# -------------------------------------------------------------
header_box = patches.FancyBboxPatch((2, 92), 96, 6.5, boxstyle="round,pad=0.5,rounding_size=1.0",
                                   facecolor="#061324", edgecolor=CYAN, linewidth=2)
ax.add_patch(header_box)
ax.text(50, 96.2, "PHISHGUARD : SYSTEM DESIGN & TECHNICAL ARCHITECTURE BLUEPRINT",
        color=TEXT_TITLE, fontsize=17, fontweight='bold', ha='center', va='center')
ax.text(50, 93.6, "End-to-End Level-2 MLOps Platform  •  Real-Time URL Threat Analysis  •  Two-Tier Explainable AI (SHAP + LLM)  •  Decoupled Observability",
        color=CYAN, fontsize=10, ha='center', va='center')

# Helper function to draw rounded container zones
def draw_zone(x, y, w, h, title, border_color, tag=""):
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.8,rounding_size=1.2",
                                  facecolor=CONTAINER_BG, edgecolor=border_color, linewidth=2, linestyle='-')
    ax.add_patch(rect)
    # Zone Title Banner
    banner = patches.FancyBboxPatch((x + 0.8, y + h - 3.8), w - 1.6, 3.2, boxstyle="round,pad=0.2,rounding_size=0.6",
                                    facecolor="#05101f", edgecolor=border_color, linewidth=1.2)
    ax.add_patch(banner)
    ax.text(x + 2, y + h - 2.2, title.upper(), color=border_color, fontsize=11, fontweight='bold', va='center')
    if tag:
        ax.text(x + w - 2, y + h - 2.2, tag, color=TEXT_MUTED, fontsize=8.5, fontweight='bold', ha='right', va='center')

# Helper function for internal module cards
def draw_card(x, y, w, h, title, subtitle, bullets, accent_color, badge=""):
    card = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5,rounding_size=0.8",
                                  facecolor=CARD_BG, edgecolor=accent_color, linewidth=1.3)
    ax.add_patch(card)
    ax.text(x + 1.2, y + h - 1.8, title, color=accent_color, fontsize=9.5, fontweight='bold', va='center')
    if badge:
        ax.text(x + w - 1.2, y + h - 1.8, badge, color=TEXT_TITLE, fontsize=7.5,
                bbox=dict(boxstyle="round,pad=0.2", facecolor=accent_color, edgecolor='none'), ha='right', va='center')
    if subtitle:
        ax.text(x + 1.2, y + h - 3.3, subtitle, color=TEXT_SUBTITLE, fontsize=8, style='italic', va='center')
    
    y_text = y + h - 5.0
    for b in bullets:
        ax.text(x + 1.2, y_text, f"• {b}", color=TEXT_BODY, fontsize=7.8, va='center')
        y_text -= 1.6

# -------------------------------------------------------------
# 1. ZONE 1: CLIENT & ACCESS LAYER (Top Left: x=2, y=49, w=22, h=41)
# -------------------------------------------------------------
draw_zone(2, 49, 22, 41, "1. Client & Access Layer", CYAN, "PORT: 5173 / 8000")

draw_card(3.5, 75, 19, 11, "React 19 Cyber SPA", "Vite + TypeScript + Tailwind",
          ["Modern Single-Page Cyber UI", "/analyze: Real-Time Scanner", "/monitoring: MLOps Telemetry", "/dashboard: SecOps History"],
          CYAN, "CLIENT UI")

draw_card(3.5, 62, 19, 11, "API & External Consumers", "RESTful JSON Gateway",
          ["Security Operations Center (SOC)", "Automated SIEM Webhooks", "API Keys & Bearer Session Auth", "Batch CSV Scan Submissions"],
          BLUE, "CONSUMERS")

draw_card(3.5, 50.5, 19, 9.5, "Network & Edge Protocol", "ASGI Non-Blocking Transport",
          ["CORS & Content Security Policy", "Strict Input Length Boundaries", "Sub-40ms Client-to-Edge SLA"],
          TEXT_SUBTITLE, "EDGE")

# -------------------------------------------------------------
# 2. ZONE 2: INFERENCE & APPLICATION ENGINE (Top Center: x=26, y=49, w=44, h=41)
# -------------------------------------------------------------
draw_zone(26, 49, 44, 41, "2. High-Concurrency Serving Engine (FastAPI Microservice)", EMERALD, "PORT: 8000")

# Sub-card 2A: Async URL Feature Extractor
draw_card(27.5, 73.5, 19.5, 12.5, "URL Feature Extractor", "url_feature_extractor.py",
          ["30 Signals Extracted in <25ms", "Lexical: IP, Length, Subdomains", "SSL: Authority, Expiration, CA", "DOM/HTML: Anchor tag %, Forms"],
          EMERALD, "FEATURE ENG")

# Sub-card 2B: Champion Inference Engine
draw_card(49, 73.5, 19.5, 12.5, "Champion Model Inference", "Random Forest Classifier",
          ["100 Ensembled Decision Trees", "Ternary Input: {-1, 0, +1}", "Preprocessed via preprocessor.pkl", "Inference Speed: < 12ms | F1: 97.4%"],
          EMERALD, "CHAMPION")

# Sub-card 2C: Data Validation & Imputation Pipeline
draw_card(27.5, 52, 19.5, 19, "Data Pipeline & Imputation", "networksecurity/pipeline",
          ["Strict Schema Check (30 cols)", "KNNImputer (k=3, Euclidean)", "StandardScaler Feature Scaling", "Zero Data-Leakage Serialization", "Artifact: final_model/preprocessor.pkl"],
          CYAN, "PREPROCESSOR")

# Sub-card 2D: User Data & Session Store
draw_card(49, 52, 19.5, 19, "MongoDB Atlas Storage", "Cloud Document Database",
          ["Cluster: mongodb+srv://...", "users: Bcrypt Auth Records", "user_sessions: Active Tokens", "url_prediction_history: Scans", "Compound Indexes {user_id, time}"],
          PURPLE, "PERSISTENCE")

# -------------------------------------------------------------
# 3. ZONE 3: TWO-TIER EXPLAINABLE AI (XAI) (Top Right: x=72, y=49, w=26, h=41)
# -------------------------------------------------------------
draw_zone(72, 49, 26, 41, "3. Two-Tier Explainable AI (XAI)", AMBER, "HYBRID ATTRIBUTION")

# Tier 1
draw_card(73.5, 73.5, 23, 12.5, "Tier 1: TreeSHAP Engine", "Mathematical Attribution",
          ["Cooperative Game Theory math", "Exact Shapley Values: O(TLD^2)", "Extracts top +/- feature weights", "Guarantees 4 Shapley Axioms", "Artifact: shap.TreeExplainer"],
          AMBER, "MATH PROOF")

# Tier 2
draw_card(73.5, 57, 23, 14.5, "Tier 2: Google Gemini 2.5 Flash", "Contextual Threat Synthesis",
          ["Grounded Prompt Engineering", "Strict Zero-Hallucination rule", "Input: Top SHAP factors + Verdict", "Output: 3-Part Analyst Briefing", "  • Assessment • Evidence • Recs"],
          AMBER, "LLM SYNTHESIS")

# Fallback Box
draw_card(73.5, 50.5, 23, 5.2, "Resilience Fallback Engine", "Deterministic Rule Templates",
          ["Local rule-based backup if Gemini timeout > 10s"],
          TEXT_SUBTITLE, "FALLBACK")

# -------------------------------------------------------------
# 4. ZONE 4: REAL-TIME TELEMETRY & OBSERVABILITY (Bottom Right: x=51, y=4, w=47, h=42)
# -------------------------------------------------------------
draw_zone(51, 4, 47, 42, "4. Decoupled Observability & Metrics Stack", ROSE, "PROMETHEUS + GRAFANA")

# Sub-card 4A: In-Memory Telemetry Engine
draw_card(52.5, 24, 21, 18, "In-Memory Model Telemetry", "networksecurity/utils/telemetry.py",
          ["Sliding Request Window (N=50..500)", "Latency Percentiles (p50, p95, p99)", "Live Throughput (RPM) Counter", "Verdict Distribution (Phish vs Legit)", "Error Rate & System Uptime", "Zero latency penalty to prediction"],
          ROSE, "IN-MEMORY")

# Sub-card 4B: OpenMetrics Exporter
draw_card(75.5, 24, 21, 18, "OpenMetrics Exporter", "FastAPI /metrics Endpoint",
          ["Exposes OpenMetrics standards", "phishing_requests_total (Counter)", "phishing_latency_ms (Gauges)", "phishing_feature_drift_score", "phishing_throughput_rpm", "Scraped via HTTP GET pull"],
          ROSE, "OPENMETRICS")

# Sub-card 4C: Prometheus
draw_card(52.5, 6, 21, 16, "Prometheus Server", "Container: phishguard-prometheus",
          ["Port: 9090 (Pull architecture)", "Scrape interval: 5 seconds", "Scrape Target: host.docker.internal:8000", "Local Time-Series TSDB", "PromQL Query Engine"],
          ROSE, "PORT: 9090")

# Sub-card 4D: Grafana
draw_card(75.5, 6, 21, 16, "Grafana Production UI", "Container: phishguard-grafana",
          ["Port: 3000 (Dark Cyber Theme)", "Pre-provisioned DataSource & JSON", "Panels: p50/p95 Gauge, Drift Score", "Timeseries: Threat Ratios & RPM", "Anonymous Admin Access enabled"],
          AMBER, "PORT: 3000")

# -------------------------------------------------------------
# 5. ZONE 5: DATA DRIFT & CONTINUOUS RETRAINING (Bottom Left: x=2, y=4, w=47, h=42)
# -------------------------------------------------------------
draw_zone(2, 4, 47, 42, "5. Statistical Drift & Closed Retraining Loop (MLOps L2)", PURPLE, "DVC + MLFLOW")

# Sub-card 5A: Statistical Drift Engine
draw_card(3.5, 24, 21, 18, "Statistical Drift Monitor", "Continuous Covariate Shift",
          ["Baseline Anchor: 11,055 records", "Computes shift: Δ = |μ_live - μ_base| / σ", "Drift Index: D = (1/k) Σ Δ_i", "Threshold D >= 0.25 triggers alarm", "Automated Retraining Advisory", "Protects against concept decay"],
          PURPLE, "DRIFT ENGINE")

# Sub-card 5B: DVC Reproducible Pipeline
draw_card(26, 24, 21, 18, "DVC Pipeline (dvc.yaml)", "Reproducible ML Stages",
          ["Stage 1: data_ingestion (Atlas/CSV)", "Stage 2: data_validation (Schema)", "Stage 3: data_transformation (KNN)", "Stage 4: model_trainer (Tournament)", "Stage 5: model_evaluation (F1 Score)", "Executed via: dvc repro / /train"],
          CYAN, "DVC DAG")

# Sub-card 5C: MLflow Tracking & DagsHub
draw_card(3.5, 6, 21, 16, "MLflow & DagsHub Registry", "Experiment & Model Management",
          ["Remote Tracking: dagshub.com/...", "Logs F1, Recall, Precision, ROC-AUC", "Artifact Repository (models, confusion)", "Model Registry Champion Tagging", "Full Hyperparameter Auditing"],
          BLUE, "EXPERIMENT")

# Sub-card 5D: Automated Model Hot-Swap
draw_card(26, 6, 21, 16, "Atomic Model Promotion", "Zero-Downtime Deployment",
          ["Champion vs Candidate Benchmark", "Candidate accepted if F1 > Champion", "Atomic swap into final_model/model.pkl", "In-memory reload without reboot", "Guarantees 100% service availability"],
          EMERALD, "HOT-SWAP")

# -------------------------------------------------------------
# ARROWS & DATA FLOW CONNECTORS
# -------------------------------------------------------------
def draw_arrow(x1, y1, x2, y2, color, text="", rad=0.0):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=color, lw=2.2, mutation_scale=16,
                                connectionstyle=f"arc3,rad={rad}"))
    if text:
        xm, ym = (x1 + x2)/2, (y1 + y2)/2
        ax.text(xm, ym + 0.9, text, color=color, fontsize=8, fontweight='bold', ha='center', va='center',
                bbox=dict(boxstyle="round,pad=0.2", facecolor=BG_COLOR, edgecolor=color, alpha=0.9))

# 1 -> 2: Client to Feature Extractor
draw_arrow(22.5, 78, 27.5, 78, CYAN, "POST /predict-url")

# 2A -> 2B: Extractor to Champion Model
draw_arrow(47, 80, 49, 80, EMERALD, "30 features")

# 2B -> 3A: Champion to TreeSHAP
draw_arrow(68.5, 80, 73.5, 80, AMBER, "Trees + Pred")

# 3A -> 3B: TreeSHAP to Gemini
draw_arrow(85, 73.5, 85, 71.5, AMBER, "Top SHAP factors")

# 2B -> 4A: Champion Model to Telemetry
draw_arrow(58, 73.5, 58, 42, ROSE, "Latency & Verdict", rad=0.1)

# 4A -> 4B: Telemetry to OpenMetrics
draw_arrow(73.5, 33, 75.5, 33, ROSE, "Metrics Buffer")

# 4B -> 4C: OpenMetrics to Prometheus
draw_arrow(82, 24, 73.5, 14, ROSE, "Scrape (5s pull)", rad=0.1)

# 4C -> 4D: Prometheus to Grafana
draw_arrow(73.5, 14, 75.5, 14, AMBER, "PromQL Queries")

# 2A -> 5A: Features to Drift Engine
draw_arrow(37, 73.5, 14, 42, PURPLE, "Live Feature Vector", rad=-0.15)

# 5A -> 5B: Drift Alarm to DVC
draw_arrow(24.5, 33, 26, 33, PURPLE, "Drift D >= 0.25")

# 5B -> 5C: DVC to MLflow
draw_arrow(26, 24, 18, 22, BLUE, "Metrics log", rad=0.1)

# 5B -> 5D: DVC to Model Hot-Swap
draw_arrow(36.5, 24, 36.5, 22, EMERALD, "New Candidate")

# 5D -> 2B: Hot-Swap back to Active Serving Engine (Closed Loop)
draw_arrow(36.5, 22, 53, 73.5, EMERALD, "Atomic Hot-Swap (final_model/model.pkl)", rad=0.25)

# Client back-response
draw_arrow(27.5, 76, 22.5, 76, CYAN, "Verdict + XAI Report")

plt.tight_layout()
plt.savefig(output_path, dpi=250, facecolor=BG_COLOR)
plt.close()
print(f"System Design Architecture diagram generated successfully at: {output_path}")
