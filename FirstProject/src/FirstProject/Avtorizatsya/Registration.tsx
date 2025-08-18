import type { RegisterPayload } from "./AuthActions";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { registerStart } from "./AuthSlice";
import "../Products.css";
import { BiUser } from "react-icons/bi";
import { GiArchiveRegister } from "react-icons/gi";
import { useNavigate } from "react-router";
import LogotipGlobus from "../img/logotipGlobus.png";
import { IoSearchSharp } from "react-icons/io5";
import { AuthoritaionLogin } from "../Avtorizatsya/Login";

export const RegistrationForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [authShow, setAuthshow] = useState(false);
    const [loginShow, setLoginShow] = useState(false);
    const { registering, registerError, userId } = useAppSelector(s => s.auth);

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
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(registerStart(form))
        localStorage.setItem("registered_phone", form.phone);

        console.log("form show", form);
    };

    useEffect(() => {
        if (userId) {
            navigate("/verify-otp");
        }
    }, [userId, navigate]);

    const handleLoginClick = () => {
        setLoginShow(true);
    };

    const handleAuthClick = () => {
        setAuthshow(true);
    };

    return (
        <div className="register">
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
            <div className="registr-main">
                <h1 className="register-title">Регистрация</h1>
                <form onSubmit={handleSubmit}
                    className="form-row">
                    <div className="register-inner">
                        <label>Imya</label>
                        <input type="text"
                            name="first_name"
                            onChange={handleChange}
                            placeholder="Vashe imya"
                            className="register-input"
                            required
                        />
                        <label>Familya</label>
                        <input type="text"
                            name="last_name"
                            onChange={handleChange}
                            placeholder="vashe familya"
                            className="register-input"
                            required
                        />
                        <label>Parol</label>
                        <input type="password"
                            name="password"
                            onChange={handleChange}
                            placeholder="Vash parol"
                            className="register-input"
                            required
                        />
                        <label>Telefon</label>
                        <input type="text"
                            name="phone"
                            onChange={handleChange}
                            placeholder="998901234567"
                            className="register-input"
                            required
                        />
                        <label>Data rojdeniye</label>
                        <input type="date"
                            name="date_of_birth"
                            onChange={handleChange}
                            placeholder="Viberite datu"
                            className="register-input"
                            required
                        />
                        <label>Pol</label>
                        <select name="gender"
                            onChange={handleChange}
                            className="register-input"
                            required>
                            <option value="male">Mujchina</option>
                            <option value="female">Jenshina</option>
                        </select>
                        <button type="submit" disabled={registering}
                            className="register-btn2">
                            {registering ? "Отправка..." : "Зарегистрироваться"}
                        </button>
                        {registerError && <p className="error">{registerError}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
};

