export interface Course {
  _id: string;
  course_code: string;
  course_name: string;
  // Add other course fields as needed
}

export interface Room {
  _id: string;
  room_id: string;
  room_name: string;
  capacity: number;
  // Add other room fields as needed
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
