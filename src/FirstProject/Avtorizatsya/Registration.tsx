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

export const RegistrationForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { registering, registerError, userId } = useAppSelector(s => s.auth);

    const [form, setForm] = useState<RegisterPayload>({
        first_name: "",
        last_name: "",
        phone: "",
        date_of_birth: "",
        gender: "male",
        password: "",
    });

    useEffect(() => {
        if (userId) {
            if (form.phone) localStorage.setItem('registered_phone', form.phone);
            navigate("/verify-otp");
        }
    }, [userId, navigate]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.phone || form.phone.length < 9) {
            // siz istasangiz local validation xabari ko'rsatishingiz mumkin
            alert('Iltimos, telefon raqamingizni toʻliq kiriting');
            return;
        }
        dispatch(registerStart(form))
        localStorage.setItem("registered_phone", form.phone);

        console.log("form show", form);
    };

    return (
        <div className="register">
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
                        onClick={() => navigate('/login')}
                        className="globus-receiv">
                        Vxod <BiUser className="user-ikons" />
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="globus-basket">
                        Регистрация
                        <GiArchiveRegister className="basket-ikons" />
                    </button>
                </div>
            </div>
            <hr style={{ width: "1400px", marginTop: "18px" }} />
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
                            value={form.first_name}
                            className="register-input"
                            required
                        />
                        <label>Familya</label>
                        <input type="text"
                            name="last_name"
                            onChange={handleChange}
                            placeholder="vashe familya"
                            value={form.last_name}
                            className="register-input"
                            required
                        />
                        <label>Parol</label>
                        <input type="password"
                            name="password"
                            onChange={handleChange}
                            placeholder="Vash parol"
                            value={form.password}
                            className="register-input"
                            required
                        />
                        <label>Telefon</label>
                        <input type="text"
                            name="phone"
                            onChange={handleChange}
                            placeholder="998901234567"
                            value={form.phone}
                            className="register-input"
                            required
                        />
                        <label>Data rojdeniye</label>
                        <input type="date"
                            name="date_of_birth"
                            onChange={handleChange}
                            placeholder="Viberite datu"
                            value={form.date_of_birth}
                            className="register-input"
                            required
                        />
                        <label>Pol</label>
                        <select name="gender"
                            onChange={handleChange}
                            className="register-input"
                            value={form.gender}
                            required>
                            <option value="male">Mujchina</option>
                            <option value="female">Jenshina</option>
                        </select>
                        <button type="submit" disabled={registering}
                            className="register-btn2">
                            {registering ? "Отправка..." : "Зарегистрироваться"}
                        </button>
                        {registerError && <p className="error" role="alert">{registerError}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
};

