export interface MarkAttendanceDto {
  student_id: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface Student {
  id: number;
  name: string;
  school_id: number;
}

export interface Payment {
  id: number;
  amount_fcfa: number;
  receipt_number: string;
  status: string;
  school_id: number;
}

export interface DirectorStats {
  totalStudents: number;
  totalClasses: number;
  todayPayments: number;
  attendanceRate: number;
  alerts: string[];
}
