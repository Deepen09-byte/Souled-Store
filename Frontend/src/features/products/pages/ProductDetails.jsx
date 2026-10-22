import React, { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useProduct } from "../hook/useProducts"
import { useCart } from "../../cart/hook/useCart";

// ─── Color Swatch Palette Map ──────────────────────────────────────
const COLOR_HEX_MAP = {
    terracotta: '#C2410C',
    sandstone: '#D4C3AC',
    'midnight black': '#1A1714',
    black: '#1A1714',
    'heather grey': '#9E9E9C',
    grey: '#9E9E9C',
    gray: '#9E9E9C',
    espresso: '#3B2F2F',
    brown: '#5C4033',
    'vintage olive': '#555B49',
    olive: '#555B49',
    green: '#15803D',
    'pure white': '#FDFCFA',
    white: '#FFFFFF',
    'navy blue': '#1E293B',
    navy: '#1E293B',
    blue: '#2563EB',
    red: '#DC2626',
    beige: '#F5F5DC',
    cream: '#FFFDD0',
    charcoal: '#333333',
    maroon: '#800000',
    yellow: '#FACC15',
    orange: '#EA580C',
    pink: '#EC4899',
    purple: '#9333EA',
};

function getColorHex(colorName) {
    if (!colorName) return '#DDD6CB';
    const lower = String(colorName).toLowerCase().trim();
    return COLOR_HEX_MAP[lower] || '#8B7355';
}

// ─── Attribute Object Safe Extraction ──────────────────────────────
function getAttributesObject(attributes) {
    if (!attributes) return {};
    if (attributes instanceof Map) {
        return Object.fromEntries(attributes);
    }
    if (typeof attributes === 'object') {
        if (typeof attributes.get === 'function') {
            const obj = {};
            for (const [k, v] of attributes.entries()) {
                obj[k] = v;
            }
            return obj;
        }
        return attributes;
    }
    return {};
}

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
                        className="no-underline tracking-widest uppercase font-semibold text-lg"
                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-on-surface)' }}
                    >
                        Souled Store Atelier
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
                    onClick={() => navigate('/cart')}
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

    // Reset selected image when images array changes (e.g. variant switched)
    useEffect(() => {
        setSelected(0);
    }, [images]);

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

    const currentImg = images[selected] || images[0];

    return (
        <div className="flex flex-col gap-3">
            {/* Main image */}
            <div
                className="relative overflow-hidden cursor-zoom-in rounded-lg"
                style={{ aspectRatio: '3/4', background: 'var(--color-surface-container)' }}
                onClick={() => setLightboxOpen(true)}
            >
                <img
                    src={currentImg?.url}
                    alt={title}
                    className="w-full h-full object-cover transition-all duration-500 hover:scale-[1.03]"
                />
                {/* Counter */}
                <div
                    className="absolute bottom-4 right-4 label-caps rounded"
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
                            className="overflow-hidden transition-all duration-200 rounded"
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
                        src={currentImg?.url}
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
    const { handleAddItem } = useCart();

    // Selected attributes map: e.g. { size: 'XL', color: 'Terracotta' }
    const [selectedAttributes, setSelectedAttributes] = useState({});

    const { handleGetProductById } = useProduct();

    useEffect(() => {
        setLoading(true);
        setError(false);
        handleGetProductById(id)
            .then((data) => {
                setProduct(data);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [id]);

    // Discover all available attribute keys and values from product variants
    const variantAttributes = useMemo(() => {
        const attrMap = {};
        (product?.variants || []).forEach(v => {
            const attrs = getAttributesObject(v.attributes);
            Object.entries(attrs).forEach(([key, val]) => {
                if (!val) return;
                const normKey = key.trim().toLowerCase();
                if (!attrMap[normKey]) {
                    attrMap[normKey] = {
                        displayKey: key.trim(),
                        values: new Set(),
                    };
                }
                attrMap[normKey].values.add(String(val).trim());
            });
        });

        const result = {};
        Object.entries(attrMap).forEach(([normKey, data]) => {
            result[normKey] = {
                displayKey: data.displayKey,
                values: Array.from(data.values),
            };
        });
        return result;
    }, [product]);

    // Sizes available: combination of variant sizes and standard sizes
    const availableSizes = useMemo(() => {
        if (variantAttributes['size']?.values?.length > 0) {
            const vSizes = variantAttributes['size'].values;
            const standard = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
            const merged = Array.from(new Set([...vSizes, ...standard]));
            return merged;
        }
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }, [variantAttributes]);

    // Matching Variant Logic:
    // If ANY attribute combination is not there, activeVariant is null (main product is selected)
    const activeVariant = useMemo(() => {
        if (!product?.variants || product.variants.length === 0) return null;

        const selectedEntries = Object.entries(selectedAttributes).filter(([_, val]) => Boolean(val));
        if (selectedEntries.length === 0) return null;

        return product.variants.find(v => {
            const vAttrs = getAttributesObject(v.attributes);
            const vEntries = Object.entries(vAttrs);
            if (vEntries.length === 0) return false;

            // 1. Every attribute in the variant must match the selected attributes
            const allVariantAttrsMatch = vEntries.every(([vKey, vVal]) => {
                const selectedVal = selectedAttributes[vKey.toLowerCase()];
                return selectedVal && selectedVal.toLowerCase() === String(vVal).trim().toLowerCase();
            });

            // 2. Every selected attribute must be present in the variant and match
            const allSelectedAttrsMatch = selectedEntries.every(([sKey, sVal]) => {
                const vVal = Object.entries(vAttrs).find(([vk]) => vk.toLowerCase() === sKey.toLowerCase())?.[1];
                return vVal && String(vVal).trim().toLowerCase() === String(sVal).trim().toLowerCase();
            });

            return allVariantAttrsMatch && allSelectedAttrsMatch;
        }) || null;
    }, [product, selectedAttributes]);

    // Toggle attribute selection
    const toggleAttribute = (key, value) => {
        const normKey = key.toLowerCase();
        setSelectedAttributes(prev => {
            if (prev[normKey]?.toLowerCase() === String(value).toLowerCase()) {
                // Clicking active value unselects it
                const copy = { ...prev };
                delete copy[normKey];
                return copy;
            }
            return {
                ...prev,
                [normKey]: value,
            };
        });
    };

    // Images to display: variant images if active, else master product images
    const activeImages = useMemo(() => {
        if (activeVariant?.images && activeVariant.images.length > 0) {
            return activeVariant.images;
        }
        return product?.images || [];
    }, [activeVariant, product]);

    // Active Price
    const currentPrice = activeVariant?.price?.amount ?? product?.price?.amount ?? 0;
    const currentCurrency = activeVariant?.price?.currency || product?.price?.currency || 'INR';

    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currentCurrency,
        maximumFractionDigits: 0,
    }).format(currentPrice);

    const formattedDate = product?.createdAt
        ? new Date(product.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';

    const hasSelectedAttributes = Object.values(selectedAttributes).some(Boolean);
    const isVariantActive = Boolean(activeVariant);
    const isOutOfStock = isVariantActive && activeVariant.stock === 0;

    const handleAddToCart = async () => {
        // If the product has variants and none is selected, require variant selection
        if (product.variants?.length > 0 && !activeVariant) {
            alert("Please select a variant / size before adding to cart");
            return;
        }

        if (isOutOfStock) {
            alert("Selected variant is out of stock");
            return;
        }

        await handleAddItem(product._id, activeVariant?._id);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

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
                    className="btn-dark px-8 py-4 rounded"
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

                    {/* LEFT: Gallery (Switches seamlessly to variant images when matched) */}
                    <div>
                        <ImageGallery images={activeImages} title={product.title} />
                    </div>

                    {/* RIGHT: Info */}
                    <div className="flex flex-col gap-6 lg:pt-2">

                        {/* Tag + Title + Variant Indicator */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="label-caps" style={{ color: 'var(--color-secondary)' }}>
                                    {isVariantActive ? 'Variant Selected' : 'New Arrival'}
                                </span>
                                <span className="text-[#DDD6CB]">•</span>
                                <span className="label-caps" style={{ color: isVariantActive ? '#15803D' : 'var(--color-on-surface-variant)' }}>
                                    {isVariantActive ? 'Custom SKU' : 'Main Product'}
                                </span>
                            </div>

                            <h1
                                className="text-3xl md:text-4xl lg:text-5xl leading-tight capitalize"
                                style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--color-on-surface)', letterSpacing: '-0.01em' }}
                            >
                                {product.title}
                            </h1>
                        </div>

                        {/* Price & Stock Indicator */}
                        <div className="flex flex-wrap items-baseline gap-3">
                            <span
                                className="text-2xl md:text-3xl"
                                style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--color-on-surface)' }}
                            >
                                {formattedPrice}
                            </span>
                            <span className="label-caps" style={{ color: 'var(--color-outline)' }}>incl. taxes</span>

                            {isVariantActive && (
                                <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold tracking-wider uppercase border border-emerald-200 bg-emerald-50 text-emerald-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                    {activeVariant.stock > 0 ? `${activeVariant.stock} in stock` : 'Out of Stock'}
                                </span>
                            )}
                        </div>

                        {/* Active Selection Status Banner */}
                        {hasSelectedAttributes && (
                            <div
                                className="p-3 rounded-lg border flex items-center justify-between text-xs transition-all"
                                style={{
                                    backgroundColor: isVariantActive ? 'rgba(240, 253, 244, 0.9)' : 'rgba(254, 243, 199, 0.5)',
                                    borderColor: isVariantActive ? '#BBF7D0' : '#FDE68A',
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm" style={{ color: isVariantActive ? '#15803D' : '#B45309' }}>
                                        {isVariantActive ? 'check_circle' : 'info'}
                                    </span>
                                    <span style={{ color: isVariantActive ? '#166534' : '#92400E' }}>
                                        {isVariantActive ? (
                                            <>
                                                Active Variant: <strong>{Object.values(getAttributesObject(activeVariant.attributes)).join(' · ')}</strong>
                                            </>
                                        ) : (
                                            <>
                                                Combination not in variant matrix — <strong>Main product selected</strong>
                                            </>
                                        )}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedAttributes({})}
                                    className="font-medium underline cursor-pointer text-[11px]"
                                    style={{ color: isVariantActive ? '#166534' : '#92400E' }}
                                >
                                    Reset to Main
                                </button>
                            </div>
                        )}

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

                        {/* ── Configured Variants Direct Quick-Pills (if variants exist) ── */}
                        {product.variants?.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="label-caps" style={{ color: 'var(--color-on-surface-variant)' }}>
                                        Configured Variants ({product.variants.length})
                                    </p>
                                    {isVariantActive && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAttributes({})}
                                            className="label-caps text-[10px] underline"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-secondary)' }}
                                        >
                                            View Main Product
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((v, i) => {
                                        const attrs = getAttributesObject(v.attributes);
                                        const isThisVariantActive = activeVariant?._id === v._id;
                                        const label = Object.entries(attrs).map(([_, val]) => val).join(' · ') || `Variant #${i + 1}`;
                                        const vPrice = v.price?.amount ? `₹${v.price.amount}` : '';
                                        const colorAttr = attrs.color || attrs.Color;

                                        return (
                                            <button
                                                key={v._id || i}
                                                type="button"
                                                onClick={() => {
                                                    if (isThisVariantActive) {
                                                        setSelectedAttributes({});
                                                    } else {
                                                        const lowerMap = {};
                                                        Object.entries(attrs).forEach(([k, val]) => {
                                                            lowerMap[k.toLowerCase()] = val;
                                                        });
                                                        setSelectedAttributes(lowerMap);
                                                    }
                                                }}
                                                className="transition-all duration-200 label-caps px-3 py-2 flex items-center gap-1.5 cursor-pointer rounded"
                                                style={{
                                                    fontSize: '0.65rem',
                                                    border: isThisVariantActive ? '1px solid var(--color-on-surface)' : '1px solid var(--color-outline-variant)',
                                                    background: isThisVariantActive ? 'var(--color-on-surface)' : 'transparent',
                                                    color: isThisVariantActive ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
                                                }}
                                            >
                                                {colorAttr && (
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shrink-0"
                                                        style={{ backgroundColor: getColorHex(colorAttr) }}
                                                    />
                                                )}
                                                <span>{label}</span>
                                                {vPrice && (
                                                    <span style={{ opacity: isThisVariantActive ? 0.9 : 0.6 }}>
                                                        ({vPrice})
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Color Selector (if colors exist in variants) ── */}
                        {variantAttributes['color'] && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="label-caps" style={{ color: 'var(--color-on-surface-variant)' }}>
                                        Select Color {selectedAttributes['color'] ? `— ${selectedAttributes['color']}` : ''}
                                    </p>
                                    {selectedAttributes['color'] && (
                                        <button
                                            type="button"
                                            onClick={() => toggleAttribute('color', selectedAttributes['color'])}
                                            className="label-caps"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-outline)', textDecoration: 'underline', fontSize: '0.6rem' }}
                                        >
                                            Clear Color
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {variantAttributes['color'].values.map((colName) => {
                                        const isSelected = selectedAttributes['color']?.toLowerCase() === colName.toLowerCase();
                                        return (
                                            <button
                                                key={colName}
                                                type="button"
                                                onClick={() => toggleAttribute('color', colName)}
                                                className="transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded cursor-pointer label-caps"
                                                style={{
                                                    border: isSelected ? '1px solid var(--color-on-surface)' : '1px solid var(--color-outline-variant)',
                                                    background: isSelected ? 'var(--color-on-surface)' : 'transparent',
                                                    color: isSelected ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
                                                    fontSize: '0.6875rem'
                                                }}
                                            >
                                                <span
                                                    className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-xs shrink-0"
                                                    style={{ backgroundColor: getColorHex(colName) }}
                                                />
                                                <span>{colName}</span>
                                                {isSelected && (
                                                    <span className="material-symbols-outlined text-xs">check</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Size Selector ── */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="label-caps" style={{ color: 'var(--color-on-surface-variant)' }}>
                                    Select Size {selectedAttributes['size'] ? `— ${selectedAttributes['size']}` : ''}
                                </p>
                                <button
                                    className="label-caps"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-outline)', textDecoration: 'underline', fontSize: '0.6rem' }}
                                >
                                    Size Guide
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableSizes.map((size) => {
                                    const isSelected = selectedAttributes['size']?.toLowerCase() === size.toLowerCase();
                                    const isVariantSize = variantAttributes['size']?.values?.some(s => s.toLowerCase() === size.toLowerCase());

                                    return (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => toggleAttribute('size', size)}
                                            className="transition-all duration-200 label-caps relative"
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                border: isSelected ? '1px solid var(--color-on-surface)' : '1px solid var(--color-outline-variant)',
                                                background: isSelected ? 'var(--color-on-surface)' : 'transparent',
                                                color: isSelected ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {size}
                                            {isVariantSize && !isSelected && (
                                                <span
                                                    className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#8B7355]"
                                                    title="Variant available in this size"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Other Custom Attributes (e.g. Material, Fit) ── */}
                        {Object.entries(variantAttributes)
                            .filter(([normKey]) => normKey !== 'size' && normKey !== 'color')
                            .map(([normKey, data]) => (
                                <div key={normKey}>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="label-caps" style={{ color: 'var(--color-on-surface-variant)' }}>
                                            Select {data.displayKey} {selectedAttributes[normKey] ? `— ${selectedAttributes[normKey]}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {data.values.map((val) => {
                                            const isSelected = selectedAttributes[normKey]?.toLowerCase() === val.toLowerCase();
                                            return (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => toggleAttribute(normKey, val)}
                                                    className="transition-all duration-200 label-caps px-4 py-2.5 cursor-pointer rounded"
                                                    style={{
                                                        border: isSelected ? '1px solid var(--color-on-surface)' : '1px solid var(--color-outline-variant)',
                                                        background: isSelected ? 'var(--color-on-surface)' : 'transparent',
                                                        color: isSelected ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                                                        fontSize: '0.6875rem'
                                                    }}
                                                >
                                                    {val}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        }

                        {/* CTA Buttons */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {/* Add to Cart */}
                            <button
                                id="btn-add-to-cart"
                                type="button"
                                onClick={() => handleAddToCart()}
                                className="btn-ghost py-4 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    background: addedToCart ? 'var(--color-on-surface)' : 'transparent',
                                    color: addedToCart ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'wght' 300" }}>
                                    {addedToCart ? 'check' : isOutOfStock ? 'block' : 'shopping_cart'}
                                </span>
                                {addedToCart ? 'Added to Bag' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </button>

                            {/* Buy Now */}
                            <button
                                id="btn-buy-now"
                                type="button"
                                disabled={isOutOfStock}
                                className="btn-dark py-4 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'wght' 300" }}>bolt</span>
                                {isOutOfStock ? 'Unavailable' : 'Buy Now'}
                            </button>
                        </div>

                        {/* Wishlist */}
                        <button
                            type="button"
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
                                { icon: 'local_shipping', title: 'Free Delivery', sub: 'On orders above ₹999' },
                                { icon: 'autorenew', title: 'Easy Returns', sub: '7-day return policy' },
                                { icon: 'verified', title: '100% Authentic', sub: 'Genuine product' },
                                { icon: 'payments', title: 'Secure Pay', sub: 'UPI · Cards · Wallets' },
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
                                SKU: {activeVariant ? activeVariant._id?.slice(-8).toUpperCase() : product._id?.slice(-8).toUpperCase()}
                                {activeVariant && <span className="ml-2 font-sans font-medium text-emerald-700">(Variant Item)</span>}
                            </p>
                            {isVariantActive && (
                                <p className="text-xs" style={{ color: 'var(--color-secondary)' }}>
                                    Live Variant Inventory: <strong>{activeVariant.stock ?? 0} units</strong>
                                </p>
                            )}
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
                                    className="animate-pulse rounded"
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