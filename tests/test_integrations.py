import json
import unittest
from unittest.mock import MagicMock, patch
from urllib.error import HTTPError

import app


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")

    def __iter__(self):
        yield f"data: {json.dumps(self.payload)}\n\n".encode("utf-8")


class GeminiIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.features = {"SSLfinal_State": 1, "Page_Rank": -1}
        self.metadata = {"hostname": "example.test", "html_status": "Fetched"}

    @patch.object(app, "GEMINI_API_KEY", "test-key")
    @patch.object(app.time, "sleep")
    @patch.object(app, "urlopen")
    def test_retries_transient_error_then_returns_gemini_response(self, urlopen, sleep):
        shap_factors = [
            {"name": "URL_of_Anchor", "value": 1, "contribution": 0.16, "direction": "Supports selected prediction"},
            {"name": "SSLfinal_State", "value": 1, "contribution": 0.10, "direction": "Supports selected prediction"},
        ]
        urlopen.side_effect = [
            HTTPError("https://example.test", 503, "Unavailable", {}, None),
            FakeResponse({"status": "completed", "steps": [{"type": "model_output", "content": [{"type": "text", "text": "Assessment: The selected prediction is Legitimate, but it is not proof that the website is safe. SHAP evidence: URL_of_Anchor = 1 supports this prediction, and SSLfinal_State = 1 also supports it. Recommendation: Verify the domain independently before entering credentials."}]}]}),
        ]

        summary = app.explain_prediction_with_gemini(
            "https://example.test", "Legitimate", self.features, self.metadata, shap_factors
        )

        self.assertIn("Assessment:", summary)
        self.assertIn("URL_of_Anchor", summary)
        payload = json.loads(urlopen.call_args.args[0].data.decode("utf-8"))
        prompt = payload["input"]
        self.assertIn("Tree SHAP table", prompt)
        self.assertIn("URL_of_Anchor", prompt)
        self.assertNotIn("Suspicious feature names", prompt)
        self.assertEqual(payload["model"], app.GEMINI_MODEL)
        self.assertEqual(payload["generation_config"]["thinking_level"], "minimal")
        self.assertEqual(urlopen.call_args.args[0].get_header("X-goog-api-key"), "test-key")
        self.assertEqual(urlopen.call_args.args[0].full_url, "https://generativelanguage.googleapis.com/v1beta/interactions")
        self.assertEqual(urlopen.call_count, 2)
        sleep.assert_called_once_with(1)

    @patch.object(app, "GEMINI_API_KEY", "test-key")
    @patch.object(app.time, "sleep")
    @patch.object(app, "urlopen")
    def test_gemini_failure_returns_labelled_local_explanation(self, urlopen, sleep):
        urlopen.side_effect = HTTPError("https://example.test", 503, "Unavailable", {}, None)

        summary = app.explain_prediction_with_gemini(
            "https://example.test", "Legitimate", self.features, self.metadata
        )

        self.assertTrue(summary.startswith("Local, rule-based explanation:"))
        self.assertIn("Legitimate", summary)
        self.assertEqual(urlopen.call_count, 3)
        self.assertEqual(sleep.call_count, 2)

    @patch.object(app, "GEMINI_API_KEY", "test-key")
    @patch.object(app.time, "sleep")
    @patch.object(app, "urlopen")
    def test_invalid_key_error_is_not_retried(self, urlopen, sleep):
        urlopen.side_effect = HTTPError("https://example.test", 403, "Forbidden", {}, None)

        summary = app.explain_prediction_with_gemini(
            "https://example.test", "Phishing", self.features, self.metadata
        )

        self.assertTrue(summary.startswith("Local, rule-based explanation:"))
        self.assertEqual(urlopen.call_count, 1)
        sleep.assert_not_called()

    def test_generic_gemini_403_explains_project_permission_next_step(self):
        error = HTTPError("https://generativelanguage.googleapis.com/v1beta/interactions", 403, "Forbidden", {}, None)
        try:
            diagnostic = app.gemini_http_diagnostic(error)
        finally:
            error.close()

        self.assertIn("HTTP 403", diagnostic)
        self.assertIn("GEMINI_API_KEY", diagnostic)

    @patch.object(app, "GEMINI_API_KEY", "test-key")
    @patch.object(app, "urlopen")
    def test_gemini_diagnostic_contains_status_without_api_key(self, urlopen):
        error_body = json.dumps(
            {"error": {"code": "invalid_api_key", "type": "authentication_error", "message": "API key is not authorized."}}
        ).encode("utf-8")
        urlopen.side_effect = HTTPError(
            "https://example.test", 403, "Forbidden", {}, MagicMock(read=MagicMock(return_value=error_body))
        )

        _, diagnostic = app.explain_prediction_with_gemini_result(
            "https://example.test", "Legitimate", self.features, self.metadata
        )

        self.assertIn("HTTP 403", diagnostic)
        self.assertIn("authentication_error", diagnostic)
        self.assertNotIn("test-key", diagnostic)

    def test_explanation_job_is_user_scoped_and_updates_when_ready(self):
        original_jobs = app.explanation_jobs.copy()
        app.explanation_jobs.clear()
        user = {"_id": "user-one"}
        try:
            job_id = app.start_gemini_explanation_job({}, user)
            self.assertEqual(app.get_gemini_explanation_job(job_id, user)["status"], "pending")
            with self.assertRaises(app.HTTPException) as context:
                app.get_gemini_explanation_job(job_id, {"_id": "another-user"})
            self.assertEqual(context.exception.status_code, 404)
            with app.explanation_jobs_lock:
                app.explanation_jobs[job_id].update(
                    {"status": "ready", "summary": "Grounded SHAP explanation.", "explanationSource": "Gemini"}
                )
            update = app.get_gemini_explanation_job(job_id, user)
            self.assertEqual(update["status"], "ready")
            self.assertEqual(update["summary"], "Grounded SHAP explanation.")
        finally:
            app.explanation_jobs.clear()
            app.explanation_jobs.update(original_jobs)


class PredictionAndMongoTests(unittest.TestCase):
    def test_prediction_survives_gemini_failure(self):
        feature_frame = MagicMock()
        features = {"SSLfinal_State": 1, "Page_Rank": -1}
        metadata = {
            "normalized_url": "https://example.test",
            "final_url": "https://example.test",
            "hostname": "example.test",
            "dns_status": "Resolved",
            "html_status": "Fetched",
        }
        with patch.object(app, "extract_url_features", return_value=(feature_frame, features, metadata)), patch.object(
            app, "predict_dataframe", return_value=[1]
        ), patch.object(app, "build_shap_explanation", return_value={
            "available": True,
            "method": "Tree SHAP",
            "message": "Top model feature contributions for this prediction.",
            "topFeatures": [{"name": "SSLfinal_State", "value": 1, "contribution": 0.2, "direction": "Supports selected prediction"}],
        }), patch.object(
            app,
            "explain_prediction_with_gemini_result",
            return_value=("Local, rule-based explanation: unavailable", "Gemini API HTTP 503: Unavailable"),
        ):
            result = app.build_url_prediction("example.test")

        self.assertEqual(result["prediction"], 1)
        self.assertEqual(result["label"], "Legitimate")
        self.assertNotIn("confidence", result)
        self.assertTrue(result["summary"].startswith("Local, rule-based explanation:"))
        self.assertEqual(result["explanationSource"], "Local rule-based fallback")
        self.assertIn("HTTP 503", result["explanationDiagnostic"])
        self.assertTrue(result["shap"]["available"])

    @patch.object(app, "GEMINI_API_KEY", "test-key")
    @patch.object(app, "urlopen")
    def test_incomplete_gemini_explanation_uses_local_fallback(self, urlopen):
        urlopen.return_value = FakeResponse(
            {"status": "completed", "steps": [{"type": "model_output", "content": [{"type": "text", "text": "Verify the domain before signing in."}]}]}
        )

        summary = app.explain_prediction_with_gemini(
            "https://example.test",
            "Legitimate",
            {"SSLfinal_State": 1},
            {"hostname": "example.test", "html_status": "Fetched"},
            [{"name": "SSLfinal_State", "value": 1, "contribution": 0.1, "direction": "Supports selected prediction"}],
        )

        self.assertTrue(summary.startswith("Local, rule-based explanation:"))

    def test_mongo_uri_uses_atlas_variable_and_never_defaults_to_localhost(self):
        with patch.dict(app.os.environ, {"MONGODB_URL_KEY": "", "MONGO_DB_URL": "mongodb+srv://cluster.example"}, clear=False):
            self.assertEqual(app.configured_mongo_uri(), "mongodb+srv://cluster.example")
        with patch.object(app.pymongo, "MongoClient") as mongo_client:
            self.assertIsNone(app.create_mongo_client(None))
            mongo_client.assert_not_called()

    @patch.object(app, "initialize_database")
    def test_mongo_health_pings_the_shared_client(self, initialize_database):
        original_uri, original_client = app.mongo_db_url, app.client
        fake_client = MagicMock()
        try:
            app.mongo_db_url = "mongodb+srv://cluster.example"
            app.client = fake_client
            ready, detail = app.mongo_health()
        finally:
            app.mongo_db_url, app.client = original_uri, original_client

        self.assertTrue(ready)
        self.assertEqual(detail, "Connected")
        initialize_database.assert_called_once()
        fake_client.admin.command.assert_called_once_with("ping")

    def test_database_initialization_does_not_boolean_test_pymongo_database(self):
        original_state = (
            app.mongo_db_url,
            app.client,
            app.database,
            app.collection,
            app.url_prediction_collection,
            app.auth_user_collection,
            app.auth_session_collection,
        )
        fake_client = MagicMock()
        try:
            app.mongo_db_url = "mongodb+srv://cluster.example"
            app.client = None
            app.database = None
            with patch.object(app, "create_mongo_client", return_value=fake_client) as create_client:
                app.initialize_database()
                app.initialize_database()
            create_client.assert_called_once_with("mongodb+srv://cluster.example")
        finally:
            (
                app.mongo_db_url,
                app.client,
                app.database,
                app.collection,
                app.url_prediction_collection,
                app.auth_user_collection,
                app.auth_session_collection,
            ) = original_state


if __name__ == "__main__":
    unittest.main()
