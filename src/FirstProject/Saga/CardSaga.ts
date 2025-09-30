import { call, put, takeEvery } from 'redux-saga/effects';
import {
  createCardRequest,
  createCardSuccess,
  createCardFailure,
} from '../Payme/CardSlice';
import { createCardApi } from '../Payme/Api/CardService';
import type { CreateCardResponse } from '../Payme/OrderType';

function* handleCreateCard(action: ReturnType<typeof createCardRequest>) {
  console.log("[Saga] createCardRequest", action.payload);
  try {
    const res: CreateCardResponse = yield call(createCardApi, action.payload);
    console.log("createCard", res);
    if (res.success) {
      console.log("[Saga] creaCardSuccess", res.data.card.token);
      yield put(createCardSuccess(res.data.card.token));
    } else {
      yield put(createCardFailure("Server returned failure"));
    }
  } catch (err: any) {
    yield put(createCardFailure(err.message));
  }
}

export function* cardSaga() {
  yield takeEvery(createCardRequest.type, handleCreateCard);
}