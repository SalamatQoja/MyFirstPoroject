import axios from "axios";
import {  type Product, ProductsActionTypes, type ProductApiresponse } from "../types";
import { call, put, takeEvery } from "redux-saga/effects";
import { fetchProductsFailure, fetchProductsSuccess } from "../Action";


export function fetchProductsApi(): Promise<Product[]> {
    return axios.get<ProductApiresponse>('https://globus-nukus.uz/api/products')
        .then(res => {
            console.log(`otvet ot servera:`, res.data.data.items );
            return res.data.data.items;
        });
    
}

function* fetchProductsSaga(){
    try {
        const data: Product[] = yield call(fetchProductsApi);
        yield put(fetchProductsSuccess(data));
    } catch (e: any) {
        yield put(fetchProductsFailure(e.message));
    }
}

export function* productsWatcherSaga(){
    yield takeEvery(ProductsActionTypes.FETCH_PRODUCTS_REQUEST, fetchProductsSaga)
}