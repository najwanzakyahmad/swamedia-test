import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../api/client';

const LIMIT = 20;

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ skip = 0, q = '' } = {}, { rejectWithValue }) => {
    try {
      const url = q
        ? `/products/search?q=${encodeURIComponent(q)}&limit=${LIMIT}&skip=${skip}`
        : `/products?limit=${LIMIT}&skip=${skip}`;
      const { data } = await client.get(url);
      return { ...data, skip };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Gagal memuat daftar produk.');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await client.get(`/products/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Produk tidak ditemukan.');
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await client.post('/products/add', payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Gagal menambahkan produk.');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await client.put(`/products/${id}`, payload);
      // gabungkan payload yang kita kirim dengan respons server,
      // karena DummyJSON kadang tidak mengembalikan semua field
      return { ...payload, ...data, id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Gagal memperbarui produk.');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await client.delete(`/products/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Gagal menghapus produk.');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    total: 0,
    skip: 0,
    listStatus: 'idle',
    listError: null,

    current: null,
    detailStatus: 'idle',
    detailError: null,

    mutationStatus: 'idle',
    mutationError: null,
  },
  reducers: {
    clearCurrentProduct(state) {
      state.current = null;
      state.detailStatus = 'idle';
      state.detailError = null;
    },
    clearMutationStatus(state) {
      state.mutationStatus = 'idle';
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- list ---
      .addCase(fetchProducts.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.listStatus = 'idle';
        state.items = action.payload.products;
        state.total = action.payload.total;
        state.skip = action.payload.skip;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.payload;
      })

      // --- detail ---
      .addCase(fetchProductById.pending, (state) => {
        state.detailStatus = 'loading';
        state.detailError = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailStatus = 'idle';
        state.current = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.detailError = action.payload;
      })

      // --- add ---
      .addCase(addProduct.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = [action.payload, ...state.items]; // <- auto-update list
        state.total += 1;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      })

      // --- update ---
      .addCase(updateProduct.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ); // <- auto-update list
        if (state.current && state.current.id === action.payload.id) {
          state.current = { ...state.current, ...action.payload };
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      })

      // --- delete ---
      .addCase(deleteProduct.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.filter((p) => p.id !== action.payload); // <- auto-update list
        state.total -= 1;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      });
  },
});

export const { clearCurrentProduct, clearMutationStatus } = productSlice.actions;
export default productSlice.reducer;