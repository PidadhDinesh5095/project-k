import { Address, Invoice, Notification, Order, Product, Subscription, User, WalletTransaction } from '@/types/fresh';

export const address: Address = { id: 'home', label: 'Home', line1: '12 Lake View Apartments, HSR Layout', city: 'Bangalore', pincode: '560102', isDefault: true };
export const user: User = { id: 'u1', name: 'praveena', phone: '+91 9440028747', addresses: [address], walletBalance: 250, paymentMethods: ['UPI · ananya@okbank'] };
export const products: Product[] = [
  { id: 'buffalo', name: 'A3 Buffalo Milk', size: '500 ml', category: 'Milk', price: 63, mrp: 70, tags: ['A2 Protein', 'Farm Fresh', 'Rich and Creamy'], description: 'Rich, creamy milk sourced from grass-fed buffaloes.', nextDeliveryDate: '2026-09-08', imageLabel: 'MILK' },
  { id: 'cow', name: 'Toned Cow Milk', size: '500 ml', category: 'Milk', price: 54, mrp: 60, tags: ['Everyday', 'Light'], description: 'Fresh, balanced everyday milk for the whole family.', nextDeliveryDate: '2026-09-08', imageLabel: 'MILK' },
  { id: 'cream', name: 'Full Cream Cow Milk', size: '500 ml', category: 'Milk', price: 72, mrp: 80, tags: ['Everyday', 'Fortified'], description: 'Full cream goodness with essential nutrients.', nextDeliveryDate: '2026-09-08', imageLabel: 'MILK' },
  { id: 'paneer', name: 'Fresh Paneer', size: '250 g', category: 'Paneer', price: 110, mrp: 125, tags: ['Soft', 'Fresh'], description: 'Soft, fresh paneer made every morning.', nextDeliveryDate: '2026-09-08', imageLabel: 'PANEER' },
  { id: 'ghee', name: 'A2 Cow Ghee', size: '500 ml', category: 'Ghee', price: 690, mrp: 760, tags: ['Bilona', 'Pure'], description: 'Small-batch cultured ghee with a golden aroma.', nextDeliveryDate: '2026-09-08', imageLabel: 'GHEE' },
  { id: 'curd', name: 'Natural Curd', size: '400 g', category: 'Curd', price: 48, mrp: 55, tags: ['Probiotic', 'Thick'], description: 'Thick, naturally set curd.', nextDeliveryDate: '2026-09-08', imageLabel: 'CURD' },
];
export const subscription: Subscription = { id: 'sub1', productId: 'buffalo', planTier: 'Family', quantityPerDelivery: 1, frequency: 'Daily', timeSlot: 'Morning', startDate: '2026-09-08', durationType: 'Ongoing', status: 'Active', deliveryAddressId: 'home', paymentMethod: 'UPI · ananya@okbank', skippedDates: [], nextDeliveryDate: '2026-09-08', createdDate: '2026-08-01' };
export const orders: Order[] = [
  { id: 'FP-20260906-114', date: '2026-09-06', items: [{ productId: 'cow', name: 'Cow Milk 500 ml', quantity: 1, price: 58 }, { productId: 'curd', name: 'Curd 400 g', quantity: 1, price: 37 }], itemTotal: 95, deliveryFee: 0, walletUsed: 0, totalPaid: 95, status: 'Delivered', deliveryAddress: address.line1 + ', ' + address.city },
  { id: 'FP-20260905-102', date: '2026-09-05', items: [{ productId: 'buffalo', name: 'Buffalo Milk 1 L', quantity: 1, price: 72 }], itemTotal: 72, deliveryFee: 0, walletUsed: 0, totalPaid: 72, status: 'Delivered', deliveryAddress: address.line1 + ', ' + address.city },
  { id: 'FP-20260908-119', date: '2026-09-08', items: [{ productId: 'buffalo', name: 'A2 Milk 500 ml', quantity: 2, price: 110 }], itemTotal: 110, deliveryFee: 0, walletUsed: 0, totalPaid: 110, status: 'Upcoming', deliveryAddress: address.line1 + ', ' + address.city },
  { id: 'FP-20260904-098', date: '2026-09-04', items: [{ productId: 'buffalo', name: 'A2 Milk 500 ml', quantity: 2, price: 220 }], itemTotal: 310, deliveryFee: 0, walletUsed: 0, totalPaid: 310, status: 'Cancelled', deliveryAddress: address.line1 + ', ' + address.city },
];
export const notifications: Notification[] = [
  { id: 'n1', type: 'delivery', title: 'Your order has been delivered', body: 'Cow Milk 500ml, Curd 400g · Delivered at 6:45 AM', timestamp: '2h ago', isRead: false },
  { id: 'n2', type: 'wallet', title: 'Wallet credited with ₹50', body: 'Cashback for your last order', timestamp: '5h ago', isRead: false },
  { id: 'n3', type: 'promo', title: 'New: Flavoured Milk now available', body: 'Try our new Chocolate and Strawberry flavoured milk.', timestamp: 'Yesterday', isRead: true },
  { id: 'n4', type: 'skip', title: 'Delivery skipped', body: 'Your delivery for 4 Sep was skipped as requested', timestamp: '2 days ago', isRead: true },
  { id: 'n5', type: 'renewal', title: 'Subscription renewed', body: 'Your A2 Buffalo Milk subscription has been renewed', timestamp: '3 days ago', isRead: true },
];
export const transactions: WalletTransaction[] = [
  { id: 't1', type: 'top-up', title: 'Wallet Top-up', timestamp: '6 Sep 2026, 10:12 AM', amount: 200, direction: 'credit' },
  { id: 't2', type: 'payment', title: 'Order Payment · #FP-2026', timestamp: '6 Sep 2026, 8:12 PM', amount: 95, direction: 'debit' },
  { id: 't3', type: 'cashback', title: 'Cashback Credited', timestamp: '5 Sep 2026, 6:00 AM', amount: 50, direction: 'credit' },
  { id: 't4', type: 'payment', title: 'Order Payment · #FP-2', timestamp: '5 Sep 2026, 7:05 PM', amount: 72, direction: 'debit' },
];
export const invoice: Invoice = { id: 'INV-20260906-114', orderId: 'FP-20260906-114', gstin: '29AAFCP1234B1Z5', sellerName: 'Fresh & Pure', billedTo: 'Ananya Rao', lineItems: [{ name: 'Cow Milk 500ml', quantity: 1, rate: 58, amount: 58 }, { name: 'Curd 400g', quantity: 1, rate: 37, amount: 37 }], subtotal: 95, cgst: 0, sgst: 0, total: 95, paymentMode: 'Wallet/UPI', dateGenerated: '6 Sep 2026' };
