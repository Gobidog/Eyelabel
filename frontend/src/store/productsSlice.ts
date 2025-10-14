import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productService, CreateProductData, UpdateProductData, ProductFilters, BulkCreateProductResult } from '@/services/product.service';
import { Product } from '@/types';

interface ProductsState {
  products: Product[];
  currentProduct: Product | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  currentProduct: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters: ProductFilters, { rejectWithValue }) => {
    try {
      const response = await productService.getAll(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await productService.getById(id);
      return response.product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch product');
    }
  }
);

export const fetchProductByBarcode = createAsyncThunk(
  'products/fetchProductByBarcode',
  async (barcode: string, { rejectWithValue }) => {
    try {
      const response = await productService.getByBarcode(barcode);
      return response.product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch product');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (data: CreateProductData, { rejectWithValue }) => {
    try {
      const response = await productService.create(data);
      return response.product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: string; data: UpdateProductData }, { rejectWithValue }) => {
    try {
      const response = await productService.update(id, data);
      return response.product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await productService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.error || 'Failed to delete product');
    }
  }
);

export const bulkCreateProducts = createAsyncThunk(
  'products/bulkCreateProducts',
  async (data: CreateProductData[], { rejectWithValue }) => {
    try {
      return await productService.bulkCreate(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to bulk create products');
    }
  }
);

// Slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch product by barcode
    builder
      .addCase(fetchProductByBarcode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductByBarcode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductByBarcode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create product
    builder
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
        state.total += 1;
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
        state.total -= 1;
        if (state.currentProduct?.id === action.payload) {
          state.currentProduct = null;
        }
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Bulk create products
    builder
      .addCase(bulkCreateProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bulkCreateProducts.fulfilled, (state, action: PayloadAction<BulkCreateProductResult>) => {
        state.isLoading = false;
        state.products = [...action.payload.created, ...state.products];
        state.total += action.payload.created.length;
        state.error = null;
      })
      .addCase(bulkCreateProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentProduct, setPage, setLimit } = productsSlice.actions;
export default productsSlice.reducer;
