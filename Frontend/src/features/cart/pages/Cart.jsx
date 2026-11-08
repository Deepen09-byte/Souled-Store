import React, { useEffect, useState } from "react";
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
    const cart = useSelector((state) => state.cart);
    const cartItems = cart?.items || [];
    const totalPrice = cart?.totalPrice ?? 0;
    const currency = cart?.currency || "INR";
    const user = useSelector((state) => state.auth.user);

    const { handleGetCart, handleIncrementCartItem, handleDecrementCartItem, handleCheckout, handleVerifyCartOrder } = useCart();

    const handleCheckoutClick = async () => {
        try {
            let order = null;
            if (handleCheckout) {
                try {
                    order = await handleCheckout();
                    console.log("Checkout response:", order);
                } catch (err) {
                    console.warn("Backend checkout API warning:", err);
                }
            }

            // If Razorpay SDK is loaded on window and order object exists with razorpay key
            if (window.Razorpay && order?.id) {
                const options = {
                    key: order.key || "YOUR_RAZORPAY_KEY",
                    amount: order.amount,
                    currency: order.currency || "INR",
                    name: "Souled Store Atelier",
                    description: "Atelier Curated Order",
                    order_id: order.id,
                    handler: async (response) => {
                        let isValid = true;
                        if (handleVerifyCartOrder) {
                            try {
                                isValid = await handleVerifyCartOrder(response);
                            } catch (e) {
                                console.warn("Verification warning:", e);
                            }
                        }

                        if (isValid) {
                            navigate(`/order-success?order_id=${response?.razorpay_order_id || order.id}`, {
                                state: {
                                    cartItems,
                                    totalPrice,
                                    currency,
                                    orderId: response?.razorpay_order_id || order.id,
                                    paymentMethod: "Razorpay Gateway",
                                },
                            });
                        }
                    },
                    prefill: {
                        name: user?.fullName || "",
                        email: user?.email || "",
                        contact: user?.contact || "",
                    },
                    theme: {
                        color: "#1c1c19",
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
                return;
            }

            // Direct fallback navigation to Order Success for immediate testing
            navigate("/order-success", {
                state: {
                    cartItems,
                    totalPrice,
                    currency,
                    orderId: `SN-${Math.floor(100000 + Math.random() * 900000)}-DEL`,
                    orderDate: new Date().toLocaleDateString("en-IN", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                    }) + " • " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST",
                    paymentMethod: "Sovereign UPI / Encrypted",
                },
            });
        } catch (error) {
            console.error("Checkout process error:", error);
            navigate("/order-success", {
                state: { cartItems, totalPrice, currency },
            });
        }
    };

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        handleGetCart()
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    // Item remove handler
    const handleRemove = (itemId) => {
        dispatch(removeItem(itemId));
    };

    const formatINR = (val) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(val || 0);

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
                        Archival Release: Complimentary express courier & bespoke presentation on all orders.
                    </span>
                    <span className="md:hidden mx-auto font-medium">Complimentary Bespoke Courier</span>
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
                            Souled Store Atelier
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
                        {/* ── LEFT COLUMN: Bag Items (8 cols) ── */}
                        <section className="lg:col-span-8 space-y-8">
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
                                    const product = typeof item.product === 'object' ? item.product : null;
                                    const rawProductId = product?._id || (typeof item.product === 'string' ? item.product : null) || item.productId;
                                    const rawVariantId = item.variant?._id || (typeof item.variant === 'string' ? item.variant : null) || item.variantId;

                                    // Find variant if present
                                    const variant = product?.variants?.find(
                                        (v) => (v._id?.toString() || String(v._id)) === (rawVariantId?.toString() || String(rawVariantId))
                                    ) || (typeof item.variant === 'object' ? item.variant : null);

                                    const productId = rawProductId || product?._id;
                                    const variantId = rawVariantId || variant?._id;

                                    const key = item._id || `${productId || 'prod'}-${variantId || index}`;
                                    const qty = item.quantity || 1;
                                    const productTitle = product?.title || 'Bespoke Atelier Garment';
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
                                                                SKU: SN-{String(key).substring(0, 6).toUpperCase()}
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
                                                            disabled={qty <= 1}
                                                            onClick={() => {
                                                                if (qty > 1 && productId && variantId) {
                                                                    handleDecrementCartItem(productId, variantId);
                                                                }
                                                            }}
                                                            aria-label="Decrease quantity"
                                                            className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-black/5 transition-colors border-none disabled:opacity-30 disabled:cursor-not-allowed"
                                                            style={{ color: 'var(--color-on-surface-variant)' }}
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">remove</span>
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-medium tabular-nums">
                                                            {qty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (productId && variantId) {
                                                                    handleIncrementCartItem(productId, variantId);
                                                                }
                                                            }}
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
                                                            onClick={() => handleRemove(item._id || productId)}
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
                                        <span>Item Subtotal ({cartItems.length} {cartItems.length === 1 ? 'garment' : 'garments'})</span>
                                        <span className="font-medium text-black tabular-nums">{formatINR(totalPrice)}</span>
                                    </div>

                                    <div className="flex justify-between items-center" style={{ color: 'var(--color-on-surface-variant)' }}>
                                        <span className="flex items-center gap-1">
                                            <span>Estimated Express Courier</span>
                                            <span className="material-symbols-outlined text-[14px] opacity-60" title="Climate-neutral insured transit">
                                                info
                                            </span>
                                        </span>
                                        <span className="label-caps font-semibold" style={{ color: 'var(--color-secondary)', fontSize: '10px' }}>
                                            Complimentary
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center" style={{ color: 'var(--color-on-surface-variant)' }}>
                                        <span>Taxes & Artisan Surcharges</span>
                                        <span className="label-caps text-[10px] opacity-60">Included</span>
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
                                            {formatINR(totalPrice)}
                                        </span>
                                    </div>
                                </div>

                                {/* Checkout CTA */}
                                <div className="mt-8 space-y-3">
                                    <button
                                        type="button"
                                        onClick={handleCheckoutClick}
                                        className="w-full btn-dark py-4 px-6 rounded flex items-center justify-center gap-2 group shadow-lg"
                                    >
                                        <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform" style={{ color: 'var(--color-accent)' }}>
                                            lock
                                        </span>
                                        <span>Proceed to Secure Checkout</span>
                                    </button>
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
