import { all, fork } from "redux-saga/effects";
import { productsWatcherSaga } from "./ProductSagas";
import { categoriesWatcherSaga } from "./CategoriesSaga";
import authSaga from "./RegistrationSagas";
import cartSaga from "../Saga/CartSaga";
// import { watchReceiptFlow } from "./receiptSaga";
// import { watchCardFlow } from "./CardSaga";
import { orderSaga } from "./OrderSaga";
import { receiptSaga } from "./receiptSaga";
import { cardSaga } from "./CardSaga";
import { verifySaga } from "./VerifySaga";
import { verifyCardSaga } from "./verifyCardSaga";
import { watchReceiptPay } from "./ReceiptPaysaga";
// import { watchSocket } from "./SocketSaga";

export function* rootSaga() {
    yield all([
        fork(productsWatcherSaga),
        fork(categoriesWatcherSaga),
        fork(authSaga),
        fork(cartSaga),
        fork(orderSaga),
        fork(receiptSaga),
        fork(cardSaga),
        fork(verifySaga),
        fork(verifyCardSaga),
        fork(watchReceiptPay), 
        // fork(watchSocket),
    ]);
}