import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService, LoginPayload, AuthResponse } from '@/services/auth.service';
import { User } from '@/types';

const TOKEN_STORAGE_KEY = 'label-tool.authToken';
const USER_STORAGE_KEY = 'label-tool.authUser';

const storage = typeof window !== 'undefined' ? window.localStorage : null;
const storedToken = storage ? storage.getItem(TOKEN_STORAGE_KEY) : null;
const storedUser = storage ? storage.getItem(USER_STORAGE_KEY) : null;

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: storedUser ? (JSON.parse(storedUser) as User) : null,
  token: storedToken,
  isAuthenticated: Boolean(storedToken),
  isLoading: false,
  error: null,
  initialized: false,
};

export const login = createAsyncThunk<AuthResponse, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authService.login(payload);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Invalid email or password';
      return rejectWithValue(message);
    }
  }
);

export const initializeAuth = createAsyncThunk<
  { token: string; user: User } | null,
  void,
  { rejectValue: string }
>('auth/initialize', async (_, { rejectWithValue }) => {
  const token = storage?.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    return null;
  }

  try {
    const user = await authService.getProfile();
    return { token, user };
  } catch (error) {
    storage?.removeItem(TOKEN_STORAGE_KEY);
    storage?.removeItem(USER_STORAGE_KEY);
    return rejectWithValue('Session expired. Please log in again.');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      storage?.removeItem(TOKEN_STORAGE_KEY);
      storage?.removeItem(USER_STORAGE_KEY);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.initialized = true;
        storage?.setItem(TOKEN_STORAGE_KEY, action.payload.token);
        storage?.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.initialized = true;

        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          storage?.setItem(TOKEN_STORAGE_KEY, action.payload.token);
          storage?.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload.user));
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.initialized = true;
        state.error = action.payload || null;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

export { TOKEN_STORAGE_KEY, USER_STORAGE_KEY };
