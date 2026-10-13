import json
import os
import sys
from datetime import datetime

import dagshub
import mlflow
from mlflow import sklearn as mlflow_sklearn
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, ClassifierMixin, clone
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import GridSearchCV
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier

from networksecurity.entity.artifact_entity import DataTransformationArtifact, ModelTrainerArtifact
from networksecurity.entity.config_entity import ModelTrainerConfig
from networksecurity.exception.exception import NetworkSecurityException
from networksecurity.logging.logger import logging
from networksecurity.utils.main_utils.utils import load_numpy_array_data, load_object, save_object
from networksecurity.utils.ml_utils.metric.classification_metric import get_classification_score
from networksecurity.utils.ml_utils.model.estimator import NetworkModel

DAGSHUB_REPO_OWNER = os.getenv("DAGSHUB_REPO_OWNER", "Sahilpatil009")
DAGSHUB_REPO_NAME = os.getenv("DAGSHUB_REPO_NAME", "network-security-edi")

dagshub.init(repo_owner=DAGSHUB_REPO_OWNER, repo_name=DAGSHUB_REPO_NAME, mlflow=True)


class EncodedTargetClassifier(ClassifierMixin, BaseEstimator):
    """Wrap classifiers that require 0/1 labels while preserving original -1/1 predictions."""

    def __init__(self, estimator):
        self.estimator = estimator

    def fit(self, X, y):
        self.label_encoder_ = LabelEncoder()
        encoded_y = self.label_encoder_.fit_transform(y)
        self.estimator_ = clone(self.estimator)
        self.estimator_.fit(X, encoded_y)
        self.classes_ = self.label_encoder_.classes_
        return self

    def predict(self, X):
        predictions = np.asarray(self.estimator_.predict(X)).astype(int)
        return self.label_encoder_.inverse_transform(predictions)

    def predict_proba(self, X):
        if hasattr(self.estimator_, "predict_proba"):
            return self.estimator_.predict_proba(X)
        raise AttributeError("Wrapped estimator does not support predict_proba.")


class ModelTrainer:
    def __init__(self, model_trainer_config: ModelTrainerConfig, data_transformation_artifact: DataTransformationArtifact):
        try:
            self.model_trainer_config = model_trainer_config
            self.data_transformation_artifact = data_transformation_artifact
        except Exception as e:
            raise NetworkSecurityException(e, sys)

    def build_model_candidates(self):
        models = {
            "Random Forest": RandomForestClassifier(random_state=42),
            "Logistic Regression": LogisticRegression(max_iter=1000, solver="liblinear", random_state=42),
            "Decision Tree": DecisionTreeClassifier(random_state=42),
        }
        params = {
            "Random Forest": {
                "max_depth": [None, 10, 20],
                "n_estimators": [50, 100],
            },
            "Logistic Regression": {
                "C": [0.1, 1.0, 10.0],
            },
            "Decision Tree": {
                "criterion": ["gini", "entropy"],
                "max_depth": [None, 10, 20],
            },
        }
        unavailable_models = {}

        try:
            from xgboost import XGBClassifier

            models["XGBoost"] = EncodedTargetClassifier(
                XGBClassifier(
                    eval_metric="logloss",
                    learning_rate=0.1,
                    n_estimators=100,
                    n_jobs=1,
                    objective="binary:logistic",
                    random_state=42,
                    tree_method="hist",
                )
            )
            params["XGBoost"] = {
                "estimator__learning_rate": [0.05, 0.1],
                "estimator__max_depth": [3, 5],
                "estimator__n_estimators": [50, 100],
            }
        except Exception as e:
            unavailable_models["XGBoost"] = f"Install xgboost to include this model. Detail: {str(e)}"

        return models, params, unavailable_models

    def track_mlflow(self, model, classification_metric, model_name: str, stage: str):
        try:
            with mlflow.start_run(run_name=f"{model_name} {stage}"):
                mlflow.log_param("model_name", model_name)
                mlflow.log_param("stage", stage)
                mlflow.log_metric("f1_score", classification_metric.f1_score)
                mlflow.log_metric("precision_score", classification_metric.precision_score)
                mlflow.log_metric("recall_score", classification_metric.recall_score)
                mlflow_sklearn.log_model(model, "model")
        except Exception as e:
            logging.info(f"MLflow tracking skipped for {model_name} {stage}. Error: {str(e)}")

    def track_model_comparison(self, report_rows: list):
        try:
            with mlflow.start_run(run_name="model_comparison"):
                for row in report_rows:
                    if row["status"] != "trained":
                        continue
                    metric_prefix = row["modelName"].lower().replace(" ", "_")
                    mlflow.log_metric(f"{metric_prefix}_test_f1", row["testF1"])
                    mlflow.log_metric(f"{metric_prefix}_test_accuracy", row["testAccuracy"])
                    mlflow.log_metric(f"{metric_prefix}_test_precision", row["testPrecision"])
                    mlflow.log_metric(f"{metric_prefix}_test_recall", row["testRecall"])
                    if row["isBest"]:
                        mlflow.log_param("best_model_name", row["modelName"])
        except Exception as e:
            logging.info(f"MLflow model comparison tracking skipped. Error: {str(e)}")

    def compare_models(self, X_train, y_train, X_test, y_test):
        models, params, unavailable_models = self.build_model_candidates()
        fitted_models = {}
        report_rows = []

        for model_name, model in models.items():
            try:
                logging.info(f"Training candidate model: {model_name}")
                grid_search = GridSearchCV(
                    estimator=model,
                    param_grid=params.get(model_name, {}),
                    cv=3,
                    n_jobs=-1,
                    scoring="f1",
                )
                grid_search.fit(X_train, y_train)
                best_estimator = grid_search.best_estimator_

                y_train_pred = best_estimator.predict(X_train)
                y_test_pred = best_estimator.predict(X_test)
                train_metric = get_classification_score(y_true=y_train, y_pred=y_train_pred)
                test_metric = get_classification_score(y_true=y_test, y_pred=y_test_pred)

                fitted_models[model_name] = best_estimator
                report_rows.append(
                    {
                        "modelName": model_name,
                        "status": "trained",
                        "trainF1": float(train_metric.f1_score),
                        "testF1": float(test_metric.f1_score),
                        "trainPrecision": float(train_metric.precision_score),
                        "testPrecision": float(test_metric.precision_score),
                        "trainRecall": float(train_metric.recall_score),
                        "testRecall": float(test_metric.recall_score),
                        "trainAccuracy": float(accuracy_score(y_train, y_train_pred)),
                        "testAccuracy": float(accuracy_score(y_test, y_test_pred)),
                        "bestParams": grid_search.best_params_,
                        "isBest": False,
                        "error": "",
                    }
                )
            except Exception as e:
                logging.info(f"Candidate model failed: {model_name}. Error: {str(e)}")
                report_rows.append(
                    {
                        "modelName": model_name,
                        "status": "failed",
                        "trainF1": 0.0,
                        "testF1": 0.0,
                        "trainPrecision": 0.0,
                        "testPrecision": 0.0,
                        "trainRecall": 0.0,
                        "testRecall": 0.0,
                        "trainAccuracy": 0.0,
                        "testAccuracy": 0.0,
                        "bestParams": {},
                        "isBest": False,
                        "error": str(e),
                    }
                )

        for model_name, reason in unavailable_models.items():
            report_rows.append(
                {
                    "modelName": model_name,
                    "status": "unavailable",
                    "trainF1": 0.0,
                    "testF1": 0.0,
                    "trainPrecision": 0.0,
                    "testPrecision": 0.0,
                    "trainRecall": 0.0,
                    "testRecall": 0.0,
                    "trainAccuracy": 0.0,
                    "testAccuracy": 0.0,
                    "bestParams": {},
                    "isBest": False,
                    "error": reason,
                }
            )

        trained_rows = [row for row in report_rows if row["status"] == "trained"]
        if not trained_rows:
            raise Exception("No candidate model trained successfully.")

        best_row = max(trained_rows, key=lambda row: (row["testF1"], row["testAccuracy"]))
        best_model_name = best_row["modelName"]
        for row in report_rows:
            row["isBest"] = row["modelName"] == best_model_name

        return fitted_models[best_model_name], best_model_name, report_rows

    def save_model_comparison_report(self, best_model_name: str, report_rows: list):
        generated_at = datetime.utcnow().isoformat() + "Z"
        best_row = next((row for row in report_rows if row["isBest"]), None)
        payload = {
            "ready": True,
            "generatedAt": generated_at,
            "bestModelName": best_model_name,
            "bestModelScore": best_row["testF1"] if best_row else 0.0,
            "models": report_rows,
        }

        report_csv_path = self.model_trainer_config.model_comparison_report_file_path
        report_json_path = self.model_trainer_config.model_comparison_json_file_path
        os.makedirs(os.path.dirname(report_csv_path), exist_ok=True)
        pd.DataFrame(report_rows).to_csv(report_csv_path, index=False)

        with open(report_json_path, "w", encoding="utf-8") as file_obj:
            json.dump(payload, file_obj, indent=2)

        os.makedirs("final_model", exist_ok=True)
        pd.DataFrame(report_rows).to_csv("final_model/model_comparison.csv", index=False)
        with open("final_model/model_comparison.json", "w", encoding="utf-8") as file_obj:
            json.dump(payload, file_obj, indent=2)

        return report_csv_path, report_json_path

    def train_model(self, X_train, y_train, x_test, y_test):
        best_model, best_model_name, report_rows = self.compare_models(
            X_train=X_train,
            y_train=y_train,
            X_test=x_test,
            y_test=y_test,
        )

        y_train_pred = best_model.predict(X_train)
        classification_train_metric = get_classification_score(y_true=y_train, y_pred=y_train_pred)

        y_test_pred = best_model.predict(x_test)
        classification_test_metric = get_classification_score(y_true=y_test, y_pred=y_test_pred)

        report_csv_path, report_json_path = self.save_model_comparison_report(best_model_name, report_rows)

        self.track_mlflow(best_model, classification_train_metric, best_model_name, "train")
        self.track_mlflow(best_model, classification_test_metric, best_model_name, "test")
        self.track_model_comparison(report_rows)

        preprocessor = load_object(file_path=self.data_transformation_artifact.transformed_object_file_path)
        model_dir_path = os.path.dirname(self.model_trainer_config.trained_model_file_path)
        os.makedirs(model_dir_path, exist_ok=True)

        network_model = NetworkModel(preprocessor=preprocessor, model=best_model)
        save_object(self.model_trainer_config.trained_model_file_path, obj=network_model)
        save_object("final_model/model.pkl", best_model)

        model_trainer_artifact = ModelTrainerArtifact(
            trained_model_file_path=self.model_trainer_config.trained_model_file_path,
            train_metric_artifact=classification_train_metric,
            test_metric_artifact=classification_test_metric,
            model_comparison_report_file_path=report_csv_path,
            model_comparison_json_file_path=report_json_path,
            best_model_name=best_model_name,
        )
        logging.info(f"Model trainer artifact: {model_trainer_artifact}")
        return model_trainer_artifact

    def initiate_model_trainer(self) -> ModelTrainerArtifact:
        try:
            train_file_path = self.data_transformation_artifact.transformed_train_file_path
            test_file_path = self.data_transformation_artifact.transformed_test_file_path

            train_arr = load_numpy_array_data(train_file_path)
            test_arr = load_numpy_array_data(test_file_path)

            x_train, y_train, x_test, y_test = (
                train_arr[:, :-1],
                train_arr[:, -1],
                test_arr[:, :-1],
                test_arr[:, -1],
            )

            model_trainer_artifact = self.train_model(x_train, y_train, x_test, y_test)
            return model_trainer_artifact

        except Exception as e:
            raise NetworkSecurityException(e, sys)
