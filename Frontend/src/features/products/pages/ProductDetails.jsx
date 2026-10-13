import React, { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useProduct } from "../hook/useProducts"

// ─── Navbar ────────────────────────────────────────────────────────
const Navbar = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                background: scrolled ? 'rgba(253,252,250,0.92)' : 'var(--color-surface)',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: '1px solid var(--color-outline-variant)',
            }}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center' }}
                        aria-label="Back"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'wght' 300" }}>arrow_back</span>
                    </button>
                    <Link
                        to="/"
                        className="no-underline"
                        style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: '1.25rem', color: 'var(--color-on-surface)', letterSpacing: '-0.01em' }}
                    >
                        Souled Store
                    </Link>
                </div>

                {/* Breadcrumb */}
                <div className="hidden md:flex items-center gap-2">
                    <Link to="/" className="label-caps no-underline" style={{ color: 'var(--color-on-surface-variant)' }}>Home</Link>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-outline)' }}>chevron_right</span>
                    <span className="label-caps" style={{ color: 'var(--color-on-surface)' }}>Product</span>
                </div>

                {/* Cart icon */}
                <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center' }}
                    aria-label="Cart"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'wght' 300" }}>shopping_bag</span>
                </button>
            </div>
        </nav>
    );
};

// ─── Image Gallery ──────────────────────────────────────────────────
const ImageGallery = ({ images, title }) => {
    const [selected, setSelected] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div
                className="w-full flex items-center justify-center"
                style={{ aspectRatio: '3/4', background: 'var(--color-surface-container)' }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '56px', color: 'var(--color-outline)', fontVariationSettings: "'wght' 200" }}>image</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Main image */}
            <div
                className="relative overflow-hidden cursor-zoom-in"
                style={{ aspectRatio: '3/4', background: 'var(--color-surface-container)' }}
                onClick={() => setLightboxOpen(true)}
            >
                <img
                    src={images[selected]?.url}
                    alt={title}
                    className="w-full h-full object-cover transition-all duration-500 hover:scale-[1.03]"
                />
                {/* Counter */}
                <div
                    className="absolute bottom-4 right-4 label-caps"
                    style={{
                        background: 'rgba(253,252,250,0.85)',
                        backdropFilter: 'blur(4px)',
                        padding: '4px 10px',
                        fontSize: '0.6rem',
                        color: 'var(--color-on-surface-variant)',
                    }}
                >
                    {selected + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(images.length, 4)}, 1fr)` }}>
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelected(idx)}
                            className="overflow-hidden transition-all duration-200"
                            style={{
                                aspectRatio: '1/1',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                outline: selected === idx ? `2px solid var(--color-on-surface)` : '2px solid transparent',
                                outlineOffset: '2px',
                            }}
                            aria-label={`Image ${idx + 1}`}
                        >
                            <img src={img?.url} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-8"
                    style={{ background: 'rgba(10,8,6,0.92)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        className="absolute top-6 right-6"
                        onClick={() => setLightboxOpen(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}
                        aria-label="Close"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>close</span>
                    </button>
                    <img
                        src={images[selected]?.url}
                        alt={title}
                        className="max-w-full max-h-[90vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {/* Arrow nav */}
                    {images.length > 1 && (
                        <>
                            <button
                                className="absolute left-6 top-1/2 -translate-y-1/2"
                                onClick={(e) => { e.stopPropagation(); setSelected((selected - 1 + images.length) % images.length); }}
                                style={{ background: 'rgba(253,252,250,0.1)', border: 'none', cursor: 'pointer', color: 'white', padding: '10px', backdropFilter: 'blur(4px)' }}
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button
                                className="absolute right-6 top-1/2 -translate-y-1/2"
                                onClick={(e) => { e.stopPropagation(); setSelected((selected + 1) % images.length); }}
                                style={{ background: 'rgba(253,252,250,0.1)', border: 'none', cursor: 'pointer', color: 'white', padding: '10px', backdropFilter: 'blur(4px)' }}
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Skeleton ──────────────────────────────────────────────────────
const DetailsSkeleton = () => (
    <div style={{ background: 'var(--color-background)', minHeight: '100dvh' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                <div className="space-y-3">
                    <div className="w-full animate-pulse" style={{ aspectRatio: '3/4', background: 'var(--color-surface-container)' }} />
                    <div className="grid grid-cols-4 gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse" style={{ aspectRatio: '1/1', background: 'var(--color-surface-container)' }} />
                        ))}
                    </div>
                </div>
                <div className="space-y-5 pt-4">
                    <div className="h-3 rounded animate-pulse w-1/4" style={{ background: 'var(--color-surface-container)' }} />
                    <div className="h-12 rounded animate-pulse w-3/4" style={{ background: 'var(--color-surface-container)' }} />
                    <div className="h-5 rounded animate-pulse w-1/3" style={{ background: 'var(--color-surface-container)' }} />
                    <div className="space-y-2 pt-4">
                        <div className="h-3 rounded animate-pulse" style={{ background: 'var(--color-surface-container)' }} />
                        <div className="h-3 rounded animate-pulse w-4/5" style={{ background: 'var(--color-surface-container)' }} />
                        <div className="h-3 rounded animate-pulse w-2/3" style={{ background: 'var(--color-surface-container)' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-6">
                        <div className="h-14 rounded animate-pulse" style={{ background: 'var(--color-surface-container)' }} />
                        <div className="h-14 rounded animate-pulse" style={{ background: 'var(--color-surface-container)' }} />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ─── Product Details Page ──────────────────────────────────────────
const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);

    const { handleGetProductById } = useProduct();

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    useEffect(() => {
        setLoading(true);
        setError(false);
        handleGetProductById(id)
            .then((data) => { setProduct(data); setLoading(false); })
            .catch(() => { setError(true); setLoading(false); });
    }, [id]);

    const handleAddToCart = () => {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const formattedPrice = product
        ? new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: product.price?.currency || 'INR',
            maximumFractionDigits: 0,
        }).format(product.price?.amount ?? 0)
        : '';

    const formattedDate = product?.createdAt
        ? new Date(product.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';

    if (loading) return <><Navbar /><DetailsSkeleton /></>;

    if (error || !product) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center gap-6"
                style={{ background: 'var(--color-background)' }}
            >
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-on-surface)', fontWeight: 300 }}>
                    Product not found
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="btn-dark px-8 py-4"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--color-background)', minHeight: '100dvh', overflowX: 'hidden' }}>
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-24">

                {/* ── Product Section ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                    {/* LEFT: Gallery */}
                    <div>
                        <ImageGallery images={product.images} title={product.title} />
                    </div>

                    {/* RIGHT: Info */}
                    <div className="flex flex-col gap-6 lg:pt-2">

                        {/* Tag + Title */}
                        <div>
                            <p className="label-caps mb-3" style={{ color: 'var(--color-secondary)' }}>New Arrival</p>
                            <h1
                                className="text-3xl md:text-4xl lg:text-5xl leading-tight capitalize"
                                style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--color-on-surface)', letterSpacing: '-0.01em' }}
                            >
                                {product.title}
                            </h1>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span
                                className="text-2xl md:text-3xl"
                                style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--color-on-surface)' }}
                            >
                                {formattedPrice}
                            </span>
                            <span className="label-caps" style={{ color: 'var(--color-outline)' }}>incl. taxes</span>
                        </div>

                        {/* Divider */}
                        <div className="divider" />

                        {/* Description */}
                        <div>
                            <p className="label-caps mb-3" style={{ color: 'var(--color-on-surface-variant)' }}>Description</p>
                            <p
                                className="text-sm leading-relaxed"
                                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-on-surface-variant)', fontWeight: 300, lineHeight: '1.8' }}
                            >
                                {product.description}
                            </p>
                        </div>

                        {/* Size selector */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="label-caps" style={{ color: 'var(--color-on-surface-variant)' }}>Select Size</p>
                                <button
                                    className="label-caps"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-outline)', textDecoration: 'underline', fontSize: '0.6rem' }}
                                >
                                    Size Guide
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className="transition-all duration-200 label-caps"
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            border: selectedSize === size ? '1px solid var(--color-on-surface)' : '1px solid var(--color-outline-variant)',
                                            background: selectedSize === size ? 'var(--color-on-surface)' : 'transparent',
                                            color: selectedSize === size ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {/* Add to Cart */}
                            <button
                                id="btn-add-to-cart"
                                onClick={handleAddToCart}
                                className="btn-ghost py-4 flex items-center justify-center gap-2 transition-all duration-200"
                                style={{
                                    background: addedToCart ? 'var(--color-on-surface)' : 'transparent',
                                    color: addedToCart ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'wght' 300" }}>
                                    {addedToCart ? 'check' : 'shopping_cart'}
                                </span>
                                {addedToCart ? 'Added' : 'Add to Cart'}
                            </button>

                            {/* Buy Now */}
                            <button
                                id="btn-buy-now"
                                className="btn-dark py-4 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'wght' 300" }}>bolt</span>
                                Buy Now
                            </button>
                        </div>

                        {/* Wishlist */}
                        <button
                            onClick={() => setWishlisted(!wishlisted)}
                            className="flex items-center justify-center gap-2 py-3 label-caps transition-all duration-200"
                            style={{
                                background: 'none',
                                border: '1px solid var(--color-outline-variant)',
                                cursor: 'pointer',
                                color: wishlisted ? '#B91C1C' : 'var(--color-on-surface-variant)',
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '16px', fontVariationSettings: wishlisted ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300" }}
                            >
                                favorite
                            </span>
                            {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
                        </button>

                        {/* Divider */}
                        <div className="divider" />

                        {/* Features grid */}
                        <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                            {[
                                { icon: 'local_shipping', title: 'Free Delivery',  sub: 'On orders above ₹999' },
                                { icon: 'autorenew',      title: 'Easy Returns',   sub: '7-day return policy' },
                                { icon: 'verified',       title: '100% Authentic', sub: 'Genuine product' },
                                { icon: 'payments',       title: 'Secure Pay',     sub: 'UPI · Cards · Wallets' },
                            ].map((item) => (
                                <div key={item.title} className="flex items-start gap-3">
                                    <span
                                        className="material-symbols-outlined flex-shrink-0 mt-0.5"
                                        style={{ fontSize: '18px', color: 'var(--color-secondary)', fontVariationSettings: "'wght' 300" }}
                                    >
                                        {item.icon}
                                    </span>
                                    <div>
                                        <p
                                            className="text-xs font-medium"
                                            style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-sans)' }}
                                        >
                                            {item.title}
                                        </p>
                                        <p
                                            className="text-xs mt-0.5"
                                            style={{ color: 'var(--color-outline)', fontFamily: 'var(--font-sans)', fontWeight: 300 }}
                                        >
                                            {item.sub}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Meta */}
                        <div className="flex flex-col gap-1.5 pt-2">
                            <p className="text-xs" style={{ color: 'var(--color-outline)', fontFamily: 'var(--font-sans)', fontWeight: 300 }}>
                                Listed on {formattedDate}
                            </p>
                            <p className="text-xs font-mono" style={{ color: 'var(--color-outline)' }}>
                                SKU: {product._id?.slice(-8).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Divider ── */}
                <div className="divider my-20" />

                {/* ── You May Also Like ── */}
                <div>
                    <div className="mb-10">
                        <p className="label-caps mb-2" style={{ color: 'var(--color-secondary)' }}>You May Also Like</p>
                        <h2
                            className="text-2xl md:text-3xl"
                            style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--color-on-surface)' }}
                        >
                            Similar Styles
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div
                                    className="animate-pulse"
                                    style={{ aspectRatio: '3/4', background: 'var(--color-surface-container)' }}
                                />
                                <div className="h-3 animate-pulse rounded" style={{ background: 'var(--color-surface-container)', width: '65%' }} />
                                <div className="h-3 animate-pulse rounded" style={{ background: 'var(--color-surface-container)', width: '40%' }} />
                            </div>
                        ))}
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer
                className="border-t"
                style={{ borderColor: 'var(--color-outline-variant)', background: 'var(--color-surface)' }}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-on-surface)', fontWeight: 400 }}>
                        Souled Store
                    </span>
                    <p className="label-caps" style={{ color: 'var(--color-outline)', fontSize: '0.625rem' }}>
                        © {new Date().getFullYear()} Souled Store
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default ProductDetails;