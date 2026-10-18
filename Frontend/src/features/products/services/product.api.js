import axios from "axios";

const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true,
})

export async function createProduct(formdata) {

    const response = await productApiInstance.post("/", formdata);

    return response.data;
}

export async function getSellerProducts() {

    const response = await productApiInstance.get("/seller");

    return response.data;
}

export async function getAllProducts() {

    const response = await productApiInstance.get("/");

    return response.data;
}

export async function getProductById(id) {

    const response = await productApiInstance.get(`/details/${id}`);

    return response.data;
}

export async function addProductVariant(productId, variantData) {
    // If variantData is FormData (for files) or regular object
    const headers = variantData instanceof FormData 
        ? { "Content-Type": "multipart/form-data" } 
        : { "Content-Type": "application/json" };
    const response = await productApiInstance.post(`/${productId}/variants`, variantData, { headers });
    return response.data;
}

export async function updateVariantStock(productId, variantId, stock) {
    const response = await productApiInstance.patch(`/${productId}/variants/${variantId}/stock`, { stock });
    return response.data;
}

export async function deleteVariant(productId, variantId) {
    const response = await productApiInstance.delete(`/${productId}/variants/${variantId}`);
    return response.data;
}