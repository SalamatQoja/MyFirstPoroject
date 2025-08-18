import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { createCardRequest } from '../Payme/CardSlice';
import { getVerifyCodeRequest } from '../Payme/VerifySlice';
import "./Payme.css";

const CardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, token, error } = useAppSelector(s => s.card);
  const { invoiceId, orderId, amount } = useAppSelector(s => s.receipt);
  const verifySent = useAppSelector(s => s.verify.sent);
  const verifyLoading = useAppSelector(s => s.verify.loading);
  const [cardNumber, setCardNumber] = useState('');
  const [expireDate, setExpireDate] = useState('');

  useEffect(() => {
    console.log('[CardPage] effect#sendVerify - token, orderId, invoiceId, verifySent, verifyLoading =',
      token, orderId, invoiceId, verifySent, verifyLoading);

    if (token && orderId && invoiceId && !verifySent && !verifyLoading) {
      console.log('[CardPage] dispatching getVerifyCodeRequest with token');
      dispatch(getVerifyCodeRequest({ token }));
    }
  }, [token, orderId, invoiceId, verifySent, verifyLoading, dispatch]);

  useEffect(() => {
    console.log('[CardPage] effect#navigate - verifySent, token, orderId, invoiceId, amount =',
      verifySent, token, orderId, invoiceId, amount);

    if (verifySent && token && orderId && invoiceId && amount !== undefined) {
      navigate('/verify_card', {
        state: { amount, orderId, invoiceId, token }
      });
    }
  }, [verifySent, token, orderId, invoiceId, amount, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{16}$/.test(cardNumber) || !/^\d{2}\/\d{2}$/.test(expireDate)) {
      alert('Введите корректный номер карты (16 цифр) и срок в формате MM/YY');
      return;
    }

    const expire = expireDate.replace('/', '');
    if (!orderId || !invoiceId) {
      alert('Ошибка: нет orderId или invoiceId. Попробуйте заново оформить заказ.');
      return;
    }

    dispatch(createCardRequest({
      card_number: cardNumber,
      expire,
      order_id: orderId,
      invoice_id: invoiceId,
    }));
  };

  return (
    <div className="card">
      <div className='cardPage'>
        <div className="card-inner">
          <h2 className='cardPage-title'>Привязать карту</h2>
          <form onSubmit={handleSubmit} className='card-item'>
            <div >
              <label className='cardPage-number-title'>Номер карты:</label><br />
              <input
                type="text"
                maxLength={16}
                placeholder="8600000000000000"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                className='cardPage-input'
              />
            </div>

            <div>
              <label className='cardPage-expire'>Срок действия (MM/YY):</label><br />
              <input
                type="text"
                maxLength={5}
                placeholder="MM/YY"
                value={expireDate}
                onChange={e => setExpireDate(e.target.value)}
                disabled={loading}
                className='cardPage-input'
              />
            </div>

            <button type="submit"
              disabled={loading}
              className='cardPage-btn' >
              {loading ? 'Привязка...' : 'Привязать карту'}
            </button>
          </form>

          {/* {token && <p style={{ marginTop: 16, color: 'green' }}>✅ Token: {token}</p>} */}
          {error && <p style={{ marginTop: 16, color: 'red' }}>❌ Ошибка: {error}</p>}
        </div>
      </div>
    </div>
  );
};

export default CardPage;