import { call, put, takeEvery } from 'redux-saga/effects';
import { payReceiptApi } from '../Payme/Api/CardService';
import { payReceiptRequest, payReceiptSuccess, payReceiptFailure } from '../Payme/ReceiptSlice';
import type { ReceiptPayPayload } from '../Payme/OrderType';
import type { SagaIterator } from 'redux-saga';

function* handlePayReceipt(action: ReturnType<typeof payReceiptRequest>): SagaIterator {
    try {
        const payload: ReceiptPayPayload = action.payload;
        console.log('[receiptSaga] payReceipt payload:', { invoice_id: payload.invoice_id, token: '***' });

        const res = yield call(payReceiptApi, payload);
        console.log('[receiptSaga] payReceipt response:', res);

        if (res.success) {
            yield put(payReceiptSuccess(res.data.receipt));
        } else {
            yield put(payReceiptFailure(res.errMessage ?? 'Ошибка оплаты'));
        }
    } catch (err: any) {
        console.error('[receiptSaga] payReceipt error:', err);
        const msg = err.response?.data?.errMessage ?? err.message ?? 'Network error';
        yield put(payReceiptFailure(msg));
    }
}

export function* watchReceiptPay() {
    yield takeEvery(payReceiptRequest.type, handlePayReceipt);
}