// import { useAppDispatch, useAppSelector } from "../hooks";
import { clearCartStart, fetchCartStart, removeItemStart, updateItemStart } from "../Cart/CartSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../RootReducer/Rootreducer";
import { useNavigate } from "react-router";
import "../Cart/CartCss.css";
import { BiUser } from "react-icons/bi";
import { GiArchiveRegister } from "react-icons/gi";
import { ImExit } from "react-icons/im";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoSearchSharp } from "react-icons/io5";
import { SlBasketLoaded } from "react-icons/sl";
import LogotipGlobus from "../img/logotipGlobus.png";
import CircularProgress from "@mui/material/CircularProgress";

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchProduct, setSearchProduct] = useState("");
    const { items, loading, error } = useSelector((st: RootState) => st.cart);

    useEffect(() => {
        dispatch(fetchCartStart());
    }, [dispatch]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchProduct(event.target.value);
    };

    const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    if (loading && items.length === 0) {
        return (
            <div>
                <CircularProgress />
            </div>
        );
    }

    if (!items.length) return <p className="cart-notice">Заказов нет</p>;

    if (loading) return <p>Загрузка…</p>;
    if (error) return <p>Ошибка: {error}</p>;

    return (
        <div className="basket-main">
            <nav className="header2">
                <img src={LogotipGlobus} alt="" className="logotip" />
                <input type="text"
                    className="globus-input2"
                    onChange={handleChange} />
                <IoSearchSharp className="ikons-search2" />
                <div className="btn-row3" >
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
            <h1 className="basket-title">Корзина</h1>
            <div className="basket-header">
                <div className="basket-inner">
                    {items.map(i => (
                        <div key={i.id} className="basket-item">
                            <img src={i.product.images[0]?.image} alt={i.product.name}
                                className="basket-image" />
                            <div className="basket-full-row">
                                <p className="basket-name">{i.product.name}</p>
                                <button onClick={() =>
                                    dispatch(removeItemStart(i.id))
                                } className="basket-remove"> <RiDeleteBin6Line className="basket-ikon" />Удалить</button>
                            </div>
                            <div className="basket-chislit">
                                <button onClick={() =>
                                    dispatch(updateItemStart({
                                        id: i.id, quantity: i.quantity - 1,
                                        product: 0
                                    }))
                                } disabled={i.quantity <= 1}
                                    className="basket-increase">−</button>
                                <span className="basket-quantity">{i.quantity}</span>
                                <button onClick={() =>
                                    dispatch(updateItemStart({
                                        id: i.id, quantity: i.quantity + 1,
                                        product: 0
                                    }))
                                } className="basket-decrease">+</button>

                                <p className="basket-cost">{(i.product.price * i.quantity).toLocaleString()} UZS</p>
                            </div>
                            <hr style={{width: "900px", marginLeft: "1px"}}/>
                        </div>
                    ))}
                    <button onClick={() => dispatch(clearCartStart())}
                        className="basket-clean">
                        Очистить корзину
                    </button>
                </div>
                <div className="basket-total-price">
                    <h2 className="basket-total">Итого: {total.toLocaleString()} UZS</h2>
                    <button type="button"
                        className="basket-oformlenye"
                        onClick={() => navigate("/order")}>
                        Перейти оформление</button>
                </div>
            </div >
        </div>
    );
};

export default CartPage;