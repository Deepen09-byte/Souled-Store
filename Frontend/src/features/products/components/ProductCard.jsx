import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const [currentImage, setCurrentImage] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);

    const images = product?.images || [];
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: product?.price?.currency || 'INR',
        maximumFractionDigits: 0,
    }).format(product?.price?.amount ?? 0);

    const handleMouseEnter = () => {
        setHovered(true);
        if (images.length > 1) setCurrentImage(1);
    };

    const handleMouseLeave = () => {
        setHovered(false);
        setCurrentImage(0);
    };

    return (
        <div
            className="group cursor-pointer"
            onClick={() => navigate(`/product/${product?._id}`)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Image wrapper */}
            <div
                className="relative overflow-hidden"
                style={{ aspectRatio: '3/4', background: 'var(--color-surface-container)' }}
            >
                {images.length > 0 ? (
                    <img
                        src={images[currentImage]?.url || images[0]?.url}
                        alt={product?.title}
                        className="w-full h-full object-cover transition-all duration-700"
                        style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '40px', color: 'var(--color-outline)', fontVariationSettings: "'wght' 200" }}
                        >
                            image
                        </span>
                    </div>
                )}

                {/* Wishlist button */}
                <button
                    className="absolute top-3 right-3 flex items-center justify-center transition-all duration-200"
                    style={{
                        width: '32px',
                        height: '32px',
                        background: 'rgba(253,252,250,0.85)',
                        backdropFilter: 'blur(4px)',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: hovered || wishlisted ? 1 : 0,
                        transform: hovered || wishlisted ? 'translateY(0)' : 'translateY(-6px)',
                        color: wishlisted ? '#B91C1C' : 'var(--color-on-surface)',
                    }}
                    onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
                    aria-label="Toggle wishlist"
                >
                    <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '16px', fontVariationSettings: wishlisted ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300" }}
                    >
                        favorite
                    </span>
                </button>

                {/* Quick shop bar on hover */}
                <div
                    className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-3 transition-all duration-300"
                    style={{
                        background: 'rgba(253,252,250,0.92)',
                        backdropFilter: 'blur(4px)',
                        opacity: hovered ? 1 : 0,
                        transform: hovered ? 'translateY(0)' : 'translateY(8px)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--color-on-surface)',
                    }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/product/${product?._id}`); }}
                >
                    View Product
                </div>
            </div>

            {/* Info */}
            <div className="mt-3 space-y-1">
                <h3
                    className="text-sm leading-snug capitalize"
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 400,
                        color: 'var(--color-on-surface)',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {product?.title}
                </h3>
                <p
                    className="text-sm"
                    style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--color-on-surface-variant)' }}
                >
                    {formattedPrice}
                </p>
            </div>
        </div>
    );
};

export default ProductCard;
