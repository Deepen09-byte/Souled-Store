import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useProduct } from "../hook/useProducts"

const ProductDetails = () => {

    const { id } = useParams()
    console.log(id)
    const [product, setProduct] = useState(null)

    const { handleGetProductById } = useProduct()

    async function fetchProductDetails() {

        const data = await handleGetProductById(id)

        setProduct(data)

    }

    useEffect(() => {
        fetchProductDetails()
    }, [id])

    return (
        <div>ProductDetails</div>
    )
}

export default ProductDetails