# University Exam Management & Scheduling System

A modern, role-based web application for seamless university exam scheduling. Built for clarity, efficiency, and reliability, this system empowers students, professors, and administrators to manage courses, enrollments, and exam timetables with ease.

---

## 🚀 Features

- **Role-Based Access:** Tailored dashboards and permissions for Students, Professors, and Admins.
- **Smart Scheduling:** Generate conflict-free exam timetables using advanced algorithms (Graph Coloring, Simulated Annealing, Genetic Algorithm).
- **Cloud Data Storage:** All data is securely managed in MongoDB Atlas for reliability and scalability.
- **Live Statistics:** Real-time insights into enrollments, room usage, conflicts, and exam schedules.
- **Modern UI:** Clean, minimal, and responsive design for a professional user experience.

---

## 👤 User Roles

- **Student:**
  - Enroll in courses
  - View available courses
  - See personal exam schedule

- **Professor:**
  - Manage and create courses
  - Assign yourself to courses
  - Update course details

- **Admin:**
  - View all system data
  - Detect course conflicts
  - Generate and export exam schedules
  - Monitor system statistics

---

## 🛠️ Getting Started

### Prerequisites

- [Python 3.8+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)

### Backend Setup (Flask API)

1. Clone the repository and navigate to the backend directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file with your MongoDB Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/exam_scheduling?retryWrites=true&w=majority
   ```
4. Start the Flask API:
   ```bash
   python api.py
   ```

### Frontend Setup (Next.js)

1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 API Endpoints

- `GET /api/courses` – List all courses
- `POST /api/courses` – Create a new course
- `GET /api/rooms` – List all rooms
- `POST /api/rooms` – Add a new room
- `POST /api/students/enroll` – Enroll a student
- `GET /api/students/<student_id>/courses` – Student's courses
- `POST /api/schedules/generate` – Generate exam schedule
- `GET /api/schedules` – View all schedules
- `GET /api/statistics` – System statistics

---

## 📄 License

This project is licensed under the MIT License.
