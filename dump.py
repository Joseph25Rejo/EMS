import pandas as pd
from pymongo import MongoClient

# Step 1: MongoDB Atlas connection URI
MONGO_URI = "mongodb+srv://joseph25rejo:exam-management-system@exammanagementsystem.7otxrdo.mongodb.net/exam-scheduling"

# Step 2: Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["exam-scheduling"]
collection = db["final_schedule"]

# Step 3: Delete all documents from the collection
collection.delete_many({})
print("✅ Existing data deleted from 'exam-scheduling.'.")

# Step 4: Read the CSV file
df = pd.read_csv("final_schedule.csv")

# Step 5: Convert DataFrame to dictionary and upload
records = df.to_dict(orient="records")
if records:
    collection.insert_many(records)
    print(f"✅ Inserted {len(records)} documents into 'final_schedule'.")
else:
    print("⚠️ No records found in CSV to upload.")
