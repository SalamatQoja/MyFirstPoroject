import { call, put, takeEvery } from 'redux-saga/effects';
import { verifyCardRequest, verifyCardSuccess, verifyCardFailure } from '../Payme/VerifySlice';
import { verifyCardApi } from '../Payme/Api/CardService';
import { type VerifyCardPayload, type VerifyCardResponse } from '../Payme/OrderType';
import type { SagaIterator } from 'redux-saga';

function* handleVerifyCard(action: ReturnType<typeof verifyCardRequest>): SagaIterator {
    try {
        const payload: VerifyCardPayload = action.payload;
        console.log("verifyCardPayload", payload);
        const res: VerifyCardResponse = yield call(verifyCardApi, action.payload);
        console.log("verifyCard", res);
        if (res.success) {
            yield put(verifyCardSuccess());
        } else {
            yield put(verifyCardFailure(res.errMessage ?? 'Ошибка верификации'));
        }
    } catch (err: any) {
        console.log("[verifySaga] error", err);
        yield put(verifyCardFailure(err.message));
    }
}

export function* verifyCardSaga() {
    yield takeEvery(verifyCardRequest.type, handleVerifyCard);
}