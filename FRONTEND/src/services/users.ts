import { api } from './api';
import type { CreateUserDto, User } from '../types';

export const userService = {
  getUsers: async () => {
    const res = await api.get<User[]>('/users');
    return res.data;
  },
  getUser: async (id: number) => {
    const res = await api.get<User>(`/users/${id}`);
    return res.data;
  },
  createUser: async (data: CreateUserDto) => {
    const res = await api.post('/users', data);
    return res.data;
  },
  updateUser: async (id: number, data: Partial<CreateUserDto>) => {
    const res = await api.patch(`/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id: number) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  }
};
