import { api, getAccessToken } from './api';

export interface ImportResult {
  imported: number;
  errors: { row: number; message: string }[];
  invitations: { type: string; nom: string; token?: string; lien?: string }[];
}

export const bulkImportService = {
  downloadTemplate: (type: 'students' | 'teachers' | 'parents') => {
    const token = getAccessToken();
    const schoolId = localStorage.getItem('currentSchoolId');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const url = `${baseUrl}/bulk-import/template/${type}`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `template_${type}.xlsx`);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    if (schoolId) xhr.setRequestHeader('x-school-id', schoolId);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      const blob = xhr.response;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${type}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    };
    xhr.send();
  },

  importStudents: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/bulk-import/students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  importTeachers: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/bulk-import/teachers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  importParents: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/bulk-import/parents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
