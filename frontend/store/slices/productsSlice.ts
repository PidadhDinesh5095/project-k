import { createSlice } from '@reduxjs/toolkit';
import { products as seededProducts } from '@/lib/mockData';

const productsSlice = createSlice({
  name: 'products',
  initialState: seededProducts,
  reducers: {},
});

export default productsSlice.reducer;
