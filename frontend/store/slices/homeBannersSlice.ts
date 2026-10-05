import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '@/store/api';

export type HomeBanner = {
  id: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
};

type ApiResponse<T> = { data: T };
type HomeBannersState = {
  items: HomeBanner[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
};

export const fetchHomeBanners = createAsyncThunk<
  HomeBanner[],
  void,
  { rejectValue: string }
>('homeBanners/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiResponse<HomeBanner[]>>('/home/banners');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }
    return rejectWithValue(error instanceof Error ? error.message : 'Unable to load banners');
  }
});

const initialState: HomeBannersState = { items: [], status: 'idle' };

const homeBannersSlice = createSlice({
  name: 'homeBanners',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeBanners.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHomeBanners.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchHomeBanners.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default homeBannersSlice.reducer;