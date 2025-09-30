import { call, put, takeEvery } from 'redux-saga/effects';
import {
    createReceiptRequest,
    createReceiptSuccess,
    createReceiptFailure,
} from '../Payme/ReceiptSlice';
import { createReceiptApi } from '../Payme/Api/CardService';
import type { SagaIterator } from 'redux-saga';
import type { CreateReceiptResponse } from '../Payme/OrderType';

function* handleCreateReceipt(action: ReturnType<typeof createReceiptRequest>): SagaIterator {
    try {
        const response: CreateReceiptResponse = yield call(createReceiptApi, action.payload);
        console.log("createReceiptApi response", response);
        if (response.success) {
            const receiptId = response.data.receipt._id;
            console.log("receipt: receiptId", receiptId);
            yield put(createReceiptSuccess(receiptId));
        } else {
            yield put(createReceiptFailure('Server returned failure'));
        }
    } catch (err: any) {
        yield put(createReceiptFailure(err.message));
    }
}

export function* receiptSaga() {
    yield takeEvery(createReceiptRequest.type, handleCreateReceipt);
}
