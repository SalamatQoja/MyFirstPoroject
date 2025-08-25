import React, { useEffect, useState } from "react";
import { loginStart } from "../Avtorizatsya/AuthSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import "../Products.css";
// import type { LoginPayload } from "./AuthSlice";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

import { BiUser } from "react-icons/bi";
import { GiArchiveRegister } from "react-icons/gi";
// import { useNavigate } from "react-router";
import LogotipGlobus from "../img/logotipGlobus.png";
import { IoSearchSharp } from "react-icons/io5";
// import { AuthoritaionLogin } from "../Avtorizatsya/Login";
import {type  RegisterPayload } from "./AuthActions";
import { RegistrationForm } from "./Registration";



export const AuthoritaionLogin: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { logging, loginError, accessToken } = useAppSelector(s => s.auth);
    const [phone, setPhone] = useState("");
    const [authShow, setAuthshow] = useState(false);
    const [loginShow, setLoginShow] = useState(false);
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(loginStart({ phone, password }));
    };
    console.log(accessToken);


    const [form, setForm] = useState<RegisterPayload>({
        first_name: "",
        last_name: "",
        phone: "",
        date_of_birth: "",
        gender: "male",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (accessToken) {
            navigate("/login");
        }
    }, [accessToken, navigate]);

    const handleLoginClick = () => {
        setLoginShow(true);
    };

    const handleAuthClick = () => {
        setAuthshow(true);
    };

    return (
        <div className="login-main">
            <div className="main-top"></div>
            <div className="header2">
                <img src={LogotipGlobus} alt="picture" 
                className="logotip"
                onClick={() => navigate('/')} />
                <input type="text"
                    className="globus-input"
                    onChange={handleChange} />
                <div className="ikons-1">
                    <IoSearchSharp className="ikons-search" />
                </div>
                <div className="btn-row5">
                    <button
                        onClick={handleLoginClick}
                        className="globus-receiv">
                        Vxod <BiUser className="user-ikons" />
                    </button>
                    <button
                        onClick={handleAuthClick}
                        className="globus-basket">
                        Регистрация
                        <GiArchiveRegister className="basket-ikons" />
                    </button>
                </div>
            </div>
            <hr style={{ width: "1400px", marginTop: "18px" }} />
            {authShow && (
                <div>
                    <RegistrationForm />
                </div>
            )}
            {loginShow && (
                <div>
                    <AuthoritaionLogin />
                </div>
            )}
            <form
                className="form-login"
                onSubmit={handleSubmit}>
                <h2 className="login-title">С возвращением</h2>
                <div className="login-inner">
                    <label>Telefon</label>
                    <input type="text"
                        name="phone"
                        onChange={(e) => setPhone(e.target.value)}
                        value={phone}
                        placeholder="998901234567"
                        className="login-phone-input"
                    />
                    <label>Parol</label>
                    <input type="password"
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        className="login-password-input"
                    />
                    <button type="submit" disabled={logging}
                        className="login-btn2"
                        onClick={() => navigate("/productregistration")}>
                        {logging ? "vixodim" : "Voyti"}
                    </button>
                    <div className="login-inform">
                        {loginError && <p className="error">Oshibka</p>}
                        <label>Net akkaunta?</label>
                        <Link to="/register"
                        >Zaregistrirovatsya</Link>
                    </div>
                    <label>Xotite vernutsya na glavniy stronitse</label>
                    <Link to="/product"
                    >Pereytii na glavniy</Link>
                </div>
            </form>
        </div>
    );
}