import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '@/store/api';
import type { Product } from '@/types/fresh';

type ProductApiRecord = {
  id: string;
  name: string;
  slug?: string;
  category: string;
  quantity_label: string;
  tags: string[];
  description: string | null;
  nutrition: Record<string, string | number | null> | null;
  quality_badges: string[];
  images: string[];
  price: number | string;
  mrp: number | string;
  active: boolean;
  created_at: string;
  main_img_nobg: string;
};

type ApiResponse<T> = { data: T };
export type ProductCategory = { id: number; type: string; image_url: string };
type ProductsState = {
  items: Product[];
  detailsById: Record<string, Product>;
  categories: ProductCategory[];
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  listError: string | null;
  categoriesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  categoriesError: string | null;
  detailStatusById: Record<string, 'idle' | 'loading' | 'succeeded' | 'failed'>;
  detailErrorsById: Record<string, string | null>;
};

const nutritionLabels: Record<string, string> = {
  proteinG: 'Protein (g)',
  sodiumMg: 'Sodium (mg)',
  calciumMg: 'Calcium (mg)',
  energyKcal: 'Energy (kcal)',
  totalFatG: 'Total Fat (g)',
  carbohydrateG: 'Carbohydrate (g)',
};

function normalizeProduct(record: ProductApiRecord): Product {
  const nutritionBenefits = Object.entries(record.nutrition ?? {})
    .filter((entry): entry is [string, string | number] => entry[1] !== null)
    .map(([key, value]) => ({
      label: nutritionLabels[key] ?? key,
      value: String(value),
    }));

  return {
    id: record.id,
    name: record.name,
    size: record.quantity_label,
    category: record.category,
    price: Number(record.price),
    mrp: Number(record.mrp),
    tags: record.tags,
    description: record.description ?? '',
    nextDeliveryDate: '',
    imageLabel: record.name,
    nutritionBenefits,
    slug: record.slug,
    mainImgNobg: record.main_img_nobg,
    images: record.images,
    nutrition: record.nutrition,
    qualityBadges: record.quality_badges,
    active: record.active,
    createdAt: record.created_at,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : fallback;
}

export const fetchProducts = createAsyncThunk<Product[], void, { rejectValue: string }>(
  'products/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<ProductApiRecord[]>>('/products');
      return response.data.data.map(normalizeProduct);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to load products'));
    }
  },
);

export const fetchProductCategories = createAsyncThunk<
  ProductCategory[],
  void,
  { rejectValue: string }
>('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiResponse<ProductCategory[]>>('/products/categories');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Unable to load product categories'));
  }
});

export const fetchProductById = createAsyncThunk<Product, string, { rejectValue: string }>(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<ProductApiRecord>>(`/products/${id}`);
      return normalizeProduct(response.data.data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to load product'));
    }
  },
);

const initialState: ProductsState = {
  items: [],
  detailsById: {},
  categories: [],
  listStatus: 'idle',
  listError: null,
  categoriesStatus: 'idle',
  categoriesError: null,
  detailStatusById: {},
  detailErrorsById: {},
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.listStatus = 'succeeded';
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.payload ?? 'Unable to load products';
      })
      .addCase(fetchProductCategories.pending, (state) => {
        state.categoriesStatus = 'loading';
        state.categoriesError = null;
      })
      .addCase(fetchProductCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.categoriesStatus = 'succeeded';
      })
      .addCase(fetchProductCategories.rejected, (state, action) => {
        state.categoriesStatus = 'failed';
        state.categoriesError = action.payload ?? 'Unable to load product categories';
      })
      .addCase(fetchProductById.pending, (state, action) => {
        state.detailStatusById[action.meta.arg] = 'loading';
        state.detailErrorsById[action.meta.arg] = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailsById[action.payload.id] = action.payload;
        state.detailStatusById[action.payload.id] = 'succeeded';
        const listItemIndex = state.items.findIndex((item) => item.id === action.payload.id);
        if (listItemIndex >= 0) state.items[listItemIndex] = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailStatusById[action.meta.arg] = 'failed';
        state.detailErrorsById[action.meta.arg] = action.payload ?? 'Unable to load product';
      });
  },
});

export default productsSlice.reducer;
