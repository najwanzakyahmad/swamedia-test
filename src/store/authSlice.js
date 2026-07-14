import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../api/client';

const savedUser = localStorage.getItem('swm_user');
const savedToken = localStorage.getItem('swm_access_token');

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  status: 'idle', // idle | loading | failed
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await client.post('/auth/login', {
        username,
        password,
        expiresInMins: 60,
      });
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Username atau password salah.';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('swm_user');
      localStorage.removeItem('swm_access_token');
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { accessToken, ...user } = action.payload;
        state.status = 'idle';
        state.user = user;
        state.token = accessToken;
        localStorage.setItem('swm_user', JSON.stringify(user));
        localStorage.setItem('swm_access_token', accessToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Gagal masuk. Coba lagi.';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;