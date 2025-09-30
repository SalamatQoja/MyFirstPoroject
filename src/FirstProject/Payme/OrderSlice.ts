import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
    type CreateOrderPayload,
    type OrderCreatedPayload,
    type Receiver,
} from './OrderType';

interface OrderState {
    loading: boolean;
    orderId?: string;
    orderNumber?: string;
    orders: Order[] | null;
    error?: string;
    Reveiver?: Receiver
}

export interface Order {
    d: number,
    order_number: string,
    amount: number,
    total_amount: number,
    use_cashback: boolean,
    cashback_earned: number,
    cashback_used: number,
    status: string,
    payment_type: number,
    delivery_type: number,
    receiver: {
        id: number,
        first_name: string;
        last_name: string;
        phone: string;
        address: string;
        longitude: number;
        latitude: number;
    },
    items: [
        {
            price: number,
            quantity: number,
            product: number,
            product_name: string,
            total_price: number
        }
    ],
    cash_payments: [
        {
            amount: string,
            type: string,
            created_at: string
        }
    ],
    online_payments: [
        {
            amount: number,
            qr_code_url: string,
            perform_time: string,
        }
    ],
    created_at: string,
    status_updated: string
}


const initialState: OrderState = {
    loading: false,
    orders: null,
};

export const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        createOrderRequest(state, action: PayloadAction<CreateOrderPayload>) {
            state.loading = true;
            state.error = undefined;
        },
        createOrderSuccess(state, action: PayloadAction<OrderCreatedPayload['data']>) {
            state.loading = false;
            state.orderId = action.payload.id;
            state.orderNumber = action.payload.order_number;
        },
        createOrderFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        getOrdersStart(state) {
            state.loading = true;
            state.error = undefined;
        },
        setOrders(state, action: PayloadAction<Order[]>) {
            state.orders = action.payload;
            console.log(state.orders);

            state.loading = false;
        },

        orderFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    createOrderRequest,
    createOrderSuccess,
    createOrderFailure,
    getOrdersStart,
    setOrders, orderFailure,
} = orderSlice.actions;
export default orderSlice.reducer;


// import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

// export interface Receiver {
//     id: number;
//     first_name: string;
//     last_name: string;
//     phone: string;
//     address: string;
//     longitude?: number;
//     latitude?: number;
// }

// export interface OrderItem {
//     price: number;
//     quantity: number;
//     product: number;
//     product_name: string;
//     total_price: number;
// }

// export interface CashPayment {
//     amount: string;
//     type: string;
//     created_at: string;
// }

// export interface OnlinePayment {
//     amount: number;
//     qr_code_url?: string;
//     perform_time?: string;
// }

// export interface Order {
//     id: number;
//     order_number: string;
//     amount: number;
//     total_amount: number;
//     use_cashback: boolean;
//     cashback_earned: number;
//     cashback_used: number;
//     status: string;
//     payment_type: number;
//     delivery_type: number;
//     receiver: Receiver;
//     items: OrderItem[];
//     cash_payments: CashPayment[];
//     online_payments: OnlinePayment[];
//     created_at: string;
//     status_updated?: string;
// }

// interface OrderState {
//     loading: boolean;
//     orderId?: string;
//     orderNumber?: string;
//     orders: Order[] | null;
//     error?: string;
//     receiver?: Receiver;
// }

// const initialState: OrderState = {
//     loading: false,
//     orders: null,
// };

// export const orderSlice = createSlice({
//     name: 'order',
//     initialState,
//     reducers: {
//         createOrderRequest(state, action: PayloadAction<any>) {
//             state.loading = true;
//             state.error = undefined;
//         },
//         createOrderSuccess(state, action: PayloadAction<Order>) {
//             state.loading = false;
//             state.orderId = String(action.payload.id);
//             state.orderNumber = action.payload.order_number;
//             // prepend or upsert into orders list
//             if (!state.orders) state.orders = [action.payload];
//             else {
//                 const idx = state.orders.findIndex(o => o.id === action.payload.id);
//                 if (idx === -1) state.orders.unshift(action.payload);
//                 else state.orders[idx] = { ...state.orders[idx], ...action.payload };
//             }
//         },
//         createOrderFailure(state, action: PayloadAction<string>) {
//             state.loading = false;
//             state.error = action.payload;
//         },

//         getOrdersStart(state) {
//             state.loading = true;
//             state.error = undefined;
//         },
//         setOrders(state, action: PayloadAction<Order[]>) {
//             state.orders = action.payload;
//             state.loading = false;
//         },
//         upsertOrder(state, action: PayloadAction<Order>) {
//             if (!state.orders) state.orders = [action.payload];
//             else {
//                 const idx = state.orders.findIndex(o => o.id === action.payload.id);
//                 if (idx === -1) state.orders.unshift(action.payload);
//                 else state.orders[idx] = { ...state.orders[idx], ...action.payload };
//             }
//         },

//         orderFailure(state, action: PayloadAction<string>) {
//             state.loading = false;
//             state.error = action.payload;
//         },
//     },
// });

// export const {
//     createOrderRequest,
//     createOrderSuccess,
//     createOrderFailure,
//     getOrdersStart,
//     setOrders,
//     upsertOrder,
//     orderFailure,
// } = orderSlice.actions;

// export default orderSlice.reducer;