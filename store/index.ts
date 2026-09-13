import { configureStore } from '@reduxjs/toolkit';
import notifications from '@/store/slices/notificationsSlice';
import orders from '@/store/slices/ordersSlice';
import products from '@/store/slices/productsSlice';
import subscription from '@/store/slices/subscriptionSlice';
import user from '@/store/slices/userSlice';
import wallet from '@/store/slices/walletSlice';

export const store = configureStore({ reducer: { user, wallet, subscription, notifications, orders, products } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
