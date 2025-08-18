import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { verifyCardRequest } from '../Payme/VerifySlice';
import { payReceiptRequest } from '../Payme/ReceiptSlice';
import "./Payme.css";

interface LocationState {
    token?: string;
    orderId?: string;
    invoiceId?: string;
    amount?: number;
}

const VerifyCardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const loc = location.state as LocationState | undefined;
    const cardTokenFromStore = useAppSelector(s => s.card.token);
    const invoiceIdFromStore = useAppSelector(state => state.receipt.invoiceId);
    const invoiceId = loc?.invoiceId ?? invoiceIdFromStore;
    const token = loc?.token ?? cardTokenFromStore;
    const cardVerifyLoading = useAppSelector(s => s.verify.cardVerifyLoading);
    const cardVerifySuccess = useAppSelector(s => s.verify.cardVerifySuccess);
    const cardVerifyError = useAppSelector(s => s.verify.cardVerifyError);
    const payLoading = useAppSelector(s => s.receipt.payLoading);
    const payError = useAppSelector(s => s.receipt.payError);
    const paySuccess = useAppSelector(s => s.receipt.paySuccess);

    const [code, setCode] = useState('');

    useEffect(() => {
        if (!token) navigate('/create_card');
    }, [token, navigate]);

    const autoPayDispatchedRef = React.useRef(false);

    useEffect(() => {
        if (!cardVerifySuccess) return;

        if (autoPayDispatchedRef.current) return;

        if (!token || !invoiceId) {
            console.warn('Auto-pay skipped: missing token or invoiceId', { token, invoiceId });
            return;
        }
        if (payLoading || paySuccess) {
            console.log('Auto-pay skipped: already in progress or succeeded');
            return;
        }

        autoPayDispatchedRef.current = true;
        console.log('[VerifyCardPage] auto pay triggered');
        dispatch(payReceiptRequest({ token, invoice_id: invoiceId }));
    }, [cardVerifySuccess, token, invoiceId, payLoading, paySuccess, dispatch]);

    useEffect(() => {
        if (paySuccess) navigate('/my_orders');
    }, [paySuccess, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{4,6}$/.test(code)) { alert('Введите корректный код'); return; }
        dispatch(verifyCardRequest({ token: token!, code }));
    };


    return (
        <div className='verify-main'>
            <h2 className='verify-title'>Введите SMS-код</h2>
            <form onSubmit={handleSubmit} className='verify-inner'>
                <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    disabled={cardVerifyLoading}
                    className='verify-input'
                />
                <button type="submit"
                    disabled={cardVerifyLoading}
                    className='verify-btn'>
                    {cardVerifyLoading ? 'Проверка...' : 'Подтвердить'}
                </button>
            </form>

            {cardVerifyError && <p style={{ color: 'red' }}>{cardVerifyError}</p>}
            {payError && <p style={{ color: 'red' }}>{payError}</p>}
        </div>
    );
};

export default VerifyCardPage;