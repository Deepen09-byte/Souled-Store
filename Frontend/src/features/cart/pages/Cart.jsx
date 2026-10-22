import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hook/useCart";
import { removeItem } from "../state/cart.slice";

// ─── Color Swatch Map ────────────────────────────────────────────────
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
};

function getColorHex(colorName) {
    if (!colorName) return '#DDD6CB';
    const lower = String(colorName).toLowerCase().trim();
    return COLOR_HEX_MAP[lower] || '#8B7355';
}

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

// ─── Cart Page Component ─────────────────────────────────────────────
const Cart = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart?.items || []);
    const { handleGetCart } = useCart();

    const [loading, setLoading] = useState(true);
    const [localQuantities, setLocalQuantities] = useState({});
    const [promoCode, setPromoCode] = useState("FIRST10");
    const [promoApplied, setPromoApplied] = useState(true);
    const [promoDiscountRate, setPromoDiscountRate] = useState(0.1); // 10%
    const [giftCardChecked, setGiftCardChecked] = useState(true);
    const [unboxingChecked, setUnboxingChecked] = useState(true);
    const [crossSellAdded, setCrossSellAdded] = useState({});

    useEffect(() => {
        setLoading(true);
        handleGetCart()
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Synchronize quantities into local state
    useEffect(() => {
        if (cartItems.length > 0) {
            const initialQtys = {};
            cartItems.forEach((item, index) => {
                const key = item._id || `${item.product?._id || item.product}-${item.variant || index}`;
                initialQtys[key] = item.quantity || 1;
            });
            setLocalQuantities(initialQtys);
        }
    }, [cartItems]);

    // Quantity update handler
    const updateQuantity = (key, delta) => {
        setLocalQuantities((prev) => {
            const current = prev[key] || 1;
            const updated = Math.max(1, current + delta);
            return { ...prev, [key]: updated };
        });
    };

    // Item remove handler
    const handleRemove = (itemId) => {
        dispatch(removeItem(itemId));
    };

    // Curated companion pieces
    const crossSellItems = [
        {
            id: 'xs-1',
            title: 'Silk Twill Pocket Square',
            category: 'Archival botanical print',
            price: 1900,
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
        },
        {
            id: 'xs-2',
            title: 'Handcrafted Nubuck Belt',
            category: 'Vegetable-tanned finish',
            price: 4200,
            image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=400&q=80',
        },
    ];

    // Compute financial figures
    const subtotal = useMemo(() => {
        let total = 0;
        cartItems.forEach((item, index) => {
            const key = item._id || `${item.product?._id || item.product}-${item.variant || index}`;
            const qty = localQuantities[key] || item.quantity || 1;
            const price = item.price?.amount ?? item.product?.price?.amount ?? 0;
            total += price * qty;
        });

        // Add any added cross-sell pieces
        crossSellItems.forEach((xs) => {
            if (crossSellAdded[xs.id]) {
                total += xs.price;
            }
        });

        return total;
    }, [cartItems, localQuantities, crossSellAdded]);

    const discountAmount = promoApplied ? Math.round(subtotal * promoDiscountRate) : 0;
    const freeDeliveryThreshold = 15000;
    const distanceToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
    const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
    const estimatedTotal = Math.max(0, subtotal - discountAmount);

    const formatINR = (val) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(val);

    return (
        <div style={{ background: 'var(--color-background)', minHeight: '100dvh', color: 'var(--color-on-surface)' }}>
            {/* ── Top Announcement / Concierge Banner ── */}
            <aside
                className="py-2.5 px-6 border-b text-center relative z-20"
                style={{
                    background: 'var(--color-surface-container-high)',
                    borderColor: 'var(--color-outline-variant)',
                }}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[var(--color-on-surface-variant)]">
                    <span className="hidden md:inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--color-secondary)' }}>
                            workspace_premium
                        </span>
                        Archival Release: Complimentary express courier & bespoke presentation coffret on orders above ₹15,000.
                    </span>
                    <span className="md:hidden mx-auto font-medium">Complimentary Bespoke Courier on orders above ₹15,000</span>
                    <div className="hidden md:flex items-center gap-6">
                        <span className="flex items-center gap-1 font-semibold tracking-widest text-[10px] uppercase">
                            <span className="material-symbols-outlined text-[14px]">call</span> Atelier Concierge
                        </span>
                        <span className="opacity-40">|</span>
                        <span className="font-semibold tracking-widest text-[10px] uppercase" style={{ color: 'var(--color-secondary)' }}>
                            Curated in New Delhi
                        </span>
                    </div>
                </div>
            </aside>

            {/* ── Top Navigation Bar ── */}
            <header
                className="sticky top-0 z-40 transition-all border-b"
                style={{
                    background: 'rgba(253, 252, 250, 0.94)',
                    backdropFilter: 'blur(12px)',
                    borderColor: 'var(--color-outline-variant)',
                }}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12 h-18 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1 rounded cursor-pointer transition-colors"
                            style={{ background: 'none', border: 'none', color: 'var(--color-on-surface-variant)' }}
                            aria-label="Back"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </button>
                        <Link
                            to="/"
                            className="no-underline tracking-widest uppercase font-semibold text-lg md:text-xl"
                            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-on-surface)' }}
                        >
                            Snitch Atelier
                        </Link>
                    </div>

                    {/* Breadcrumbs */}
                    <nav className="hidden md:flex items-center gap-2 text-xs label-caps" style={{ color: 'var(--color-on-surface-variant)' }}>
                        <Link to="/" className="no-underline hover:text-black transition-colors" style={{ color: 'inherit' }}>
                            Home
                        </Link>
                        <span className="text-[12px] opacity-40">/</span>
                        <span className="text-black font-semibold">Shopping Bag ({cartItems.length})</span>
                    </nav>

                    {/* Trailing */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="label-caps flex items-center gap-1 text-[11px] no-underline hover:opacity-80 transition-opacity"
                            style={{ color: 'var(--color-secondary)' }}
                        >
                            <span>Continue Shopping</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── Main Workspace ── */}
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">
                {/* Header Title & Sartorial Quote */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b pb-6 gap-4" style={{ borderColor: 'var(--color-outline-variant)' }}>
                    <div>
                        <span className="label-caps block mb-1" style={{ color: 'var(--color-secondary)', fontSize: '10px' }}>
                            Curation Registry
                        </span>
                        <h1 className="text-3xl md:text-4xl font-normal tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                            Your Sartorial Bag
                        </h1>
                    </div>
                    <p className="text-xs md:text-sm italic max-w-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.6' }}>
                        "Garments tailored with archival reverence, cut from master-spun natural yarns for enduring silhouettes."
                    </p>
                </div>

                {loading ? (
                    /* Skeleton state */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-6">
                            {[1, 2].map((n) => (
                                <div key={n} className="p-8 border rounded animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-outline-variant)' }}>
                                    <div className="h-32 bg-stone-200/50 rounded mb-4" />
                                    <div className="h-4 bg-stone-200/50 rounded w-2/3" />
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-4 p-8 border rounded animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-outline-variant)' }}>
                            <div className="h-6 bg-stone-200/50 rounded mb-4 w-1/2" />
                            <div className="h-40 bg-stone-200/50 rounded" />
                        </div>
                    </div>
                ) : cartItems.length === 0 ? (
                    /* ── Empty Cart State ── */
                    <div
                        className="p-12 md:p-20 text-center rounded border max-w-2xl mx-auto"
                        style={{
                            background: 'var(--color-surface)',
                            borderColor: 'var(--color-outline-variant)',
                        }}
                    >
                        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'var(--color-surface-container)' }}>
                            <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--color-secondary)' }}>
                                shopping_bag
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl mb-3 font-normal" style={{ fontFamily: 'var(--font-serif)' }}>
                            Your Shopping Bag is Empty
                        </h2>
                        <p className="text-sm max-w-md mx-auto mb-8" style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.7' }}>
                            You have not yet added any archival garments to your selection. Explore our master collection of timeless shirts, trousers, and refined knitwear.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-dark px-8 py-4 inline-flex items-center gap-2 rounded"
                        >
                            <span>Explore Collections</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                    </div>
                ) : (
                    /* ── 2-Column Cart Layout ── */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* ── LEFT COLUMN: Bag Items & Atelier Extras (8 cols) ── */}
                        <section className="lg:col-span-8 space-y-8">
                            {/* Free Delivery Milestone Progress Bar */}
                            <div
                                className="p-6 rounded border"
                                style={{
                                    background: 'var(--color-surface)',
                                    borderColor: 'var(--color-outline-variant)',
                                    boxShadow: '0 4px 20px -2px rgba(26,23,20,0.03)',
                                }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-secondary)' }}>
                                            local_shipping
                                        </span>
                                        <span className="text-sm font-medium">
                                            {distanceToFreeDelivery > 0 ? (
                                                <>
                                                    You are <strong className="font-semibold text-black">{formatINR(distanceToFreeDelivery)}</strong> away from Complimentary Express Delivery & Signature Gift Packaging
                                                </>
                                            ) : (
                                                <span style={{ color: 'var(--color-success)' }} className="font-semibold">
                                                    ✨ Complimentary Express Delivery & Signature Coffret Unlocked!
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <span className="label-caps hidden sm:inline" style={{ color: 'var(--color-secondary)', fontSize: '10px' }}>
                                        {freeDeliveryProgress}% Achieved
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-container)' }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out"
                                        style={{
                                            width: `${freeDeliveryProgress}%`,
                                            background: 'var(--color-secondary)',
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-2.5 text-[11px]" style={{ color: 'var(--color-on-surface-variant)' }}>
                                    <span>Tier: Sovereign Courier (₹15,000 threshold)</span>
                                    <span className="font-medium text-black">
                                        {distanceToFreeDelivery > 0 ? `Unlocked at ${formatINR(freeDeliveryThreshold)}` : 'Complimentary'}
                                    </span>
                                </div>
                            </div>

                            {/* Bag Item List */}
                            <div
                                className="rounded border divide-y overflow-hidden"
                                style={{
                                    background: 'var(--color-surface)',
                                    borderColor: 'var(--color-outline-variant)',
                                    boxShadow: '0 4px 20px -2px rgba(26,23,20,0.03)',
                                }}
                            >
                                {cartItems.map((item, index) => {
                                    const key = item._id || `${item.product?._id || item.product}-${item.variant || index}`;
                                    const qty = localQuantities[key] || item.quantity || 1;
                                    const product = typeof item.product === 'object' ? item.product : null;
                                    const productTitle = product?.title || 'Bespoke Atelier Garment';

                                    // Find variant if present
                                    const variant = product?.variants?.find(
                                        (v) => (v._id?.toString() || v._id) === (item.variant?.toString() || item.variant)
                                    );
                                    const variantAttrs = getAttributesObject(variant?.attributes);
                                    const colorAttr = variantAttrs.color || variantAttrs.Color || '';
                                    const sizeAttr = variantAttrs.size || variantAttrs.Size || '';

                                    // Resolved image: variant image -> product image -> fallback
                                    const itemImage =
                                        variant?.images?.[0]?.url ||
                                        product?.images?.[0]?.url ||
                                        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=400&q=80';

                                    // Price
                                    const itemPrice = item.price?.amount ?? variant?.price?.amount ?? product?.price?.amount ?? 0;
                                    const itemTotal = itemPrice * qty;

                                    return (
                                        <article
                                            key={key}
                                            className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 transition-colors hover:bg-black/[0.01]"
                                        >
                                            {/* Thumbnail */}
                                            <div
                                                className="w-full sm:w-36 h-48 flex-shrink-0 border overflow-hidden relative rounded"
                                                style={{ borderColor: 'var(--color-outline-variant)' }}
                                            >
                                                <img
                                                    src={itemImage}
                                                    alt={productTitle}
                                                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                                                />
                                                <span
                                                    className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-semibold tracking-widest uppercase border rounded"
                                                    style={{
                                                        background: 'rgba(253, 252, 250, 0.9)',
                                                        borderColor: 'var(--color-outline-variant)',
                                                    }}
                                                >
                                                    Atelier
                                                </span>
                                            </div>

                                            {/* Details & Controls */}
                                            <div className="flex flex-col justify-between flex-grow gap-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <span className="label-caps block mb-1" style={{ color: 'var(--color-secondary)', fontSize: '9px' }}>
                                                            Archival Cut
                                                        </span>
                                                        <h2 className="text-xl md:text-2xl font-normal leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                                                            {productTitle}
                                                        </h2>
                                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
                                                            {colorAttr && (
                                                                <span className="flex items-center gap-1.5">
                                                                    <span>Hue:</span>
                                                                    <span
                                                                        className="w-2.5 h-2.5 rounded-full inline-block border border-black/10"
                                                                        style={{ backgroundColor: getColorHex(colorAttr) }}
                                                                    />
                                                                    <strong className="text-black font-medium">{colorAttr}</strong>
                                                                </span>
                                                            )}
                                                            {sizeAttr && (
                                                                <>
                                                                    <span className="opacity-40">·</span>
                                                                    <span>
                                                                        Size: <strong className="text-black font-medium">{sizeAttr}</strong>
                                                                    </span>
                                                                </>
                                                            )}
                                                            <span className="opacity-40">·</span>
                                                            <span className="font-mono text-[10px] opacity-60">
                                                                SKU: SN-{key.substring(0, 6).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right shrink-0">
                                                        <span className="text-xl md:text-2xl font-normal" style={{ fontFamily: 'var(--font-serif)' }}>
                                                            {formatINR(itemTotal)}
                                                        </span>
                                                        <span className="block text-[10px] label-caps tracking-wider opacity-60">
                                                            {qty > 1 ? `${formatINR(itemPrice)} each` : 'Taxes Included'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Stepper & Secondary Actions */}
                                                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-outline-variant)' }}>
                                                    {/* Quantity Stepper */}
                                                    <div
                                                        className="inline-flex items-center border rounded"
                                                        style={{
                                                            borderColor: 'var(--color-outline-variant)',
                                                            background: 'var(--color-surface)',
                                                        }}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(key, -1)}
                                                            aria-label="Decrease quantity"
                                                            className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-black/5 transition-colors border-none"
                                                            style={{ color: 'var(--color-on-surface-variant)' }}
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">remove</span>
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-medium tabular-nums">
                                                            {qty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(key, 1)}
                                                            aria-label="Increase quantity"
                                                            className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-black/5 transition-colors border-none"
                                                            style={{ color: 'var(--color-on-surface-variant)' }}
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">add</span>
                                                        </button>
                                                    </div>

                                                    {/* Secondary Link Actions */}
                                                    <div className="flex items-center gap-6 text-[10px] label-caps">
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-1.5 cursor-pointer underline underline-offset-4 transition-colors"
                                                            style={{ color: 'var(--color-on-surface-variant)', background: 'none', border: 'none' }}
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">favorite</span>
                                                            <span>Move to Wishlist</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemove(item._id || item.product?._id || item.product)}
                                                            className="flex items-center gap-1.5 cursor-pointer underline underline-offset-4 hover:text-red-700 transition-colors"
                                                            style={{ color: 'var(--color-on-surface-variant)', background: 'none', border: 'none' }}
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                                            <span>Remove</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            {/* Atelier Concierge & Gifting Options */}
                            <div
                                className="p-6 sm:p-8 rounded border"
                                style={{
                                    background: 'var(--color-surface)',
                                    borderColor: 'var(--color-outline-variant)',
                                    boxShadow: '0 4px 20px -2px rgba(26,23,20,0.03)',
                                }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--color-secondary)' }}>
                                        featured_seasonal_and_gifts
                                    </span>
                                    <h3 className="text-xl font-normal" style={{ fontFamily: 'var(--font-serif)' }}>
                                        Atelier Concierge Gifting & Packaging
                                    </h3>
                                </div>
                                <p className="text-xs mb-6 max-w-2xl" style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.6' }}>
                                    Every garment arrives enclosed in archival non-acidic tissue and protective garment bags. Choose custom presentation protocols below:
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Option 1 */}
                                    <label
                                        className="relative flex items-start gap-3.5 p-4 border rounded cursor-pointer transition-colors"
                                        style={{
                                            background: giftCardChecked ? 'var(--color-surface-container-low)' : 'transparent',
                                            borderColor: giftCardChecked ? 'var(--color-secondary)' : 'var(--color-outline-variant)',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={giftCardChecked}
                                            onChange={(e) => setGiftCardChecked(e.target.checked)}
                                            className="mt-0.5 accent-black"
                                        />
                                        <div>
                                            <span className="block text-xs font-semibold text-black">
                                                Complimentary Calligraphy Gift Card
                                            </span>
                                            <span className="block text-[11px] mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
                                                Pen-lettered parchment on handmade cotton card stock.
                                            </span>
                                            <span className="label-caps mt-2 block" style={{ color: 'var(--color-secondary)', fontSize: '9px' }}>
                                                Complimentary
                                            </span>
                                        </div>
                                    </label>

                                    {/* Option 2 */}
                                    <label
                                        className="relative flex items-start gap-3.5 p-4 border rounded cursor-pointer transition-colors"
                                        style={{
                                            background: unboxingChecked ? 'var(--color-surface-container-low)' : 'transparent',
                                            borderColor: unboxingChecked ? 'var(--color-secondary)' : 'var(--color-outline-variant)',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={unboxingChecked}
                                            onChange={(e) => setUnboxingChecked(e.target.checked)}
                                            className="mt-0.5 accent-black"
                                        />
                                        <div>
                                            <span className="block text-xs font-semibold text-black">
                                                Discreet Luxury Unboxing Presentation
                                            </span>
                                            <span className="block text-[11px] mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
                                                Neutral exterior seal with cedar scent sachet & brass hanger.
                                            </span>
                                            <span className="label-caps mt-2 block" style={{ color: 'var(--color-secondary)', fontSize: '9px' }}>
                                                Included
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Complete the Silhouette (Artisanal Accents) */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <span className="label-caps block" style={{ color: 'var(--color-secondary)', fontSize: '9px' }}>
                                            Artisanal Accents
                                        </span>
                                        <h3 className="text-xl font-normal" style={{ fontFamily: 'var(--font-serif)' }}>
                                            Complete the Silhouette
                                        </h3>
                                    </div>
                                    <span className="text-xs hidden sm:inline" style={{ color: 'var(--color-on-surface-variant)' }}>
                                        Handcrafted companion pieces
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {crossSellItems.map((xs) => {
                                        const isAdded = Boolean(crossSellAdded[xs.id]);
                                        return (
                                            <div
                                                key={xs.id}
                                                className="p-4 rounded border flex items-center justify-between gap-4 transition-colors"
                                                style={{
                                                    background: 'var(--color-surface)',
                                                    borderColor: isAdded ? 'var(--color-secondary)' : 'var(--color-outline-variant)',
                                                }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-20 rounded overflow-hidden flex-shrink-0 border" style={{ borderColor: 'var(--color-outline-variant)' }}>
                                                        <img src={xs.image} alt={xs.title} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium leading-tight">{xs.title}</h4>
                                                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
                                                            {xs.category}
                                                        </p>
                                                        <p className="text-xs font-semibold mt-1" style={{ color: 'var(--color-primary)' }}>
                                                            {formatINR(xs.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCrossSellAdded((prev) => ({
                                                            ...prev,
                                                            [xs.id]: !prev[xs.id],
                                                        }))
                                                    }
                                                    className="label-caps px-3 py-2 rounded transition-all cursor-pointer text-[10px]"
                                                    style={{
                                                        background: isAdded ? 'var(--color-primary)' : 'var(--color-surface-container)',
                                                        color: isAdded ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
                                                        border: '1px solid var(--color-outline-variant)',
                                                    }}
                                                >
                                                    {isAdded ? '✓ Added' : '+ Add'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* ── RIGHT COLUMN: Sticky Order Summary Sidebar (4 cols) ── */}
                        <aside className="lg:col-span-4 sticky top-28 space-y-6">
                            {/* Order Summary Card */}
                            <div
                                className="p-6 sm:p-8 rounded border"
                                style={{
                                    background: 'var(--color-surface)',
                                    borderColor: 'var(--color-outline-variant)',
                                    boxShadow: '0 4px 20px -2px rgba(26,23,20,0.04)',
                                }}
                            >
                                <div className="border-b pb-4 mb-6" style={{ borderColor: 'var(--color-outline-variant)' }}>
                                    <span className="label-caps block mb-1" style={{ color: 'var(--color-secondary)', fontSize: '9px' }}>
                                        Financial Ledger
                                    </span>
                                    <h2 className="text-2xl font-normal" style={{ fontFamily: 'var(--font-serif)' }}>
                                        Order Summary
                                    </h2>
                                </div>

                                {/* Price Ledger Breakdown */}
                                <div className="space-y-3.5 text-xs md:text-sm">
                                    <div className="flex justify-between items-center" style={{ color: 'var(--color-on-surface-variant)' }}>
                                        <span>Item Subtotal ({cartItems.length} garments)</span>
                                        <span className="font-medium text-black tabular-nums">{formatINR(subtotal)}</span>
                                    </div>

                                    {promoApplied && (
                                        <div className="flex justify-between items-center" style={{ color: 'var(--color-secondary)' }}>
                                            <span className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[16px]">stars</span>
                                                <span>Atelier Member Privilege (10%)</span>
                                            </span>
                                            <span className="tabular-nums font-semibold">-{formatINR(discountAmount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center" style={{ color: 'var(--color-on-surface-variant)' }}>
                                        <span className="flex items-center gap-1">
                                            <span>Estimated Express Courier</span>
                                            <span className="material-symbols-outlined text-[14px] opacity-60" title="Climate-neutral insured transit">
                                                info
                                            </span>
                                        </span>
                                        <span className="label-caps font-semibold" style={{ color: 'var(--color-secondary)', fontSize: '10px' }}>
                                            {distanceToFreeDelivery === 0 ? 'Complimentary' : 'Calculated next'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center" style={{ color: 'var(--color-on-surface-variant)' }}>
                                        <span>Taxes & Artisan Surcharges</span>
                                        <span className="label-caps text-[10px] opacity-60">Included (12%)</span>
                                    </div>

                                    <div className="pt-4 border-t flex justify-between items-baseline" style={{ borderColor: 'var(--color-outline-variant)' }}>
                                        <div>
                                            <span className="text-sm font-semibold text-black uppercase tracking-wider">
                                                Estimated Total
                                            </span>
                                            <span className="block text-[10px] opacity-60 mt-0.5">
                                                Inclusive of all bespoke artisanal taxes
                                            </span>
                                        </div>
                                        <span className="text-2xl md:text-3xl font-normal text-black tabular-nums tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                                            {formatINR(estimatedTotal)}
                                        </span>
                                    </div>
                                </div>

                                {/* Promo Code Input & Chip */}
                                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-outline-variant)' }}>
                                    <label htmlFor="promo" className="label-caps block mb-2" style={{ fontSize: '10px' }}>
                                        Voucher or Archival Pass
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            id="promo"
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder="ENTER PROMO"
                                            className="w-full border px-3 py-2 text-xs uppercase tracking-wider rounded focus:outline-none"
                                            style={{
                                                background: 'var(--color-surface-container)',
                                                borderColor: 'var(--color-outline-variant)',
                                                color: 'var(--color-on-surface)',
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (promoCode.trim()) {
                                                    setPromoApplied(true);
                                                }
                                            }}
                                            className="btn-dark px-4 py-2 rounded text-[10px]"
                                        >
                                            Apply
                                        </button>
                                    </div>

                                    {/* Applied Voucher Chip */}
                                    {promoApplied && (
                                        <div
                                            className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs"
                                            style={{
                                                background: 'var(--color-surface-container)',
                                                color: 'var(--color-secondary)',
                                                border: '1px solid var(--color-outline-variant)',
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                            <span className="label-caps text-[9px]">{promoCode} Applied (-10%)</span>
                                            <button
                                                type="button"
                                                onClick={() => setPromoApplied(false)}
                                                className="ml-1 cursor-pointer opacity-60 hover:opacity-100"
                                                style={{ background: 'none', border: 'none' }}
                                                aria-label="Remove promo code"
                                            >
                                                <span className="material-symbols-outlined text-[12px]">close</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Checkout CTA */}
                                <div className="mt-8 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => alert("Proceeding to secure atelier checkout...")}
                                        className="w-full btn-dark py-4 px-6 rounded flex items-center justify-center gap-2 group shadow-lg"
                                    >
                                        <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform" style={{ color: 'var(--color-accent)' }}>
                                            lock
                                        </span>
                                        <span>Proceed to Secure Checkout</span>
                                    </button>

                                    {/* Direct Express Checkout */}
                                    <div className="relative py-2 text-center">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" style={{ borderColor: 'var(--color-outline-variant)' }} />
                                        </div>
                                        <span
                                            className="relative px-3 label-caps text-[9px]"
                                            style={{ background: 'var(--color-surface)' }}
                                        >
                                            Direct Express Checkout
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => alert("Initiating Apple Pay...")}
                                            className="flex items-center justify-center gap-1.5 py-2.5 border rounded cursor-pointer transition-colors text-xs font-medium"
                                            style={{
                                                borderColor: 'var(--color-outline-variant)',
                                                background: 'var(--color-surface)',
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">phone_iphone</span>
                                            <span>Apple Pay</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => alert("Initiating UPI Direct...")}
                                            className="flex items-center justify-center gap-1.5 py-2.5 border rounded cursor-pointer transition-colors text-xs font-medium"
                                            style={{
                                                borderColor: 'var(--color-outline-variant)',
                                                background: 'var(--color-surface)',
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                                            <span>UPI Direct</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Trust & Security Badges */}
                                <div className="mt-8 pt-6 border-t space-y-3 text-xs" style={{ borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
                                    <div className="flex items-center gap-2.5">
                                        <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--color-secondary)' }}>verified</span>
                                        <span>Authentic Atelier Guarantee & Certified Hallmark</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--color-secondary)' }}>cached</span>
                                        <span>7-Day Seamless Doorstep Returns & Exchange</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--color-secondary)' }}>eco</span>
                                        <span>Complimentary Climate-Neutral White Glove Delivery</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--color-secondary)' }}>shield</span>
                                        <span>End-to-End 256-Bit Encrypted Concierge Payment</span>
                                    </div>
                                </div>
                            </div>

                            {/* Concierge Sizing Helpline Box */}
                            <div
                                className="p-5 rounded border flex items-center justify-between"
                                style={{
                                    background: 'var(--color-surface-container)',
                                    borderColor: 'var(--color-outline-variant)',
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--color-secondary)' }}>
                                        support_agent
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold text-black">Atelier Sizing Assistance</p>
                                        <p className="text-[11px]" style={{ color: 'var(--color-on-surface-variant)' }}>
                                            Consult our senior master cutter
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href="#concierge"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        alert("Connecting to Atelier Senior Master Cutter...");
                                    }}
                                    className="label-caps text-[10px] underline hover:text-black transition-colors"
                                    style={{ color: 'var(--color-secondary)' }}
                                >
                                    Speak Now
                                </a>
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Cart;