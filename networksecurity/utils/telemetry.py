import time
import math
import logging
from collections import deque
from pathlib import Path
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


class ModelTelemetry:
    """
    Production Telemetry, Monitoring, and Feature Drift Tracker for PhishGuard.
    Exposes Prometheus format (/metrics) and JSON format (/api/telemetry).
    """

    def __init__(self, baseline_csv_path: Path | None = None, max_history: int = 500):
        self.start_time = time.time()
        self.total_requests = 0
        self.total_errors = 0
        self.verdict_counts = {"Phishing": 0, "Legitimate": 0}

        # Rolling windows for latency and request rates
        self.latencies_ms = deque(maxlen=max_history)
        self.request_timestamps = deque(maxlen=max_history)

        # Drift tracking
        self.recent_features = deque(maxlen=max_history)
        self.baseline_means = {}
        self.baseline_stds = {}
        self._load_baseline(baseline_csv_path)

    def _load_baseline(self, baseline_csv_path: Path | None):
        """Precomputes baseline feature distributions from training dataset."""
        try:
            if baseline_csv_path and Path(baseline_csv_path).exists():
                df = pd.read_csv(baseline_csv_path)
                # Drop non-feature columns if present
                for col in ["Result", "index", "_id"]:
                    if col in df.columns:
                        df = df.drop(columns=[col])
                for col in df.select_dtypes(include=[np.number]).columns:
                    self.baseline_means[col] = float(df[col].mean())
                    self.baseline_stds[col] = float(df[col].std()) if df[col].std() > 0 else 1.0
                logger.info("Loaded baseline statistics for %d features.", len(self.baseline_means))
        except Exception as e:
            logger.warning("Could not load baseline feature statistics: %s", e)

    def track_prediction(self, latency_ms: float, verdict: str, features: dict | None = None):
        """Records inference metrics and feature observations."""
        self.total_requests += 1
        now = time.time()
        self.request_timestamps.append(now)
        self.latencies_ms.append(float(latency_ms))

        normalized_verdict = "Phishing" if "phish" in verdict.lower() else "Legitimate"
        self.verdict_counts[normalized_verdict] = self.verdict_counts.get(normalized_verdict, 0) + 1

        if features and isinstance(features, dict):
            # Numeric conversion
            numeric_features = {}
            for k, v in features.items():
                try:
                    numeric_features[k] = float(v)
                except (ValueError, TypeError):
                    continue
            if numeric_features:
                self.recent_features.append(numeric_features)

    def track_error(self):
        self.total_errors += 1

    def _calculate_latencies(self) -> dict:
        if not self.latencies_ms:
            return {"avg": 0.0, "p50": 0.0, "p95": 0.0, "p99": 0.0}
        sorted_latencies = sorted(self.latencies_ms)
        n = len(sorted_latencies)
        avg = sum(sorted_latencies) / n
        p50 = sorted_latencies[int(n * 0.50)]
        p95 = sorted_latencies[min(int(n * 0.95), n - 1)]
        p99 = sorted_latencies[min(int(n * 0.99), n - 1)]
        return {
            "avg": round(avg, 2),
            "p50": round(p50, 2),
            "p95": round(p95, 2),
            "p99": round(p99, 2),
        }

    def _calculate_throughput(self) -> float:
        """Returns requests per minute over the recent rolling window."""
        now = time.time()
        # Count requests in the last 60 seconds
        recent = [ts for ts in self.request_timestamps if now - ts <= 60]
        return float(len(recent))

    def _calculate_drift(self) -> dict:
        """
        Calculates feature distribution shift against the training baseline.
        Uses normalized mean absolute shift (L1 distance in std units).
        """
        if not self.recent_features or not self.baseline_means:
            return {
                "status": "Baseline",
                "score": 0.0,
                "threshold": 0.25,
                "samples_analyzed": len(self.recent_features),
                "top_drifting_features": [],
            }

        df_recent = pd.DataFrame(list(self.recent_features))
        drifting_features = []

        total_shift = 0.0
        feature_count = 0

        for col, baseline_mean in self.baseline_means.items():
            if col in df_recent.columns:
                live_mean = float(df_recent[col].mean())
                std = self.baseline_stds.get(col, 1.0)
                # Standardized mean absolute shift
                shift = abs(live_mean - baseline_mean) / (std if std > 0 else 1.0)
                total_shift += shift
                feature_count += 1
                drifting_features.append({
                    "feature": col,
                    "baseline_mean": round(baseline_mean, 3),
                    "live_mean": round(live_mean, 3),
                    "shift": round(live_mean - baseline_mean, 3),
                    "relative_deviation": round(shift, 3),
                })

        avg_drift_score = round(total_shift / feature_count, 4) if feature_count > 0 else 0.0

        # Sort features by highest drift
        drifting_features.sort(key=lambda x: abs(x["relative_deviation"]), reverse=True)

        if avg_drift_score > 0.35:
            status = "High Drift (Retraining Advised)"
        elif avg_drift_score > 0.18:
            status = "Moderate Drift"
        else:
            status = "Healthy / Low Drift"

        return {
            "status": status,
            "score": avg_drift_score,
            "threshold": 0.25,
            "samples_analyzed": len(self.recent_features),
            "top_drifting_features": drifting_features[:5],
        }

    def get_telemetry_json(self) -> dict:
        """Returns structured JSON for frontend React dashboard."""
        uptime = round(time.time() - self.start_time, 1)
        latencies = self._calculate_latencies()
        throughput = self._calculate_throughput()
        drift = self._calculate_drift()

        total = self.total_requests or 1
        phishing_pct = round((self.verdict_counts["Phishing"] / total) * 100, 1)
        legit_pct = round((self.verdict_counts["Legitimate"] / total) * 100, 1)

        return {
            "status": "healthy",
            "uptime_seconds": uptime,
            "total_requests": self.total_requests,
            "total_errors": self.total_errors,
            "throughput_rpm": throughput,
            "latency_ms": latencies,
            "distribution": {
                "phishing": self.verdict_counts["Phishing"],
                "legitimate": self.verdict_counts["Legitimate"],
                "phishing_percentage": phishing_pct,
                "legitimate_percentage": legit_pct,
            },
            "drift": drift,
            "system": {
                "active_model": "RandomForest / XGBoost",
                "framework": "Scikit-Learn / FastAPI",
                "drift_engine": "Statistical Distribution Shift",
            },
        }

    def get_prometheus_metrics(self) -> str:
        """Returns OpenMetrics/Prometheus formatted text for scraping."""
        latencies = self._calculate_latencies()
        drift = self._calculate_drift()
        throughput = self._calculate_throughput()
        uptime = round(time.time() - self.start_time, 1)

        lines = [
            "# HELP phishing_requests_total Total number of inference requests processed",
            "# TYPE phishing_requests_total counter",
            f"phishing_requests_total {self.total_requests}",
            "",
            "# HELP phishing_errors_total Total number of prediction errors",
            "# TYPE phishing_errors_total counter",
            f"phishing_errors_total {self.total_errors}",
            "",
            "# HELP phishing_verdict_total Total verdicts by category",
            "# TYPE phishing_verdict_total counter",
            f'phishing_verdict_total{{verdict="Phishing"}} {self.verdict_counts["Phishing"]}',
            f'phishing_verdict_total{{verdict="Legitimate"}} {self.verdict_counts["Legitimate"]}',
            "",
            "# HELP phishing_latency_ms Model inference latency in milliseconds",
            "# TYPE phishing_latency_ms gauge",
            f'phishing_latency_ms{{quantile="avg"}} {latencies["avg"]}',
            f'phishing_latency_ms{{quantile="0.5"}} {latencies["p50"]}',
            f'phishing_latency_ms{{quantile="0.95"}} {latencies["p95"]}',
            f'phishing_latency_ms{{quantile="0.99"}} {latencies["p99"]}',
            "",
            "# HELP phishing_throughput_rpm Live inference requests per minute",
            "# TYPE phishing_throughput_rpm gauge",
            f"phishing_throughput_rpm {throughput}",
            "",
            "# HELP phishing_feature_drift_score Kolmogorov/L1 distribution drift score against baseline",
            "# TYPE phishing_feature_drift_score gauge",
            f"phishing_feature_drift_score {drift['score']}",
            "",
            "# HELP phishing_system_uptime_seconds Application uptime in seconds",
            "# TYPE phishing_system_uptime_seconds gauge",
            f"phishing_system_uptime_seconds {uptime}",
        ]
        return "\n".join(lines) + "\n"
