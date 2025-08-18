// // // OrderSaga.ts
// // import { eventChannel, type EventChannel, END } from 'redux-saga';
// // import { call, put, take, fork, select, takeEvery, delay } from 'redux-saga/effects';
// // import type { SagaIterator } from 'redux-saga';
// // import {
// //     createOrderRequest,
// //     createOrderSuccess,
// //     createOrderFailure,
// //     getOrdersStart,
// //     setOrders,
// //     orderFailure,
// // } from '../Payme/OrderSlice'; // поправьте путь
// // import type { RootState } from '../RootReducer/Rootreducer';

// // type SocketMessage = { type: string; data?: any; error?: string };

// // let socket: WebSocket | null = null;

// // /** channel wrapper for native WebSocket */
// // function createWebSocketChannel(ws: WebSocket): EventChannel<SocketMessage | typeof END> {
// //     return eventChannel((emit) => {
// //         ws.onopen = () => {
// //             console.log('[WS] open');
// //             emit({ type: '__WS_OPEN__' });
// //         };

// //         ws.onmessage = (e: MessageEvent) => {
// //             // debug raw message
// //             console.debug('[WS] raw message:', e.data);
// //             try {
// //                 const msg = JSON.parse(e.data) as SocketMessage;
// //                 emit(msg);
// //             } catch (err) {
// //                 console.error('[WS] parse error:', err, e.data);
// //             }
// //         };

// //         ws.onerror = (err) => {
// //             console.error('[WS] error event', err);
// //             // don't emit END here — let onclose handle termination
// //         };

// //         ws.onclose = (ev) => {
// //             console.warn('[WS] closed', ev.code, ev.reason);
// //             emit(END);
// //         };

// //         return () => {
// //             try {
// //                 ws.onopen = null;
// //                 ws.onmessage = null;
// //                 ws.onerror = null;
// //                 ws.onclose = null;
// //                 ws.close();
// //             } catch (e) { /* ignore */ }
// //         };
// //     });
// // }

// // /** wait for socket open (promise) */
// // function waitForSocketOpen(ws: WebSocket, timeoutMs = 10000): Promise<void> {
// //     return new Promise((resolve, reject) => {
// //         if (!ws) return reject(new Error('No socket'));
// //         if (ws.readyState === WebSocket.OPEN) return resolve();

// //         const onOpen = () => { cleanup(); resolve(); };
// //         const onClose = () => { cleanup(); reject(new Error('Socket closed before open')); };
// //         const onError = () => { cleanup(); reject(new Error('Socket error before open')); };

// //         const timer = window.setTimeout(() => { cleanup(); reject(new Error('waitForSocketOpen timeout')); }, timeoutMs);

// //         function cleanup() {
// //             clearTimeout(timer);
// //             ws.removeEventListener('open', onOpen);
// //             ws.removeEventListener('close', onClose);
// //             ws.removeEventListener('error', onError);
// //         }

// //         ws.addEventListener('open', onOpen);
// //         ws.addEventListener('close', onClose);
// //         ws.addEventListener('error', onError);
// //     });
// // }

// // /** safeSend: дождаться открытия сокета и отправить сообщение */
// // function* safeSend(msg: any): SagaIterator {
// //     if (!socket) throw new Error('WebSocket not initialized');
// //     // ждём открытие (если уже открыт — сразу вернётся)
// //     yield call(waitForSocketOpen, socket, 10000);
// //     if (socket!.readyState === WebSocket.OPEN) {
// //         socket!.send(JSON.stringify(msg));
// //         console.debug('[WS] sent message', msg);
// //     } else {
// //         throw new Error('Socket not open after wait');
// //     }
// // }

// // /** send create_order через WS */
// // function* sendCreateOrder(action: ReturnType<typeof createOrderRequest>): SagaIterator {
// //     try {
// //         if (!socket || socket.readyState !== WebSocket.OPEN) {
// //             yield put(createOrderFailure('WebSocket not connected'));
// //             return;
// //         }
// //         const msg = { type: 'create_order', data: action.payload };
// //         yield call(safeSend, msg);
// //     } catch (err: any) {
// //         yield put(createOrderFailure(err.message ?? String(err)));
// //     }
// // }

// // /** handleGetOrders: отправляет get_orders по открытому socket (вызывается при dispatch(getOrdersStart())) */
// // function* handleGetOrders(): SagaIterator {
// //     try {
// //         const userId: string | undefined = yield select((s: RootState) => s.auth.userId);
// //         if (!socket) {
// //             // console.warn('[handleGetOrders] socket is null');
// //             yield put(orderFailure('WebSocket not connected'));
// //             return;
// //         }
// //         // если socket не в OPEN — попробуем дождаться или вернуть ошибку
// //         if (socket.readyState !== WebSocket.OPEN) {
// //             try {
// //                 // ждём открытия (10s)
// //                 yield call(waitForSocketOpen, socket, 2000);
// //             } catch (e: any) {
// //                 console.warn('[handleGetOrders] socket did not open in time', e);
// //                 yield put(orderFailure('WebSocket not ready'));
// //                 return;
// //             }
// //         }

// //         // теперь отправляем
// //         const msg = { type: 'get_orders', data: { userId } };
// //         socket.send(JSON.stringify(msg));
// //         console.debug('[handleGetOrders] sent get_orders', msg);
// //         // ответ придёт в watchWebSocket как orders:list
// //     } catch (err: any) {
// //         console.error('[handleGetOrders] error', err);
// //         yield put(orderFailure(err.message ?? String(err)));
// //     }
// // }

// // /** основной watcher с reconnect/backoff (обрабатывает входящие сообщения) */
// // function* watchWebSocket(): SagaIterator {
// //     const token: string | undefined = yield select((s: RootState) => s.auth.accessToken);
// //     const base = 'wss://globus-nukus.uz/ws/orders';
// //     let attempt = 0;

// //     while (true) {
// //         let chan: EventChannel<SocketMessage | typeof END> | null = null;
// //         let ws: WebSocket | null = null;
// //         try {
// //             const url = token ? `${base}?token=${encodeURIComponent(token)}` : base;
// //             console.log('[orderSaga] connecting to', url, 'attempt', attempt + 1);
// //             ws = new WebSocket(url);
// //             socket = ws;

// //             // создаём канал (yield call возвращает значение канала)
// //             chan = (yield call(createWebSocketChannel, ws)) as EventChannel<SocketMessage | typeof END>;

// //             let opened = false;

// //             while (true) {
// //                 if (!chan) {
// //                     console.warn('[orderSaga] channel is null before take — breaking inner loop');
// //                     break;
// //                 }

// //                 const msg: SocketMessage | typeof END = yield take(chan);
// //                 if (msg === END) {
// //                     console.warn('[orderSaga] channel END received — break inner loop');
// //                     break;
// //                 }

// //                 // при открытии — запросим список заказов (по userId)
// //                 if (!opened && msg.type === '__WS_OPEN__') {
// //                     opened = true;
// //                     try {
// //                         const userId: string | undefined = yield select((s: RootState) => s.auth.userId);
// //                         const getMsg = { type: 'get_orders', data: { userId } };
// //                         ws!.send(JSON.stringify(getMsg));
// //                         console.debug('[orderSaga] initial get_orders sent', getMsg);
// //                     } catch (e) {
// //                         console.warn('[orderSaga] initial get_orders failed', e);
// //                     }
// //                     attempt = 0;
// //                     continue;
// //                 }

// //                 // обработка событий от сервера
// //                 if (msg.type === 'orders:list' || msg.type === 'orders_list') {
// //                     const list = msg.data ?? msg;
// //                     const orders = list.orders ?? list;
// //                     console.log('[orderSaga] orders:list received count=', (orders?.length ?? 0));
// //                     yield put(setOrders(orders));
// //                 } else if (msg.type === 'order_created' || msg.type === 'order:created') {
// //                     const order = msg.data ?? msg;
// //                     console.log('[orderSaga] order_created', order);
// //                     yield put(createOrderSuccess(order));
// //                     // дополнительно добавим в список (если нужно)
// //                     const existing: any[] = yield select((s: RootState) => s.order.orders ?? []);
// //                     yield put(setOrders([order, ...existing]));
// //                 } else if (msg.type === 'order:update' || msg.type === 'order:updated') {
// //                     const order = msg.data ?? msg;
// //                     console.log('[orderSaga] order:update', order);
// //                     const existing2: any[] = yield select((s: RootState) => s.order.orders ?? []);
// //                     const idx = existing2.findIndex(x => String(x._id ?? x.id ?? x.invoiceId) === String(order._id ?? order.id ?? order.invoiceId));
// //                     if (idx === -1) {
// //                         yield put(setOrders([order, ...existing2]));
// //                     } else {
// //                         existing2[idx] = { ...existing2[idx], ...order };
// //                         yield put(setOrders(existing2));
// //                     }
// //                 } else if (msg.type === 'receipt:paid') {
// //                     const receipt = msg.data ?? msg;
// //                     console.log('[orderSaga] receipt:paid', receipt);
// //                     const existing3: any[] = yield select((s: RootState) => s.order.orders ?? []);
// //                     const invoiceId = receipt._id ?? receipt.invoice_id ?? receipt.id;
// //                     const idx2 = existing3.findIndex(x => String(x._id ?? x.invoiceId ?? x.id) === String(invoiceId));
// //                     if (idx2 !== -1) {
// //                         existing3[idx2] = { ...existing3[idx2], receipt };
// //                         yield put(setOrders(existing3));
// //                     }
// //                 } else {
// //                     console.log('[orderSaga] unknown message type', msg.type);
// //                 }
// //             }
// //         } catch (err: any) {
// //             console.error('[orderSaga] WS error', err?.message ?? err);
// //             attempt = Math.min(attempt + 1, 6);
// //             const backoff = Math.min(30000, 1000 * Math.pow(2, attempt));
// //             console.log(`[orderSaga] reconnect in ${backoff}ms (attempt ${attempt})`);
// //             yield delay(backoff);
// //         } finally {
// //             if (chan) try { chan.close(); } catch { /* ignore */ }
// //             try { if (ws) ws.close(); } catch { /* ignore */ }
// //             if (socket === ws) socket = null;
// //         }
// //     }
// // }

// // /** root saga */
// // export function* orderSaga(): SagaIterator {
// //     yield fork(watchWebSocket);
// //     yield takeEvery(createOrderRequest.type, sendCreateOrder);
// //     yield takeEvery(getOrdersStart.type, handleGetOrders);
// // }


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

// import { eventChannel, END } from 'redux-saga';
// import { call, put, take, takeEvery, fork, select, delay, race } from 'redux-saga/effects';
// import type { SagaIterator } from 'redux-saga';

// // Import actionlar — pathni loyihangizga moslab o'zgartiring
// import {
//     createOrderRequest,
//     createOrderSuccess,
//     createOrderFailure,
//     getOrdersStart,
//     setOrders,
//     orderFailure,
// } from '../Payme/OrderSlice';

// type RootState = any; // loyihangizdagi RootState bilan almashtiring
// type SocketMessage = { type: string; data?: any; error?: string };

// let socket: WebSocket | null = null;

// // bitta channel yaratadi va ws hodisalarini uni orqali yuboradi
// function createWebSocketChannel(ws: WebSocket) {
//     return eventChannel<SocketMessage>(emitter => {
//         ws.onopen = () => {
//             console.log('[WS] connected');
//             emitter({ type: '__WS_OPEN__' });
//         };

//         ws.onmessage = (e: MessageEvent) => {
//             try {
//                 const msg: SocketMessage = JSON.parse(e.data);
//                 // console.log('[WS] recv', msg);
//                 emitter(msg);
//             } catch (err) {
//                 console.error('[WS] invalid json', err);
//                 emitter({ type: 'error', error: 'Invalid JSON from WS' });
//             }
//         };

//         ws.onerror = (err) => {
//             console.error('[WS] error', err);
//             emitter({ type: 'error', error: 'WebSocket error' });
//         };

//         ws.onclose = (ev) => {
//             console.log('[WS] closed', ev);
//             emitter(END);
//         };

//         // unsubscribe
//         return () => {
//             try { ws.close(); } catch (e) { }
//         };
//     });
// }

// // watchWebSocket: bitta kanalni yaratadi va barcha xabarlarni store ga yo'naltiradi
// function* watchWebSocket(): SagaIterator {
//     while (true) {
//         try {
//             const token: string = yield select((s: RootState) => s.auth?.accessToken ?? '');
//             const url = `wss://globus-nukus.uz/ws/orders?token=${encodeURIComponent(token)}`;
//             console.log('[WS] connecting to', url);

//             try {
//                 socket = new WebSocket(url);
//             } catch (err) {
//                 console.error('[WS] WebSocket constructor failed', err);
//                 // kichik kutishdan so'ng qayta urinish
//                 yield delay(2000);
//                 continue;
//             }

//             const channel = yield call(createWebSocketChannel, socket);

//             try {
//                 while (true) {
//                     const msg: SocketMessage = yield take(channel);
//                     if (!msg) continue;

//                     // MARKAZIY ROUTING: serverdan kelgan turlarga qarab action yuboramiz
//                     if (msg.type === 'orders:init' && Array.isArray(msg.data)) {
//                         // server to'liq ro'yxat yubordi
//                         yield put(setOrders(msg.data));
//                     } else if (msg.type === 'orders:update') {
//                         // agar server bitta order obyekti yuborsa, createOrderSuccess yoki setOrders qilamiz
//                         if (Array.isArray(msg.data)) {
//                             yield put(setOrders(msg.data));
//                         } else if (msg.data) {
//                             // ko'plab loyihalarda update uchun alohida action bo'ladi (upsert).
//                             // Sizning slice ichida createOrderSuccess orderni ro'yxatga qo'shadigan xulq bo'lsa ishlatilsin.
//                             yield put(createOrderSuccess(msg.data));
//                         }
//                     } else if (msg.type === 'order_created' || msg.type === 'order_created_success') {
//                         // server biz jo'natgan create_order ga javob berdi
//                         if (msg.data) yield put(createOrderSuccess(msg.data));
//                     } else if (msg.type === 'get_orders' || msg.type === 'orders_list') {
//                         // server get_orders so'roviga javob qaytargan bo'lsa
//                         if (msg.data && Array.isArray(msg.data.orders)) yield put(setOrders(msg.data.orders));
//                         else if (Array.isArray(msg.data)) yield put(setOrders(msg.data));
//                     } else if (msg.type === 'error' || msg.type === 'order_error') {
//                         // umumiy server xatolari
//                         const errStr = msg.error ?? (msg.data?.message) ?? 'WS error';
//                         yield put(orderFailure(errStr));
//                     } else {
//                         // noma'lum xabar turlari uchun log — kerak bo'lsa moslang
//                         console.log('[WS] unknown message type', msg.type, msg.data);
//                     }
//                 }
//             } finally {
//                 // channel END bo'lganda yoki saga cancel bo'lganda keladi — tozalash
//                 channel.close();
//                 socket = null;
//                 console.log('[WS] channel closed, will reconnect');
//             }
//         } catch (err) {
//             console.error('[WS] watcher error', err);
//         }

//         // Oddiy reconnect delay. Kerak bo'lsa exponential backoff qo'shamiz.
//         yield delay(2000);
//     }
// }

// // Yordamchi: create_order xabarini qurish (backend kutgan formatga moslang)
// function buildCreateOrderMessage(payload: any) {
//     return { type: 'order_created', data: payload };
// }

// // sendCreateOrder: socket ochilguncha qisqa muddat kutadi, keyin jo'natadi
// function* sendCreateOrder(action: ReturnType<typeof createOrderRequest>): SagaIterator {
//     const maxWaitMs = 5000;
//     const intervalMs = 100;
//     let waited = 0;

//     // agar socket null yoki hali ochilmagan bo'lsa bir oz kutamiz
//     while ((!socket || socket.readyState !== WebSocket.OPEN) && waited < maxWaitMs) {
//         // agar socket null -> ehtimol hali ulanmoqda; kutamiz
//         yield delay(intervalMs);
//         waited += intervalMs;
//     }

//     if (!socket || socket.readyState !== WebSocket.OPEN) {
//         console.warn('[WS] sendCreateOrder: socket not ready after wait', socket?.readyState);
//         yield put(createOrderFailure('WebSocket not connected'));
//         return;
//     }

//     const msg = buildCreateOrderMessage(action.payload);
//     try {
//         socket.send(JSON.stringify(msg));
//         // serverdan create reply kutiladi va watchWebSocket uni qabul qilib createOrderSuccess ni dispatch qiladi
//     } catch (err: any) {
//         console.error('[WS] sendCreateOrder error', err);
//         yield put(createOrderFailure(err?.message ?? 'Send failed'));
//     }
// }

// // handleGetOrders: serverga get_orders so'rovini yuboradi va setOrders actioniga yoki timeoutga qarab natija qaytaradi
// function* handleGetOrders(): SagaIterator {
//     try {
//         if (!socket || socket.readyState !== WebSocket.OPEN) {
//             yield put(orderFailure('WebSocket not connected'));
//             return;
//         }

//         // jo'natamiz — backend kutgan formatga moslang
//         const req = { type: 'get_orders' };
//         try {
//             socket.send(JSON.stringify(req));
//         } catch (err: any) {
//             console.error('[WS] handleGetOrders send error', err);
//             yield put(orderFailure('Failed to send get_orders'));
//             return;
//         }

//         // server javobini setOrders actioni orqali kutamiz (watchWebSocket uni dispatch qiladi)
//         const { timeout } = yield race({
//             resp: take(setOrders.type),
//             timeout: delay(5000),
//         });

//         if (timeout) {
//             yield put(orderFailure('Get orders timeout'));
//             return;
//         }

//         // agar resp mavjud bo'lsa — setOrders reducer allaqachon ishladi.
//     } catch (err: any) {
//         console.error('[WS] handleGetOrders error', err);
//         yield put(orderFailure(err?.message ?? 'Get orders failed'));
//     }
// }

// // root saga
// export function* orderSaga(): SagaIterator {
//     yield fork(watchWebSocket);
//     yield takeEvery(createOrderRequest.type, sendCreateOrder);
//     yield takeEvery(getOrdersStart.type, handleGetOrders);
// }



// // import { eventChannel, END, type EventChannel } from 'redux-saga';
// // import { call, put, take, fork, select, takeEvery, delay } from 'redux-saga/effects';
// // import type { SagaIterator } from 'redux-saga';
// // import {
// //     createOrderRequest,
// //     createOrderSuccess,
// //     createOrderFailure,
// //     getOrdersStart,
// //     setOrders,
// //     orderFailure,
// // } from '../Payme/OrderSlice'; // подправьте путь
// // import type { RootState } from '../RootReducer/Rootreducer';

// // type SocketMessage = { type: string; data?: any; error?: string };

// // let socket: WebSocket | null = null;

// // /** channel обёртка для native WebSocket */
// // function createWebSocketChannel(ws: WebSocket): EventChannel<SocketMessage | typeof END> {
// //     return eventChannel((emit) => {
// //         console.log('[WS channel] subscribe');

// //         ws.onopen = () => {
// //             console.log('[WS] open');
// //             // Отправляем внутрь саги событие, что сокет открыт
// //             emit({ type: '__WS_OPEN__' });
// //         };

// //         ws.onmessage = (e: MessageEvent) => {
// //             // логируем raw payload, это важно для отладки
// //             console.debug('[WS] raw message:', e.data);
// //             try {
// //                 const msg = JSON.parse(e.data) as SocketMessage;
// //                 console.debug('[WS] parsed message:', msg);
// //                 emit(msg);
// //             } catch (err) {
// //                 console.error('[WS] JSON parse error', err, e.data);
// //             }
// //         };

// //         ws.onerror = (err) => {
// //             console.error('[WS] error event', err);
// //             // не emit END здесь — оставляем reconnect в саге
// //         };

// //         ws.onclose = (ev) => {
// //             console.warn('[WS] close', ev.code, ev.reason);
// //             emit(END);
// //         };

// //         // unsubscribe function
// //         return () => {
// //             try {
// //                 console.log('[WS channel] unsubscribe & close ws');
// //                 ws.onopen = null;
// //                 ws.onmessage = null;
// //                 ws.onerror = null;
// //                 ws.onclose = null;
// //                 ws.close();
// //             } catch (e) {
// //                 // ignore
// //             }
// //         };
// //     });
// // }

// // /** Помощник: дождаться открытия сокета (Promise) */
// // function waitForSocketOpen(ws: WebSocket, timeoutMs = 10000): Promise<void> {
// //     return new Promise((resolve, reject) => {
// //         if (!ws) return reject(new Error('No socket'));
// //         if (ws.readyState === WebSocket.OPEN) return resolve();

// //         const onOpen = () => { cleanup(); resolve(); };
// //         const onClose = () => { cleanup(); reject(new Error('Socket closed before open')); };
// //         const onError = () => { cleanup(); reject(new Error('Socket error before open')); };

// //         const timer = window.setTimeout(() => { cleanup(); reject(new Error('waitForSocketOpen timeout')); }, timeoutMs);

// //         function cleanup() {
// //             clearTimeout(timer);
// //             ws.removeEventListener('open', onOpen);
// //             ws.removeEventListener('close', onClose);
// //             ws.removeEventListener('error', onError);
// //         }

// //         ws.addEventListener('open', onOpen);
// //         ws.addEventListener('close', onClose);
// //         ws.addEventListener('error', onError);
// //     });
// // }

// // /** безопасная отправка (дождаться open) */
// // function* safeSend(msg: any): SagaIterator {
// //     if (!socket) throw new Error('WebSocket not initialized');
// //     yield call(waitForSocketOpen, socket, 10000);
// //     if (socket!.readyState === WebSocket.OPEN) {
// //         socket!.send(JSON.stringify(msg));
// //         console.debug('[WS] sent', msg);
// //     } else {
// //         throw new Error('Socket not open');
// //     }
// // }

// // /** handle getOrdersStart: отправляет get_orders по открытому socket */
// // function* handleGetOrders(): SagaIterator {
// //     try {
// //         const userId: string | undefined = yield select((s: RootState) => s.auth.userId);
// //         if (!socket || socket.readyState !== WebSocket.OPEN) {
// //             console.warn('[handleGetOrders] socket not ready');
// //             yield put(orderFailure('WebSocket not connected'));
// //             return;
// //         }
// //         const msg = { type: 'get_orders', data: { userId } };
// //         yield call(safeSend, msg);
// //         // ответ придёт в watchWebSocket (orders:list)
// //     } catch (err: any) {
// //         console.error('[handleGetOrders] error', err);
// //         yield put(orderFailure(err.message ?? String(err)));
// //     }
// // }

// // /** send create_order по WS */
// // function* sendCreateOrder(action: ReturnType<typeof createOrderRequest>): SagaIterator {
// //     try {
// //         if (!socket || socket.readyState !== WebSocket.OPEN) {
// //             yield put(createOrderFailure('WebSocket not connected'));
// //             return;
// //         }
// //         const msg = { type: 'create_order', data: action.payload };
// //         yield call(safeSend, msg);
// //     } catch (err: any) {
// //         console.error('[sendCreateOrder] error', err);
// //         yield put(createOrderFailure(err.message ?? String(err)));
// //     }
// // }

// // /** Основной watcher с reconnect/backoff */

// // function* watchWebSocket(): SagaIterator {
// //     const token: string | undefined = yield select((s: RootState) => s.auth.accessToken);
// //     const base = 'wss://globus-nukus.uz/ws/orders';
// //     let attempt = 0;

// //     while (true) {
// //         let chan: EventChannel<SocketMessage | typeof END> | null = null;
// //         let ws: WebSocket | null = null;

// //         try {
// //             const url = token ? `${base}?token=${encodeURIComponent(token)}` : base;
// //             ws = new WebSocket(url);
// //             socket = ws;

// //             // Явно привести результат yield call к типу EventChannel<...>
// //             chan = (yield call(createWebSocketChannel, ws)) as EventChannel<SocketMessage | typeof END>;

// //             let opened = false;

// //             while (true) {
// //                 // перед take гарантируем, что chan не null
// //                 if (!chan) {
// //                     console.warn('[orderSaga] channel is null before take — breaking inner loop');
// //                     break;
// //                 }

// //                 // Теперь take получает ненулевой канал — TS удовлетворён
// //                 const msg: SocketMessage | typeof END = yield take(chan);

// //                 if (msg === END) {
// //                     console.warn('[orderSaga] received END — break inner loop');
// //                     break;
// //                 }

// //                 if (!opened && msg.type === '__WS_OPEN__') {
// //                     opened = true;
// //                     try {
// //                         const userId: string | undefined = yield select((s: RootState) => s.auth.userId);
// //                         ws!.send(JSON.stringify({ type: 'get_orders', data: { userId } }));
// //                     } catch (e) { /* ignore */ }
// //                     attempt = 0;
// //                     continue;
// //                 }

// //                 // ... остальная обработка сообщений как было
// //                 if (msg.type === 'orders:list') {
// //                     const list = msg.data ?? msg;
// //                     const orders = list.orders ?? list;
// //                     yield put(setOrders(orders));
// //                 } else if (msg.type === 'order_created' || msg.type === 'order:created') {
// //                     const order = msg.data ?? msg;
// //                     yield put(createOrderSuccess(order));
// //                     const existing: any[] = yield select((s: RootState) => s.order.orders ?? []);
// //                     yield put(setOrders([order, ...existing]));
// //                 } else {
// //                     // ...
// //                 }
// //             }
// //         } catch (err: any) {
// //             console.error('[orderSaga] WS outer error', err?.message ?? err);
// //             attempt = Math.min(attempt + 1, 6);
// //             const backoff = Math.min(30000, 1000 * Math.pow(2, attempt));
// //             yield delay(backoff);
// //         } finally {
// //             if (chan) {
// //                 try { chan.close(); } catch (e) { /* ignore */ }
// //             }
// //             try { if (ws) ws.close(); } catch (e) { /* ignore */ }
// //             if (socket === ws) socket = null;
// //         }
// //     }
// // }
// // /** root saga */
// // export function* orderSaga(): SagaIterator {
// //     yield fork(watchWebSocket);
// //     yield takeEvery(createOrderRequest.type, sendCreateOrder);
// //     yield takeEvery(getOrdersStart.type, handleGetOrders);
// // }


// import { eventChannel, END, type EventChannel } from 'redux-saga';
// import { call, put, take, fork, select, takeEvery, delay } from 'redux-saga/effects';
// import type { SagaIterator } from 'redux-saga';
// import {
//     createOrderRequest,
//     createOrderSuccess,
//     createOrderFailure,
//     getOrdersStart,
//     setOrders,
//     orderFailure, updateOrder, addOrder
// } from '../Payme/OrderSlice'; // поправьте путь
// import type { RootState } from '../RootReducer/Rootreducer'; // поправьте путь

// type SocketMessage = { type: string; data?: any; error?: string };

// let socket: WebSocket | null = null;

// /** channel wrapper */
// function createWebSocketChannel(ws: WebSocket): EventChannel<SocketMessage | typeof END> {
//     return eventChannel((emit) => {
//         ws.onopen = () => {
//             console.log('[WS] open');
//             emit({ type: '__WS_OPEN__' });
//         };

//         ws.onmessage = (e: MessageEvent) => {
//             console.debug('[WS] raw message:', e.data);
//             try {
//                 const msg = JSON.parse(e.data) as SocketMessage;
//                 emit(msg);
//             } catch (err) {
//                 console.error('[WS] parse error', err, e.data);
//             }
//         };

//         ws.onerror = (err) => console.error('[WS] error', err);
//         ws.onclose = () => {
//             // console.warn('[WS] closed');
//             emit(END);
//         };

//         return () => {
//             try {
//                 ws.onopen = null;
//                 ws.onmessage = null;
//                 ws.onerror = null;
//                 ws.onclose = null;
//                 ws.close();
//             } catch { /* ignore */ }
//         };
//     });
// }

// /** wait until ws open (promise) */
// function waitForSocketOpen(ws: WebSocket, timeoutMs = 10000): Promise<void> {
//     return new Promise((resolve, reject) => {
//         if (!ws) return reject(new Error('No socket'));
//         if (ws.readyState === WebSocket.OPEN) return resolve();

//         const onOpen = () => { cleanup(); resolve(); };
//         const onClose = () => { cleanup(); reject(new Error('Socket closed before open')); };
//         const onError = () => { cleanup(); reject(new Error('Socket error before open')); };

//         const timer = window.setTimeout(() => { cleanup(); reject(new Error('waitForSocketOpen timeout')); }, timeoutMs);
//         function cleanup() {
//             clearTimeout(timer);
//             ws.removeEventListener('open', onOpen);
//             ws.removeEventListener('close', onClose);
//             ws.removeEventListener('error', onError);
//         }

//         ws.addEventListener('open', onOpen);
//         ws.addEventListener('close', onClose);
//         ws.addEventListener('error', onError);
//     });
// }

// /** safe send helper */
// function* safeSend(msg: any): SagaIterator {
//     if (!socket) throw new Error('WebSocket not initialized');
//     yield call(waitForSocketOpen, socket, 10000);
//     if (socket!.readyState === WebSocket.OPEN) {
//         socket!.send(JSON.stringify(msg));
//         console.debug('[WS] sent', msg);
//     } else {
//         throw new Error('Socket not open');
//     }
// }

// /** send create_order */
// function* sendCreateOrder(action: ReturnType<typeof createOrderRequest>): SagaIterator {
//     try {
//         if (!socket || socket.readyState !== WebSocket.OPEN) {
//             yield put(createOrderFailure('WebSocket not connected'));
//             return;
//         }
//         const msg = { type: 'create_order', data: action.payload };
//         yield call(safeSend, msg);
//     } catch (err: any) {
//         yield put(createOrderFailure(err.message ?? String(err)));
//     }
// }

// function* handleGetOrders(): SagaIterator {
//     try {
//         const userId: string | undefined = yield select((s: RootState) => s.auth.userId);

//         if (!socket) {
//             console.warn('[handleGetOrders] socket is null');
//             yield put(orderFailure('WebSocket not connected'));
//             return;
//         }

//         // ждём открытия при необходимости
//         if (socket.readyState !== WebSocket.OPEN) {
//             try {
//                 yield call(waitForSocketOpen, socket, 10000);
//             } catch (e) {
//                 console.warn('[handleGetOrders] socket did not open in time', e);
//                 yield put(orderFailure('WebSocket not ready'));
//                 return;
//             }
//         }

//         const msg = { type: 'get_orders', data: { userId } };
//         // используем safeSend для надёжности
//         yield call(safeSend, msg);
//         console.debug('[handleGetOrders] sent get_orders', msg);
//     } catch (err: any) {
//         console.error('[handleGetOrders] error', err);
//         yield put(orderFailure(err.message ?? String(err)));
//     }
// }

// function* watchWebSocket(): SagaIterator {
//     const base = 'wss://globus-nukus.uz/ws/orders';
//     let attempt = 0;

//     while (true) {
//         let chan: EventChannel<SocketMessage | typeof END> | null = null;
//         let ws: WebSocket | null = null;

//         try {
//             // <- ключевая правка: получаем token *каждый проход цикла*, чтобы reconnect с новым токеном работал
//             const token: string | undefined = yield select((s: RootState) => s.auth.accessToken);
//             const url = token ? `${base}?token=${encodeURIComponent(token)}` : base;
//             console.log('[orderSaga] connecting to', url, 'attempt', attempt + 1);

//             ws = new WebSocket(url);
//             socket = ws;

//             chan = (yield call(createWebSocketChannel, ws)) as EventChannel<SocketMessage | typeof END>;

//             let opened = false;

//             while (true) {
//                 if (!chan) break;
//                 const msg: SocketMessage | typeof END = yield take(chan);
//                 if (msg === END) {
//                     console.warn('[orderSaga] channel END — break inner loop');
//                     break;
//                 }

//                 if (!opened && msg.type === '__WS_OPEN__') {
//                     opened = true;
//                     // сразу запрос списка (если нужно)
//                     try {
//                         const userId: string | undefined = yield select((s: RootState) => s.auth.userId);
//                         // используем safeSend или прямой send (ws открыт)
//                         ws!.send(JSON.stringify({ type: 'get_orders', data: { userId } }));
//                         console.debug('[orderSaga] initial get_orders sent');
//                     } catch (e) {
//                         console.warn('[orderSaga] initial get_orders send failed', e);
//                     }
//                     attempt = 0;
//                     continue;
//                 }

//                 // Обработка сообщений
//                 if (msg.type === 'orders:list' || msg.type === 'orders_list') {
//                     const payload = msg.data ?? msg;
//                     const orders = payload.orders ?? payload;
//                     yield put(setOrders(orders));
//                 } else if (msg.type === 'order_created' || msg.type === 'order:created') {
//                     const order = msg.data ?? msg;
//                     // лучше использовать addOrder для апсёрта
//                     yield put(addOrder(order));
//                     // если хотите также сигнализировать об успехе создания:
//                     yield put(createOrderSuccess(order));
//                 } else if (msg.type === 'order:update' || msg.type === 'order:updated') {
//                     const order = msg.data ?? msg;
//                     yield put(updateOrder(order));
//                 } else if (msg.type === 'receipt:paid') {
//                     const receipt = msg.data ?? msg;
//                     // обновим соответствующий заказ (можно через updateOrder)
//                     yield put(updateOrder({ _id: String(receipt._id ?? receipt.id), ...receipt }));
//                 } else {
//                     console.log('[orderSaga] unknown message', msg.type);
//                 }
//             }
//         } catch (err: any) {
//             console.error('[orderSaga] WS outer error', err?.message ?? err);
//             attempt = Math.min(attempt + 1, 6);
//             const backoff = Math.min(30000, 1000 * Math.pow(2, attempt));
//             console.log(`[orderSaga] reconnect in ${backoff}ms (attempt ${attempt})`);
//             yield delay(backoff);
//         } finally {
//             if (chan) try { chan.close(); } catch { }
//             try { if (ws) ws.close(); } catch { }
//             if (socket === ws) socket = null;
//         }
//     }
// }

// export function* orderSaga(): SagaIterator {
//     yield fork(watchWebSocket);
//     yield takeEvery(createOrderRequest.type, sendCreateOrder);
//     yield takeEvery(getOrdersStart.type, handleGetOrders);
// }
