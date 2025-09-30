import { call, put, takeLatest } from "redux-saga/effects";
import {
    loginFailure, loginStart, loginSuccess, registerFailure,
    registerStart, registerSuccess, verifyFailure, verifyStart,
    verifySuccess
} from "../Avtorizatsya/AuthSlice";
import { type RegisterResponse, type VerifyResponse, loginUser, registerUser, verifyOtp } from "../Avtorizatsya/AuthActions";

function* handleRegister(action: ReturnType<typeof registerStart>) {
    try {
        const payload = action.payload;
        console.log(payload);

        const data: RegisterResponse = yield call(registerUser, payload);
        console.log(data);
        yield put(registerSuccess(data.data.user.id))
    }
    catch (err: any) {
        yield put(registerFailure(err.message))
    }
}

function* handleVerify(action: ReturnType<typeof verifyStart>) {
    try {
        const { phone, otp } = action.payload;
        const data: VerifyResponse = yield call(verifyOtp, { phone, otp });
        yield put(verifySuccess({
            access: data.data.token.access,
            refresh: data.data.token.refresh,
        }))
    }
    catch (err: any) {
        yield put(verifyFailure(err.message))
    }
}

function* handleLogin(action: ReturnType<typeof loginStart>) {
    try {
        const data: VerifyResponse = yield call(loginUser, action.payload);
        console.log(data.data);

        yield put(loginSuccess(data.data.token));

        localStorage.setItem('token', data.data.token.access);
        localStorage.setItem('refresh_token', data.data.token.refresh);
    }
    catch (err: any) {
        yield put(loginFailure(err.message))
    }
}

export default function* authSaga() {
    yield takeLatest(registerStart.type, handleRegister);
    yield takeLatest(verifyStart.type, handleVerify);
    yield takeLatest(loginStart.type, handleLogin);
}
