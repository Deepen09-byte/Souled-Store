import React, { useEffect } from "react";
import { useProduct } from "../hook/useProducts";
import { useSelector } from "react-redux";

const Dashboard = () => {

    const { handleGetSellerProducts } = useProduct()

    const sellerProducts = useSelector((state) => state.products.sellerProducts)

    useEffect(() => {
        handleGetSellerProducts()
    }, [])

    console.log(sellerProducts)

    return (
        <div>
            Dashboard
        </div>
    )
} 