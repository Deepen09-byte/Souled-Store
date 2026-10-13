import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const [currentImage, setCurrentImage] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const navigate = useNavigate();
    const images = product?.images || [];
    const price = product?.price?.amount ?? 0;
    const currency = product?.price?.currency ?? 'INR';

    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
    }).format(price);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (images.length > 1) {
            setCurrentImage(1);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setCurrentImage(0);
    };

    return (
        <div

            onClick={() => navigate(`/product/${product?._id}`)}

            className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer"
            style={{
                background: 'var(--color-surface-container)',
                border: '1px solid var(--color-outline-variant)',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
                transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: isHovered
                    ? '0 20px 40px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.3), 0 0 30px -5px rgba(245,158,11,0.15)'
                    : '0 4px 12px -2px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Image Container */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: 'var(--color-surface-container-low)' }}>
                {images.length > 0 ? (
                    <img
                        src={images[currentImage]?.url || images[0]?.url}
                        alt={product?.title}
                        className="w-full h-full object-cover"
                        style={{
                            transition: 'transform 0.5s ease, opacity 0.3s ease',
                            transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl" style={{ color: 'var(--color-outline)' }}>
                            image
                        </span>
                    </div>
                )}

                {/* Gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to top, rgba(19,19,21,0.7) 0%, transparent 50%)',
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                    }}
                />

                {/* Image dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentImage(idx); }}
                                className="rounded-full transition-all duration-200"
                                style={{
                                    width: currentImage === idx ? '16px' : '6px',
                                    height: '6px',
                                    background: currentImage === idx ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Quick add badge on hover */}
                <div
                    className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                        background: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'translateY(0)' : 'translateY(-8px)',
                        transition: 'opacity 0.2s ease, transform 0.2s ease',
                        fontFamily: 'var(--font-label-sm)',
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add_shopping_cart</span>
                    Quick Add
                </div>
            </div>

            {/* Card Content */}
            <div className="flex flex-col gap-1 p-4">
                <h3
                    className="text-sm font-semibold leading-tight line-clamp-2"
                    style={{
                        color: 'var(--color-on-surface)',
                        fontFamily: 'var(--font-body-md)',
                        textTransform: 'capitalize',
                    }}
                >
                    {product?.title}
                </h3>

                <p
                    className="text-xs line-clamp-1 mt-0.5"
                    style={{
                        color: 'var(--color-on-surface-variant)',
                        fontFamily: 'var(--font-body-sm)',
                    }}
                >
                    {product?.description}
                </p>

                <div className="flex items-center justify-between mt-2">
                    <span
                        className="text-base font-bold"
                        style={{
                            color: 'var(--color-primary)',
                            fontFamily: 'var(--font-label-md)',
                        }}
                    >
                        {formattedPrice}
                    </span>

                    <button
                        className="flex items-center justify-center rounded-xl transition-all duration-200"
                        style={{
                            width: '36px',
                            height: '36px',
                            background: isHovered ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                            color: isHovered ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                            border: '1px solid',
                            borderColor: isHovered ? 'transparent' : 'var(--color-outline-variant)',
                        }}
                        aria-label="Add to wishlist"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            favorite
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
