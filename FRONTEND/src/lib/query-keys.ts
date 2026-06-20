export const queryKeys = {
  users: {
    all: ['users'] as const,
    detail: (id: number) => ['users', id] as const,
  },
  students: {
    all: ['students'] as const,
    detail: (id: number) => ['students', id] as const,
    grades: (id: number) => ['students', id, 'grades'] as const,
  },
  teachers: {
    all: ['teachers'] as const,
    detail: (id: number) => ['teachers', id] as const,
  },
  classes: {
    all: ['classes'] as const,
    detail: (id: number) => ['classes', id] as const,
  },
  subjects: {
    all: ['subjects'] as const,
  },
  schools: {
    all: ['schools'] as const,
    detail: (id: number) => ['schools', id] as const,
    stats: (id: number) => ['school-stats', id] as const,
  },
  schoolYears: {
    all: ['school-years'] as const,
  },
  periods: {
    all: ['periods'] as const,
  },
  notes: {
    student: (studentId: number) => ['notes', studentId] as const,
    pending: (periodId?: number) => ['notes-pending', periodId] as const,
  },
  incidents: {
    all: ['incidents'] as const,
  },
  attendance: {
    sessions: ['attendance-sessions'] as const,
    student: (studentId: number) => ['attendance', studentId] as const,
  },
  payments: {
    all: ['payments'] as const,
    student: (studentId: number) => ['payments', studentId] as const,
    audit: ['audit-logs'] as const,
  },
  paymentPlans: {
    all: ['payment-plans'] as const,
  },
  timetables: {
    all: ['timetables'] as const,
    filtered: (params: Record<string, unknown>) => ['timetables', params] as const,
  },
  teacherSubjects: {
    all: ['teacher-subjects'] as const,
    mine: ['my-assignments'] as const,
  },
  sync: {
    latest: ['latest-sync'] as const,
  },
  parentLinks: {
    student: (studentId: number) => ['parent-links', studentId] as const,
  },
} as const;
