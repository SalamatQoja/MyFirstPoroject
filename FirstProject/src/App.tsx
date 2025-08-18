import './App.css';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ProductList } from './FirstProject/products/Products';
import { AuthoritaionLogin } from './FirstProject/Avtorizatsya/Login';
import { RegistrationForm } from './FirstProject/Avtorizatsya/Registration';
import { ProductListRegistration } from './FirstProject/products/ProductsRegistration';
import CartPage from './FirstProject/Cart/CartPage';
import { OrderPage } from './FirstProject/Payme/CheckoutPage';
import CardPage from './FirstProject/Payme/CardPage';
import VerifyCardPage from './FirstProject/Payme/verifyCardPage';
// import OrdersPage from './FirstProject/Payme/OrdersPage';
import MyOrdersPage from './FirstProject/Payme/OrdersPage';

function App() {
  const navigate = useNavigate();
  return (
    <>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/login" element={<AuthoritaionLogin />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/productregistration" element={<ProductListRegistration />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/create_card" element={<CardPage />} />
        <Route path="/verify_card" element={< VerifyCardPage />} />
        <Route path="/my_orders" element={< MyOrdersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App;
