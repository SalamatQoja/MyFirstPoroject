import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {type CreateCardPayload } from './OrderType';

interface CardState {
    loading: boolean;
    cardNumber?: string;
    expireDate?: string;
    token?: string;
    error?: string;
}

const initialState: CardState = { loading: false };

export const cardSlice = createSlice({
    name: 'card',
    initialState,
    reducers: {
        createCardRequest(state, action: PayloadAction<CreateCardPayload>) {
            state.loading = true;
            state.error = undefined;
            state.cardNumber = action.payload.card_number;
            state.expireDate = action.payload.expire;
        },
        createCardSuccess(state, action: PayloadAction<string>) {
            state.loading = false;
            state.token = action.payload;
        },
        createCardFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    createCardRequest,
    createCardSuccess,
    createCardFailure,
} = cardSlice.actions;
export default cardSlice.reducer;
