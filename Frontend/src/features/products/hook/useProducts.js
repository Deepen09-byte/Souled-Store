import { createProduct, getSellerProducts } from "../services/product.api";
import { useDispatch } from "react-redux";
import { setSellerProducts } from "../state/product.slice";

export const useProduct = () => {

    const dispatch = useDispatch()

    async function handleCreateProduct(formData) {
        const data = await createProduct(formData);
        return data.product;
    }

    async function handleGetSellerProducts() {
        const data = await getSellerProducts();
        dispatch(setSellerProducts(data.products))
        return data.products;
    }

    return {
        handleCreateProduct,
        handleGetSellerProducts
    }

}