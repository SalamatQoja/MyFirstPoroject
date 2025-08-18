import { useDispatch } from "react-redux";
import type { CartItem } from "./CartService";
import { updateItemStart, removeItemStart } from "./CartSlice";


export interface Props {
    item: CartItem
}

function CartImportant({ item }: Props) {
    const dispatch = useDispatch();

    const handleIncrease = () => {
        dispatch(updateItemStart({ id: item.id, product: item.product.id, quantity: item.quantity + 1 }));
    };

    const handleDecrease = () => {
        if (item.quantity > 1) {
            dispatch(updateItemStart({ id: item.id, product: item.product.id, quantity: item.quantity - 1 }));
        }
    };

    const handleRemove = () => {
        dispatch(removeItemStart(item.id));
    };

    return (
        <div>
            <img src={item.product.images[0].image}
                alt={item.product.name}
                className="cart-img" />
            <p>{item.product.name}</p>
            <div>
                {item.product.price} som x {item.quantity} * {item.quantity * item.product.price} so'm
            </div>
            <div>
                <button onClick={handleDecrease}
                >-</button>
                <span>{item.quantity}</span>
                <button onClick={handleIncrease}
                >+</button>
            </div>
            <button
                onClick={handleRemove}>
            </button>

        </div>
    );
}

export default CartImportant;
