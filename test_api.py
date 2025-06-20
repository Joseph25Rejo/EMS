from pymongo import MongoClient

# Replace with your actual connection URI from MongoDB Atlas
uri = "mongodb+srv://joseph25rejo:exam-management-system@exammanagementsystem.7otxrdo.mongodb.net/exam_scheduling?retryWrites=true&w=majority"

client = MongoClient(uri)

# Choose your database and collection
db = client["exam-"]
collection = db["adminauth"]

# Teacher records
teachers = [
    {
      "course_code": "CS241AT",
      "course_name": "Discrete Mathematical Structures and Combinatorics",
      "instructor": "Dr. Satish V.M.",
      "expected_students": 45
    },
    {
      "course_code": "CY245AT",
      "course_name": "Computer Networks",
      "instructor": "Prof. Narasimha Swamy S",
      "expected_students": 45
    },
    {
      "course_code": "CD343AI",
      "course_name": "Design and Analysis of Algorithms",
      "instructor": "Prof. S. Anupama Kumar",
      "expected_students": 45
    },
    {
      "course_code": "AI244AI",
      "course_name": "Artificial Intelligence and Machine Learning",
      "instructor": "Prof. K. Vishwavardhan Reddy",
      "expected_students": 45
    },
    {
      "course_code": "XX242TX",
      "course_name": "Basket Courses – Group A",
      "instructor": null,
      "expected_students": 40
    },
    {
      "course_code": "HS248AT",
      "course_name": "Universal Human Values",
      "instructor": "Prof. Vijayalakshmi M.N",
      "expected_students": 40
    },
    {
      "course_code": "MA149AT",
      "course_name": "Bridge Course: Mathematics",
      "instructor": null,
      "expected_students": 35
    },
    {
      "course_code": "HS247LX",
      "course_name": "Ability Enhancement Courses",
      "instructor": null,
      "expected_students": 35
    }
]

# Insert the documents into the 'teacherauth' collection
result = collection.insert_many(teachers)

print(f"{len(result.inserted_ids)} teacher records inserted into 'teacherauth' collection.")
