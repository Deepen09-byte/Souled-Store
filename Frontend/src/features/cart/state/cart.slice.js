import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        totalPrice: 0,
        currency: "INR",
        items: [],
    },
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload?.items ?? [];
            state.totalPrice = action.payload?.totalPrice ?? 0;
            state.currency = action.payload?.currency ?? "INR";
        },
        addItem: (state, action) => {
            state.items.push(action.payload);
        },
        removeItem: (state, action) => {
            const targetId = String(action.payload);
            state.items = state.items.filter((item) => {
                const id = item._id || item.id || item.product?._id || item.product;
                return String(id) !== targetId;
            });
        },
        incrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload;
            const item = state.items.find((i) => {
                const pId = i.product?._id || i.product || i.productId;
                const vId = i.variant?._id || i.variant || i.variantId;
                return (
                    String(pId) === String(productId) &&
                    (!variantId || String(vId) === String(variantId))
                );
            });

            if (item) {
                item.quantity = (item.quantity || 0) + 1;
                const unitPrice = item.price?.amount ?? item.variant?.price?.amount ?? item.product?.price?.amount ?? 0;
                if (typeof state.totalPrice === "number") {
                    state.totalPrice += unitPrice;
                }
            }
        },
        decrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload;
            const item = state.items.find((i) => {
                const pId = i.product?._id || i.product || i.productId;
                const vId = i.variant?._id || i.variant || i.variantId;
                return (
                    String(pId) === String(productId) &&
                    (!variantId || String(vId) === String(variantId))
                );
            });

            if (item && item.quantity > 1) {
                item.quantity -= 1;
                const unitPrice = item.price?.amount ?? item.variant?.price?.amount ?? item.product?.price?.amount ?? 0;
                if (typeof state.totalPrice === "number") {
                    state.totalPrice = Math.max(0, state.totalPrice - unitPrice);
                }
            }
        },
    },
});

export const { setItems, addItem, removeItem, incrementCartItem, decrementCartItem } = cartSlice.actions;
export default cartSlice.reducer;
