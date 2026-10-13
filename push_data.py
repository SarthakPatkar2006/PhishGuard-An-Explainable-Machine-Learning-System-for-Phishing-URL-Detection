import os
import sys
import json

from dotenv import load_dotenv
load_dotenv()

MONGO_DB_URL=os.getenv("MONGODB_URL_KEY") or os.getenv("MONGO_DB_URL")
##certi is python package that provides set of root certificates
##used to make secure http connection we are making http connection between mongodb
##we will do requests so it ensures that it only trusts this certifcates
import certifi
ca=certifi.where()

import pandas as pd
import numpy as np
import pymongo
from networksecurity.exception.exception import NetworkSecurityException
from networksecurity.logging.logger import logging
from networksecurity.constants.training_pipeline import (
    DATA_INGESTION_COLLECTION_NAME,
    DATA_INGESTION_DATABASE_NAME,
)

class NetworkDataExtract():
    def __init__(self):
        try:
            pass
        except Exception as e:
            raise NetworkSecurityException(e,sys)
        
    def csv_to_json_convertor(self,file_path):
        try:
            data=pd.read_csv(file_path)
            data.reset_index(drop=True,inplace=True)
            records=list(json.loads(data.T.to_json()).values())
            return records
        except Exception as e:
            raise NetworkSecurityException(e,sys)
        
    def insert_data_mongodb(self,records,database,collection):
        try:
            if not MONGO_DB_URL:
                raise ValueError("MongoDB Atlas URI is not configured. Set MONGODB_URL_KEY or MONGO_DB_URL.")
            self.database=database
            self.collection=collection
            self.records=records

            mongo_kwargs = {}
            if MONGO_DB_URL and MONGO_DB_URL.lower().startswith("mongodb+srv://"):
                mongo_kwargs["tlsCAFile"] = ca
            self.mongo_client=pymongo.MongoClient(MONGO_DB_URL, **mongo_kwargs)
            self.database=self.mongo_client[self.database]
            self.collection=self.database[self.collection]
            self.collection.insert_many(self.records)
            return len(self.records)
        except Exception as e:
            raise NetworkSecurityException(e,sys)
        
if __name__=='__main__':
    FILE_PATH=os.path.join("Network_Data", "phisingData.csv")
    DATABASE=DATA_INGESTION_DATABASE_NAME
    Collection=DATA_INGESTION_COLLECTION_NAME
    newtworkobj=NetworkDataExtract()
    records=newtworkobj.csv_to_json_convertor(file_path=FILE_PATH)
    no_of_records=newtworkobj.insert_data_mongodb(records,DATABASE,Collection)
    print(f"Inserted {no_of_records} records into {DATABASE}.{Collection}")
