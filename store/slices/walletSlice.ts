import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { transactions as seededTransactions, user as seededUser } from '@/lib/mockData';
import { WalletTransaction } from '@/types/fresh';

type WalletState = { balance: number; transactions: WalletTransaction[] };

const initialState: WalletState = { balance: seededUser.walletBalance, transactions: seededTransactions };

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    addWalletMoney: (state, action: PayloadAction<number>) => {
      state.balance += action.payload;
      state.transactions.unshift({ id: `t-${Date.now()}`, type: 'top-up', title: 'Wallet Top-up', timestamp: 'Just now', amount: action.payload, direction: 'credit' });
    },
  },
});

export const { addWalletMoney } = walletSlice.actions;
export default walletSlice.reducer;
