import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { kanbanApi, Board, Column, Task, CreateBoardData, CreateColumnData, CreateTaskData, PaginatedResponse } from '../../services/kanbanApi';

interface KanbanState {
  boards: Board[];
  currentBoard: Board | null;
  columns: Column[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: KanbanState = {
  boards: [],
  currentBoard: null,
  columns: [],
  tasks: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchBoards = createAsyncThunk(
  'kanban/fetchBoards',
  async () => {
    const response = await kanbanApi.getBoards();
    return response.data;
  }
);

export const fetchBoardById = createAsyncThunk(
  'kanban/fetchBoardById',
  async (boardId: string) => {
    const response = await kanbanApi.getBoardById(boardId);
    return response.data;
  }
);

export const createBoard = createAsyncThunk(
  'kanban/createBoard',
  async (boardData: CreateBoardData) => {
    const response = await kanbanApi.createBoard(boardData);
    return response.data;
  }
);

export const updateBoard = createAsyncThunk(
  'kanban/updateBoard',
  async ({ id, data }: { id: string; data: Partial<CreateBoardData> }) => {
    const response = await kanbanApi.updateBoard(id, data);
    return response.data;
  }
);

export const deleteBoard = createAsyncThunk(
  'kanban/deleteBoard',
  async (boardId: string) => {
    await kanbanApi.deleteBoard(boardId);
    return boardId;
  }
);

export const createColumn = createAsyncThunk(
  'kanban/createColumn',
  async ({ boardId, data }: { boardId: string; data: CreateColumnData }) => {
    const response = await kanbanApi.createColumn(boardId, data);
    return response.data;
  }
);

export const updateColumn = createAsyncThunk(
  'kanban/updateColumn',
  async ({ boardId, columnId, data }: { boardId: string; columnId: string; data: Partial<CreateColumnData> }) => {
    const response = await kanbanApi.updateColumn(boardId, columnId, data);
    return response.data;
  }
);

export const deleteColumn = createAsyncThunk(
  'kanban/deleteColumn',
  async ({ boardId, columnId }: { boardId: string; columnId: string }) => {
    await kanbanApi.deleteColumn(boardId, columnId);
    return columnId;
  }
);

export const createTask = createAsyncThunk(
  'kanban/createTask',
  async ({ boardId, columnId, data }: { boardId: string; columnId: string; data: CreateTaskData }) => {
    const response = await kanbanApi.createTask(boardId, columnId, data);
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  'kanban/updateTask',
  async ({ boardId, columnId, taskId, data }: { boardId: string; columnId: string; taskId: string; data: Partial<CreateTaskData> }) => {
    const response = await kanbanApi.updateTask(boardId, columnId, taskId, data);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  'kanban/deleteTask',
  async ({ boardId, columnId, taskId }: { boardId: string; columnId: string; taskId: string }) => {
    await kanbanApi.deleteTask(boardId, columnId, taskId);
    return taskId;
  }
);

const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    setCurrentBoard: (state, action: PayloadAction<Board>) => {
      state.currentBoard = action.payload;
      state.columns = action.payload.columns || [];
    },
    clearError: (state) => {
      state.error = null;
    },
    // Para drag and drop local
    moveTaskLocal: (state, action: PayloadAction<{
      taskId: string;
      sourceColumnId: string;
      targetColumnId: string;
      position: number;
    }>) => {
      const { taskId, sourceColumnId, targetColumnId, position } = action.payload;
      
      // Encontrar a task
      const sourceColumn = state.columns.find(col => col.id === sourceColumnId);
      const targetColumn = state.columns.find(col => col.id === targetColumnId);
      const taskIndex = sourceColumn?.tasks.findIndex(task => task.id === taskId);
      
      if (sourceColumn && targetColumn && taskIndex !== -1 && taskIndex !== undefined) {
        const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
        movedTask.position = position;
        targetColumn.tasks.splice(position, 0, movedTask);
        
        // Atualizar contadores
        sourceColumn.task_count = sourceColumn.tasks.length;
        targetColumn.task_count = targetColumn.tasks.length;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch boards
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        // Handle paginated response
        if (action.payload && action.payload.results) {
          state.boards = action.payload.results;
        } else {
          state.boards = [];
        }
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch boards';
      })
      
      // Fetch board by ID
      .addCase(fetchBoardById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload;
        state.columns = action.payload.columns || [];
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch board';
      })
      
      // Create board
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.push(action.payload);
      })
      
      // Update board
      .addCase(updateBoard.fulfilled, (state, action) => {
        const index = state.boards.findIndex(board => board.id === action.payload.id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard?.id === action.payload.id) {
          state.currentBoard = action.payload;
        }
      })
      
      // Delete board
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.boards = state.boards.filter(board => board.id !== action.payload);
        if (state.currentBoard?.id === action.payload) {
          state.currentBoard = null;
          state.columns = [];
        }
      })
      
      // Create column
      .addCase(createColumn.fulfilled, (state, action) => {
        state.columns.push(action.payload);
      })
      
      // Update column
      .addCase(updateColumn.fulfilled, (state, action) => {
        const index = state.columns.findIndex(col => col.id === action.payload.id);
        if (index !== -1) {
          state.columns[index] = action.payload;
        }
      })
      
      // Delete column
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.columns = state.columns.filter(col => col.id !== action.payload);
      })
      
      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        const column = state.columns.find(col => col.id === action.meta.arg.columnId);
        if (column) {
          column.tasks.push(action.payload);
          column.task_count = column.tasks.length;
        }
      })
      
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        state.columns.forEach(column => {
          const taskIndex = column.tasks.findIndex(task => task.id === action.payload.id);
          if (taskIndex !== -1) {
            column.tasks[taskIndex] = action.payload;
          }
        });
      })
      
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.columns.forEach(column => {
          const taskIndex = column.tasks.findIndex(task => task.id === action.payload);
          if (taskIndex !== -1) {
            column.tasks.splice(taskIndex, 1);
            column.task_count = column.tasks.length;
          }
        });
      });
  },
});

export const { setCurrentBoard, clearError, moveTaskLocal } = kanbanSlice.actions;
export default kanbanSlice.reducer;
