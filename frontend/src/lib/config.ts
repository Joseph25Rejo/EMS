// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const API_ENDPOINTS = {
  STATISTICS: `/api/statistics`,
  CONFLICTS: `/api/schedules/conflicts`,
  ROOMS: `/api/rooms`,
  COURSES: `/api/courses`,
  // Add other API endpoints here as needed
};
