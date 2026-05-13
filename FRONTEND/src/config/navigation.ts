export interface NavItem {
  label: string;
  path: string;
  roles: string[];
}

export const NAV_CONFIG: NavItem[] = [
  { label: 'Dashboard', path: '/', roles: ['DIRECTOR', 'TEACHER', 'CASHIER', 'STUDENT'] },
  { label: 'Absences', path: '/absences', roles: ['DIRECTOR', 'TEACHER'] },
  { label: 'Élèves', path: '/students', roles: ['DIRECTOR', 'TEACHER'] },
  { label: 'Classes', path: '/classes', roles: ['DIRECTOR'] },
  { label: 'Emploi du temps', path: '/timetables', roles: ['DIRECTOR', 'TEACHER'] },
  { label: 'Enseignants', path: '/teachers', roles: ['DIRECTOR'] },
  { label: 'Paiements', path: '/payments', roles: ['DIRECTOR', 'CASHIER'] },
  { label: 'Bulletins', path: '/bulletins', roles: ['DIRECTOR', 'TEACHER', 'STUDENT', 'PARENT'] },
];
