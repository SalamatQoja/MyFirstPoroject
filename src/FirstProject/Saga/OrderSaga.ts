import { eventChannel, END, type SagaIterator } from 'redux-saga';
import { take, call, fork, delay, put, race, select, takeEvery } from 'redux-saga/effects';
import {
    createOrderRequest,
    createOrderSuccess,
    createOrderFailure,
    getOrdersStart, orderFailure, setOrders
} from '../Payme/OrderSlice';
import { buildCreateOrderMessage } from '../Payme/Api/CardService';
import { type RootState } from '../RootReducer/Rootreducer';
// import { type SocketMessage } from '../Payme/OrderType';
// import { orderFailure } from '../Payme/OrderSlice';
// import { setOrders } from '../Payme/ordersSlice';

// type SocketMessage = { type: string; data?: any; error?: string };
// let socket: WebSocket | null = null;
// function createWebSocketChannel(ws: WebSocket) {
//     return eventChannel(emitter => {
//         ws.onopen = () => console.log('WS connected');
//         ws.onmessage = e => {
//             const msg: SocketMessage = JSON.parse(e.data);
//             console.log("createSocket socketmessage, msg", msg);
//             emitter(msg);
//         }
//         ws.onerror = err => console.error('WS error', err);
//         ws.onclose = () => emitter(END);
//         return () => ws.close();
//     });
// }

// function* watchWebSocket(): SagaIterator {
//     const token: string = yield select((s: RootState) => s.auth.accessToken);
//     socket = new WebSocket(`wss://globus-nukus.uz/ws/orders?token=${token}`);
//     console.log("watchwebsocket - socket readstyte", socket.readyState);

//     const channel = yield call(createWebSocketChannel, socket);
//     try {
//         while (true) {
//             const msg: SocketMessage = yield take(channel);
//             console.log("watchWebsocket, polucheneye sms iz ws", msg.data);
//             if (msg.type === 'order_created') {
//                 console.log("dispatchim createOrderSuccess s data", msg.data);
//                 yield put(createOrderSuccess(msg.data));
//             } else {
//                 console.log("neojidanniy tip sms", msg.type);

//             }
//         }
//     } finally {
//         channel.close();
//     }
// }

// function* sendCreateOrder(action: ReturnType<typeof createOrderRequest>) {
//     console.log('sendcreateOrder: payload', action.payload);
//     if (!socket || socket.readyState !== WebSocket.OPEN) {
//         console.log("sendcreateOrder: socket not ready", socket?.readyState);
//         yield put(createOrderFailure('WebSocket not connected'));
//         return;
//     }
//     const msg = buildCreateOrderMessage(action.payload);
//     console.log("sendCreateOrder", msg);
//     try {
//         socket.send(JSON.stringify(msg));
//     } catch (err: any) {
//         console.error("sendCreateOrder error", err);
//         yield put(createOrderFailure(err.message));
//     }
// }

// function* handleGetOrders(): SagaIterator {
//     try {
//         // const token = localStorage.getItem("token");
//         // console.log("getorders", token);
//         // if (!token) throw new Error("Token net");
//         if (!socket) {
//             console.warn('[handleGetOrders] socket is null');
//             yield put(orderFailure('WebSocket not connected'));
//             return;
//         }

//         const chan = yield call(createWebSocketChannel, socket);
//         console.log("getOrders, watchwebSocket", chan);
//         while (true) {
//             const msg = yield take(chan);
//             console.log("getordersWatchwebsocket", msg);

//             if (msg.error) throw new Error(msg.error);

//             if (msg.type === "get_orders") {
//                 yield put(setOrders(msg.data.orders));
//                 chan.close();
//                 break;
//             }
//         }
//     } catch (err: any) {
//         yield put(createOrderFailure(err.message));
//     }
// }

// export function* orderSaga() {
//     yield fork(watchWebSocket);
//     yield takeEvery(createOrderRequest.type, sendCreateOrder);
//     yield takeEvery(getOrdersStart.type, handleGetOrders);
// }


type SocketMessage = { type: string; data?: any; error?: string };
let socket: WebSocket | null = null;

function createWebSocketChannel(ws: WebSocket) {
    return eventChannel(emitter => {
        ws.onopen = () => console.log('WS connected');
        ws.onmessage = e => {
            try {
                const msg: SocketMessage = JSON.parse(e.data);
                console.log("createSocket socketmessage, msg", msg);
                emitter(msg);
            } catch (err) {
                console.error('WS invalid json', err);
                emitter({ type: 'error', error: 'Invalid JSON' });
            }
        };
        ws.onerror = err => console.error('WS error', err);
        ws.onclose = () => emitter(END);
        return () => ws.close();
    });
}

function* watchWebSocket(): SagaIterator {
    const token: string = yield select((s: RootState) => s.auth?.accessToken ?? '');
    socket = new WebSocket(`wss://globus-nukus.uz/ws/orders?token=${encodeURIComponent(token)}`);
    console.log("watchwebsocket - socket readstyte", socket.readyState);

    const channel = yield call(createWebSocketChannel, socket);
    try {
        while (true) {
            const msg: SocketMessage = yield take(channel);
            if (!msg) continue;

            console.log("watchWebsocket, received msg from ws", msg);

            // MARKAZIY ROUTING: bu yerda barcha ws turlarini qayta ishlaymiz
            if (msg.type === 'order_created') {
                console.log("dispatch createOrderSuccess with data", msg.data);
                yield put(createOrderSuccess(msg.data));
            } else if (msg.type === 'get_orders' || msg.type === 'orders_list' || msg.type === 'orders:init') {
                // Backend turli nomlar bilan yuborishi mumkin — hammasini qamrab olamiz
                // msg.data.orders yoki msg.data bo'lishi mumkin
                const ordersPayload = msg.data?.orders ?? msg.data;
                if (Array.isArray(ordersPayload)) {
                    yield put(setOrders(ordersPayload));
                } else {
                    // agar server bitta order yuborsa ham ishlatsin
                    console.warn('[WS] get_orders payload is not array', ordersPayload);
                }
            } else if (msg.type === 'orders:update') {
                // agar sizda upsert action bo'lsa chaqiring; agar yo'q bo'lsa createOrderSuccess ishlatish mumkin
                if (msg.data) {
                    yield put(createOrderSuccess(msg.data)); // yoki yield put(upsertOrder(msg.data));
                }
            } else if (msg.type === 'error' || msg.type === 'order_error') {
                const errStr = msg.error ?? msg.data?.message ?? 'WS error';
                yield put(orderFailure(errStr));
            } else {
                console.log('[WS] unknown message type', msg.type, msg.data);
            }
        }
    } finally {
        channel.close();
        socket = null;
        console.log('[WS] channel closed');
    }
}

function* sendCreateOrder(action: ReturnType<typeof createOrderRequest>) {
    console.log('sendcreateOrder: payload', action.payload);
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.log("sendcreateOrder: socket not ready", socket?.readyState);
        yield put(createOrderFailure('WebSocket not connected'));
        return;
    }
    const msg = buildCreateOrderMessage(action.payload);
    try {
        socket.send(JSON.stringify(msg));
    } catch (err: any) {
        console.error("sendCreateOrder error", err);
        yield put(createOrderFailure(err.message ?? 'Send failed'));
    }
}

function* handleGetOrders(): SagaIterator {
    try {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.warn('[handleGetOrders] socket not ready');
            yield put(orderFailure('WebSocket not connected'));
            return;
        }

        // yuboramiz — backend get_orders tipidagi xabar kutadi
        const req = { type: 'get_orders' };
        try {
            socket.send(JSON.stringify(req));
        } catch (err: any) {
            console.error('[handleGetOrders] send error', err);
            yield put(orderFailure('Failed to request orders'));
            return;
        }

        // kutamiz: setOrders actioni kelishi yoki timeout (5s)
        const {  timeout } = yield race({
            resp: take(setOrders.type),
            timeout: delay(5000),
        });

        if (timeout) {
            yield put(orderFailure('Get orders timeout'));
            return;
        }

        // agar resp bo'lsa — setOrders reducer allaqachon ishlagan
    } catch (err: any) {
        console.error('[handleGetOrders] error', err);
        yield put(orderFailure(err.message ?? 'Get orders failed'));
    }
}

export function* orderSaga() {
    yield fork(watchWebSocket);
    yield takeEvery(createOrderRequest.type, sendCreateOrder);
    yield takeEvery(getOrdersStart.type, handleGetOrders);
}
