import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProducts } from '../api/productService';

export const getProducts = createAsyncThunk('products/getAll', async (_, thunkAPI) => {
  try {
    return await fetchProducts();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: { products: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => { state.isLoading = true; })
      .addCase(getProducts.fulfilled, (state, action) => { state.isLoading = false; state.products = action.payload; })
      .addCase(getProducts.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });
  },
});

export default productSlice.reducer;
