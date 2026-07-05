import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import shopService from "@/services/shop.service";

export const fetchCart = createAsyncThunk("cart/fetch", async () => {
  return await shopService.getCart();
});

export const addToCart = createAsyncThunk("cart/add", async ({ productId, qty }) => {
  return await shopService.addToCart(productId, qty);
});

export const updateCartItem = createAsyncThunk("cart/update", async ({ productId, qty }) => {
  return await shopService.updateCart(productId, qty);
});

export const removeFromCart = createAsyncThunk("cart/remove", async (productId) => {
  return await shopService.removeFromCart(productId);
});

export const clearCart = createAsyncThunk("cart/clear", async () => {
  return await shopService.clearCart();
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCart.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; })
      .addCase(fetchCart.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })
      .addCase(addToCart.fulfilled, (s) => { s.data = null; })
      .addCase(updateCartItem.fulfilled, (s) => { s.data = null; })
      .addCase(removeFromCart.fulfilled, (s) => { s.data = null; })
      .addCase(clearCart.fulfilled, (s) => { s.data = null; });
  },
});

export default cartSlice.reducer;
