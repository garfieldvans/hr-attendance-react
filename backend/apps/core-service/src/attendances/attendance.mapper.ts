import { WorkType } from '../../../../libs/common/src';

export interface AttendanceRecord {
  id: string;
  attendanceDate: string;
  checkInAt: Date;
  workType: WorkType;
  notes: string | null;
  photoPath: string;
}

export interface EmployeeSummary {
  id: string;
  employeeCode: string;
  name: string;
  position: string | null;
  department: string | null;
}

export interface AttendanceView {
  id: string;
  attendanceDate: string;
  checkInAt: string;
  workType: WorkType;
  notes: string | null;
  photoUrl: string;
}

export interface MonitoredAttendanceView extends AttendanceView {
  employee: EmployeeSummary | null;
}

const publicPhotoUrl = (photoPath: string) => `/api/files/${photoPath}`;

export const toAttendanceView = (attendance: AttendanceRecord): AttendanceView => ({
  id: attendance.id,
  attendanceDate: attendance.attendanceDate,
  checkInAt: attendance.checkInAt.toISOString(),
  workType: attendance.workType,
  notes: attendance.notes,
  photoUrl: publicPhotoUrl(attendance.photoPath),
});

export const toMonitoredView = (
  attendance: AttendanceRecord,
  employee: EmployeeSummary | null,
): MonitoredAttendanceView => ({
  ...toAttendanceView(attendance),
  employee,
});
