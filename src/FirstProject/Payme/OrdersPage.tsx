import { useEffect } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Card,
    CardContent,
    Container,
    Typography,
    Divider,
    Chip,
    Link,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import { getOrdersStart, type Order } from './OrderSlice';
import { type RootState } from '../RootReducer/Rootreducer';

export default function MyOrdersPage() {
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((s: RootState) => s.order);

    useEffect(() => {
        dispatch(getOrdersStart());
    }, [dispatch]);

    if (loading) return <Typography align="center">Загрузка…</Typography>;
    if (error) return <Typography color="error" align="center">{error}</Typography>;
    if (!orders?.length) return <Typography align="center">У вас нет заказов.</Typography>;

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Typography variant="h4" gutterBottom>
                Мои заказы
            </Typography>

            {orders.map((order: Order) => (
                <Accordion key={order.order_number} sx={{
                    mb: 2,
                    color: 'var(--text-color)',
                    background: 'var(--main-background-color)'
                }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{
                        color: 'var(--text-color)',
                        background: 'var(--main-background-color)'
                    }}>
                        <Box sx={{
                            flexGrow: 1,
                            color: 'var(--text-color)',
                            background: 'var(--main-background-color)'
                        }}>
                            <Typography variant="h6">Заказ №{order.order_number}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {new Date(order.created_at).toLocaleString()}
                            </Typography>
                        </Box>
                        <Chip
                            label={order.status}
                            color={order.status === 'Ожидает подтверждения' ? 'warning' : 'success'}
                        />
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2,
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            }}
                        >
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Детали заказа
                                    </Typography>
                                    <Divider sx={{ mb: 1 }} />
                                    <Typography>Итоговая сумма: {order.total_amount} сум</Typography>
                                    <Typography>Использован кэшбэк: {order.cashback_used} сум</Typography>
                                    <Typography>Начислен кэшбэк: {order.cashback_earned} сум</Typography>
                                    <Typography>
                                        Способ оплаты: {order.payment_type === 1 ? 'Онлайн картой' : 'Наличными/картой'}
                                    </Typography>
                                    <Typography>
                                        Доставка: {order.delivery_type === 1 ? 'Самовывоз' : 'Курьер'}
                                    </Typography>
                                </CardContent>
                            </Card>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Получатель
                                    </Typography>
                                    <Divider sx={{ mb: 1 }} />
                                    <Typography>Имя: {order.receiver.first_name}</Typography>
                                    <Typography>Фамилия: {order.receiver.last_name}</Typography>
                                    <Typography>Телефон: {order.receiver.phone}</Typography>
                                    {order.receiver.address && (
                                        <Typography>Адрес: {order.receiver.address}</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>   
                        {/* Товары */}
                        <Box sx={{ mt: 2 }}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Товары
                                    </Typography>
                                    <Divider sx={{ mb: 1 }} />
                                    {order.items?.map((item, idx) => (
                                        <Box
                                            key={idx}
                                            sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}
                                        >
                                            <Typography>{item.product_name} ×{item.quantity}</Typography>
                                            <Typography>{item.total_price} сум</Typography>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Box>
                        {/* Платежи */}
                        <Box sx={{ mt: 2 }}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Платежи
                                    </Typography>
                                    <Divider sx={{ mb: 1 }} />
                                    {order.cash_payments?.length > 0 && (
                                        <>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                Оплата наличными:
                                            </Typography>
                                            {order.cash_payments?.map((pmt, i) => (
                                                <Typography key={i} variant="body2">
                                                    {new Date(pmt.created_at).toLocaleString()} — {pmt.amount} сум
                                                </Typography>
                                            ))}
                                        </>
                                    )}

                                    {order.online_payments.length > 0 && (
                                        <>
                                            <Typography variant="body2" sx={{ mt: 2 }}>
                                                Онлайн оплата:
                                            </Typography>
                                            {order.online_payments.map((pmt, i) => (
                                                <Box
                                                    key={i}
                                                    sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
                                                >
                                                    <Typography variant="body2">
                                                        {new Date(pmt.perform_time).toLocaleString()} — {pmt.amount} сум
                                                    </Typography>
                                                    <Link
                                                        href={pmt.qr_code_url}
                                                        target="_blank"
                                                        rel="noopener"
                                                        sx={{ ml: 2 }}
                                                    >
                                                        QR-код
                                                    </Link>
                                                </Box>
                                            ))}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Container>
    );
}