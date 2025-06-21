# API Endpoints Documentation

## Student Endpoints
1. **Login**
   ```
   POST /api/login
   Body: {
     "role": "student",
     "USN": "1RV23AI001",
     "Password": "your_password"
   }
   ```

2. **View Enrolled Courses**
   ```
   GET /api/students/{student_id}/courses
   ```

3. **Enroll in Course**
   ```
   POST /api/students/enroll
   Body: {
     "student_id": "1RV23AI001",
     "name": "Student Name",
     "course_code": "CS101"
   }
   ```

4. **Get Hall Ticket**
   ```
   GET /api/students/{student_id}/hallticket
   ```

## Teacher Endpoints
1. **Login**
   ```
   POST /api/login
   Body: {
     "role": "teacher",
     "UserID": "TEACHER001",
     "Password": "your_password"
   }
   ```

2. **View Invigilation Schedule**
   ```
   GET /api/teachers/{teacher_name}/invigilations
   ```

3. **View Course Information**
   ```
   GET /api/courses/{course_code}
   ```

4. **Update Course Information**
   ```
   PUT /api/courses/{course_code}
   Body: {
     "course_name": "Updated Name",
     "instructor": "Teacher Name",
     "expected_students": 60
   }
   ```

5. **Get Bench Assignments**
   ```
   GET /api/schedules/{course_code}/benches
   ```

## Admin Endpoints
1. **Login**
   ```
   POST /api/login
   Body: {
     "role": "admin",
     "UserID": "ADMIN001",
     "Password": "your_password"
   }
   ```

2. **Course Management**
   - List all courses: `GET /api/courses`
   - Create new course: `POST /api/courses`
   - Update course: `PUT /api/courses/{course_code}`

3. **Room Management**
   - List all rooms: `GET /api/rooms`
   - Create new room: `POST /api/rooms`

4. **Schedule Management**
   - Get all schedules: `GET /api/schedules`
   - Generate new schedule: 
     ```
     POST /api/schedules/generate
     Body: {
       "algorithm": "graph_coloring" | "simulated_annealing" | "genetic",
       "constraints": {
         "start_date": "2024-01-01"
       }
     }
     ```
   - Check schedule conflicts: `GET /api/schedules/conflicts`

5. **Student Management**
   - List all students: `GET /api/students`
   - View student enrollments: `GET /api/students/{student_id}/courses`

6. **Statistics**
   - Get system statistics: `GET /api/statistics`

## Common Endpoints
These endpoints are accessible to all authenticated users:

1. **View Exam Schedule**
   ```
   GET /api/schedules
   Query Parameters:
   - course_code (optional)
   - room (optional)
   - date (optional)
   ```

## Response Format
All endpoints return JSON responses with the following structure:
```json
{
  "message": "Success message",  // On success
  "error": "Error message",      // On error
  "data": { ... }               // Optional data payload
}
```

## Error Codes
- 200: Success
- 201: Created successfully
- 400: Bad request / Invalid input
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Conflict (e.g., duplicate entry)
- 500: Server error
- 503: Service unavailable 