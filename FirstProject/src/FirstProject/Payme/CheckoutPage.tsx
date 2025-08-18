import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import type { Receiver } from '../Payme/OrderType';
import { createOrderRequest } from '../Payme/OrderSlice';
import { createReceiptRequest } from './ReceiptSlice';
import { IoSearchSharp } from "react-icons/io5";
import { BiUser } from "react-icons/bi";
import { GiArchiveRegister } from "react-icons/gi";
import { SlBasketLoaded } from "react-icons/sl";
import { ImExit } from "react-icons/im";
import LogotipGlobus from "../img/logotipGlobus.png";
// import {type Category } from '../types';
import "./Payme.css";
import { fetchProductsRequest, fetchCategoriesRequest } from '../Action';

export const OrderPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    // const { products, categories, loading } = useAppSelector(state => state.app);
    const cartItems = useAppSelector(state => state.cart.items);
    const totalAmount = cartItems.reduce((sum: number, i: { product: { price: number; }; quantity: number; }) => sum + i.product.price * i.quantity, 0);
    const [paymentType, setPaymentType] = useState<1 | 2>(1);
    const [useCashback, setUseCashback] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { categories } = useAppSelector(s => s.app)
    const orderState = useAppSelector(state => state.order);
    const receiptState = useAppSelector(state => state.receipt);
    const [searchProduct, setSearchProduct] = useState("");
    // const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);
    const [receiver, setReceiver] = useState<Receiver>({
        first_name: '',
        last_name: '',
        phone: '',
        longitude: null,
        latitude: null,
    });

    useEffect(() => {
        if (orderState.orderId) {
            dispatch(createReceiptRequest({
                amount: totalAmount,
                order_id: orderState.orderId,
                phone: receiver.phone
            }));
            navigate('/create_card')
        }
    }, [orderState.orderId, totalAmount, dispatch]);

    useEffect(() => {
        // console.log("receiptState.invoiceId", receiptState.invoiceId);
        console.log("totalAmount", orderState.orderId);
        if (receiptState.invoiceId) {
            navigate('/create_card', {
                state: {
                    amount: totalAmount,
                    orderId: orderState.orderId,
                    invoiceId: receiptState.invoiceId
                }
            });
        }
    }, [receiptState.invoiceId, navigate, totalAmount, orderState.orderId]);


    useEffect(() => {
        dispatch(fetchProductsRequest());
        dispatch(fetchCategoriesRequest());
    }, [dispatch]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchProduct(event.target.value);
    };

    const handleSubmit = () => {

        if (!receiver.first_name || !receiver.last_name || !receiver.phone) {
            setError('Заполните все поля получателя');
            return;
        }
        setError(null);
        dispatch(createOrderRequest({
            amount: totalAmount,
            payment_type: paymentType,
            delivery_type: 1,
            use_cashback: useCashback,
            receiver,
            items: cartItems.map((i: { product: { id: any; price: any; }; quantity: any; }) => ({
                product: i.product.id,
                price: i.product.price,
                quantity: i.quantity
            })),
        }));
    };

    function handleCategoryShow(id: number): void {
        throw new Error('Function not implemented.');
    }

    return (
        <div className="checkout-header-general">
            <nav className="header">
                <img src={LogotipGlobus} alt="" className="logotip" />
                <input type="text"
                    className="globus-input"
                    onChange={handleChange} />
                <IoSearchSharp className="ikons-search" />
                <div className="btn-row2" >
                    <button className="pr-register-exit"
                        onClick={() => navigate("/")}>
                        Выйты
                        < ImExit className="pr-register-exit-btn" />
                    </button>
                    <button type="submit" className="pr-register-myorders"
                        onClick={() => navigate('/my_orders')}>
                        Мой заказ
                    </button>
                    <button type="submit" className="pr-register-basket-btn1"
                        onClick={() => navigate("/cart")}>
                        Korzina
                        <SlBasketLoaded className="pr-registerbasket2" />
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="globus-receiv">
                        Vxod <BiUser className="user-ikons" />
                    </button>
                    <button
                        onClick={() => navigate("/register")}
                        className="globus-basket">
                        Регистрация
                        <GiArchiveRegister className="basket-ikons" />
                    </button>
                </div>
            </nav>
            <hr style={{width: "1340px", marginLeft: "70px", marginTop: "15px"}}/>
            <div className="checkout-wrapper">
                <div className="categories-main2">
                    <h2 className="category-title3">Все категоры</h2>
                    <div className="category-row2">
                        {categories.map(cat => (
                            <div key={cat.id}
                                className="categories-inner2"
                                onClick={() => handleCategoryShow(cat.id)}>
                                <p className="category-p2">{cat.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="checkout-header">
                    <div className="checkout-inner">
                        <h1 className='checkout-title'>Оформление заказа</h1>
                        <div className='checkout-main'>
                            <input
                                placeholder="Имя"
                                value={receiver.first_name}
                                name='first_name'
                                className='checkout-input'
                                onChange=
                                {e => setReceiver(r => ({ ...r, first_name: e.target.value }))}
                            />
                            <input
                                placeholder="Фамилия"
                                value={receiver.last_name}
                                name='last_name'
                                className='checkout-input'
                                onChange={e => setReceiver(r => ({ ...r, last_name: e.target.value }))}
                            />
                            <input
                                placeholder="Телефон"
                                value={receiver.phone}
                                name='phone'
                                className='checkout-input'
                                onChange={e => setReceiver(r => ({ ...r, phone: e.target.value }))}
                            />
                        </div>
                        <div className="checkout-payme-type">
                            <div>
                                <label className='checkout-title'>Использовать кэшбэк: <input type="checkbox" checked={useCashback} onChange={e => setUseCashback(e.target.checked)} /></label>
                            </div>
                            <div className='checkout-payme-type2'>
                                <label className='checkout-title'>Способ оплаты:</label>

                                <label style={{ display: 'block' }} className='checkout-chex'>
                                    <input
                                        type="radio"
                                        name="paymentType"
                                        value={1}
                                        checked={paymentType === 1}
                                        onChange={() => setPaymentType(1)}
                                    />
                                    Онлайн (карта)
                                </label>

                                <label style={{ display: 'block' }} className='checkout-chex'>
                                    <input
                                        type="radio"
                                        name="paymentType"
                                        value={2}
                                        checked={paymentType === 2}
                                        onChange={() => setPaymentType(2)}
                                    />
                                    Наличные
                                </label>
                            </div>
                        </div>
                        <h3 style={{ marginLeft: '20px' }}>Итого: {totalAmount} UZS</h3>
                        <div style={{ marginTop: 16 }}>
                            <button onClick={handleSubmit}
                                disabled={orderState.loading}
                                className='checkout-btn'>
                                {orderState.loading ? 'Отправка...' : `Оплатить ${totalAmount} UZS`}
                            </button>
                        </div>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        {orderState.error && <p style={{ color: 'red' }}>{orderState.error}</p>}
                    </div>
                    <div className="checkout-order-row">
                        <div className='checkout-order-inner'>
                            <h1 className='checkout-order-title'>Ваша заказ</h1>
                            {/* <hr style={{width: '430px'}}/> */}
                            {cartItems.map((i: any) =>
                                <div key={i.product.id}
                                    className='checkout-order-item'>
                                    <img src={i.product.images[0]?.image}
                                        alt={i.product.name}
                                        className='checkout-img4' />
                                    <hr style={{width: "440px", marginLeft: "2px"}} />
                                    <p className='checkout-order-p'>{i.product.name}</p>
                                    <p className='checkout-order-price'>{i.product.price} Сум</p>
                                </div>

                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
