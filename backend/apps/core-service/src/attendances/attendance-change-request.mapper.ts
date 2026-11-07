import { ChangeRequestStatus } from '../../../../libs/common/src';
import { EmployeeSummary } from './attendance.mapper';

export interface ChangeRequestRow {
  id: string;
  attendanceId: string;
  reason: string;
  status: ChangeRequestStatus;
  reviewNote: string | null;
  reviewedAt: Date | null;
  appliedAt: Date | null;
  createdAt: Date;
  attendanceDate: string;
  checkInAt: Date;
  checkOutAt: Date | null;
  attendanceNotes: string | null;
  employeeId: string | null;
  employeeCode: string | null;
  employeeName: string | null;
  employeePosition: string | null;
  employeeDepartment: string | null;
}

export interface AttendanceSummary {
  id: string;
  attendanceDate: string;
  checkInAt: string;
  checkOutAt: string | null;
  notes: string | null;
}

export interface ChangeRequestView {
  id: string;
  attendanceId: string;
  reason: string;
  status: ChangeRequestStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  appliedAt: string | null;
  createdAt: string;
  attendance: AttendanceSummary;
  employee: EmployeeSummary | null;
}

export const toChangeRequestView = (row: ChangeRequestRow): ChangeRequestView => ({
  id: row.id,
  attendanceId: row.attendanceId,
  reason: row.reason,
  status: row.status,
  reviewNote: row.reviewNote,
  reviewedAt: row.reviewedAt?.toISOString() ?? null,
  appliedAt: row.appliedAt?.toISOString() ?? null,
  createdAt: row.createdAt.toISOString(),
  attendance: {
    id: row.attendanceId,
    attendanceDate: row.attendanceDate,
    checkInAt: row.checkInAt.toISOString(),
    checkOutAt: row.checkOutAt?.toISOString() ?? null,
    notes: row.attendanceNotes,
  },
  employee:
    row.employeeId && row.employeeCode && row.employeeName
      ? {
          id: row.employeeId,
          employeeCode: row.employeeCode,
          name: row.employeeName,
          position: row.employeePosition,
          department: row.employeeDepartment,
        }
      : null,
});
