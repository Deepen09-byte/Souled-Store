import { addItem, getCart, incrementCartItemApi } from "../service/cart.api";
import { useDispatch } from "react-redux";
import { addItem as addItemToCart, setItems, incrementCartItem } from "../state/cart.slice";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem(productId, variantId) {
        try {
            await addItem({ productId, variantId });
            dispatch(addItemToCart({ productId, variantId }));
        } catch (error) {
            console.error("Error adding item to cart:", error);
        }
    }

    async function handleGetCart() {
        const data = await getCart();
        dispatch(setItems(data.cart.items));
    }

    async function handleIncrementCartItem(productId, variantId) {
        const data = await incrementCartItemApi({ productId, variantId });
        dispatch(incrementCartItem({ productId, variantId }));
    }

    return { handleAddItem, handleGetCart, handleIncrementCartItem }
}