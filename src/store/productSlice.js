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
      return {
        ...data,
        skip,
        q,
      };
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
  async (
    { id, payload },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState();

      const isAddedProduct =
        state.products.addedProducts.some(
          (product) =>
            String(product.id) === String(id)
        );

      /*
       * Produk hasil add hanya ada di Redux.
       * Jangan kirim PUT ke DummyJSON karena produk tersebut
       * tidak benar-benar tersimpan di server.
       */
      if (isAddedProduct) {
        return {
          ...payload,
          id,
          isLocalProduct: true,
        };
      }

      /*
       * Produk asli DummyJSON tetap melakukan request PUT.
       */
      const { data } = await client.put(
        `/products/${id}`,
        payload
      );

      return {
        ...payload,
        ...data,
        id,
        isLocalProduct: false,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          'Gagal memperbarui produk.'
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await client.delete(`/products/${id}`);

      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Gagal menghapus produk.'
      );
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    total: 0,
    skip: 0,

    updatedProducts: {},
    deletedIds: [],
    addedProducts: [],

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

        const keyword = String(action.payload.q || '')
          .trim()
          .toLowerCase();

        // Data asli dari API.
        const apiProducts = action.payload.products
          // Jangan tampilkan produk yang telah dihapus lokal.
          .filter(
            (product) =>
              !state.deletedIds.some(
                (deletedId) =>
                  String(deletedId) === String(product.id)
              )
          )
          // Terapkan perubahan update lokal.
          .map((product) => {
            const localUpdate =
              state.updatedProducts[String(product.id)];

            return localUpdate
              ? { ...product, ...localUpdate }
              : product;
          });

        // Produk baru yang ditambahkan lokal.
        const localAddedProducts = state.addedProducts
          .filter(
            (product) =>
              !state.deletedIds.some(
                (deletedId) =>
                  String(deletedId) === String(product.id)
              )
          )
          .map((product) => {
            const localUpdate =
              state.updatedProducts[String(product.id)];

            return localUpdate
              ? { ...product, ...localUpdate }
              : product;
          })
          .filter((product) => {
            if (!keyword) {
              return true;
            }

            const searchableText = [
              product.title,
              product.brand,
              product.category,
              product.description,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();

            return searchableText.includes(keyword);
          });

        // Hindari ID duplikat.
        const apiProductIds = new Set(
          apiProducts.map((product) => String(product.id))
        );

        const uniqueAddedProducts = localAddedProducts.filter(
          (product) =>
            !apiProductIds.has(String(product.id))
        );

        // Produk lokal hanya ditambahkan pada halaman pertama.
        state.items =
          action.payload.skip === 0
            ? [...uniqueAddedProducts, ...apiProducts]
            : apiProducts;

        state.total = Math.max(
          0,
          action.payload.total +
            state.addedProducts.length -
            state.deletedIds.length
        );

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

        const productId = String(action.payload.id);
        const localUpdate = state.updatedProducts[productId];

        state.current = {
          ...action.payload,
          ...(localUpdate || {}),
        };
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

        const addedProduct = action.payload;
        const productId = String(addedProduct.id);

        const alreadyAdded = state.addedProducts.some(
          (product) => String(product.id) === productId
        );

        if (!alreadyAdded) {
          state.addedProducts.unshift(addedProduct);
        }

        // Langsung tampilkan di halaman saat ini.
        state.items = [
          addedProduct,
          ...state.items.filter(
            (product) => String(product.id) !== productId
          ),
        ];

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

        const productId = String(action.payload.id);

        /*
        * Simpan perubahan supaya tidak hilang setelah GET ulang.
        */
        state.updatedProducts[productId] = {
          ...state.updatedProducts[productId],
          ...action.payload,
        };

        /*
        * Update daftar produk yang sedang ditampilkan.
        */
        state.items = state.items.map((product) =>
          String(product.id) === productId
            ? {
                ...product,
                ...action.payload,
              }
            : product
        );

        /*
        * Update produk yang berasal dari proses add.
        */
        state.addedProducts =
          state.addedProducts.map((product) =>
            String(product.id) === productId
              ? {
                  ...product,
                  ...action.payload,
                }
              : product
          );

        /*
        * Update data detail yang sedang dibuka.
        */
        if (
          state.current &&
          String(state.current.id) === productId
        ) {
          state.current = {
            ...state.current,
            ...action.payload,
          };
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

        const deletedId = action.payload.id;

        const alreadyDeleted = state.deletedIds.some(
          (id) => String(id) === String(deletedId)
        );

        if (!alreadyDeleted) {
          state.deletedIds.push(deletedId);
        }

        state.items = state.items.filter(
          (product) => String(product.id) !== String(deletedId)
        );

        if (
          state.current &&
          String(state.current.id) === String(deletedId)
        ) {
          state.current = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      });
  },
});

export const { clearCurrentProduct, clearMutationStatus } = productSlice.actions;
export default productSlice.reducer;