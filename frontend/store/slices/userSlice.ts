import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/store/api';
import { fetchAddresses } from '@/store/slices/addressesSlice';
import { fetchProfile, setProfileCompleted } from '@/store/slices/profileSlice';
import { User } from '@/types/fresh';

type ApiResponse<T> = {
  data: T;
};

export type SendOtpResult = {
  isRegistered: boolean;
};

export type VerifyOtpResult = {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  profileCompleted: boolean;
  user: {
    id: string;
    phone: string;
  };
};

export const logout = createAsyncThunk('user/logout', async () => {
  let serverLogoutSucceeded = false;

  try {
    await api.post('/auth/logout');
    serverLogoutSucceeded = true;
  } catch {
    // Local sign-out should still complete if the server is unavailable.
  }

  await AsyncStorage.multiRemove(['token', 'refreshToken']);
  return { serverLogoutSucceeded };
});

type UserState = User & {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isRegistered: boolean | null;
  isNewUser: boolean;
  isLoggingOut: boolean;
  hasLoaded: boolean;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export const sendOtp = createAsyncThunk<
  SendOtpResult,
  string,
  { rejectValue: string }
>(
  'user/sendOtp',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<SendOtpResult>>(
        '/auth/otp/send',
        {
          phone: `91${phone}`,
        }
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Unable to send OTP')
      );
    }
  }
);

export const verifyOtp = createAsyncThunk<
  VerifyOtpResult,
  { phone: string; otp: string },
  { rejectValue: string }
>(
  'user/verifyOtp',
  async ({ phone, otp }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post<ApiResponse<VerifyOtpResult>>(
        '/auth/otp/verify',
        {
          phone: `91${phone}`,
          otp,
        }
      );

      const result = response.data.data;

      await Promise.all([
        AsyncStorage.setItem('token', result.accessToken),
        AsyncStorage.setItem('refreshToken', result.refreshToken),
      ]);

      dispatch(setProfileCompleted(result.profileCompleted));
      dispatch(fetchProfile());
      dispatch(fetchAddresses());

      return result;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Unable to verify OTP')
      );
    }
  }
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
    isLoggingOut: false,
    hasLoaded: false,
  } as UserState,

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },

    restoreSession: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string | null }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
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
        state.hasLoaded = true;
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
        state.hasLoaded = true;

        state.id = action.payload.user.id;
        state.phone = action.meta.arg.phone;

        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;

        state.isAuthenticated = true;
        state.isNewUser = action.payload.isNewUser;

        state.error = null;
      })

      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.id = action.payload.userId;
        state.phone = action.payload.phone.startsWith('91')
          ? action.payload.phone.slice(2)
          : action.payload.phone;
      })

      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Unable to verify OTP';
        state.isAuthenticated = false;
      })
      .addCase(logout.pending, (state) => {
        state.isLoggingOut = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoggingOut = false;
        state.isLoading = false;
        state.error = action.error.message ?? 'Unable to logout';
      })

      .addCase(logout.fulfilled, () => userSlice.getInitialState());
  },
});

export const {
  clearAuthError,
  restoreSession,
  setPhone,
} = userSlice.actions;

export default userSlice.reducer;