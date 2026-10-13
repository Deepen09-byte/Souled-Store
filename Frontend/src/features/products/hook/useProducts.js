import { createProduct, getSellerProducts, getProductById, getAllProducts } from "../services/product.api";
import { useDispatch } from "react-redux";
import { setSellerProducts, setProducts } from "../state/product.slice";

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

    async function handleGetAllProducts() {
        const data = await getAllProducts();
        dispatch(setProducts(data.products));
    }

    async function handleGetProductById(id) {
        const data = await getProductById(id);
        return data.product;
    }

    return {
        handleCreateProduct,
        handleGetSellerProducts,
        handleGetAllProducts,
        handleGetProductById
    }

}