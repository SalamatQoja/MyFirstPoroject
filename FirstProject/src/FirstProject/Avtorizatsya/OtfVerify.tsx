import { useDispatch } from "react-redux"
import { useNavigate } from "react-router";
import { useAppSelector } from "../hooks";
import { verifyStart } from "./AuthSlice";
import React, { useEffect, useState } from "react";

export default function OtpVerifySide() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { verifying, verifyError, accessToken } = useAppSelector(state => state.auth);
    const [otp, setOtp] = useState("");

    const phone = localStorage.getItem("registered_phone") || "";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone) {
            dispatch(verifyStart({ phone, otp }));
        }
    };

    useEffect(() => {
        if (accessToken) {
            localStorage.removeItem("registered_phone");
            navigate("/");
        }
    }, [accessToken, navigate]);

    return (
        <div className="verify-main">
            <form onSubmit={handleSubmit}>
                <label>Vvedite kod iz SMS, otpravlenniy na {phone}</label>
                <input type="text"
                    onChange={(e) => setOtp(e.target.value)}
                    value={otp}
                    placeholder="1233456"
                    required />
                <button type="submit"
                    disabled={verifying}
                    className="verify-btn">
                    {verifying ? "provereno..." : "Proverit"}
                    {verifyError && <p className="error">{verifyError}</p>}
                </button>
            </form>
        </div>
    );
}