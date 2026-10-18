import {
    createProduct,
    getSellerProducts,
    getProductById,
    getAllProducts,
    addProductVariant,
    updateVariantStock,
    deleteVariant
} from "../services/product.api";
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

    async function handleAddProductVariant(productId, variantData) {
        const data = await addProductVariant(productId, variantData);
        return data;
    }

    async function handleUpdateVariantStock(productId, variantId, stock) {
        const data = await updateVariantStock(productId, variantId, stock);
        return data;
    }

    async function handleDeleteVariant(productId, variantId) {
        const data = await deleteVariant(productId, variantId);
        return data;
    }

    return {
        handleCreateProduct,
        handleGetSellerProducts,
        handleGetAllProducts,
        handleGetProductById,
        handleAddProductVariant,
        handleUpdateVariantStock,
        handleDeleteVariant
    }

}