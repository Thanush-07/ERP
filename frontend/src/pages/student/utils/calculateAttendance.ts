import { ATTENDANCE_THRESHOLD } from './constants';

export function calculateAttendancePercentage(attended: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((attended / total) * 100 * 100) / 100;
}

export function getAttendanceStatus(percentage: number): 'success' | 'warning' | 'danger' {
  if (percentage >= ATTENDANCE_THRESHOLD) return 'success';
  if (percentage >= ATTENDANCE_THRESHOLD - 10) return 'warning';
  return 'danger';
}

export function getAttendanceMessage(percentage: number): string {
  if (percentage >= ATTENDANCE_THRESHOLD) {
    return 'Good standing';
  }
  if (percentage >= ATTENDANCE_THRESHOLD - 10) {
    return 'At risk - Improve attendance';
  }
  return 'Critical - Attendance shortage';
}

export function getRequiredClasses(currentAttended: number, currentTotal: number, futureClasses: number = 10): number {
  const targetTotal = currentTotal + futureClasses;
  const requiredAttended = Math.ceil((ATTENDANCE_THRESHOLD / 100) * targetTotal);
  return Math.max(0, requiredAttended - currentAttended);
}
