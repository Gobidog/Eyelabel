import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { labelService, CreateLabelData, UpdateLabelData, LabelFilters } from '@/services/label.service';
import { Label } from '@/types';

interface LabelsState {
  labels: Label[];
  currentLabel: Label | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: LabelsState = {
  labels: [],
  currentLabel: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchLabels = createAsyncThunk(
  'labels/fetchLabels',
  async (filters: LabelFilters, { rejectWithValue }) => {
    try {
      const response = await labelService.getAll(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch labels');
    }
  }
);

export const fetchLabelById = createAsyncThunk(
  'labels/fetchLabelById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await labelService.getById(id);
      return response.label;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch label');
    }
  }
);

export const fetchMyLabels = createAsyncThunk(
  'labels/fetchMyLabels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await labelService.getMyLabels();
      return response.labels;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch your labels');
    }
  }
);

export const fetchPendingLabels = createAsyncThunk(
  'labels/fetchPendingLabels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await labelService.getPendingApproval();
      return response.labels;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch pending labels');
    }
  }
);

export const createLabel = createAsyncThunk(
  'labels/createLabel',
  async (data: CreateLabelData, { rejectWithValue }) => {
    try {
      const response = await labelService.create(data);
      return response.label;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create label');
    }
  }
);

export const updateLabel = createAsyncThunk(
  'labels/updateLabel',
  async ({ id, data }: { id: string; data: UpdateLabelData }, { rejectWithValue }) => {
    try {
      const response = await labelService.update(id, data);
      return response.label;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update label');
    }
  }
);

export const updateLabelStatus = createAsyncThunk(
  'labels/updateLabelStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await labelService.updateStatus(id, status);
      return response.label;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update label status');
    }
  }
);

export const deleteLabel = createAsyncThunk(
  'labels/deleteLabel',
  async (id: string, { rejectWithValue }) => {
    try {
      await labelService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete label');
    }
  }
);

// Slice
const labelsSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentLabel: (state) => {
      state.currentLabel = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch labels
    builder
      .addCase(fetchLabels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLabels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.labels = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchLabels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch label by ID
    builder
      .addCase(fetchLabelById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLabelById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLabel = action.payload;
        state.error = null;
      })
      .addCase(fetchLabelById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch my labels
    builder
      .addCase(fetchMyLabels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyLabels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.labels = action.payload;
        state.error = null;
      })
      .addCase(fetchMyLabels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch pending labels
    builder
      .addCase(fetchPendingLabels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingLabels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.labels = action.payload;
        state.error = null;
      })
      .addCase(fetchPendingLabels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create label
    builder
      .addCase(createLabel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLabel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.labels.unshift(action.payload);
        state.total += 1;
        state.error = null;
      })
      .addCase(createLabel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update label
    builder
      .addCase(updateLabel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLabel.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.labels.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.labels[index] = action.payload;
        }
        if (state.currentLabel?.id === action.payload.id) {
          state.currentLabel = action.payload;
        }
        state.error = null;
      })
      .addCase(updateLabel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update label status
    builder
      .addCase(updateLabelStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLabelStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.labels.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.labels[index] = action.payload;
        }
        if (state.currentLabel?.id === action.payload.id) {
          state.currentLabel = action.payload;
        }
        state.error = null;
      })
      .addCase(updateLabelStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete label
    builder
      .addCase(deleteLabel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLabel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.labels = state.labels.filter((l) => l.id !== action.payload);
        state.total -= 1;
        if (state.currentLabel?.id === action.payload) {
          state.currentLabel = null;
        }
        state.error = null;
      })
      .addCase(deleteLabel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentLabel, setPage, setLimit } = labelsSlice.actions;
export default labelsSlice.reducer;
