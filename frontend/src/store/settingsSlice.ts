import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

interface KeyStatus {
  configured: boolean;
  maskedKey: string | null;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

interface SettingsState {
  keyStatus: KeyStatus | null;
  testResult: TestResult | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: SettingsState = {
  keyStatus: null,
  testResult: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

export const fetchOpenAIKeyStatus = createAsyncThunk(
  'settings/fetchOpenAIKeyStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/settings/openai/status');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch key status');
    }
  }
);

export const updateOpenAIKey = createAsyncThunk(
  'settings/updateOpenAIKey',
  async (apiKey: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/settings/openai/key', { apiKey });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to update API key'
      );
    }
  }
);

export const testAIConnection = createAsyncThunk(
  'settings/testAIConnection',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/settings/openai/test');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to test connection');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearTestResult: (state) => {
      state.testResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch key status
      .addCase(fetchOpenAIKeyStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOpenAIKeyStatus.fulfilled, (state, action: PayloadAction<KeyStatus>) => {
        state.isLoading = false;
        state.keyStatus = action.payload;
      })
      .addCase(fetchOpenAIKeyStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update API key
      .addCase(updateOpenAIKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateOpenAIKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message || 'API key updated successfully';
      })
      .addCase(updateOpenAIKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Test connection
      .addCase(testAIConnection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.testResult = null;
      })
      .addCase(testAIConnection.fulfilled, (state, action: PayloadAction<TestResult>) => {
        state.isLoading = false;
        state.testResult = action.payload;
      })
      .addCase(testAIConnection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearStatus, clearTestResult } = settingsSlice.actions;
export default settingsSlice.reducer;
