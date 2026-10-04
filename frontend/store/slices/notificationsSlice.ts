import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notifications as seededNotifications } from '@/lib/mockData';
import { Notification } from '@/types/fresh';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: seededNotifications,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => { state.unshift(action.payload); },
    clearNotifications: () => [],
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.find((item) => item.id === action.payload);
      if (notification) notification.isRead = true;
    },
  },
});

export const { addNotification, clearNotifications, markNotificationRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
