import api from './api';

export interface Board {
  id: string;
  name: string;
  description: string;
  created_by: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
  position: number;
  columns_count: number;
  tasks_count: number;
  columns?: Column[];
}

export interface Column {
  id: string;
  name: string;
  position: number;
  color: string;
  max_tasks: number | null;
  task_count: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'completed' | 'archived';
  due_date: string | null;
  assigned_to: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  position: number;
  labels: string[];
  created_at: string;
  updated_at: string;
  comments_count: number;
  attachments_count: number;
}

export interface TaskComment {
  id: string;
  content: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateBoardData {
  name: string;
  description: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateColumnData {
  name: string;
  color: string;
  max_tasks?: number;
}

export interface CreateTaskData {
  title: string;
  description: string;
  priority: string;
  due_date?: string;
  assigned_to_id?: number;
  labels: string[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}

export interface MoveTaskData {
  column_id: string;
  position: number;
}

// Board endpoints
export const kanbanApi = {
  // Boards
  getBoards: () => api.get<PaginatedResponse<Board>>('/api/kanban/boards/'),
  getBoardById: (id: string) => api.get<Board>(`/api/kanban/boards/${id}`),
  createBoard: (data: CreateBoardData) => api.post<Board>('/api/kanban/boards/', data),
  updateBoard: (id: string, data: Partial<CreateBoardData>) => api.patch<Board>(`/api/kanban/boards/${id}`, data),
  deleteBoard: (id: string) => api.delete(`/api/kanban/boards/${id}`),

  // Columns (nested under boards)
  getColumns: (boardId: string) => api.get<Column[]>(`/api/kanban/boards/${boardId}/columns/`),
  getColumnById: (boardId: string, columnId: string) => api.get<Column>(`/api/kanban/boards/${boardId}/columns/${columnId}/`),
  createColumn: (boardId: string, data: CreateColumnData) => api.post<Column>(`/api/kanban/boards/${boardId}/columns/`, data),
  updateColumn: (boardId: string, columnId: string, data: Partial<CreateColumnData>) => api.patch<Column>(`/api/kanban/boards/${boardId}/columns/${columnId}/`, data),
  deleteColumn: (boardId: string, columnId: string) => api.delete(`/api/kanban/boards/${boardId}/columns/${columnId}/`),

  // Tasks (nested under boards/columns)
  getTasks: (boardId: string, columnId: string) => api.get<Task[]>(`/api/kanban/boards/${boardId}/columns/${columnId}/tasks/`),
  getTaskById: (boardId: string, columnId: string, taskId: string) => api.get<Task>(`/api/kanban/boards/${boardId}/columns/${columnId}/tasks/${taskId}/`),
  createTask: (boardId: string, columnId: string, data: CreateTaskData) => api.post<Task>(`/api/kanban/boards/${boardId}/columns/${columnId}/tasks/`, data),
  updateTask: (boardId: string, columnId: string, taskId: string, data: UpdateTaskData) => api.patch<Task>(`/api/kanban/boards/${boardId}/columns/${columnId}/tasks/${taskId}/`, data),
  deleteTask: (boardId: string, columnId: string, taskId: string) => api.delete(`/api/kanban/boards/${boardId}/columns/${columnId}/tasks/${taskId}/`),

  // Task Comments (nested under boards/columns/tasks)
  getTaskComments: (boardId: string, columnId: string, taskId: string) => api.get<TaskComment[]>(`/api/kanban/boards/${boardId}/columns/${columnId}/tasks/${taskId}/comments/`),
  getTaskCommentById: (boardId: string, columnId: string, taskId: string, commentId: string) => api.get<TaskComment>(`/api/kanban/boards/${boardId}/columns/${columnId}/tasks/${taskId}/comments/${commentId}/`),
  createTaskComment: (boardId: string, columnId: string, taskId: string, content: string) => api.post<TaskComment>(`/api/kanban/boards/${boardId}/columns/${columnId}/tasks/${taskId}/comments/`, { content }),
  updateTaskComment: (boardId: string, columnId: string, taskId: string, commentId: string, content: string) => api.patch<TaskComment>(`/api/kanban/boards/${boardId}/columns/${columnId}/tasks/${taskId}/comments/${commentId}/`, { content }),
  deleteTaskComment: (boardId: string, columnId: string, taskId: string, commentId: string) => api.delete(`/api/kanban/boards/${boardId}/columns/${columnId}/tasks/${taskId}/comments/${commentId}/`),

  // Task Operations (nested under boards/columns/tasks)
  moveTask: (boardId: string, columnId: string, taskId: string, data: MoveTaskData) => api.patch(`/api/kanban/boards/${boardId}/columns/${columnId}/tasks/${taskId}/move/`, data),
  archiveTask: (boardId: string, columnId: string, taskId: string) => api.patch(`/api/kanban/boards/${boardId}/columns/${columnId}/tasks/${taskId}/archive/`),
};