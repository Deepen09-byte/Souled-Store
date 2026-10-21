import axios from "axios";

const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
})

export const addItem = async ({ productId, variantId }) => {
    const response = await cartApiInstance.post(`/${productId}/${variantId}`);
    return response.data;
}