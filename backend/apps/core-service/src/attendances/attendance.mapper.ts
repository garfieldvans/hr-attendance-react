import { WorkType } from '../../../../libs/common/src';
import { Attendance } from './attendance.entity';
import { Employee } from './employee.entity';

export interface AttendanceView {
  id: string;
  attendanceDate: string;
  checkInAt: string;
  workType: WorkType;
  notes: string | null;
  photoUrl: string;
}

export interface MonitoredAttendanceView extends AttendanceView {
  employee: {
    id: string;
    employeeCode: string;
    name: string;
    position: string | null;
    department: string | null;
  } | null;
}

const publicPhotoUrl = (photoPath: string) => `/api/files/${photoPath}`;

export const toAttendanceView = (attendance: Attendance): AttendanceView => ({
  id: attendance.id,
  attendanceDate: attendance.attendanceDate,
  checkInAt: attendance.checkInAt.toISOString(),
  workType: attendance.workType,
  notes: attendance.notes,
  photoUrl: publicPhotoUrl(attendance.photoPath),
});

export const toMonitoredView = (
  attendance: Attendance,
  employee?: Employee,
): MonitoredAttendanceView => ({
  ...toAttendanceView(attendance),
  employee: employee
    ? {
        id: employee.id,
        employeeCode: employee.employeeCode,
        name: employee.name,
        position: employee.position,
        department: employee.department,
      }
    : null,
});
