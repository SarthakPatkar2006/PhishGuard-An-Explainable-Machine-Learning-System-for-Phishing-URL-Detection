import sys
import os
import json
import base64
import hashlib
import hmac
import re
import secrets
import time
from functools import lru_cache
from threading import Lock
from datetime import datetime, timedelta, timezone
from html import escape
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request as UrlRequest, urlopen

import certifi
from bson import ObjectId

ca = certifi.where()

from dotenv import load_dotenv

import pymongo
from networksecurity.exception.exception import NetworkSecurityException
from networksecurity.logging.logger import logging

from fastapi.middleware.cors import CORSMiddleware
from fastapi import BackgroundTasks, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel
from uvicorn import run as app_run
import pandas as pd
import numpy as np
import shap

from networksecurity.utils.main_utils.utils import load_object
from networksecurity.utils.ml_utils.model.estimator import NetworkModel
from networksecurity.utils.url_feature_extractor import extract_url_features


BASE_DIR = Path(__file__).resolve().parent
# Load the backend environment file regardless of the process working directory.
# Existing process environment variables keep precedence over .env values.
load_dotenv(BASE_DIR / ".env")


def bounded_int_from_env(name: str, default: int, minimum: int, maximum: int) -> int:
    try:
        value = int(os.getenv(name, str(default)))
    except ValueError:
        return default
    return max(minimum, min(value, maximum))


def configured_mongo_uri() -> str | None:
    """Return the supported Atlas URI without ever defaulting to localhost."""
    return os.getenv("MONGODB_URL_KEY") or os.getenv("MONGO_DB_URL")


mongo_db_url = configured_mongo_uri()


def create_mongo_client(uri: str | None):
    if not uri:
        return None
    uri_lower = (uri or "").lower()
    uses_tls = (
        uri_lower.startswith("mongodb+srv://")
        or "tls=true" in uri_lower
        or "ssl=true" in uri_lower
    )
    if uses_tls:
        return pymongo.MongoClient(
            uri, tlsCAFile=ca, connectTimeoutMS=5000, serverSelectionTimeoutMS=5000
        )
    return pymongo.MongoClient(uri, connectTimeoutMS=5000, serverSelectionTimeoutMS=5000)


# MongoDB SRV client construction can require DNS. Defer it until a database route
# or health check needs it so a transient Atlas/DNS outage cannot prevent startup.
client = None

from networksecurity.constants.training_pipeline import DATA_INGESTION_COLLECTION_NAME
from networksecurity.constants.training_pipeline import DATA_INGESTION_DATABASE_NAME
from networksecurity.constants.training_pipeline import TARGET_COLUMN

database = None
collection = None

app = FastAPI()
TEMPLATE_DIR = BASE_DIR / "templates"
MODEL_PATH = BASE_DIR / "final_model" / "model.pkl"
PREPROCESSOR_PATH = BASE_DIR / "final_model" / "preprocessor.pkl"
MODEL_COMPARISON_JSON_PATH = BASE_DIR / "final_model" / "model_comparison.json"
MODEL_COMPARISON_CSV_PATH = BASE_DIR / "final_model" / "model_comparison.csv"
PREDICTION_OUTPUT_PATH = BASE_DIR / "prediction_output" / "output.csv"
SAMPLE_DATA_PATH = BASE_DIR / "Network_Data" / "phisingData.csv"
DAGSHUB_REPO_OWNER = os.getenv("DAGSHUB_REPO_OWNER", "Sahilpatil009")
DAGSHUB_REPO_NAME = os.getenv("DAGSHUB_REPO_NAME", "network-security-edi")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# Configurable Gemini model. Defaults to gemini-2.5-flash which is active and supported on Google AI Studio.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
GEMINI_TIMEOUT_SECONDS = bounded_int_from_env(
    "GEMINI_TIMEOUT_SECONDS", default=10, minimum=3, maximum=30
)
EXPLANATION_JOB_TTL_SECONDS = 10 * 60
URL_PREDICTION_COLLECTION_NAME = os.getenv(
    "URL_PREDICTION_COLLECTION_NAME", "url_prediction_history"
)
AUTH_USER_COLLECTION_NAME = os.getenv("AUTH_USER_COLLECTION_NAME", "users")
AUTH_SESSION_COLLECTION_NAME = os.getenv("AUTH_SESSION_COLLECTION_NAME", "user_sessions")
AUTH_SESSION_DAYS = int(os.getenv("AUTH_SESSION_DAYS", "7"))
url_prediction_collection = None
auth_user_collection = None
auth_session_collection = None
explanation_jobs: dict[str, dict] = {}
explanation_jobs_lock = Lock()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AuthSignupPayload(BaseModel):
    name: str
    email: str
    password: str


class AuthLoginPayload(BaseModel):
    email: str
    password: str


def render_template(template_name: str, **context: str) -> HTMLResponse:
    template = (TEMPLATE_DIR / template_name).read_text(encoding="utf-8")
    for key, value in context.items():
        template = template.replace("{{ " + key + " }}", str(value))
    return HTMLResponse(content=template)


def file_meta(path: Path) -> str:
    if not path.exists():
        return "Not found"
    size_kb = path.stat().st_size / 1024
    modified = datetime.fromtimestamp(path.stat().st_mtime).strftime(
        "%d %b %Y, %I:%M %p"
    )
    return f"{size_kb:,.0f} KB | {modified}"


def status_class(is_ready: bool) -> str:
    return "good" if is_ready else "warn"


def safe_mongo_description(uri: str | None) -> str:
    if not uri:
        return "Set MONGODB_URL_KEY or MONGO_DB_URL in the backend .env file"
    return "MongoDB Atlas URI configured" if uri.lower().startswith("mongodb+srv://") else "MongoDB URI configured"


def mongo_health() -> tuple[bool, str]:
    if not mongo_db_url:
        return False, "No MongoDB URI configured"
    try:
        initialize_database()
        client.admin.command("ping")
        return True, "Connected"
    except pymongo.errors.PyMongoError as exc:
        logging.warning("MongoDB health check failed: %s", type(exc).__name__)
        return False, "Unavailable; check Atlas URI, network access, and credentials"


def require_database() -> None:
    try:
        initialize_database()
        client.admin.command("ping")
    except pymongo.errors.PyMongoError as exc:
        logging.warning("MongoDB initialization failed: %s", type(exc).__name__)
        raise HTTPException(
            status_code=503,
            detail="MongoDB is unavailable. Check the Atlas URI, network access, and credentials.",
        )


def initialize_database() -> None:
    """Initialize the one shared configured client and its collections on demand."""
    global client, database, collection
    global url_prediction_collection, auth_user_collection, auth_session_collection
    if database is not None:
        return
    if not mongo_db_url:
        raise pymongo.errors.ConfigurationError("MongoDB URI is not configured")
    client = client or create_mongo_client(mongo_db_url)
    database = client[DATA_INGESTION_DATABASE_NAME]
    collection = database[DATA_INGESTION_COLLECTION_NAME]
    url_prediction_collection = database[URL_PREDICTION_COLLECTION_NAME]
    auth_user_collection = database[AUTH_USER_COLLECTION_NAME]
    auth_session_collection = database[AUTH_SESSION_COLLECTION_NAME]


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt),
        120_000,
    )
    encoded_digest = base64.b64encode(digest).decode("utf-8")
    return f"pbkdf2_sha256${salt}${encoded_digest}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, salt, expected_digest = stored_hash.split("$", 2)
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False
    candidate_digest = hash_password(password, salt).split("$", 2)[2]
    return hmac.compare_digest(candidate_digest, expected_digest)


def validate_auth_payload(email: str, password: str, name: str | None = None):
    if not email or "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if name is not None and not name.strip():
        raise HTTPException(status_code=400, detail="Enter your name.")


def serialize_auth_user(document: dict) -> dict:
    created_at = document.get("createdAt")
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()
    return {
        "id": str(document.get("_id", "")),
        "name": document.get("name", ""),
        "email": document.get("email", ""),
        "createdAt": created_at or "",
    }


def create_auth_session(user_id: str) -> dict:
    require_database()
    token = secrets.token_urlsafe(32)
    created_at = datetime.now(timezone.utc)
    expires_at = created_at + timedelta(days=AUTH_SESSION_DAYS)
    auth_session_collection.insert_one(
        {
            "token": token,
            "userId": user_id,
            "createdAt": created_at,
            "expiresAt": expires_at,
        }
    )
    return {"token": token, "expiresAt": expires_at.isoformat()}


def extract_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    prefix = "Bearer "
    if not authorization.startswith(prefix):
        return None
    return authorization[len(prefix) :].strip()


def get_user_from_authorization(authorization: str | None) -> dict | None:
    require_database()
    token = extract_bearer_token(authorization)
    if not token:
        return None

    session = auth_session_collection.find_one({"token": token})
    if not session:
        return None

    expires_at = session.get("expiresAt")
    if isinstance(expires_at, datetime):
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            auth_session_collection.delete_one({"_id": session.get("_id")})
            return None

    try:
        user_id = ObjectId(session.get("userId"))
    except Exception:
        return None
    return auth_user_collection.find_one({"_id": user_id})


def require_authenticated_user(authorization: str | None) -> dict:
    user_document = get_user_from_authorization(authorization)
    if not user_document:
        raise HTTPException(status_code=401, detail="Sign in to continue.")
    return user_document


def prediction_label(value: int) -> str:
    return "Legitimate" if int(value) == 1 else "Phishing"


def prediction_class(value: int) -> str:
    return "good" if int(value) == 1 else "danger"


def feature_rows(features: dict) -> str:
    rows = []
    for name, value in features.items():
        if value == -1:
            signal = "Suspicious"
            cls = "danger"
        elif value == 0:
            signal = "Neutral"
            cls = "warn"
        else:
            signal = "Normal"
            cls = "good"
        rows.append(
            "<tr>"
            f"<td>{escape(name)}</td>"
            f"<td>{value}</td>"
            f'<td><span class="badge {cls}">{signal}</span></td>'
            "</tr>"
        )
    return "".join(rows)


def local_prediction_summary(url: str, label: str, features: dict) -> str:
    suspicious_features = [name for name, value in features.items() if value == -1]
    neutral_features = [name for name, value in features.items() if value == 0]
    if suspicious_features:
        reason = f"Suspicious signals include {', '.join(suspicious_features[:5])}."
    elif neutral_features:
        reason = f"Most URL signals look normal, with uncertain values for {', '.join(neutral_features[:4])}."
    else:
        reason = "Most extracted URL signals look normal."
    return (
        f"Local, rule-based explanation: the model predicted this URL as {label}. {reason} "
        "Treat this as an ML-assisted check and manually verify the domain before sharing passwords or payment details."
    )


def is_complete_gemini_explanation(
    summary: str, label: str, shap_factors: list[dict] | None = None
) -> bool:
    """Reject generic prose that does not cite the supplied Tree SHAP evidence."""
    normalized = " ".join(summary.split())
    required_sections = ("assessment:", "shap evidence:", "recommendation:")
    required_factor_names = [
        str(factor.get("name", "")).lower()
        for factor in (shap_factors or [])[:2]
        if factor.get("name")
    ]
    return (
        len(normalized) >= 80
        and label.lower() in normalized.lower()
        and all(section in normalized.lower() for section in required_sections)
        and all(name in normalized.lower() for name in required_factor_names)
        and normalized.rstrip().endswith((".", "!"))
    )


def safe_gemini_diagnostic(value: object, maximum_length: int = 240) -> str:
    """Keep provider diagnostics useful without risking a secret in logs or the UI."""
    normalized = " ".join(str(value or "").split())
    normalized = re.sub(r"(?:AIza|gsk_)[\w-]+", "[redacted API key]", normalized)
    return normalized[:maximum_length]


def gemini_http_diagnostic(error: HTTPError) -> str:
    """Extract Gemini's public error message without retaining response data."""
    provider_message = ""
    provider_type = ""
    try:
        body = error.read().decode("utf-8", errors="replace")
        payload = json.loads(body)
        error_payload = payload.get("error", {}) if isinstance(payload, dict) else {}
        if isinstance(error_payload, dict):
            provider_message = str(error_payload.get("message", ""))
            provider_type = str(error_payload.get("type") or error_payload.get("code") or "")
    except (OSError, ValueError, UnicodeDecodeError, json.JSONDecodeError, AttributeError):
        pass

    if error.code in {401, 403} and not provider_message:
        provider_message = (
            "Access denied. Check that GEMINI_API_KEY belongs to an active Google AI Studio project "
            "with Gemini API access."
        )
    elif not provider_message:
        provider_message = str(error.reason or "No additional error message was returned.")
    detail = safe_gemini_diagnostic(provider_message)
    suffix = f" ({safe_gemini_diagnostic(provider_type, 60)})" if provider_type else ""
    return f"Gemini API HTTP {error.code}{suffix}: {detail}"


def extract_gemini_text(response_payload: dict) -> str:
    """Extract text output from Gemini generateContent or Interactions API response."""
    text_blocks = []
    # Standard generateContent structure: candidates[0].content.parts[*].text
    for candidate in response_payload.get("candidates", []):
        if not isinstance(candidate, dict):
            continue
        content = candidate.get("content", {})
        if isinstance(content, dict):
            for part in content.get("parts", []):
                if isinstance(part, dict) and "text" in part:
                    text_blocks.append(str(part["text"]))

    # Alternate Interactions API structure: steps[*].content[*].text
    if not text_blocks:
        for step in response_payload.get("steps", []):
            if not isinstance(step, dict):
                continue
            for content in step.get("content", []):
                if isinstance(content, dict) and content.get("type") == "text":
                    text = content.get("text")
                    if text:
                        text_blocks.append(str(text))
    return "\n".join(text_blocks).strip()


def explain_prediction_with_gemini_result(
    url: str, label: str, features: dict, metadata: dict, shap_factors: list[dict] | None = None
) -> tuple[str, str | None]:
    fallback = local_prediction_summary(url, label, features)
    if not GEMINI_API_KEY:
        return fallback, "Gemini is not configured: set GEMINI_API_KEY in the backend .env file."

    shap_evidence = "\n".join(
        f"- {factor['name']} = {factor['value']}: {factor['direction']}; Tree SHAP contribution {factor['contribution']:+.4f}"
        for factor in (shap_factors or [])
    ) or "unavailable"
    prompt = (
        "Write a concise explanation of this phishing detector output. Use the Tree "
        "SHAP table as the only evidence; do not infer facts about the website from its "
        "URL or use any other signals. A positive contribution supports the selected "
        "prediction and a negative contribution counters it. Copy the first two Tree SHAP "
        "feature names exactly as written. Return plain text with exactly these headings:\n"
        "Assessment: state the selected model prediction and that it is not proof.\n"
        "SHAP evidence: explain how the first two listed factors support or counter that prediction.\n"
        "Recommendation: give one practical safety check.\n"
        "Use 80 to 120 words. Do not use Markdown, greetings, or extra headings.\n"
        f"Selected model prediction: {label}\n"
        f"Tree SHAP table:\n{shap_evidence}"
    )

    # Standard Google Gemini REST API endpoint
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "maxOutputTokens": 800,
            "temperature": 0.2,
            "thinkingConfig": {
                "thinkingBudget": 0,
            },
        },
    }
    # Three attempts total; only known transient service/network responses retry.
    last_diagnostic = "Gemini did not return a usable response."
    for attempt in range(3):
        request = UrlRequest(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=GEMINI_TIMEOUT_SECONDS) as response:
                data = json.loads(response.read().decode("utf-8"))
            summary = extract_gemini_text(data)
            if not is_complete_gemini_explanation(summary, label, shap_factors):
                logging.warning("Gemini returned an explanation without required Tree SHAP evidence; using local explanation")
                return fallback, "Gemini responded, but the explanation did not cite the required Tree SHAP evidence."
            return summary, None
        except HTTPError as exc:
            retryable = exc.code in {429, 500, 502, 503, 504}
            last_diagnostic = gemini_http_diagnostic(exc)
            logging.warning(
                "Gemini request failed (model=%s, status=%s, attempt=%s/3, retryable=%s, detail=%s)",
                GEMINI_MODEL,
                exc.code,
                attempt + 1,
                retryable,
                last_diagnostic,
            )
            if not retryable or attempt == 2:
                exc.close()
                break
            exc.close()
        except (URLError, TimeoutError) as exc:
            error_type = "timed out" if isinstance(exc, TimeoutError) else "could not be reached"
            last_diagnostic = (
                f"Gemini {error_type} after {GEMINI_TIMEOUT_SECONDS} seconds "
                f"(attempt {attempt + 1}/3): {safe_gemini_diagnostic(getattr(exc, 'reason', exc), 160)}"
            )
            logging.warning(
                "Gemini request failed (model=%s, type=%s, attempt=%s/3, detail=%s)",
                GEMINI_MODEL,
                type(exc).__name__,
                attempt + 1,
                last_diagnostic,
            )
            if attempt == 2:
                break
        except (KeyError, IndexError, json.JSONDecodeError) as exc:
            last_diagnostic = "Gemini returned an unexpected response format."
            logging.warning("Gemini returned an unexpected response (model=%s, type=%s)", GEMINI_MODEL, type(exc).__name__)
            break
        time.sleep(2**attempt)

    logging.warning("Gemini explanation unavailable after request attempts; using local explanation: %s", last_diagnostic)
    return fallback, last_diagnostic


def explain_prediction_with_gemini(
    url: str, label: str, features: dict, metadata: dict, shap_factors: list[dict] | None = None
) -> str:
    """Compatibility wrapper for the synchronous HTML prediction route."""
    summary, _ = explain_prediction_with_gemini_result(url, label, features, metadata, shap_factors)
    return summary


def start_gemini_explanation_job(result: dict, user: dict) -> str:
    """Create an in-memory, user-scoped job so Gemini never blocks URL scoring."""
    job_id = secrets.token_urlsafe(18)
    now = datetime.now(timezone.utc)
    with explanation_jobs_lock:
        expired_job_ids = [
            existing_id
            for existing_id, existing_job in explanation_jobs.items()
            if (now - existing_job["createdAt"]).total_seconds() > EXPLANATION_JOB_TTL_SECONDS
        ]
        for existing_id in expired_job_ids:
            explanation_jobs.pop(existing_id, None)
        explanation_jobs[job_id] = {
            "createdAt": now,
            "status": "pending",
            "userId": str(user["_id"]),
        }
    return job_id


def get_gemini_explanation_job(job_id: str, user: dict) -> dict:
    with explanation_jobs_lock:
        job = explanation_jobs.get(job_id)
        if not job or job["userId"] != str(user["_id"]):
            raise HTTPException(status_code=404, detail="Explanation request was not found.")
        return {
            "status": job["status"],
            "summary": job.get("summary", ""),
            "explanationSource": job.get("explanationSource", "Pending Gemini explanation"),
            "diagnostic": job.get("diagnostic", ""),
        }


def generate_gemini_explanation_job(job_id: str, result: dict, user_id: str) -> None:
    """Run after the prediction response has been returned to the browser."""
    features = {feature["name"]: feature["value"] for feature in result["features"]}
    metadata = {
        "normalized_url": result["url"],
        "hostname": result["hostname"],
        "html_status": result["htmlStatus"],
    }
    started_at = time.perf_counter()
    summary, diagnostic = explain_prediction_with_gemini_result(
        result["url"], result["label"], features, metadata, result["shap"]["topFeatures"]
    )
    elapsed = time.perf_counter() - started_at
    is_gemini_response = not summary.startswith("Local, rule-based explanation:")
    status = "ready" if is_gemini_response else "unavailable"
    explanation_source = "Gemini" if is_gemini_response else "Gemini unavailable"
    response_summary = summary if is_gemini_response else ""

    with explanation_jobs_lock:
        job = explanation_jobs.get(job_id)
        if job:
            job.update(
                {
                    "status": status,
                    "summary": response_summary,
                    "explanationSource": explanation_source,
                    "diagnostic": diagnostic or "",
                }
            )

    if result.get("historyId") and url_prediction_collection is not None:
        try:
            url_prediction_collection.update_one(
                {"_id": ObjectId(result["historyId"]), "userId": user_id},
                {
                    "$set": {
                        "summary": response_summary,
                        "explanationSource": explanation_source,
                        "explanationStatus": status,
                        "explanationDiagnostic": diagnostic or "",
                    }
                },
            )
        except pymongo.errors.PyMongoError as exc:
            logging.warning("Could not persist Gemini explanation status: %s", type(exc).__name__)
    logging.info("Gemini explanation job finished in %.2f seconds with status=%s", elapsed, status)


@lru_cache(maxsize=1)
def load_prediction_components():
    """Load the persisted preprocessing and classifier pair once per process."""
    return load_object(str(PREPROCESSOR_PATH)), load_object(str(MODEL_PATH))


@lru_cache(maxsize=1)
def get_tree_shap_explainer():
    """TreeExplainer is model-specific and can be reused for every URL scan."""
    _, final_model = load_prediction_components()
    return shap.TreeExplainer(final_model)


def predict_dataframe(input_df: pd.DataFrame):
    preprocessor, final_model = load_prediction_components()
    network_model = NetworkModel(preprocessor=preprocessor, model=final_model)
    return network_model.predict(input_df)


def build_shap_explanation(feature_df: pd.DataFrame, prediction: int) -> dict:
    """Return local Tree SHAP factors for the fitted Random Forest prediction."""
    try:
        preprocessor, final_model = load_prediction_components()
        transformed = preprocessor.transform(feature_df)
        feature_names = (
            list(preprocessor.get_feature_names_out())
            if hasattr(preprocessor, "get_feature_names_out")
            else list(feature_df.columns)
        )
        class_index = list(final_model.classes_).index(prediction)
        shap_values = np.asarray(get_tree_shap_explainer().shap_values(transformed))
        if shap_values.ndim == 3:
            contributions = shap_values[0, :, class_index]
        elif shap_values.ndim == 2:
            contributions = shap_values[0]
        else:
            raise ValueError("Unexpected Tree SHAP output shape")

        top_indices = np.argsort(np.abs(contributions))[::-1][:5]
        factors = []
        for index in top_indices:
            contribution = float(contributions[index])
            factors.append(
                {
                    "name": feature_names[index],
                    "value": int(feature_df.iloc[0][feature_names[index]]),
                    "contribution": round(contribution, 4),
                    "direction": "Supports selected prediction" if contribution >= 0 else "Counters selected prediction",
                }
            )
        return {
            "available": True,
            "method": "Tree SHAP",
            "message": "Top model feature contributions for this prediction.",
            "topFeatures": factors,
        }
    except Exception as exc:
        logging.warning("Tree SHAP explanation unavailable: %s", type(exc).__name__)
        return {
            "available": False,
            "method": "Tree SHAP",
            "message": "Model-derived SHAP factors could not be generated for this scan.",
            "topFeatures": [],
        }


def build_url_prediction(url: str, generate_gemini: bool = True) -> dict:
    started_at = time.perf_counter()
    feature_df, features, metadata = extract_url_features(url)
    features_finished_at = time.perf_counter()
    y_pred = predict_dataframe(feature_df)
    prediction = int(y_pred[0])
    label = prediction_label(prediction)
    prediction_finished_at = time.perf_counter()
    shap_explanation = build_shap_explanation(feature_df, prediction)
    shap_finished_at = time.perf_counter()
    if generate_gemini:
        summary, explanation_diagnostic = explain_prediction_with_gemini_result(
            metadata["normalized_url"],
            label,
            features,
            metadata,
            shap_explanation["topFeatures"],
        )
        explanation_source = (
            "Local rule-based fallback"
            if summary.startswith("Local, rule-based explanation:")
            else "Gemini"
        )
        explanation_status = "ready" if explanation_source == "Gemini" else "unavailable"
    else:
        summary = ""
        explanation_source = "Pending Gemini explanation"
        explanation_status = "pending"
        explanation_diagnostic = ""
    gemini_finished_at = time.perf_counter()
    logging.info(
        "URL scan timing seconds: features=%.2f, prediction=%.2f, shap=%.2f, gemini=%.2f, total=%.2f",
        features_finished_at - started_at,
        prediction_finished_at - features_finished_at,
        shap_finished_at - prediction_finished_at,
        gemini_finished_at - shap_finished_at,
        gemini_finished_at - started_at,
    )
    suspicious_count = sum(1 for value in features.values() if value == -1)
    neutral_count = sum(1 for value in features.values() if value == 0)
    normal_count = sum(1 for value in features.values() if value == 1)
    return {
        "url": metadata["normalized_url"],
        "finalUrl": metadata["final_url"],
        "hostname": metadata["hostname"],
        "dnsStatus": metadata["dns_status"],
        "htmlStatus": metadata["html_status"],
        "prediction": prediction,
        "label": label,
        "statusClass": prediction_class(prediction),
        "summary": summary,
        "explanationSource": explanation_source,
        "explanationStatus": explanation_status,
        "explanationDiagnostic": explanation_diagnostic or "",
        "shap": shap_explanation,
        "signals": {
            "suspicious": suspicious_count,
            "neutral": neutral_count,
            "normal": normal_count,
        },
        "features": [
            {
                "name": name,
                "value": value,
                "signal": (
                    "Suspicious"
                    if value == -1
                    else "Neutral" if value == 0 else "Normal"
                ),
            }
            for name, value in features.items()
        ],
    }


def save_url_prediction(result: dict, user: dict | None = None) -> dict:
    require_database()
    saved_at = datetime.now(timezone.utc)
    document = {
        "url": result["url"],
        "finalUrl": result["finalUrl"],
        "hostname": result["hostname"],
        "dnsStatus": result["dnsStatus"],
        "htmlStatus": result["htmlStatus"],
        "prediction": result["prediction"],
        "label": result["label"],
        "statusClass": result["statusClass"],
        "summary": result["summary"],
        "explanationSource": result["explanationSource"],
        "explanationStatus": result["explanationStatus"],
        "explanationDiagnostic": result.get("explanationDiagnostic", ""),
        "shap": result["shap"],
        "signals": result["signals"],
        "features": result["features"],
        "suspiciousFeatures": [
            feature["name"]
            for feature in result["features"]
            if feature["signal"] == "Suspicious"
        ],
        "createdAt": saved_at,
    }
    if user:
        document["userId"] = str(user["_id"])
        document["userEmail"] = user.get("email", "")

    inserted = url_prediction_collection.insert_one(document)
    result["historyId"] = str(inserted.inserted_id)
    result["savedAt"] = saved_at.isoformat()
    return result


def serialize_url_prediction_history(document: dict) -> dict:
    created_at = document.get("createdAt")
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()

    return {
        "historyId": str(document.get("_id", "")),
        "url": document.get("url", ""),
        "finalUrl": document.get("finalUrl", ""),
        "hostname": document.get("hostname", ""),
        "dnsStatus": document.get("dnsStatus", ""),
        "htmlStatus": document.get("htmlStatus", ""),
        "prediction": int(document.get("prediction", 0)),
        "label": document.get("label", "Phishing"),
        "statusClass": document.get("statusClass", "danger"),
        "summary": document.get("summary", ""),
        "explanationSource": document.get("explanationSource", "Local rule-based fallback"),
        "explanationStatus": document.get("explanationStatus", "unavailable"),
        "explanationDiagnostic": document.get("explanationDiagnostic", ""),
        "explanationJobId": document.get("explanationJobId"),
        "shap": document.get(
            "shap", {"available": False, "method": "Tree SHAP", "message": "Not available for this saved scan.", "topFeatures": []}
        ),
        "signals": document.get(
            "signals", {"suspicious": 0, "neutral": 0, "normal": 0}
        ),
        "features": document.get("features", []),
        "suspiciousFeatures": document.get("suspiciousFeatures", []),
        "createdAt": created_at or "",
    }


def get_url_prediction_history(limit: int = 10, user: dict | None = None) -> list:
    if not user:
        return []
    require_database()

    safe_limit = max(1, min(limit, 50))
    query = {"userId": str(user["_id"])}
    documents = (
        url_prediction_collection.find(query)
        .sort("createdAt", pymongo.DESCENDING)
        .limit(safe_limit)
    )
    return [serialize_url_prediction_history(document) for document in documents]


def build_model_comparison_payload() -> dict:
    if not MODEL_COMPARISON_JSON_PATH.exists():
        return {
            "ready": False,
            "generatedAt": "",
            "bestModelName": "",
            "bestModelScore": 0,
            "models": [],
            "message": "Run model training to generate a model comparison report.",
        }

    with open(MODEL_COMPARISON_JSON_PATH, "r", encoding="utf-8") as file_obj:
        payload = json.load(file_obj)

    best_model = next(
        (model for model in payload.get("models", []) if model.get("isBest")), None
    )
    payload["ready"] = True
    payload["bestModelName"] = payload.get("bestModelName") or (best_model or {}).get(
        "modelName", ""
    )
    payload["bestModelScore"] = payload.get("bestModelScore") or (best_model or {}).get(
        "testF1", 0
    )
    payload["reportMeta"] = file_meta(MODEL_COMPARISON_CSV_PATH)
    return payload


def build_status_payload() -> dict:
    model_ready = MODEL_PATH.exists() and PREPROCESSOR_PATH.exists()
    mongo_ready, mongo_meta = mongo_health()
    sample_ready = SAMPLE_DATA_PATH.exists()
    output_ready = PREDICTION_OUTPUT_PATH.exists()
    model_comparison_ready = MODEL_COMPARISON_JSON_PATH.exists()
    return {
        "model": {
            "status": "Ready" if model_ready else "Missing",
            "ready": model_ready,
            "meta": file_meta(MODEL_PATH),
        },
        "preprocessor": {
            "status": "Ready" if PREPROCESSOR_PATH.exists() else "Missing",
            "ready": PREPROCESSOR_PATH.exists(),
            "meta": file_meta(PREPROCESSOR_PATH),
        },
        "mongo": {
            "status": "Connected" if mongo_ready else "Unavailable",
            "ready": mongo_ready,
            "meta": mongo_meta if mongo_db_url else safe_mongo_description(mongo_db_url),
        },
        "sampleData": {
            "status": "Available" if sample_ready else "Missing",
            "ready": sample_ready,
            "meta": file_meta(SAMPLE_DATA_PATH),
        },
        "output": {
            "status": "Available" if output_ready else "No predictions yet",
            "ready": output_ready,
            "meta": file_meta(PREDICTION_OUTPUT_PATH),
        },
        "modelComparison": {
            "status": "Available" if model_comparison_ready else "Not generated",
            "ready": model_comparison_ready,
            "meta": file_meta(MODEL_COMPARISON_JSON_PATH),
        },
        "gemini": {
            "status": "Configured" if GEMINI_API_KEY else "Missing",
            "ready": bool(GEMINI_API_KEY),
            "meta": GEMINI_MODEL if GEMINI_API_KEY else "Set GEMINI_API_KEY in .env",
        },
        "repo": {
            "name": f"{DAGSHUB_REPO_OWNER}/{DAGSHUB_REPO_NAME}",
            "url": f"https://dagshub.com/{DAGSHUB_REPO_OWNER}/{DAGSHUB_REPO_NAME}",
        },
    }


@app.get("/", tags=["ui"])
async def index():
    status_payload = build_status_payload()

    return render_template(
        "index.html",
        MODEL_STATUS=status_payload["model"]["status"],
        MODEL_STATUS_CLASS=status_class(status_payload["model"]["ready"]),
        MODEL_META=escape(status_payload["model"]["meta"]),
        PREPROCESSOR_META=escape(status_payload["preprocessor"]["meta"]),
        MONGO_STATUS=status_payload["mongo"]["status"],
        MONGO_STATUS_CLASS=status_class(status_payload["mongo"]["ready"]),
        MONGO_META=escape(status_payload["mongo"]["meta"]),
        SAMPLE_STATUS=status_payload["sampleData"]["status"],
        SAMPLE_STATUS_CLASS=status_class(status_payload["sampleData"]["ready"]),
        SAMPLE_META=escape(status_payload["sampleData"]["meta"]),
        OUTPUT_STATUS=status_payload["output"]["status"],
        OUTPUT_STATUS_CLASS=status_class(status_payload["output"]["ready"]),
        OUTPUT_META=escape(status_payload["output"]["meta"]),
        DAGSHUB_REPO=escape(status_payload["repo"]["name"]),
        DAGSHUB_URL=escape(status_payload["repo"]["url"]),
        GEMINI_STATUS=status_payload["gemini"]["status"],
        GEMINI_STATUS_CLASS=status_class(status_payload["gemini"]["ready"]),
        GEMINI_META=escape(status_payload["gemini"]["meta"]),
    )


@app.get("/api/status")
async def api_status(authorization: str | None = Header(default=None)):
    require_authenticated_user(authorization)
    return build_status_payload()


@app.post("/api/auth/signup")
async def api_auth_signup(payload: AuthSignupPayload):
    require_database()
    email = normalize_email(payload.email)
    validate_auth_payload(email=email, password=payload.password, name=payload.name)

    if auth_user_collection.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="An account already exists for this email.")

    created_at = datetime.now(timezone.utc)
    user_document = {
        "name": payload.name.strip(),
        "email": email,
        "passwordHash": hash_password(payload.password),
        "createdAt": created_at,
    }
    inserted = auth_user_collection.insert_one(user_document)
    user_document["_id"] = inserted.inserted_id
    session = create_auth_session(str(inserted.inserted_id))
    return {"user": serialize_auth_user(user_document), **session}


@app.post("/api/auth/login")
async def api_auth_login(payload: AuthLoginPayload):
    require_database()
    email = normalize_email(payload.email)
    validate_auth_payload(email=email, password=payload.password)

    user_document = auth_user_collection.find_one({"email": email})
    if not user_document or not verify_password(payload.password, user_document.get("passwordHash", "")):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")

    session = create_auth_session(str(user_document["_id"]))
    return {"user": serialize_auth_user(user_document), **session}


@app.get("/api/auth/me")
async def api_auth_me(authorization: str | None = Header(default=None)):
    user_document = require_authenticated_user(authorization)
    return {"user": serialize_auth_user(user_document)}


@app.post("/api/auth/logout")
async def api_auth_logout(authorization: str | None = Header(default=None)):
    require_database()
    token = extract_bearer_token(authorization)
    if token:
        auth_session_collection.delete_one({"token": token})
    return {"ok": True}


@app.get("/api/prediction-history")
async def api_prediction_history(limit: int = 10, authorization: str | None = Header(default=None)):
    try:
        user_document = require_authenticated_user(authorization)
        return {
            "items": get_url_prediction_history(limit, user_document),
            "requiresAuth": False,
        }
    except HTTPException:
        raise
    except Exception as e:
        error = NetworkSecurityException(e, sys)
        return {
            "error": str(error),
            "message": "Could not load URL prediction history from MongoDB.",
            "items": [],
        }


@app.get("/api/model-comparison")
async def api_model_comparison(authorization: str | None = Header(default=None)):
    try:
        require_authenticated_user(authorization)
        return build_model_comparison_payload()
    except HTTPException:
        raise
    except Exception as e:
        error = NetworkSecurityException(e, sys)
        return {
            "ready": False,
            "error": str(error),
            "message": "Could not load the model comparison report.",
            "models": [],
        }


@app.get("/train")
async def train_route():
    try:
        from networksecurity.pipeline.training_pipeline import TrainingPipeline

        train_pipeline = TrainingPipeline()
        train_pipeline.run_pipeline()
        return render_template(
            "message.html",
            STATUS_CLASS="good",
            TITLE="Training completed",
            MESSAGE="The training pipeline finished successfully. New model artifacts are available for prediction.",
            DETAIL=escape(
                f"MLflow tracking repo: {DAGSHUB_REPO_OWNER}/{DAGSHUB_REPO_NAME}"
            ),
            PRIMARY_ACTION="/",
            PRIMARY_LABEL="Back to dashboard",
            SECONDARY_ACTION="/docs",
            SECONDARY_LABEL="Open API docs",
        )
    except Exception as e:
        error = NetworkSecurityException(e, sys)
        return render_template(
            "message.html",
            STATUS_CLASS="danger",
            TITLE="Training failed",
            MESSAGE="The training pipeline could not finish.",
            DETAIL=escape(str(error)),
            PRIMARY_ACTION="/",
            PRIMARY_LABEL="Back to dashboard",
            SECONDARY_ACTION="/docs",
            SECONDARY_LABEL="Open API docs",
        )


@app.post("/predict")
async def predict_route(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)
        input_df = df.drop(columns=[TARGET_COLUMN], errors="ignore")
        y_pred = predict_dataframe(input_df)
        df["predicted_column"] = y_pred

        PREDICTION_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(PREDICTION_OUTPUT_PATH, index=False)

        preview_df = df.head(200)
        table_html = preview_df.to_html(classes="data-table", index=False)
        predicted_counts = df["predicted_column"].value_counts().to_dict()
        phishing_count = int(predicted_counts.get(0, 0))
        legitimate_count = int(predicted_counts.get(1, 0))

        return render_template(
            "results.html",
            FILE_NAME=escape(file.filename or "Uploaded CSV"),
            ROW_COUNT=f"{len(df):,}",
            COLUMN_COUNT=f"{len(df.columns):,}",
            PHISHING_COUNT=f"{phishing_count:,}",
            LEGITIMATE_COUNT=f"{legitimate_count:,}",
            TABLE_HTML=table_html,
            PREVIEW_NOTE=escape(
                "Showing first 200 rows." if len(df) > 200 else "Showing all rows."
            ),
            OUTPUT_META=escape(file_meta(PREDICTION_OUTPUT_PATH)),
        )

    except Exception as e:
        error = NetworkSecurityException(e, sys)
        return render_template(
            "message.html",
            STATUS_CLASS="danger",
            TITLE="Prediction failed",
            MESSAGE="The CSV could not be processed.",
            DETAIL=escape(str(error)),
            PRIMARY_ACTION="/",
            PRIMARY_LABEL="Back to dashboard",
            SECONDARY_ACTION="/docs",
            SECONDARY_LABEL="Open API docs",
        )


@app.post("/predict-url")
async def predict_url_route(url: str = Form(...)):
    try:
        result = build_url_prediction(url)
        result = save_url_prediction(result)
        features = {feature["name"]: feature["value"] for feature in result["features"]}

        return render_template(
            "url_result.html",
            URL=escape(result["url"]),
            FINAL_URL=escape(result["finalUrl"]),
            HOSTNAME=escape(result["hostname"]),
            DNS_STATUS=escape(result["dnsStatus"]),
            HTML_STATUS=escape(result["htmlStatus"]),
            RESULT_LABEL=escape(result["label"]),
            RESULT_CLASS=result["statusClass"],
            RESULT_VALUE=str(result["prediction"]),
            GEMINI_SUMMARY=escape(result["summary"]),
            FEATURE_ROWS=feature_rows(features),
        )
    except Exception as e:
        error = NetworkSecurityException(e, sys)
        return render_template(
            "message.html",
            STATUS_CLASS="danger",
            TITLE="URL prediction failed",
            MESSAGE="The website URL could not be converted into model features.",
            DETAIL=escape(str(error)),
            PRIMARY_ACTION="/",
            PRIMARY_LABEL="Back to dashboard",
            SECONDARY_ACTION="/docs",
            SECONDARY_LABEL="Open API docs",
        )


@app.post("/api/predict-url")
async def api_predict_url(
    background_tasks: BackgroundTasks,
    url: str = Form(...),
    authorization: str | None = Header(default=None),
):
    try:
        user_document = require_authenticated_user(authorization)
        result = save_url_prediction(
            build_url_prediction(url, generate_gemini=False), user_document
        )
        job_id = start_gemini_explanation_job(result, user_document)
        result["explanationJobId"] = job_id
        url_prediction_collection.update_one(
            {"_id": ObjectId(result["historyId"]), "userId": str(user_document["_id"])},
            {"$set": {"explanationJobId": job_id}},
        )
        background_tasks.add_task(
            generate_gemini_explanation_job,
            job_id,
            result.copy(),
            str(user_document["_id"]),
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        error = NetworkSecurityException(e, sys)
        return {
            "error": str(error),
            "message": "The website URL could not be converted into model features.",
        }


@app.get("/api/prediction-explanations/{job_id}")
async def api_prediction_explanation(
    job_id: str, authorization: str | None = Header(default=None)
):
    user_document = require_authenticated_user(authorization)
    return get_gemini_explanation_job(job_id, user_document)


@app.post("/api/predict-csv")
async def api_predict_csv(file: UploadFile = File(...), authorization: str | None = Header(default=None)):
    try:
        require_authenticated_user(authorization)
        df = pd.read_csv(file.file)
        input_df = df.drop(columns=[TARGET_COLUMN], errors="ignore")
        y_pred = predict_dataframe(input_df)
        df["predicted_column"] = y_pred

        PREDICTION_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(PREDICTION_OUTPUT_PATH, index=False)

        predicted_counts = df["predicted_column"].value_counts().to_dict()
        preview = df.head(8).to_dict(orient="records")
        return {
            "fileName": file.filename or "Uploaded CSV",
            "rows": len(df),
            "columns": len(df.columns),
            "phishing": int(predicted_counts.get(0, 0)),
            "legitimate": int(predicted_counts.get(1, 0)),
            "outputMeta": file_meta(PREDICTION_OUTPUT_PATH),
            "preview": preview,
        }
    except HTTPException:
        raise
    except Exception as e:
        error = NetworkSecurityException(e, sys)
        return {
            "error": str(error),
            "message": "The CSV could not be processed.",
        }


@app.get("/download-output")
async def download_output():
    if not PREDICTION_OUTPUT_PATH.exists():
        return render_template(
            "message.html",
            STATUS_CLASS="warn",
            TITLE="No output file yet",
            MESSAGE="Run a prediction first to generate prediction_output/output.csv.",
            DETAIL="",
            PRIMARY_ACTION="/",
            PRIMARY_LABEL="Back to dashboard",
            SECONDARY_ACTION="/docs",
            SECONDARY_LABEL="Open API docs",
        )
    return FileResponse(
        PREDICTION_OUTPUT_PATH,
        media_type="text/csv",
        filename="network_security_predictions.csv",
    )


@app.get("/sample-data")
async def sample_data():
    return FileResponse(
        SAMPLE_DATA_PATH,
        media_type="text/csv",
        filename="phisingData.csv",
    )


if __name__ == "__main__":
    app_run(app, host="0.0.0.0", port=8000)
