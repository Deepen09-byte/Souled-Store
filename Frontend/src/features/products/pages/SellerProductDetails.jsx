import React from 'react'
import { useProduct } from '../hook/useProducts';
import { useEffect } from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';


const SellerProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { id } = useParams();
  const { handleGetProductById } = useProduct();

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    setLoading(true);
    setError(false);
    handleGetProductById(id)
      .then((data) => { setProduct(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [id]);

  return (
    <div>SellerProductDetails</div>
  )
}

export default SellerProductDetails
