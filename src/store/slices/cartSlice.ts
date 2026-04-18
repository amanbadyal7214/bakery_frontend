import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type AddToCartPayload =
  | Product
  | {
      product: Product;
      quantity?: number;
    };

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const payloadProduct = 'product' in action.payload ? action.payload.product : action.payload;
      const quantityToAdd =
        'product' in action.payload
          ? Math.max(1, Math.floor(action.payload.quantity ?? 1))
          : 1;

      const existingItem = state.items.find(item => 
        item.id === payloadProduct.id && 
        (item.variantId === payloadProduct.variantId)
      );
      if (existingItem) {
        existingItem.quantity += quantityToAdd;
      } else {
        state.items.push({ ...payloadProduct, quantity: quantityToAdd });
      }
    },
    removeFromCart: (state, action: PayloadAction<Product['id']>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: Product['id']; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { setCartItems, addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
