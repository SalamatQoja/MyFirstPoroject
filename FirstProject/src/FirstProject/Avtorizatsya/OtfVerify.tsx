import { useAppDispatch, useAppSelector } from "../hooks";
import { verifyStart } from "./AuthSlice";
import { useNavigate } from "react-router";
import React, { useEffect, useState, useRef } from "react";


export default function OtpVerifySide() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { verifying, verifyError, accessToken } = useAppSelector(state => state.auth);
    const [otp, setOtp] = useState("");

    const phone = localStorage.getItem("registered_phone") ?? "";


    const otpInputRef = useRef<HTMLInputElement | null>(null);

    // autofocus
    useEffect(() => {
        otpInputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!phone) {
            navigate('/register');
        }
    }, [phone, navigate]);

    useEffect(() => {
        if (accessToken) {
            localStorage.removeItem("registered_phone");
            navigate("/");
        }
    }, [accessToken, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone) {
            dispatch(verifyStart({ phone, otp }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // faqat raqamlar (agar OTP raqamli bo'lsa)
        const val = e.target.value.replace(/\D/g, '');
        setOtp(val);
    };


    return (
        <div className="verify-main">
            <form onSubmit={handleSubmit}>
                <label>Vvedite kod iz SMS, otpravlenniy na {phone}</label>
                <input type="tel"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={6}
                    onChange={handleChange}
                    value={otp}
                    placeholder="1233456"
                    required />
                <button type="submit"
                    disabled={verifying}
                    className="verify-btn">
                    {verifying ? "provereno..." : "Proverit"}
                    {verifyError && <p className="error" role="alert">{verifyError}</p>}
                </button>
            </form>
        </div>
    );
}