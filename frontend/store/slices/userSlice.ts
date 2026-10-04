import axios from 'axios';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { user as seededUser } from '@/lib/mockData';
import { authService, SendOtpResult, VerifyOtpResult } from '@/lib/authService';
import { Address, User } from '@/types/fresh';

type UserState = User & {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isRegistered: boolean | null;
  isNewUser: boolean;
  profileCompleted: boolean;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export const sendOtp = createAsyncThunk<SendOtpResult, string, { rejectValue: string }>(
  'user/sendOtp',
  async (phone, { rejectWithValue }) => {
    try {
      return await authService.sendOtp(phone);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to send OTP'));
    }
  },
);

export const verifyOtp = createAsyncThunk<
  VerifyOtpResult,
  { phone: string; otp: string },
  { rejectValue: string }
>(
  'user/verifyOtp',
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      return await authService.verifyOtp(phone, otp);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to verify OTP'));
    }
  },
);

type ProfileDetails = {
  firstName: string;
  lastName?: string;
  email?: string;
  birthDate: string;
};

const userSlice = createSlice({
  name: 'user',
  initialState: {
    ...seededUser,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    isRegistered: null,
    isNewUser: false,
    profileCompleted: false,
  } as UserState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
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
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.phone = action.meta.arg;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRegistered = action.payload.isRegistered;
        state.error = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Unable to send OTP';
      })
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.id = action.payload.user.id;
        state.phone = action.payload.user.phone.slice(-10);
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isNewUser = action.payload.isNewUser;
        state.profileCompleted = action.payload.profileCompleted;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Unable to verify OTP';
        state.isAuthenticated = false;
      });
  },
});

export const {
  clearAuthError,
  setPhone,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
} = userSlice.actions;
export default userSlice.reducer;