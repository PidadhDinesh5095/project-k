import { useCallback } from 'react';
import { addWalletMoney } from '@/store/slices/walletSlice';
import { addNotification, clearNotifications, markNotificationRead } from '@/store/slices/notificationsSlice';
import { addSubscription, removeSubscription, setActiveSubscription, updateSubscription } from '@/store/slices/subscriptionSlice';
import { addOrder, updateOrderStatus } from '@/store/slices/ordersSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Notification, Order, OrderStatus, Subscription } from '@/types/fresh';

export function useFreshStore() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const addresses = useAppSelector((state) => state.addresses.items);
  const profile = useAppSelector((state) => state.profile);
  const wallet = useAppSelector((state) => state.wallet);
  const subscriptionState = useAppSelector((state) => state.subscription);
  const notifications = useAppSelector((state) => state.notifications.items);
  const notificationsHasLoaded = useAppSelector((state) => state.notifications.hasLoaded);
  const products = useAppSelector((state) => state.products.items);
  const productsStatus = useAppSelector((state) => state.products.listStatus);
  const productsError = useAppSelector((state) => state.products.listError);
  const productsHasLoaded = useAppSelector((state) => state.products.listHasLoaded);
  const orders = useAppSelector((state) => state.orders.items);

  const subscriptions = subscriptionState.items;
  const activeSubscription = subscriptions.find((sub) => sub.id === subscriptionState.activeId) ?? subscriptions[0] ?? null;

  return {
    user,
    addresses,
    profile,
    walletBalance: wallet.balance,
    transactions: wallet.transactions,
    subscription: activeSubscription,
    subscriptions,
    notifications,
    notificationsHasLoaded,
    products,
    productsStatus,
    productsError,
    productsHasLoaded,
    orders,
    addWalletMoney: useCallback((amount: number) => dispatch(addWalletMoney(amount)), [dispatch]),
    addNotification: useCallback((notification: Notification) => dispatch(addNotification(notification)), [dispatch]),
    clearNotifications: useCallback(() => dispatch(clearNotifications()), [dispatch]),
    markNotificationRead: useCallback((id: string) => dispatch(markNotificationRead(id)), [dispatch]),
    addSubscription: useCallback((subscription: Subscription) => dispatch(addSubscription(subscription)), [dispatch]),
    updateSubscription: useCallback((changes: Partial<Subscription> & { id?: string }) => dispatch(updateSubscription(changes)), [dispatch]),
    removeSubscription: useCallback((id: string) => dispatch(removeSubscription(id)), [dispatch]),
    setActiveSubscription: useCallback((id: string) => dispatch(setActiveSubscription(id)), [dispatch]),
    addOrder: useCallback((order: Order) => dispatch(addOrder(order)), [dispatch]),
    updateOrderStatus: useCallback((id: string, status: OrderStatus) => dispatch(updateOrderStatus({ id, status })), [dispatch]),
  };
}
