import axios from "axios";
import { type CategoryApiResponse, type Category, CategoryActionTypes } from "../types";
import { fetchCategoriesFailure, fetchCategoriesSuccess } from "../Action";
import { call, put, takeEvery } from "redux-saga/effects";

export function fetchCategoriesApi(): Promise<Category[]> {
  return axios
    .get<CategoryApiResponse>("https://globus-nukus.uz/api/categories")
    .then(res => res.data.data.categories);
}

function* fetchCategoriesSaga() {
  try {
    const cats: Category[] = yield call(fetchCategoriesApi);
    yield put(fetchCategoriesSuccess(cats));
  } catch (err: any) {
    yield put(fetchCategoriesFailure(err.message));
  }
}

export function* categoriesWatcherSaga() {
  yield takeEvery(
    CategoryActionTypes.FETCH_CATEGORIES_REQUEST,
    fetchCategoriesSaga
  );
}