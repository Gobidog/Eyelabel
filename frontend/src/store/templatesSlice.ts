import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { templateService, CreateTemplateData, UpdateTemplateData, TemplateFilters } from '@/services/template.service';
import { LabelTemplate } from '@/types';

interface TemplatesState {
  templates: LabelTemplate[];
  currentTemplate: LabelTemplate | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: TemplatesState = {
  templates: [],
  currentTemplate: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async (filters: TemplateFilters, { rejectWithValue }) => {
    try {
      const response = await templateService.getAll(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch templates');
    }
  }
);

export const fetchTemplateById = createAsyncThunk(
  'templates/fetchTemplateById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await templateService.getById(id);
      return response.template;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch template');
    }
  }
);

export const fetchActiveTemplates = createAsyncThunk(
  'templates/fetchActiveTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await templateService.getActive();
      return response.templates;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch active templates');
    }
  }
);

export const createTemplate = createAsyncThunk(
  'templates/createTemplate',
  async (data: CreateTemplateData, { rejectWithValue }) => {
    try {
      const response = await templateService.create(data);
      return response.template;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create template');
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'templates/updateTemplate',
  async ({ id, data }: { id: string; data: UpdateTemplateData }, { rejectWithValue }) => {
    try {
      const response = await templateService.update(id, data);
      return response.template;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update template');
    }
  }
);

export const toggleTemplateActive = createAsyncThunk(
  'templates/toggleTemplateActive',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await templateService.toggleActive(id);
      return response.template;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to toggle template status');
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'templates/deleteTemplate',
  async (id: string, { rejectWithValue }) => {
    try {
      await templateService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete template');
    }
  }
);

// Slice
const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch templates
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch template by ID
    builder
      .addCase(fetchTemplateById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplateById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTemplate = action.payload;
        state.error = null;
      })
      .addCase(fetchTemplateById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch active templates
    builder
      .addCase(fetchActiveTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload;
        state.error = null;
      })
      .addCase(fetchActiveTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create template
    builder
      .addCase(createTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates.unshift(action.payload);
        state.total += 1;
        state.error = null;
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update template
    builder
      .addCase(updateTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.templates.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        if (state.currentTemplate?.id === action.payload.id) {
          state.currentTemplate = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Toggle template active
    builder
      .addCase(toggleTemplateActive.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleTemplateActive.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.templates.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        if (state.currentTemplate?.id === action.payload.id) {
          state.currentTemplate = action.payload;
        }
        state.error = null;
      })
      .addCase(toggleTemplateActive.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete template
    builder
      .addCase(deleteTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = state.templates.filter((t) => t.id !== action.payload);
        state.total -= 1;
        if (state.currentTemplate?.id === action.payload) {
          state.currentTemplate = null;
        }
        state.error = null;
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentTemplate, setPage, setLimit } = templatesSlice.actions;
export default templatesSlice.reducer;
