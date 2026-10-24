import { addItem, getCart, incrementCartItemApi, decrementCartItemApi } from "../service/cart.api";
import { useDispatch } from "react-redux";
import { addItem as addItemToCart, setItems, incrementCartItem, decrementCartItem } from "../state/cart.slice";

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

    async function handleDecrementCartItem(productId, variantId) {
        const data = await decrementCartItemApi({ productId, variantId });
        dispatch(decrementCartItem({ productId, variantId }));
    }

    return { handleAddItem, handleGetCart, handleIncrementCartItem, handleDecrementCartItem }
}