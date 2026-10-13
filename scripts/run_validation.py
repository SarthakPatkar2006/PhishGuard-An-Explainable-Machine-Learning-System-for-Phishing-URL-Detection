"""
DVC Stage: Data Validation
Reads the latest ingested data from Artifacts/ and validates it.
"""
import os
import glob
import sys

from networksecurity.components.data_validation import DataValidation
from networksecurity.entity.config_entity import DataValidationConfig, TrainingPipelineConfig
from networksecurity.entity.artifact_entity import DataIngestionArtifact
from networksecurity.logging.logger import logging

def main():
    config = TrainingPipelineConfig()

    # Find the latest ingested train/test files
    ingested_dirs = sorted(glob.glob("Artifacts/*/data_ingestion/ingested"), reverse=True)
    if not ingested_dirs:
        raise FileNotFoundError("No ingested data found. Run data_ingestion stage first.")

    ingested_dir = ingested_dirs[0]
    train_path = os.path.join(ingested_dir, "train.csv")
    test_path  = os.path.join(ingested_dir, "test.csv")

    logging.info(f"Using ingested data from: {ingested_dir}")

    ingestion_artifact = DataIngestionArtifact(
        trained_file_path=train_path,
        test_file_path=test_path
    )

    val_config = DataValidationConfig(config)
    dv = DataValidation(ingestion_artifact, val_config)
    artifact = dv.initiate_data_validation()

    logging.info(f"Data Validation Done: {artifact}")
    print(artifact)

if __name__ == "__main__":
    main()
