import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import kanbanSlice from './slices/kanbanSlice';
import chatSlice from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    kanban: kanbanSlice,
    chat: chatSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
