import apiClient from './client';

export interface Task {
  id: string;
  tenant_id: string;
  listing_id: string;
  booking_id: string | null;
  title: string;
  description: string | null;
  type: string;
  status: string;
  priority: string | null;
  assigned_to: string | null;
  due_date: string;
  completed_at: string | null;
  created_at: string;
}

export interface CreateTaskPayload {
  listing_id: string;
  booking_id?: string;
  title: string;
  description?: string;
  type: string;
  priority?: string;
  assigned_to?: string;
  due_date: string;
}

export const tasksApi = {
  getTasks: async (tenantId: string, listingId?: string, status?: string): Promise<Task[]> => {
    let url = `/tasks?tenant_id=${tenantId}`;
    if (listingId) url += `&listing_id=${listingId}`;
    if (status) url += `&status=${status}`;
    const response = await apiClient.get(url);
    return response.data.tasks || [];
  },

  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const response = await apiClient.post('/tasks', payload);
    return response.data.task;
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const response = await apiClient.patch(`/tasks/${taskId}`, updates);
    return response.data.task;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};