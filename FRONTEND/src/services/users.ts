import { api } from './api';
import type { CreateUserDto, User } from '../types';

export const userService = {
  getUsers: async () => {
    return api.get<User[]>('/users');
  },
  getUser: async (id: number) => {
    return api.get<User>(`/users/${id}`);
  },
  createUser: async (data: CreateUserDto) => {
    return api.post('/users', data);
  },
  updateUser: async (id: number, data: Partial<CreateUserDto>) => {
    return api.patch(`/users/${id}`, data);
  },
  deleteUser: async (id: number) => {
    return api.delete(`/users/${id}`);
  }
};
