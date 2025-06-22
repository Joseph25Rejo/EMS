import pandas as pd
from pymongo import MongoClient

# Step 1: MongoDB Atlas connection URI
MONGO_URI = "mongodb+srv://joseph25rejo:exam-management-system@exammanagementsystem.7otxrdo.mongodb.net/exam-scheduling"

# Step 2: Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["auth"]
collection = db["studentauth"]

distinct_students = db.students.distinct('USN')
distinct_count = len([id for id in distinct_students if id]) 
print(f"Distinct student count: {distinct_count}")