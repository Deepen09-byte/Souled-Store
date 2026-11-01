import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        totalPrice: null,
        currency: null,
        items: [],
    },
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload?.items ?? [];
            state.totalPrice = action.payload?.totalPrice ?? 0;
            state.currency = action.payload?.currency ?? "INR";
        },
        addItem: (state, action) => {
            state.items.push(action.payload)
        },
        removeItem: (state, action) => {
            state.items = state.items.filter((item) => item.id !== action.payload)
        },
        incrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload;
            const items = state.items.find(item => item.productId === productId && item.variantId === variantId);

            state.items = state.items.map(item => {
                if (item.id === productId && item.variantId === variantId) {
                    return { ...item, quantity: item.quantity + 1 }
                } else {
                    return item;
                }
            })
        },
        decrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload;
            const items = state.items.find(item => item.productId === productId && item.variantId === variantId);

            state.items = state.items.map(item => {
                if (item.id === productId && item.variantId === variantId) {
                    return { ...item, quantity: item.quantity - 1 }
                } else {
                    return item;
                }
            })
        }
    }
})

export const { setItems, addItem, removeItem, incrementCartItem, decrementCartItem } = cartSlice.actions;
export default cartSlice.reducer;

