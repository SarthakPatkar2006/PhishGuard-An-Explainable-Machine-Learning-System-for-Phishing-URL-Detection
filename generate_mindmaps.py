import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Ensure temp directory for mplconfigdir
os.environ['MPLCONFIGDIR'] = os.path.join(os.getcwd(), 'tmp_mpl')
os.makedirs('tmp_mpl', exist_ok=True)
output_dir = os.path.join(os.getcwd(), 'docs', 'interview_prep')
os.makedirs(output_dir, exist_ok=True)

# Common styling
BG_COLOR = "#071322"
CARD_BG = "#0d2038"
ACCENT_CYAN = "#06b6d4"
ACCENT_GREEN = "#10b981"
ACCENT_AMBER = "#f59e0b"
ACCENT_ROSE = "#f43f5e"
ACCENT_PURPLE = "#8b5cf6"
TEXT_WHITE = "#ffffff"
TEXT_MUTED = "#94a3b8"

# -------------------------------------------------------------
# Mindmap 1: End-to-End MLOps System Architecture
# -------------------------------------------------------------
def create_architecture_mindmap():
    fig, ax = plt.subplots(figsize=(16, 9), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Title
    ax.text(50, 95, "PhishGuard: End-to-End MLOps Architecture & System Lifecycle",
            color=TEXT_WHITE, fontsize=18, fontweight='bold', ha='center', va='center')
    ax.text(50, 91.5, "Level-2 Production MLOps with Automated Reproducibility, Observability & Explainable AI",
            color=ACCENT_CYAN, fontsize=11, ha='center', va='center')

    # Core Stages
    stages = [
        {"x": 10, "y": 68, "w": 16, "h": 16, "color": ACCENT_CYAN, "title": "1. Data Ingestion\n& Schema Validation", "desc": "• MongoDB Atlas Cluster\n• 11,055 Baseline URLs\n• 30 Features Schema Check\n• DVC Data Versioning"},
        {"x": 30, "y": 68, "w": 16, "h": 16, "color": ACCENT_PURPLE, "title": "2. Transformation\n& Preprocessing", "desc": "• KNN Feature Imputation\n• Standard Scaling Pipeline\n• Train/Test Split (80/20)\n• Pickled Preprocessor Artifact"},
        {"x": 50, "y": 68, "w": 16, "h": 16, "color": ACCENT_GREEN, "title": "3. Multi-Model\nBenchmarking", "desc": "• Random Forest (Champion)\n• XGBoost & Gradient Boost\n• Decision Trees & AdaBoost\n• Hyperparameter Tuning"},
        {"x": 70, "y": 68, "w": 16, "h": 16, "color": ACCENT_AMBER, "title": "4. Tracking &\nModel Registry", "desc": "• MLflow Tracking Server\n• DagsHub Remote Storage\n• Metrics (F1, Accuracy, AUC)\n• Model Registry Promotion"},
        {"x": 90, "y": 68, "w": 16, "h": 16, "color": ACCENT_ROSE, "title": "5. Automated CI/CD\n& Deployment", "desc": "• GitHub Actions CI/CD\n• 12 Integration Tests\n• Multi-Stage Dockerfile\n• Docker Compose Orch."},
    ]

    for s in stages:
        rect = patches.FancyBboxPatch((s["x"] - s["w"]/2, s["y"] - s["h"]/2), s["w"], s["h"],
                                      boxstyle="round,pad=0.8,rounding_size=1.5",
                                      facecolor=CARD_BG, edgecolor=s["color"], linewidth=2)
        ax.add_patch(rect)
        ax.text(s["x"], s["y"] + 4.5, s["title"], color=s["color"], fontsize=10.5, fontweight='bold', ha='center', va='center')
        ax.text(s["x"], s["y"] - 2.5, s["desc"], color=TEXT_MUTED, fontsize=8, ha='center', va='center', linespacing=1.4)

    # Arrows between top pipeline stages
    for i in range(len(stages)-1):
        x1 = stages[i]["x"] + stages[i]["w"]/2 + 0.5
        x2 = stages[i+1]["x"] - stages[i+1]["w"]/2 - 0.5
        y = stages[i]["y"]
        ax.annotate("", xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle="->", color=ACCENT_CYAN, lw=2, mutation_scale=15))

    # Center Serving Engine Box
    center_rect = patches.FancyBboxPatch((20, 26), 60, 24,
                                        boxstyle="round,pad=1.2,rounding_size=2.0",
                                        facecolor="#05192d", edgecolor=ACCENT_CYAN, linewidth=2.5)
    ax.add_patch(center_rect)
    ax.text(50, 46.5, "PRODUCTION SERVING ENGINE (FastAPI + ASGI + Docker)",
            color=TEXT_WHITE, fontsize=13, fontweight='bold', ha='center')

    # Sub-blocks inside Serving Engine
    serving_blocks = [
        {"x": 30, "y": 35, "w": 17, "h": 12, "color": ACCENT_CYAN, "title": "Real-Time URL Scanner", "desc": "• Async Feature Extractor\n• 30 Features in <40ms\n• Microsecond RF Predict"},
        {"x": 50, "y": 35, "w": 17, "h": 12, "color": ACCENT_GREEN, "title": "Explainable AI (XAI)", "desc": "• Local TreeSHAP Math\n• Real-Time Factor Attribution\n• Google Gemini LLM Narrative"},
        {"x": 70, "y": 35, "w": 17, "h": 12, "color": ACCENT_AMBER, "title": "In-Memory Telemetry", "desc": "• Rolling Latency (p50/95/99)\n• RPM Throughput Counter\n• Verdict Ratio Distribution"},
    ]
    for b in serving_blocks:
        r = patches.FancyBboxPatch((b["x"] - b["w"]/2, b["y"] - b["h"]/2), b["w"], b["h"],
                                   boxstyle="round,pad=0.5,rounding_size=1.0",
                                   facecolor="#0c233c", edgecolor=b["color"], linewidth=1.5)
        ax.add_patch(r)
        ax.text(b["x"], b["y"] + 3.2, b["title"], color=b["color"], fontsize=9.5, fontweight='bold', ha='center')
        ax.text(b["x"], b["y"] - 1.8, b["desc"], color=TEXT_MUTED, fontsize=7.5, ha='center', linespacing=1.3)

    # Arrow from Stage 5 to Center Serving
    ax.annotate("", xy=(80, 50), xytext=(90, 60),
                arrowprops=dict(arrowstyle="->", color=ACCENT_ROSE, lw=2, mutation_scale=15, connectionstyle="arc3,rad=-0.2"))

    # Bottom Monitoring & Drift Loop
    bottom_blocks = [
        {"x": 22, "y": 10, "w": 26, "h": 12, "color": ACCENT_ROSE, "title": "Observability Stack (Prometheus + Grafana)", "desc": "• Scrapes /metrics endpoint every 5s\n• Latency percentiles & uptime tracking\n• Pre-provisioned Dark MLOps Dashboard"},
        {"x": 50, "y": 10, "w": 24, "h": 12, "color": ACCENT_AMBER, "title": "Statistical Drift Monitor", "desc": "• L1 / KS distance vs 11,055 Baseline\n• Real-time feature shift tracking\n• 0.25 Threshold Alarm Trigger"},
        {"x": 78, "y": 10, "w": 26, "h": 12, "color": ACCENT_GREEN, "title": "Automated Retraining Advisory", "desc": "• Raised upon elevated drift\n• Triggers DVC pipeline ('dvc repro')\n• Zero-downtime model promotion"},
    ]
    for b in bottom_blocks:
        r = patches.FancyBboxPatch((b["x"] - b["w"]/2, b["y"] - b["h"]/2), b["w"], b["h"],
                                   boxstyle="round,pad=0.6,rounding_size=1.2",
                                   facecolor=CARD_BG, edgecolor=b["color"], linewidth=1.8)
        ax.add_patch(r)
        ax.text(b["x"], b["y"] + 3.2, b["title"], color=b["color"], fontsize=9.5, fontweight='bold', ha='center')
        ax.text(b["x"], b["y"] - 2.0, b["desc"], color=TEXT_MUTED, fontsize=7.5, ha='center', linespacing=1.3)

    # Connect Center Serving to Bottom Monitoring
    ax.annotate("", xy=(22, 16), xytext=(35, 26),
                arrowprops=dict(arrowstyle="->", color=ACCENT_ROSE, lw=2, mutation_scale=15))
    ax.annotate("", xy=(50, 16), xytext=(50, 26),
                arrowprops=dict(arrowstyle="->", color=ACCENT_AMBER, lw=2, mutation_scale=15))
    ax.annotate("", xy=(65, 10), xytext=(62, 10),
                arrowprops=dict(arrowstyle="->", color=ACCENT_AMBER, lw=2, mutation_scale=15))

    # Feedback loop arrow from Retraining Advisory back to Stage 1 Ingestion
    ax.annotate("", xy=(10, 60), xytext=(78, 16),
                arrowprops=dict(arrowstyle="->", color=ACCENT_GREEN, lw=2.5, linestyle="--",
                                mutation_scale=18, connectionstyle="arc3,rad=-0.4"))
    ax.text(32, 18.5, "Closed Retraining Feedback Loop (dvc repro)", color=ACCENT_GREEN, fontsize=9.5, fontweight='bold', rotation=-7)

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "mindmap_system_architecture.png"), dpi=200, facecolor=BG_COLOR)
    plt.close()
    print("Created mindmap_system_architecture.png")

# -------------------------------------------------------------
# Mindmap 2: 30 URL Features Taxonomy Mindmap
# -------------------------------------------------------------
def create_features_mindmap():
    fig, ax = plt.subplots(figsize=(16, 9), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Title
    ax.text(50, 95, "PhishGuard: 30 URL Security Features Taxonomy",
            color=TEXT_WHITE, fontsize=18, fontweight='bold', ha='center')
    ax.text(50, 91.5, "Hierarchical Breakdown of Heuristic, Syntactic, DNS & Content-Based Threat Signals",
            color=ACCENT_CYAN, fontsize=11, ha='center')

    # Center Hub
    hub_rect = patches.FancyBboxPatch((40, 44), 20, 12,
                                      boxstyle="round,pad=1.0,rounding_size=2.0",
                                      facecolor="#05192d", edgecolor=ACCENT_CYAN, linewidth=2.5)
    ax.add_patch(hub_rect)
    ax.text(50, 51.5, "30 Extracted\nURL Signals", color=TEXT_WHITE, fontsize=13, fontweight='bold', ha='center', va='center')
    ax.text(50, 46.5, "Normalized {-1, 0, 1}", color=ACCENT_CYAN, fontsize=9, ha='center')

    # 4 Category Nodes
    categories = [
        {
            "title": "Category 1: Address Bar / Lexical Signals",
            "color": ACCENT_CYAN,
            "x": 20, "y": 72, "w": 34, "h": 22,
            "items": [
                "1. having_IP_Address (Direct IP usage evasion)",
                "2. URL_Length (>54 chars suspicious, >75 phishing)",
                "3. Shortining_Service (tinyurl, bitly masking)",
                "4. having_At_Symbol (@ sign discards prefix)",
                "5. double_slash_redirecting (// in path redirection)",
                "6. Prefix_Suffix (Hyphens in domain e.g. paypal-login)",
                "7. having_Sub_Domain (Excess subdomains e.g. login.verify.bank)"
            ]
        },
        {
            "title": "Category 2: Domain, SSL & Network Authority",
            "color": ACCENT_PURPLE,
            "x": 80, "y": 72, "w": 34, "h": 22,
            "items": [
                "8. SSLfinal_State (Cert age, CA authority, HTTPS valid)",
                "9. Domain_registeration_length (≤1 year expire date)",
                "10. Favicon (Favicon loaded from external origin)",
                "11. port (Non-standard open ports 80/443)",
                "12. HTTPS_token (HTTPS text inside domain name)",
                "13. age_of_domain (Domain registered < 6 months)",
                "14. DNSRecord (Missing or unresolvable DNS entry)"
            ]
        },
        {
            "title": "Category 3: HTML, Anchor & DOM Behavior",
            "color": ACCENT_GREEN,
            "x": 20, "y": 24, "w": 34, "h": 22,
            "items": [
                "15. Request_URL (% assets loaded from foreign domains)",
                "16. URL_of_Anchor (% href='#' or foreign target)",
                "17. Links_in_tags (% <meta>, <script>, <link> external)",
                "18. SFH (Server Form Handler is blank or about:blank)",
                "19. Submitting_to_email (mailto: in form submission)",
                "20. Abnormal_URL (Host does not match WHOIS hostname)",
                "21. Redirect (Total redirect count ≥ 4)"
            ]
        },
        {
            "title": "Category 4: Client-Side JS, Traffic & PageRank",
            "color": ACCENT_AMBER,
            "x": 80, "y": 24, "w": 34, "h": 22,
            "items": [
                "22. on_mouseover (window.status text spoofing)",
                "23. RightClick (event.button==2 disabled inspect)",
                "24. popUpWidnow (JS prompt/alert harvesting fields)",
                "25. Iframe (Invisible 0x0 <iframe> injection)",
                "26. web_traffic (Alexa / Tranco top 100k popularity)",
                "27. Page_Rank (Google PageRank < 0.2)",
                "28. Google_Index (URL indexed in search cache)",
                "29. Links_pointing_to_page (Backlinks pointing count)",
                "30. Statistical_report (Known IP / Domain threat list)"
            ]
        }
    ]

    for cat in categories:
        rect = patches.FancyBboxPatch((cat["x"] - cat["w"]/2, cat["y"] - cat["h"]/2), cat["w"], cat["h"],
                                      boxstyle="round,pad=0.8,rounding_size=1.5",
                                      facecolor=CARD_BG, edgecolor=cat["color"], linewidth=2)
        ax.add_patch(rect)
        ax.text(cat["x"], cat["y"] + cat["h"]/2 - 2.2, cat["title"], color=cat["color"], fontsize=10.5, fontweight='bold', ha='center')

        # List items
        y_cursor = cat["y"] + cat["h"]/2 - 4.8
        for item in cat["items"]:
            ax.text(cat["x"] - cat["w"]/2 + 1.5, y_cursor, item, color=TEXT_MUTED, fontsize=7.8, va='center')
            y_cursor -= 1.8

        # Connect Hub to category
        hx = 50 + (cat["x"] - 50)*0.35
        hy = 50 + (cat["y"] - 50)*0.35
        ax.annotate("", xy=(cat["x"] + (1 if cat["x"] < 50 else -1)*cat["w"]*0.4, cat["y"] + (1 if cat["y"] < 50 else -1)*cat["h"]*0.4),
                    xytext=(50, 50),
                    arrowprops=dict(arrowstyle="->", color=cat["color"], lw=1.8, mutation_scale=14))

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "mindmap_feature_taxonomy.png"), dpi=200, facecolor=BG_COLOR)
    plt.close()
    print("Created mindmap_feature_taxonomy.png")

# -------------------------------------------------------------
# Mindmap 3: Statistical Drift & Telemetry Loop
# -------------------------------------------------------------
def create_drift_mindmap():
    fig, ax = plt.subplots(figsize=(16, 9), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Title
    ax.text(50, 95, "PhishGuard: Statistical Feature Drift & MLOps Telemetry Architecture",
            color=TEXT_WHITE, fontsize=18, fontweight='bold', ha='center')
    ax.text(50, 91.5, "Continuous Distribution Distance Tracking, Prometheus Scrapes & Closed Retraining Loop",
            color=ACCENT_CYAN, fontsize=11, ha='center')

    # 3 Key Columns
    cols = [
        {
            "x": 20, "y": 50, "w": 32, "h": 70, "color": ACCENT_CYAN,
            "title": "A. Baseline Training Distribution",
            "desc": "Baseline Anchor: 11,055 Historical URLs\n(phisingData.csv stored via DVC)\n\n• For each feature i in [1..30]:\n   - Mean: mu_baseline(i)\n   - Standard Dev: sigma_baseline(i)\n   - Range: [-1, +1]\n\n• Top sensitive baseline signals:\n   - URL_of_Anchor: mu = 0.120\n   - having_Sub_Domain: mu = 0.240\n   - web_traffic: mu = 0.520\n   - SSLfinal_State: mu = 0.380\n   - Prefix_Suffix: mu = -0.650"
        },
        {
            "x": 50, "y": 50, "w": 24, "h": 70, "color": ACCENT_AMBER,
            "title": "B. Real-Time Drift Math",
            "desc": "Sliding Sample Window:\nCaptures live URL scans (N=50..500)\n\nRelative Deviation Formula:\nDelta_i = |mu_live(i) - mu_base(i)| / sigma_base(i)\n\nOverall Drift Index (D):\nD = (1 / k) * Sum(Delta_i)\n\nThreshold Policy:\n• D < 0.18: Healthy / Normal\n• 0.18 <= D < 0.25: Moderate Shift\n• D >= 0.25: Critical Drift Detected!\n  -> Automated Retraining Flag Raised"
        },
        {
            "x": 80, "y": 50, "w": 32, "h": 70, "color": ACCENT_ROSE,
            "title": "C. Prometheus & Grafana Stack",
            "desc": "FastAPI OpenMetrics Exporter:\nExposes /metrics every 5 seconds\n\nExported Gauges & Counters:\n• phishing_requests_total\n• phishing_latency_ms{quantile='0.5'}\n• phishing_latency_ms{quantile='0.95'}\n• phishing_latency_ms{quantile='0.99'}\n• phishing_feature_drift_score\n• phishing_throughput_rpm\n• phishing_verdict_total{verdict=...}\n\nGrafana Visualization:\n• Dedicated MLOps Dashboard (port 3000)\n• Dynamic alert rules & timeseries"
        }
    ]

    for c in cols:
        rect = patches.FancyBboxPatch((c["x"] - c["w"]/2, c["y"] - c["h"]/2), c["w"], c["h"],
                                      boxstyle="round,pad=1.0,rounding_size=1.8",
                                      facecolor=CARD_BG, edgecolor=c["color"], linewidth=2)
        ax.add_patch(rect)
        ax.text(c["x"], c["y"] + c["h"]/2 - 3.5, c["title"], color=c["color"], fontsize=12, fontweight='bold', ha='center')
        ax.text(c["x"] - c["w"]/2 + 2, c["y"] + 6, c["desc"], color=TEXT_MUTED, fontsize=8.5, va='center', linespacing=1.45)

    # Connecting Flow Arrows
    ax.annotate("", xy=(38, 50), xytext=(36, 50),
                arrowprops=dict(arrowstyle="->", color=ACCENT_CYAN, lw=2.5, mutation_scale=16))
    ax.annotate("", xy=(68, 50), xytext=(62, 50),
                arrowprops=dict(arrowstyle="->", color=ACCENT_AMBER, lw=2.5, mutation_scale=16))

    # Bottom Retraining Trigger Box
    retrain_rect = patches.FancyBboxPatch((25, 4), 50, 8,
                                         boxstyle="round,pad=0.6,rounding_size=1.2",
                                         facecolor="#05241b", edgecolor=ACCENT_GREEN, linewidth=2)
    ax.add_patch(retrain_rect)
    ax.text(50, 8, "Trigger DVC Closed Loop: 'dvc repro' or GET http://localhost:8000/train",
            color=ACCENT_GREEN, fontsize=10.5, fontweight='bold', ha='center')

    # Arrow from Math to Retrain Box
    ax.annotate("", xy=(50, 12), xytext=(50, 15),
                arrowprops=dict(arrowstyle="->", color=ACCENT_GREEN, lw=2, mutation_scale=14))

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "mindmap_drift_monitoring.png"), dpi=200, facecolor=BG_COLOR)
    plt.close()
    print("Created mindmap_drift_monitoring.png")

# -------------------------------------------------------------
# Mindmap 4: Explainable AI (TreeSHAP + Gemini) Pipeline
# -------------------------------------------------------------
def create_xai_mindmap():
    fig, ax = plt.subplots(figsize=(16, 9), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Title
    ax.text(50, 95, "PhishGuard: Two-Tier Explainable AI (XAI) Architecture",
            color=TEXT_WHITE, fontsize=18, fontweight='bold', ha='center')
    ax.text(50, 91.5, "Mathematical TreeSHAP Attribution Coupled with Google Gemini LLM Contextual Synthesis",
            color=ACCENT_CYAN, fontsize=11, ha='center')

    # Step 1: Input URL
    s1 = patches.FancyBboxPatch((4, 45), 18, 22, boxstyle="round,pad=0.8,rounding_size=1.5",
                               facecolor=CARD_BG, edgecolor=ACCENT_CYAN, linewidth=2)
    ax.add_patch(s1)
    ax.text(13, 62, "Step 1: Input URL", color=ACCENT_CYAN, fontsize=11, fontweight='bold', ha='center')
    ax.text(13, 52, "• Submissions: API / Web\n• Asynchronous DNS lookup\n• DOM HTML asset parser\n• 30 Raw Vector Signals",
            color=TEXT_MUTED, fontsize=8, ha='center', linespacing=1.35)

    # Step 2: Random Forest
    s2 = patches.FancyBboxPatch((27, 45), 20, 22, boxstyle="round,pad=0.8,rounding_size=1.5",
                               facecolor=CARD_BG, edgecolor=ACCENT_PURPLE, linewidth=2)
    ax.add_patch(s2)
    ax.text(37, 62, "Step 2: RF Classifier", color=ACCENT_PURPLE, fontsize=11, fontweight='bold', ha='center')
    ax.text(37, 52, "• 100 Ensembled Trees\n• Non-linear decision paths\n• Probability Score [0..1]\n• Verdict: Phishing / Legit",
            color=TEXT_MUTED, fontsize=8, ha='center', linespacing=1.35)

    # Step 3: TreeSHAP Engine
    s3 = patches.FancyBboxPatch((52, 45), 20, 22, boxstyle="round,pad=0.8,rounding_size=1.5",
                               facecolor=CARD_BG, edgecolor=ACCENT_GREEN, linewidth=2)
    ax.add_patch(s3)
    ax.text(62, 62, "Step 3: TreeSHAP (Math)", color=ACCENT_GREEN, fontsize=11, fontweight='bold', ha='center')
    ax.text(62, 52, "• Cooperative Game Theory\n• Shapley Values Formula\n• Polynomial O(TLD^2) time\n• Local Factor Contributions\n  (e.g., URL_of_Anchor: +0.14)",
            color=TEXT_MUTED, fontsize=8, ha='center', linespacing=1.35)

    # Step 4: Gemini LLM Synthesis
    s4 = patches.FancyBboxPatch((77, 45), 19, 22, boxstyle="round,pad=0.8,rounding_size=1.5",
                               facecolor=CARD_BG, edgecolor=ACCENT_AMBER, linewidth=2)
    ax.add_patch(s4)
    ax.text(86.5, 62, "Step 4: Gemini LLM", color=ACCENT_AMBER, fontsize=11, fontweight='bold', ha='center')
    ax.text(86.5, 52, "• Prompt with Top SHAP cues\n• Domain WHOIS context\n• Fallback rule templates\n• Plain English Threat Report\n  for Security SOC Team",
            color=TEXT_MUTED, fontsize=8, ha='center', linespacing=1.35)

    # Arrows between steps
    ax.annotate("", xy=(26, 56), xytext=(22, 56),
                arrowprops=dict(arrowstyle="->", color=ACCENT_CYAN, lw=2.5, mutation_scale=15))
    ax.annotate("", xy=(51, 56), xytext=(47, 56),
                arrowprops=dict(arrowstyle="->", color=ACCENT_PURPLE, lw=2.5, mutation_scale=15))
    ax.annotate("", xy=(76, 56), xytext=(72, 56),
                arrowprops=dict(arrowstyle="->", color=ACCENT_GREEN, lw=2.5, mutation_scale=15))

    # Bottom Comparison: Why SHAP + LLM vs Traditional Black-Box
    cmp_rect = patches.FancyBboxPatch((10, 10), 80, 24, boxstyle="round,pad=1.0,rounding_size=1.8",
                                     facecolor="#05192d", edgecolor=ACCENT_CYAN, linewidth=1.8)
    ax.add_patch(cmp_rect)
    ax.text(50, 30, "KEY INTERVIEW DEFENSE: Why TreeSHAP + Gemini is Superior to LIME or Black-Box ML",
            color=TEXT_WHITE, fontsize=11.5, fontweight='bold', ha='center')

    bullets = [
        "1. Mathematical Consistency: Shapley values guarantee efficiency, symmetry, additivity, and dummy axioms that perturbation methods (LIME) violate.",
        "2. Exact & Deterministic: TreeSHAP traverses ensemble tree leaf weights directly in polynomial time; zero random sampling variance between repeated runs.",
        "3. Low Latency (<15ms): Pre-initialized TreeExplainer runs locally in memory inside the FastAPI process without external microservice hops.",
        "4. Actionable SecOps Briefing: Translating raw weights like (+0.1409 Anchor, -0.08 PageRank) into executive security recommendations reduces SOC triage fatigue."
    ]
    y_b = 24.5
    for b in bullets:
        ax.text(14, y_b, b, color=TEXT_MUTED, fontsize=8.5, va='center')
        y_b -= 4.2

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "mindmap_xai_pipeline.png"), dpi=200, facecolor=BG_COLOR)
    plt.close()
    print("Created mindmap_xai_pipeline.png")

if __name__ == "__main__":
    create_architecture_mindmap()
    create_features_mindmap()
    create_drift_mindmap()
    create_xai_mindmap()
    print("All 4 Mindmaps successfully generated!")
