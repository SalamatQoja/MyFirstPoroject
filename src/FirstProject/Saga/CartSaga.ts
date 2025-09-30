import { call, put, takeLatest } from 'redux-saga/effects';
import {
    fetchCart,
    addCartItem,
    updateCartItem,
    removeCartItem,
    clearCart,
    type CartItem,
} from "../Cart/CartService";
import {
    fetchCartStart,
    fetchCartSuccess,
    fetchCartFailure,
    addItemStart,
    addItemSuccess,
    addItemFailure,
    updateItemStart,
    updateItemSuccess,
    updateItemFailure,
    removeItemStart,
    removeItemSuccess,
    removeItemFailure,
    clearCartStart,
    clearCartSuccess,
    clearCartFailure,
} from "../Cart/CartSlice";

function* onFetchCart() {
    try {
        const items: CartItem[] = yield call(fetchCart);
        console.log("fetchCart",items);
        yield put(fetchCartSuccess(items));
    } catch (err: any) {
        yield put(fetchCartFailure(err.message));
    }
}

function* onAddItem(action: ReturnType<typeof addItemStart>) {
    try {
        const { product, quantity } = action.payload;
        const item: CartItem = yield call(addCartItem, product, quantity);
        console.log("Additem",item);
        yield put(addItemSuccess(item));
    } catch (err: any) {
        yield put(addItemFailure(err.message));
    }
}

function* onUpdateItem(action: ReturnType<typeof updateItemStart>) {
    try {
        const { id, product, quantity } = action.payload;
        const item: CartItem = yield call(updateCartItem, id, product, quantity);
        console.log("Uptadeitem",item);
        // console.log(item);

        yield put(updateItemSuccess(item));
    } catch (err: any) {
        yield put(updateItemFailure(err.message));
    }
}

function* onRemoveItem(action: ReturnType<typeof removeItemStart>) {
    try {
        const id: number = action.payload;
        console.log("removeItem", id);
        yield call(removeCartItem, id);
        yield put(removeItemSuccess(id));
    } catch (err: any) {
        yield put(removeItemFailure(err.message));
    }
}

function* onClearCart() {
    try {
        yield call(clearCart);
        yield put(clearCartSuccess());
    } catch (err: any) {
        yield put(clearCartFailure(err.message));
    }
}

export default function* cartSaga() {
    yield takeLatest(fetchCartStart.type, onFetchCart);
    yield takeLatest(addItemStart.type, onAddItem);
    yield takeLatest(updateItemStart.type, onUpdateItem);
    yield takeLatest(removeItemStart.type, onRemoveItem);
    yield takeLatest(clearCartStart.type, onClearCart);
}