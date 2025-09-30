export interface Receiver {
    first_name: string;
    last_name: string;
    phone: string;
    longitude?: number | null;
    latitude?: number | null;
}

export interface Item {
    product: number;
    price: number;
    quantity: number;
}

export interface CreateOrderPayload {
    amount: number;
    payment_type: 1 | 2;
    delivery_type: 1 | 2;
    use_cashback: boolean;
    receiver: Receiver;
    items: Item[];
}

export interface OrderCreatedPayload {
    type: 'order_created';
    data: {
        [x: string]: string;
        id: string;
        order_number: string;
    };
}

export type SocketMessage = OrderCreatedPayload;

export interface CreateReceiptPayload {
    amount: number;
    order_id: string;
}

export interface CreateReceiptResponse {
    success: boolean;
    data: {
        receipt: {
            _id: string;
        }
    };
}

export interface CreateCardPayload {
    card_number: string;
    expire: string; // "MM/YY"
    order_id: string;
    invoice_id: string;
}

export interface CreateCardSuccessResponse {
    success: true;
    data: {
        card: {
            token: string;
        }
    };
}

export interface CreateCardErrorResponse {
    success: false;
    errorCode: string;
    errorMessage: string;
}

export type CreateCardResponse =
    | CreateCardSuccessResponse
    | CreateCardErrorResponse;


export interface GetVerifyCodePayload {
    token: string;
}

export interface GetVerifyCodeData {
    sent: boolean;
    phone: string;
    wait: number;
}

export interface GetVerifyCodeSuccessResponse {
    success: true;
    errMessage: null | string;
    errorCode: null | number | string;
    data: GetVerifyCodeData;
}

export interface GetVerifyCodeErrorResponse {
    success: false;
    errMessage?: string;
    errorCode?: number | string;
    data?: any;
}

export type GetVerifyCodeResponse =
    | GetVerifyCodeSuccessResponse
    | GetVerifyCodeErrorResponse;

export interface VerifyCardPayload {
    token: string;
    code: string;
}

export interface VerifyCardSuccessResponse {
    success: true;
    errMessage: null | string;
    errorCode: null | number | string;
    data?: any;
}

export interface VerifyCardErrorResponse {
    success: false;
    errMessage?: string;
    errorCode?: number | string;
    data?: any;
}

export type VerifyCardResponse = VerifyCardSuccessResponse | VerifyCardErrorResponse;

export interface ReceiptPayPayload {
    token: string;
    invoice_id: string
}

export interface ReceiptInfo {
    [x: string]: any;
    invoice_id: any;
    _id: string | number;
    create_time?: number;
    pay_time?: number;
    cancel_time?: number;
    state?: number;
    type?: number;
    external?: boolean;
    operation?: number;
    category?: {
        _id?: string;
        title?: string;
    };
}

export interface ReceiptPaySuccessResponse {
    success: true;
    errMessage: null | string;
    errMode?: null | string;
    data: {
        receipt: ReceiptInfo;
    };
}

export interface ReceiptPayErrorResponse {
    success: false;
    errMessage?: string;
    errorCode?: number | string;
    data?: any;
}

export type ReceiptPayResponse =
    | ReceiptPaySuccessResponse
    | ReceiptPayErrorResponse;