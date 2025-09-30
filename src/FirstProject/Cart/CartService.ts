import CartItem from './CartItem';
import axios from '../Avtorizatsya/Api';
import {type Product } from '../types';

export interface CartItem {
    id: number;
    cart_items: number;
    product: Product;
    quantity: number;
}

export const fetchCart = async () => {
    const res = await axios.get<{ data: { cart: CartItem[] } }>('/cart');
    console.log(res.data.data.cart);
    const cart: CartItem[] = res.data.data.cart
    console.log(cart);

    return res.data.data.cart;
};

export const addCartItem = async (
    productId: number,
    quantity: number
): Promise<CartItem> => {
    const res = await axios.post<{ data: { cart: CartItem } }>('/cart', {
        product: productId,
        quantity,
    });
    console.log(res.data.data.cart);

    return res.data.data.cart;
};

export const updateCartItem = async (
    id: number,
    product: number,
    quantity: number
) => {
    console.log(id, product, quantity);
    const res = await axios.put(`/cart/${id}`, { product, quantity });
    console.log(res.data.data.cart);
    const item = res.data.data.cart;

    return item;
};

export const removeCartItem = async (id: number): Promise<void> => {
    await axios.delete(`/cart/${id}`);
};

export const clearCart = async (): Promise<void> => {
    await axios.delete('/cart/delete-all');
};
