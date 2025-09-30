import axios from 'axios';
import {type ProductApiresponse } from '../types';

const API = axios.create({
  baseURL: 'https://globus-nukus.uz/api' 
});

export const fetchProducts = async (urlOrParams?: { url?: string; limit?: number; offset?: number }) : Promise<ProductApiresponse> => {
  if (urlOrParams?.url) {
    const res = await API.get<ProductApiresponse>(urlOrParams.url);
    return res.data;
  } else {
    const params: any = {};
    if (urlOrParams?.limit) params.limit = urlOrParams.limit;
    if (urlOrParams?.offset) params.offset = urlOrParams.offset;
    const res = await API.get<ProductApiresponse>('/products', { params });
    return res.data;
  }
};