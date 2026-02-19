export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
] as const;

export const GENDERS = ['Male', 'Female', 'Other'] as const;

export const ATTENDANCE_THRESHOLD = 75;

export const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const YEARS = [1, 2, 3, 4] as const;

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export const PERIODS = [
  { id: 1, time: '9:00 - 10:00' },
  { id: 2, time: '10:00 - 11:00' },
  { id: 3, time: '11:15 - 12:15' },
  { id: 4, time: '12:15 - 1:15' },
  { id: 5, time: '2:00 - 3:00' },
  { id: 6, time: '3:00 - 4:00' },
  { id: 7, time: '4:00 - 5:00' },
] as const;
