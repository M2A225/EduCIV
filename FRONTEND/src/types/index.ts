export type UserRole = 'DIRECTOR' | 'TEACHER' | 'ACCOUNTANT' | 'CASHIER' | 'EDUCATOR' | 'PARENT' | 'BACKOFFICE' | 'STUDENT';

export type PaymentType = 'SCOLARITE' | 'CANTINE' | 'INSCRIPTION' | 'TRANSPORT' | 'AUTRE';
export type PaymentStatus = 'VALIDE' | 'ANNULE';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';
export type IncidentType = 'RETARD' | 'ABSENCE_NON_JUSTIFIEE' | 'COMPORTEMENT' | 'AUTRE';
export type IncidentStatus = 'EN_COURS' | 'RESOLU' | 'IGNORE';
export type GradeType = 'INTERROGATION' | 'DEVOIR' | 'EXAMEN';
export type GradeStatus = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: unknown;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  roles?: UserRole[];
  scope_by_role?: Record<string, string>;
  school_id?: number;
  school_ids?: number[];
  primary_school_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id: number;
  name: string;
  matricule?: string;
  dob?: string;
  place_birth?: string;
  sexe?: string;
  nationality?: string;
  is_repeater: boolean;
  regime?: string;
  is_internal: boolean;
  is_affected: boolean;
  avatar_url?: string;
  class_id?: number;
  school_id: number;
  class?: Class;
  parentLinks?: StudentParent[];
}

export interface Teacher {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  grade?: string;
  specialty?: string;
  hire_date?: string;
  address?: string;
  school_id: number;
}

export interface Class {
  id: number;
  name: string;
  level?: string;
  section?: string;
  capacity?: number;
  classroom?: string;
  grade_total_max?: number;
  grade_avg_scale?: number;
  school_id: number;
  students?: Student[];
  _count?: { students: number };
}

export interface Subject {
  id: number;
  name: string;
  coefficient: number;
  max_score?: number;
  level_group?: string;
  school_id: number;
}

export interface Grade {
  id: number;
  value: number;
  type: GradeType | string;
  comment?: string;
  max_score?: number;
  status: GradeStatus;
  validated_by?: number;
  validated_at?: string;
  rejection_reason?: string;
  period_id: number;
  student_id: number;
  subject_id: number;
  school_id: number;
  created_at: string;
  updated_at: string;
  subject?: Subject;
  period?: AcademicPeriod;
  student?: Student;
}

export interface SchoolYear {
  id: number;
  year_range: string;
  school_id: number;
  periods?: AcademicPeriod[];
}

export interface AcademicPeriod {
  id: number;
  name: string;
  period_type?: string;
  start_date: string;
  end_date: string;
  school_year_id?: number;
  school_year?: SchoolYear;
  school_id: number;
}

export interface ReportCard {
  id: number;
  student_id: number;
  period_id: number;
  year: string;
  average: number;
  rank: number;
  total_points: number;
  total_coef: number;
  appreciation?: string;
  decision?: string;
  created_at: string;
}

export interface Payment {
  id: number;
  amount_fcfa: number;
  payment_type: PaymentType;
  payment_date: string;
  receipt_number: string;
  receipt_hash?: string;
  status: PaymentStatus;
  student_id: number;
  school_id: number;
  plan_id?: number;
  created_at: string;
  updated_at: string;
  student?: Student;
}

export interface PaymentAuditLog {
  id: number;
  payment_id: number;
  action: string;
  data?: unknown;
  old_data?: unknown;
  new_data?: unknown;
  performed_by?: number;
  school_id: number;
  created_at: string;
}

export interface School {
  id: number;
  name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  city?: string;
  type?: string;
  school_type?: string;
  school_id: number;
  school_group_id?: number | null;
  school_group?: SchoolGroup;
  created_at?: string;
}

export interface SchoolGroup {
  id: number;
  name: string;
  abbreviation?: string;
  city?: string;
  schools?: School[];
}

export interface Timetable {
  id: number;
  class_id: number;
  teacher_id: number;
  subject_id: number;
  slot: string;
  school_id: number;
  class?: Class;
  teacher?: Teacher;
  subject?: Subject;
}

export interface AttendanceSession {
  id: number;
  class_id: number;
  subject_id: number;
  timetable_id: number;
  teacher_id: number;
  date: string;
  school_id: number;
  class?: Class;
  subject?: Subject;
  teacher?: Teacher;
  attendances?: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: number;
  session_id: number;
  student_id: number;
  status: AttendanceStatus;
  version: number;
  created_at: string;
  updated_at: string;
  session?: AttendanceSession;
}

export interface Incident {
  id: number;
  student_id: number;
  teacher_id?: number;
  type: IncidentType;
  description: string;
  date: string;
  status: IncidentStatus;
  school_id: number;
  created_at: string;
  updated_at: string;
}

export interface Bulletin {
  average: number;
  rank: number;
  total_points: number;
  total_coef: number;
  appreciation?: string;
  decision?: string;
  subjects?: {
    name: string;
    coefficient: number;
    average: number;
  }[];
}

export interface SchoolStats {
  totalStudents: number;
  totalClasses: number;
  todayPayments: number;
  attendanceRate: number;
  alerts: string[];
}

export interface NavItem {
  label: string;
  path: string;
  roles: UserRole[];
  icon?: string;
}

export type DirectorStats = SchoolStats;

export interface AxiosError {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
}

export interface StudentParent {
  student_id: number;
  parent_user_id: number;
  relation?: string;
  school_id: number;
  student?: Student;
  parent?: User;
}

// DTOs
export interface LoginDto {
  identifier: string;
  password: string;
}

export interface CreateStudentDto {
  name: string;
  matricule?: string;
  dob?: string;
  place_birth?: string;
  sexe?: string;
  nationality?: string;
  is_repeater?: boolean;
  regime?: string;
  is_internal?: boolean;
  class_id?: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  school_id?: number;
}

export interface CreateSchoolDto {
  name: string;
  school_id?: number;
  address?: string;
  phone?: string;
  email?: string;
  city?: string;
  type?: string;
  school_type?: string;
  school_group_id?: number | null;
}

export interface UpdateSchoolDto {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  city?: string;
  type?: string;
  school_type?: string;
  logo_url?: string;
  school_group_id?: number | null;
}

export interface MarkAttendanceDto {
  student_id: number;
  status: AttendanceStatus;
}

export interface CreateGradeDto {
  value: number;
  type: string;
  period_id: number;
  student_id: number;
  subject_id: number;
}

export interface CreateIncidentDto {
  student_id: number;
  teacher_id?: number;
  type: IncidentType;
  description: string;
  date?: string;
}

export interface CreateTimetableDto {
  class_id: number;
  teacher_id: number;
  subject_id: number;
  slot: string;
}

export interface CreateClassDto {
  name: string;
  level?: string;
  section?: string;
  capacity?: number;
  classroom?: string;
}

export interface CreateSubjectDto {
  name: string;
  coefficient: number;
  max_score?: number;
  level_group?: string;
}

export interface CreateTeacherDto {
  name: string;
  phone?: string;
  email?: string;
  grade?: string;
  specialty?: string;
  hire_date?: string;
  address?: string;
}

export interface PaymentPlan {
  id: number;
  name: string;
  total_amount: number;
  school_id: number;
}

export interface CreatePaymentPlanDto {
  name: string;
  total_amount: number;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Progression
export interface ProgressionStudent {
  id: number;
  name: string;
  class_id: number | null;
  class?: Class | null;
  progressions?: StudentProgression[];
}

export interface StudentProgression {
  id: number;
  student_id: number;
  class_id: number | null;
  final_decision: string;
  next_class_id: number | null;
  comment: string | null;
  applied_at?: Date;
}

// Vote
export interface TeacherProgressionVote {
  id: number;
  student_id: number;
  teacher_id: number;
  decision: string;
  comment?: string;
}

// Sync
export interface SyncOperation {
  client_operation_id: string;
  entity: string;
  entity_id?: string;
  action?: string;
  payload?: Record<string, unknown>;
}

// School Config
export interface SchoolConfig {
  grade_total_max?: number;
  grade_avg_scale?: number;
}

// Setup Wizard
export interface SetupStatus {
  completed: boolean;
  completed_at: string | null;
  director_completed: boolean;
  accountant_completed: boolean;
  wizard_steps: number;
  current_step: number;
}

export interface City {
  id: number;
  name: string;
  communes: { id: number; name: string }[];
}

export interface Commune {
  id: number;
  name: string;
}

export interface SchoolLevel {
  id: number;
  level: string;
}

export interface LevelTuition {
  id: number;
  level: string;
  amount: number;
}

// Session / Assignment
export interface TeacherAssignment {
  id: number;
  teacher_id: number;
  subject_id: number;
  school_id?: number;
  subject?: Subject;
  class_id?: number;
  class?: Class;
}
