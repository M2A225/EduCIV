import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { studentService } from '../services/students';
import { extractData } from '../lib/utils';
import type { Student, CreateStudentDto } from '../types';

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => studentService.getStudents().then(res => extractData<Student[]>(res)),
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudentDto) => studentService.createStudent(data),
    onSuccess: () => {
      toast.success('Élève créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};
