import axios from 'axios';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/store/api';

export type ProfileFields = {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
};

type ApiProfile = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  dob: string | null;
  profile_completed: boolean;
};

type ApiResponse<T> = { data: T };

type ProfileState = {
  details: ProfileFields;
  profileCompleted: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasLoaded: boolean;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

function dateForForm(value: string | null) {
  if (!value) return '';
  const [year, month, day] = value.slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : '';
}

function dateForApi(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

function toProfileDetails(profile: ApiProfile): ProfileFields {
  return {
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
    email: profile.email ?? '',
    birthDate: dateForForm(profile.dob),
  };
}

export const fetchProfile = createAsyncThunk<ProfileState['details'] & { profileCompleted: boolean }, void, { rejectValue: string }>(
  'profile/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<ApiProfile>>('/profile/me');
      return { ...toProfileDetails(response.data.data), profileCompleted: response.data.data.profile_completed };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to load profile'));
    }
  },
);

export const completeProfile = createAsyncThunk<ProfileState['details'], ProfileFields, { rejectValue: string }>(
  'profile/complete',
  async (profile, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<ApiProfile>>('/profile/complete', {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim() || null,
        email: profile.email.trim() || null,
        dob: dateForApi(profile.birthDate),
      });
      return toProfileDetails(response.data.data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to complete profile'));
    }
  },
);

export const updateProfile = createAsyncThunk<ProfileState['details'], ProfileFields, { rejectValue: string }>(
  'profile/update',
  async (profile, { rejectWithValue }) => {
    try {
      const response = await api.patch<ApiResponse<ApiProfile>>('/profile/me', {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        email: profile.email.trim(),
        dob: dateForApi(profile.birthDate),
      });
      return toProfileDetails(response.data.data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to update profile'));
    }
  },
);

const initialState: ProfileState = {
  details: { firstName: '', lastName: '', email: '', birthDate: '' },
  profileCompleted: false,
  isLoading: false,
  isSaving: false,
  error: null,
  hasLoaded: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    setProfileCompleted: (state, action: PayloadAction<boolean>) => {
      state.profileCompleted = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasLoaded = true;
        state.profileCompleted = action.payload.profileCompleted;
        state.details = {
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          email: action.payload.email,
          birthDate: action.payload.birthDate,
        };
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Unable to load profile';
      })
      .addCase(completeProfile.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(completeProfile.fulfilled, (state, action) => {
        state.isSaving = false;
        state.profileCompleted = true;
        state.details = action.payload;
      })
      .addCase(completeProfile.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload ?? 'Unable to complete profile';
      })
      .addCase(updateProfile.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isSaving = false;
        state.details = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload ?? 'Unable to update profile';
      });
  },
});

export const { clearProfileError, setProfileCompleted } = profileSlice.actions;
export default profileSlice.reducer;
