import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import kanbanSlice from './slices/kanbanSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    kanban: kanbanSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
