// src/features/cart/cartSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type CartItem } from './CartService';

interface CartState {
    items: CartItem[];
    loading: boolean;
    error: string | null;
}

const initialState: CartState = {
    items: [],
    loading: false,
    error: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        fetchCartStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchCartSuccess(state, action: PayloadAction<CartItem[]>) {
            console.log(action.payload);
            state.items = action.payload;
            console.log(state.items);

            state.loading = false;
        },
        fetchCartFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        addItemStart(state, _action: PayloadAction<{ product: number; quantity: number }>) {
            state.loading = true;
            state.error = null;
        },
        addItemSuccess(state, action: PayloadAction<CartItem>) {
            state.items.push(action.payload);
            state.loading = false;
        },
        addItemFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        updateItemStart(state, _action: PayloadAction<{ id: number; product: number; quantity: number }>) {
            state.loading = true;
            state.error = null;
        },
        updateItemSuccess(state, action: PayloadAction<CartItem>) {
            const idx = state.items.findIndex(i => i.id === action.payload.id);
            console.log(state.items[idx]);
            console.log(action.payload);

            if (idx !== -1) state.items[idx] = action.payload;
            state.loading = false;
        },
        updateItemFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        removeItemStart(state, _action: PayloadAction<number>) {
            state.loading = true;
            state.error = null;
        },
        removeItemSuccess(state, action: PayloadAction<number>) {
            state.items = state.items.filter(i => i.id !== action.payload);
            state.loading = false;
        },
        removeItemFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        clearCartStart(state) {
            state.loading = true;
            state.error = null;
        },
        clearCartSuccess(state) {
            state.items = [];
            state.loading = false;
        },
        clearCartFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    fetchCartStart,
    fetchCartSuccess,
    fetchCartFailure,
    addItemStart,
    addItemSuccess,
    addItemFailure,
    updateItemStart,
    updateItemSuccess,
    updateItemFailure,
    removeItemStart,
    removeItemSuccess,
    removeItemFailure,
    clearCartStart,
    clearCartSuccess,
    clearCartFailure,
} = cartSlice.actions;

export default cartSlice.reducer;
