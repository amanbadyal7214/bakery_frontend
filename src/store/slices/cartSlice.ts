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
    removeFromCart: (state, action: PayloadAction<{ id: string; variantId?: string }>) => {
      const { id, variantId } = action.payload;
      state.items = state.items.filter(item => 
        !(item.id === id && item.variantId === variantId)
      );
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; variantId?: string; quantity: number }>) => {
      const { id, variantId, quantity } = action.payload;
      const item = state.items.find(item => 
        item.id === id && item.variantId === variantId
      );
      if (item && quantity > 0) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { setCartItems, addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
