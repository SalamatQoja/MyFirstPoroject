import type {
  CreateOrderPayload, CreateReceiptPayload, CreateReceiptResponse,
  GetVerifyCodeResponse, VerifyCardResponse,
  CreateCardPayload,
  CreateCardResponse,
  GetVerifyCodePayload,
  VerifyCardPayload,ReceiptPayPayload, ReceiptPayResponse
} from '../OrderType';

export const buildCreateOrderMessage = (payload: CreateOrderPayload) => ({
  type: 'create_order',
  message: payload,
});


import axios from 'axios';

export const createReceiptApi = async (
  payload: CreateReceiptPayload
): Promise<CreateReceiptResponse> => {
  const response = await axios.post<CreateReceiptResponse>(
    'https://globus-nukus.uz/api/receipts/receipts_create',
    payload
  );
  return response.data;
};

export const createCardApi = async (
  payload: CreateCardPayload
): Promise<CreateCardResponse> => {
  const { data } = await axios.post<CreateCardResponse>(
    'https://globus-nukus.uz/api/cards/create_card',
    payload
  );
  return data;
};

export const getVerifyCodeApi = async (
  payload: GetVerifyCodePayload
): Promise<GetVerifyCodeResponse> => {
  try {
    const { data } = await axios.post<GetVerifyCodeResponse>(
      'https://globus-nukus.uz/api/cards/get_verify_code',
      payload
    );
    return data;
  } catch (err: any) {
    // если сервер вернул JSON с success=false в err.response.data
    if (err.response?.data) return err.response.data as GetVerifyCodeResponse;
    throw err;
  }
};

export const verifyCardApi = async (payload: VerifyCardPayload): Promise<VerifyCardResponse> => {
  try {
    const { data } = await axios.post<VerifyCardResponse>(
      'https://globus-nukus.uz/api/cards/verify_card',
      payload
    );
    return data;
  } catch (err: any) {
    if (err.response?.data) return err.response.data as VerifyCardResponse;
    throw err;
  }
};

export const payReceiptApi = async (payload: ReceiptPayPayload): Promise<ReceiptPayResponse> => {
  try {
    const { data } = await axios.post<ReceiptPayResponse>(
      'https://globus-nukus.uz/api/receipts/receipts_pay',
      payload
    );
    return data;
  } catch (err: any) {
    if (err.response?.data) return err.response.data as ReceiptPayResponse;
    throw err;
  }
};