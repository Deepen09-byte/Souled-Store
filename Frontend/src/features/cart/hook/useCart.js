import { addItem, getCart } from "../service/cart.api";
import { useDispatch } from "react-redux";
import { addItem as addItemToCart, setItems, removeItem } from "../state/cart.slice";

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

    async function handleIncrementCartItem(productId, variantId) {
        try {
            await addItem({ productId, variantId });
            await handleGetCart();
        } catch (error) {
            console.error("Error incrementing cart item:", error);
        }
    }

    async function handleGetCart() {
        try {
            const data = await getCart();
            if (data?.cart?.items) {
                dispatch(setItems(data.cart.items));
            }
            return data?.cart;
        } catch (error) {
            console.error("Error fetching cart:", error);
            return null;
        }
    }

    return { handleAddItem, handleIncrementCartItem, handleGetCart }
}