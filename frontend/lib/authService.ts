
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/store/api';

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

async function storeToken(key: string, value: string) {
  await AsyncStorage.setItem(key, value);
}

export const authService = {
  async sendOtp(phone: string) {
    console.log(`[authService] sendOtp for ${phone}`);
    const response = await api.post<ApiResponse<SendOtpResult>>(
      '/auth/otp/send',
      {
        phone: `91${phone}`,
      }
    );
    console.log(`[authService] sendOtp response for ${phone}:`, response.data);
    return response.data.data;
  },

  async verifyOtp(phone: string, otp: string) {
    const response = await api.post<ApiResponse<VerifyOtpResult>>(
      '/auth/otp/verify',
      {
        phone: `91${phone}`,
        otp,
      }
    );

    const result = response.data.data;

    await Promise.all([
      storeToken('token', result.accessToken),
      storeToken('refreshToken', result.refreshToken),
    ]);

    return result;
  },
};

