import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notifications as seededNotifications } from '@/lib/mockData';
import { Notification } from '@/types/fresh';

type NotificationsState = {
  items: Notification[];
  hasLoaded: boolean;
};

const initialState: NotificationsState = {
  items: seededNotifications,
  hasLoaded: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
    },
    clearNotifications: (state) => {
      state.items = [];
      state.hasLoaded = true;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find((item) => item.id === action.payload);
      if (notification) notification.isRead = true;
    },
  },
});

export const { addNotification, clearNotifications, markNotificationRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
