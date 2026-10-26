# PhishGuard: MLOps & Machine Learning Master Interview Guide

> **Project:** PhishGuard: An Explainable Machine Learning System for Phishing URL Detection  
> **Architecture Level:** Level-2 MLOps (Automated Pipelines, Decoupled Observability, Continuous Drift Tracking & Explainable AI)

---

## 📑 Table of Contents
1. [Executive Summaries & Elevator Pitches](#1-executive-summaries--elevator-pitches)
2. [End-to-End System Architecture & Lifecycle](#2-end-to-end-system-architecture--lifecycle)
3. [30 URL Features Taxonomy & Engineering](#3-30-url-features-taxonomy--engineering)
4. [Machine Learning Modeling & Benchmarking](#4-machine-learning-modeling--benchmarking)
5. [Two-Tier Explainable AI: TreeSHAP + Google Gemini LLM](#5-two-tier-explainable-ai-treeshap--google-gemini-llm)
6. [Data Drift Engine & Retraining Feedback Loop](#6-data-drift-engine--retraining-feedback-loop)
7. [Production Serving & Observability Stack (FastAPI, Prometheus & Grafana)](#7-production-serving--observability-stack)
8. [Software Engineering Rigor & CI/CD](#8-software-engineering-rigor--cicd)
9. [35+ Technical Interview Questions & Model Answers](#9-35-technical-interview-questions--high-scoring-answers)

---

## 1. Executive Summaries & Elevator Pitches

### ⚡ 30-Second Elevator Pitch
> *"PhishGuard is an enterprise-grade, Explainable Machine Learning and Level-2 MLOps system that detects phishing URLs in real time. Beyond achieving 97%+ F1 accuracy using an ensembled Random Forest, PhishGuard solves production Day-2 operations: it provides continuous statistical feature drift detection against an 11,055-row baseline, exports live latency percentiles to Prometheus and Grafana, explains every prediction using mathematical TreeSHAP combined with Google Gemini LLM, and automates closed-loop retraining via DVC."*

### ⏱️ 2-Minute System Overview
- **Data & Pipeline Versioning:** DVC orchestrates an automated 5-stage pipeline (`ingestion`, `validation`, `transformation`, `training`, `evaluation`) backed by MongoDB Atlas and DagsHub MLflow remote tracking.
- **Real-Time Inference & XAI:** FastAPI extracts 30 URL signals asynchronously in under 40ms. Predictions are coupled with TreeSHAP feature attribution and Google Gemini natural language explanations.
- **Production Observability:** An in-memory rolling buffer monitors p50/p95/p99 latency and statistical feature drift ($\Delta$). Prometheus scrapes `/metrics` every 5 seconds, visualized via an automated Grafana dashboard.
- **Closed Retraining Loop:** When feature drift exceeds our calibrated 0.25 threshold, an automated Retraining Advisory is raised to trigger the DVC pipeline (`dvc repro`).

---

## 2. End-to-End System Architecture & Lifecycle

![System Architecture Mindmap](mindmap_system_architecture.png)

### Lifecycle Stages Breakdown:
1. **Data Ingestion:** Extracts raw URL feature data from MongoDB cluster with local fallback caching. Generates immutable dataset artifacts tracked via SHA256 hashes in DVC.
2. **Data Validation:** Validates all 30 features against strictly typed schema ranges `[-1, 0, 1]`. Enforces column presence, checks data types, and flags initial distribution anomalies.
3. **Transformation:** Applies KNN Imputation ($k=3$) for missing DNS/network values. Fits a reusable `StandardScaler` pipeline and serializes preprocessor artifacts to `final_model/preprocessor.pkl`.
4. **Model Training:** Executes competitive multi-model benchmarking across Random Forest, XGBoost, Gradient Boosting, AdaBoost, Decision Tree, and Logistic Regression. Tracks runs, parameters, and confusion matrices to DagsHub MLflow.
5. **Model Evaluation:** Compares candidate model against existing production champion. Promoted if candidate outperforms champion by $\ge 0.5\%$ F1.
6. **Serving Engine:** High-concurrency FastAPI ASGI microservice extracting 30 features in under 40ms with microsecond inference.
7. **Observability:** Prometheus scrapes `/metrics` every 5s; Grafana provides live latency, throughput, and drift dashboards.

---

## 3. 30 URL Features Taxonomy & Engineering

![30 URL Features Taxonomy](mindmap_feature_taxonomy.png)

Features are normalized into a ternary space: `+1 (Legitimate / Normal)`, `0 (Suspicious / Neutral)`, and `-1 (Phishing / High Risk)`.

### Feature Categories:
- **Category 1: Address Bar / Lexical Signals (1–7):**  
  `having_IP_Address`, `URL_Length`, `Shortining_Service`, `having_At_Symbol`, `double_slash_redirecting`, `Prefix_Suffix`, `having_Sub_Domain`.
- **Category 2: Domain, SSL & Network Authority (8–14):**  
  `SSLfinal_State`, `Domain_registeration_length`, `Favicon`, `port`, `HTTPS_token`, `age_of_domain`, `DNSRecord`.
- **Category 3: HTML, Anchor & DOM Behavior (15–21):**  
  `Request_URL`, `URL_of_Anchor`, `Links_in_tags`, `SFH`, `Submitting_to_email`, `Abnormal_URL`, `Redirect`.
- **Category 4: Client-Side JS, Traffic & PageRank (22–30):**  
  `on_mouseover`, `RightClick`, `popUpWidnow`, `Iframe`, `web_traffic`, `Page_Rank`, `Google_Index`, `Links_pointing_to_page`, `Statistical_report`.

---

## 4. Machine Learning Modeling & Benchmarking

### Algorithms Benchmarked:
1. **Random Forest Classifier (Selected Champion ⭐):** Ensembled bagging with 100 decision trees. Achieved **97.4% F1-score** with superior resistance to outlier feature noise and microsecond inference.
2. **XGBoost Classifier:** 96.9% F1-score; higher memory footprint in container.
3. **Gradient Boosting:** 96.1% F1-score.
4. **AdaBoost:** 93.8% F1-score.
5. **Decision Tree:** 92.3% F1-score; high variance and prone to overfitting.
6. **Logistic Regression:** 88.5% F1-score; struggled with non-linear feature interactions.

### Asymmetric Cost Matrix:
- **False Negative (Phishing predicted as Legitimate):** Catastrophic breach, malware injection, credential theft.
- **False Positive (Legitimate flagged as Phishing):** Minor inconvenience resolved via manual review.
- **Optimization Strategy:** Maximized **Recall on the Phishing class** while maintaining Precision $> 96\%$.

---

## 5. Two-Tier Explainable AI (TreeSHAP + Google Gemini LLM)

![XAI Pipeline Mindmap](mindmap_xai_pipeline.png)

### Tier 1: Mathematical Attribution via TreeSHAP
Shapley values compute exact local feature contributions:
$$\phi_i(v) = \sum_{S \subseteq N \setminus \{i\}} \frac{|S|!(|N| - |S| - 1)!}{|N|!} \left[ v(S \cup \{i\}) - v(S) \right]$$
- **Polynomial Execution:** TreeSHAP computes contributions in $O(TLD^2)$ time by recursively evaluating decision tree partitions.
- **Axiomatic Consistency:** Fulfills Efficiency, Symmetry, Dummy, and Additivity axioms (unlike LIME).

### Tier 2: Google Gemini Contextual Synthesis
Translates mathematical weights (e.g. `URL_of_Anchor: +0.1409`, `SSLfinal_State: +0.1012`) into actionable human reports for SOC analysts.

---

## 6. Data Drift Engine & Retraining Feedback Loop

![Drift Monitoring Mindmap](mindmap_drift_monitoring.png)

- **Baseline Training Anchor:** 11,055 records (`phisingData.csv`).
- **Normalized Relative Deviation:**
  $$\Delta_i = \frac{|\mu_{\text{live}}(i) - \mu_{\text{base}}(i)|}{\sigma_{\text{base}}(i)}$$
- **Dataset Drift Index ($D$):**
  $$D = \frac{1}{k} \sum_{i=1}^{k} \Delta_i$$
- **Threshold Policy:**
  - $D < 0.18$: Stable / Normal
  - $0.18 \le D < 0.25$: Moderate Shift
  - $D \ge 0.25$: Critical Drift &rarr; Triggers Automated Retraining Advisory & DVC execution (`dvc repro` or `GET /train`).

---

## 7. Production Serving & Observability Stack

- **FastAPI Backend:** Non-blocking async DNS and DOM parsers process requests in $<40\text{ms}$.
- **Decoupled Observability:** OpenMetrics exporter at `/metrics` scraped every 5s by Prometheus.
- **Grafana Dashboard:** Port 3000 displays live latency percentiles (p50/p95/p99), RPM throughput, drift gauge, and classification breakdown.

---

## 8. Software Engineering Rigor & CI/CD

- **GitHub Actions:** Flake8 linting, automated dependency audits.
- **Automated Tests:** 12 integration tests in Pytest covering Gemini fallbacks, SHAP generation, telemetry rolling math, and MongoDB connections.
- **Docker Compose:** Multi-container orchestration isolating application runtime from monitoring stack.

---

## 9. 35+ Technical Interview Questions & High-Scoring Answers

*(Refer to the full PDF [PhishGuard_MLOps_Interview_Master_Guide.pdf](file:///C:/Users/LOQ/OneDrive/Desktop/Projects/Network-Security-Phishing-Detection-main/Network-Security-Phishing-Detection-main/docs/interview_prep/PhishGuard_MLOps_Interview_Master_Guide.pdf) for complete questions and answers across ML Modeling, MLOps, System Design, Scalability, and Behavioral scenarios).*
