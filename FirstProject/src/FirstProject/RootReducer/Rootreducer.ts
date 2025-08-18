
import { combineReducers } from "redux";
import  authSlice  from "../Avtorizatsya/AuthSlice"
import { appReducer }     from "../Reducer"; 
import cartSlice from "../Cart/CartSlice"
import  cardSlice  from "../Payme/CardSlice";
import orderSlice from "../Payme/OrderSlice";
import receiptSlice from "../Payme/ReceiptSlice";
import  verifySlice  from "../Payme/VerifySlice";
// import SocketOrders from "../Payme/ordersSlice"

export const rootReducer = combineReducers({
  auth: authSlice,
  app:  appReducer,
  cart: cartSlice,
  card: cardSlice,
  order: orderSlice,
  receipt: receiptSlice,
  verify: verifySlice,
  // socketOrder: SocketOrders,
});
export type RootState = ReturnType<typeof rootReducer>;

