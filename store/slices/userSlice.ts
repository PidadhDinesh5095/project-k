import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { user as seededUser } from '@/lib/mockData';
import { Address, User } from '@/types/fresh';

type UserState = User;

type ProfileDetails = {
  firstName: string;
  lastName?: string;
  email?: string;
  birthDate: string;
};

const userSlice = createSlice({
  name: 'user',
  initialState: seededUser as UserState,
  reducers: {
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    updateProfile: (state, action: PayloadAction<ProfileDetails>) => {
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.email = action.payload.email;
      state.birthDate = action.payload.birthDate;
      state.name = [action.payload.firstName, action.payload.lastName]
        .filter(Boolean)
        .join(' ');
    },
    addAddress: (state, action: PayloadAction<Omit<Address, 'id'>>) => {
      state.addresses = [
        ...state.addresses.map((address) => ({ ...address, isDefault: false })),
        { ...action.payload, id: `address-${Date.now()}`, isDefault: true },
      ];
    },
    updateAddress: (state, action: PayloadAction<Address>) => {
      const idx = state.addresses.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) {
        state.addresses[idx] = action.payload;
        if (action.payload.isDefault) {
          state.addresses.forEach((a, i) => { if (i !== idx) a.isDefault = false; });
        }
      }
    },
    deleteAddress: (state, action: PayloadAction<string>) => {
      const wasDefault = state.addresses.find((a) => a.id === action.payload)?.isDefault;
      state.addresses = state.addresses.filter((a) => a.id !== action.payload);
      if (wasDefault && state.addresses.length > 0) state.addresses[0].isDefault = true;
    },
  },
});

export const { setPhone, updateProfile, addAddress, updateAddress, deleteAddress } = userSlice.actions;
export default userSlice.reducer;