import { addItem, getCart, incrementCartItemApi, decrementCartItemApi, checkoutApi } from "../service/cart.api";
import { useDispatch } from "react-redux";
import { addItem as addItemToCart, setItems, incrementCartItem, decrementCartItem } from "../state/cart.slice";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem(productId, variantId) {
        try {
            await addItem({ productId, variantId });
            dispatch(addItemToCart({ productId, variantId }));
            await handleGetCart();
        } catch (error) {
            console.error("Error adding item to cart:", error);
        }
    }

    async function handleGetCart() {
        try {
            const response = await getCart();
            const cartData = response?.data?.cart ?? response?.cart;

            if (!cartData || !Array.isArray(cartData.items)) {
                throw new Error("Invalid cart response structure");
            }

            dispatch(setItems(cartData));
            return cartData;
        } catch (error) {
            console.error("Error fetching cart:", error);
            throw error;
        }
    }

    async function handleIncrementCartItem(productId, variantId) {
        try {
            dispatch(incrementCartItem({ productId, variantId }));
            await incrementCartItemApi({ productId, variantId });
            await handleGetCart();
        } catch (error) {
            console.error("Error incrementing cart item:", error);
            await handleGetCart().catch(() => { });
        }
    }

    async function handleDecrementCartItem(productId, variantId) {
        try {
            dispatch(decrementCartItem({ productId, variantId }));
            await decrementCartItemApi({ productId, variantId });
            await handleGetCart();
        } catch (error) {
            console.error("Error decrementing cart item:", error);
            await handleGetCart().catch(() => { });
        }
    }

    async function handleCheckout() {
        const data = await checkoutApi();
        return data.order
    }

    return { handleAddItem, handleGetCart, handleIncrementCartItem, handleDecrementCartItem, handleCheckout };
};
