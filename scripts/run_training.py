"""
DVC Stage: Model Training
Reads the latest transformed numpy arrays from Artifacts/ and trains models.
Logs all experiments to DagsHub via MLflow.
"""
import os
import glob

from networksecurity.components.model_trainer import ModelTrainer
from networksecurity.entity.config_entity import ModelTrainerConfig, TrainingPipelineConfig
from networksecurity.entity.artifact_entity import DataTransformationArtifact
from networksecurity.logging.logger import logging

def main():
    config = TrainingPipelineConfig()

    # Find latest transformed data
    trans_dirs = sorted(glob.glob("Artifacts/*/data_transformation/transformed"), reverse=True)
    if not trans_dirs:
        raise FileNotFoundError("No transformed data found. Run data_transformation stage first.")

    trans_dir = trans_dirs[0]

    # Find latest preprocessor object
    obj_files = sorted(
        glob.glob("Artifacts/*/data_transformation/transformed_object/preprocessing.pkl"),
        reverse=True
    )
    if not obj_files:
        raise FileNotFoundError("No preprocessor object found. Run data_transformation stage first.")

    obj_path = obj_files[0]

    logging.info(f"Using transformed data from: {trans_dir}")
    logging.info(f"Using preprocessor from: {obj_path}")

    trans_artifact = DataTransformationArtifact(
        transformed_object_file_path=obj_path,
        transformed_train_file_path=os.path.join(trans_dir, "train.npy"),
        transformed_test_file_path=os.path.join(trans_dir, "test.npy")
    )

    model_config = ModelTrainerConfig(config)
    mt = ModelTrainer(
        model_trainer_config=model_config,
        data_transformation_artifact=trans_artifact
    )
    artifact = mt.initiate_model_trainer()

    logging.info(f"Model Training Done: {artifact}")
    print(artifact)

if __name__ == "__main__":
    main()
