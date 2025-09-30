import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GetVerifyCodePayload, GetVerifyCodeData, VerifyCardPayload } from './OrderType';

interface VerifyState {
    sent: boolean;
    phone: string | null;
    wait: number;
    token?: string | null;
    loading: boolean;
    error: string | null;
    cardVerifyLoading?: boolean;
    cardVerifySuccess?: boolean;
    cardVerifyError?: string | null;
}

const initialState: VerifyState = {
    sent: false,
    phone: null,
    wait: 0,
    token: null,
    loading: false,
    error: null,
    cardVerifyLoading: false,
    cardVerifySuccess: false,
    cardVerifyError: null,
};

const verifySlice = createSlice({
    name: 'verify',
    initialState,
    reducers: {
        getVerifyCodeRequest(state, action: PayloadAction<GetVerifyCodePayload>) {
            state.loading = true;
            state.error = null;
            state.token = action.payload.token ?? null;
        },
        getVerifyCodeSuccess(state, action: PayloadAction<GetVerifyCodeData>) {
            state.loading = false;
            state.sent = action.payload.sent;
            state.phone = action.payload.phone;
            state.wait = action.payload.wait;
            state.error = null;
        },
        getVerifyCodeFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        resetVerifyState(state) {
            state.sent = false;
            state.phone = null;
            state.wait = 0;
            state.token = null;
            state.loading = false;
            state.error = null;
        },
        verifyCardRequest(state, action: PayloadAction<VerifyCardPayload>) {
            state.cardVerifyLoading = true;
            state.cardVerifyError = null;
            state.cardVerifySuccess = false;
        },
        verifyCardSuccess(state) {
            state.cardVerifyLoading = false;
            state.cardVerifySuccess = true;
            state.cardVerifyError = null;
        },
        verifyCardFailure(state, action: PayloadAction<string>) {
            state.cardVerifyLoading = false;
            state.cardVerifySuccess = false;
            state.cardVerifyError = action.payload;
        },
    },
});

export const {
    getVerifyCodeRequest,
    getVerifyCodeSuccess,
    getVerifyCodeFailure,
    resetVerifyState,
    verifyCardRequest,
    verifyCardSuccess,
    verifyCardFailure,
} = verifySlice.actions;
export default verifySlice.reducer;

