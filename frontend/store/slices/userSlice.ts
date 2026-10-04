import axios from 'axios';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authService, SendOtpResult, VerifyOtpResult } from '@/lib/authService';
import { fetchAddresses } from '@/store/slices/addressesSlice';
import { fetchProfile, setProfileCompleted } from '@/store/slices/profileSlice';
import { User } from '@/types/fresh';

type UserState = User & {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isRegistered: boolean | null;
  isNewUser: boolean;
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
  async ({ phone, otp }, { rejectWithValue, dispatch }) => {
    try {
      const result = await authService.verifyOtp(phone, otp);
      dispatch(setProfileCompleted(result.profileCompleted));
      dispatch(fetchProfile());
      dispatch(fetchAddresses());
      return result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to verify OTP'));
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: '',
    name: '',
    phone: '',
    walletBalance: 0,
    paymentMethods: [],
    isLoading: false,
    error: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    isRegistered: null,
    isNewUser: false,
  } as UserState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
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
        state.phone = action.meta.arg.phone;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isNewUser = action.payload.isNewUser;
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
} = userSlice.actions;
export default userSlice.reducer;