import { call, put, takeEvery } from 'redux-saga/effects';
import {
    getVerifyCodeRequest,
    getVerifyCodeSuccess,
    getVerifyCodeFailure,
} from '../Payme/VerifySlice';
import { getVerifyCodeApi } from '../Payme/Api/CardService';
import { type GetVerifyCodePayload } from '../Payme/OrderType';
import type { SagaIterator } from 'redux-saga';

function* handleGetVerifyCode(action: ReturnType<typeof getVerifyCodeRequest>): SagaIterator {
    try {
        const payload: GetVerifyCodePayload = action.payload;
        console.log("[verifySaga] send get _verify_code payload", payload);

        const res = yield call(getVerifyCodeApi, action.payload);
        console.log("getverifycode", res);
        if (res.success) {
            yield put(getVerifyCodeSuccess(res.data));
        } else {
            yield put(getVerifyCodeFailure('Ошибка на сервере'));
        }
    } catch (err: any) {
        yield put(getVerifyCodeFailure(err.message));
    }
}

export function* verifySaga() {
    yield takeEvery(getVerifyCodeRequest.type, handleGetVerifyCode);
}