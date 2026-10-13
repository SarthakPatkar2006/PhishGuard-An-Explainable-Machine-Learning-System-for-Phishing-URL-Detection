"""
DVC Stage: Data Transformation
Reads the latest validated data from Artifacts/ and applies KNN imputation.
"""
import os
import glob
import sys

sys.path.append(os.getcwd())

from networksecurity.components.data_transformation import DataTransformation
from networksecurity.entity.config_entity import DataTransformationConfig, TrainingPipelineConfig
from networksecurity.entity.artifact_entity import DataValidationArtifact
from networksecurity.logging.logger import logging

def main():
    config = TrainingPipelineConfig()

    # Find latest validated data
    val_dirs = sorted(glob.glob("Artifacts/*/data_validation/validated"), reverse=True)
    if not val_dirs:
        raise FileNotFoundError("No validated data found. Run data_validation stage first.")

    val_dir = val_dirs[0]

    # Find drift report
    drift_files = sorted(glob.glob("Artifacts/*/data_validation/drift_report/report.yaml"), reverse=True)
    drift_path = drift_files[0] if drift_files else ""

    logging.info(f"Using validated data from: {val_dir}")

    val_artifact = DataValidationArtifact(
        validation_status=True,
        valid_train_file_path=os.path.join(val_dir, "train.csv"),
        valid_test_file_path=os.path.join(val_dir, "test.csv"),
        invalid_train_file_path=None,
        invalid_test_file_path=None,
        drift_report_file_path=drift_path
    )

    trans_config = DataTransformationConfig(config)
    dt = DataTransformation(val_artifact, trans_config)
    artifact = dt.initiate_data_transformation()

    logging.info(f"Data Transformation Done: {artifact}")
    print(artifact)

if __name__ == "__main__":
    main()
