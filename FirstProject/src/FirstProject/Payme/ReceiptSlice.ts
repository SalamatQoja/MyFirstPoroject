import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type CreateReceiptPayload, type ReceiptInfo } from './OrderType';

export interface ReceiptState {
    loading: boolean;
    amount?: number;
    orderId?: string;
    invoiceId?: string;
    phone?: string;
    invoiceInfo?: ReceiptInfo | null;
    payLoading?: boolean;
    payError?: string | null;
    paySuccess?: boolean;
    error?: string;
}

const initialState: ReceiptState = {
    loading: false,
    phone: '',
    invoiceInfo: null,
    paySuccess: false,
    payLoading: false,
    payError: null,
};

export const receiptSlice = createSlice({
    name: 'receipt',
    initialState,
    reducers: {
        createReceiptRequest(state, action: PayloadAction<CreateReceiptPayload & { phone?: string }>) {
            state.loading = true;
            state.error = undefined;
            state.amount = action.payload.amount;
            state.orderId = action.payload.order_id;
            if (action.payload.phone) state.phone = action.payload.phone;
        },
        createReceiptSuccess(state, action: PayloadAction<string>) {
            state.loading = false;
            state.invoiceId = action.payload;
        },
        createReceiptFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        payReceiptRequest(state, action: PayloadAction<{ token: string; invoice_id: string }>) {
            state.payLoading = true;
            state.payError = null;
            state.paySuccess = false;
        },
        payReceiptSuccess(state, action: PayloadAction<ReceiptInfo>) {
            state.payLoading = false;
            state.paySuccess = true;
            state.invoiceInfo = action.payload;
        },
        payReceiptFailure(state, action: PayloadAction<string>) {
            state.payLoading = false;
            state.payError = action.payload;
            state.paySuccess = false;
        },
    },
});

export const {
    createReceiptRequest,
    createReceiptSuccess,
    createReceiptFailure,
    payReceiptRequest,
    payReceiptSuccess,
    payReceiptFailure,
} = receiptSlice.actions;
export default receiptSlice.reducer;
