import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ─── Color Swatch Palette ──────────────────────────────────────────
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

// ─── Fallback Curated Garments (Editorial Lookbook Defaults) ─────────
const FALLBACK_ITEMS = [
    {
        id: "item-1",
        title: "Double-Faced Cashmere Overshirt",
        subtitle: "Atelier Edition 04 • Hand-hemmed with horn button closures",
        hue: "Terracotta",
        size: "L",
        sku: "SN-CSH-8821",
        quantity: 1,
        price: 12490,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-bZp7qHnyxJE2LiJ_QRzyLsaTPDqvdzpKDzhjSe666RMChwhDuuSH0tj8RmYaokxMpXz6CPjxmqbhQQ7rECrhSonGYdiQ-8mXNuxnel9yQ7WxtaUUNQ75EKG_WpV-GENzJxAkxFhnsRybw7dB0rT3ZN7ZD91znL5UPH-YrbX6613iZJg2c8AFeWzJFraiEE1jyIdV6HEEtliZ1SiBZ7D4wktySO5ksJn9LLJfjDurbmp3N9d9wRJu2yObakmGbsMakRi9naLhJb8e",
        badge: "Limited Edition",
        hallmark: "Master Artisan Hallmarked",
        extra: "Complimentary Hemming Included",
    },
    {
        id: "item-2",
        title: "Pleated Belgian Linen Trousers",
        subtitle: "Continuous waistband with side adjusters and deep forward pleats",
        hue: "Sandstone Ivory",
        size: "32",
        sku: "SN-LIN-0412",
        quantity: 1,
        price: 7850,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmsE9nX5hNpLJ-GieA-mxhan4y_gdJLqpbE0zvY5njdehIJtLvlE7-aUBO_uDUBiRdi1k6mzmOhXZY6FGeHyzTBbXpXwYli07688171SLKWKvxVAIY_2hT1ATby_jij0_YoFX7ypzCAHVIaRgmCTcqN0eJj3sQxVwDBwJutft4yX_k663q0Yy-tvSjbwuj5uNEAME1eVWBT0RB7Tp3sSHUlDMVTicD_07mzB-VvJoO7Q1EwevMZUJGCWBBBPDQ0T7tFIQn7keI-Dzn",
        hallmark: "Raw Flax Sourced from Flanders",
        extra: "Inseam: 32\" (Finished)",
    },
    {
        id: "item-3",
        title: "Heavyweight Pima Silk Knit Polo",
        subtitle: "70% Peruvian Pima cotton blended with 30% Mulberry silk",
        hue: "Midnight Espresso",
        size: "M",
        sku: "SN-PK-9102",
        quantity: 1,
        price: 6200,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqs3HWBkJ5_eHjNVWQdm5PPS54X7mJDv2LidOKXknmiHrgZj68jqHAhu45jsZCVI8R55FwGAHfRqyFmCKIt537_yMiPEhoBnCNuXb8mnjdXwzNXAQZsiEQQ75nf-inUykraYfDD_ejMaB38ycocHcMnd2CnmEvqqGHNek1A0OuFZ1fct6Za69hXCRhbHAoz8JCRe888lGwdVJ07MM76nSbkLmUNBRyNIvKbJMcXq6ZP3Y7dTMsaja_jwdvp5bK5cFGtYR7rh1HTeFk",
        hallmark: "Mother-of-Pearl Buttoning",
        extra: "Pre-Shrunk Cold Finish",
    },
];

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);

    const user = useSelector((state) => state.auth?.user);
    const reduxCart = useSelector((state) => state.cart);

    // Extract query parameters if redirected from Razorpay handler
    const queryParams = new URLSearchParams(location.search);
    const orderIdFromQuery = queryParams.get("order_id");

    // Passed state from Cart or checkout flow
    const passedCartItems = location.state?.cartItems || (reduxCart?.items?.length ? reduxCart.items : null);
    const passedTotalPrice = location.state?.totalPrice ?? (reduxCart?.totalPrice || null);
    const currency = location.state?.currency || reduxCart?.currency || "INR";

    // Dynamic or generated order metadata
    const orderId = orderIdFromQuery || location.state?.orderId || "SN-89421-DEL";
    const orderDate = location.state?.orderDate || "October 24, 2026 • 16:42 IST";
    const deliveryWindow = "October 28 – 30, 2026";
    const paymentMethod = location.state?.paymentMethod || (orderIdFromQuery ? "Razorpay Luxury Gateway" : "Sovereign UPI / Encrypted");
    const paymentRef = location.state?.paymentRef || (orderIdFromQuery ? `#RZP-${orderIdFromQuery.slice(-6)}` : "#UPI-SN-998242");

    // Format currency helper
    const formatINR = (val) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(val || 0);

    // Compute display items: normalize passed cart items or use Stitch fallback items
    const displayItems = (passedCartItems && passedCartItems.length > 0)
        ? passedCartItems.map((item, index) => {
            const product = typeof item.product === 'object' ? item.product : null;
            const variant = typeof item.variant === 'object' ? item.variant : null;
            const variantAttrs = getAttributesObject(variant?.attributes);
            const color = variantAttrs.color || variantAttrs.Color || '';
            const size = variantAttrs.size || variantAttrs.Size || '';
            const unitPrice = item.price?.amount ?? variant?.price?.amount ?? product?.price?.amount ?? 0;
            const qty = item.quantity || 1;
            const key = item._id || `${product?._id || 'prod'}-${variant?._id || index}`;

            return {
                id: key,
                title: product?.title || "Bespoke Atelier Garment",
                subtitle: product?.description?.slice(0, 70) || "Hand-tailored master cut with archival artisanal finish",
                hue: color || "Archival Hue",
                size: size || "Bespoke Cut",
                sku: `SN-${String(key).slice(0, 6).toUpperCase()}`,
                quantity: qty,
                price: unitPrice,
                total: unitPrice * qty,
                image: variant?.images?.[0]?.url || product?.images?.[0]?.url || "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=400&q=80",
                badge: index === 0 ? "Curated Choice" : null,
                hallmark: "Master Artisan Hallmarked",
                extra: "Taxes & Duties Included",
            };
        })
        : FALLBACK_ITEMS.map((item) => ({ ...item, total: item.price * item.quantity }));

    // Financial totals
    const computedSubtotal = displayItems.reduce((acc, item) => acc + (item.total || item.price * item.quantity), 0);
    const finalTotal = passedTotalPrice ?? computedSubtotal;

    // Handle Invoice Print
    const handleDownloadInvoice = () => {
        window.print();
    };

    return (
        <div style={{ background: '#fcf9f4', color: '#1c1c19', minHeight: '100dvh' }}>
            {/* ── Top Announcement / Concierge Banner ── */}
            <aside
                className="py-2.5 px-6 border-b text-center relative z-20"
                style={{
                    background: '#f6f3ee',
                    borderColor: '#cfc5bd',
                }}
            >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-[#4c4640] gap-2">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#725a3c' }}></span>
                        <span>Archival Release: Complimentary express courier & bespoke signature presentation on orders above ₹15,000</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <span className="flex items-center gap-1 font-semibold tracking-widest text-[10px] uppercase">
                            <span className="material-symbols-outlined text-[14px]">call</span> Atelier Concierge: +91 11 4982 0000
                        </span>
                        <span className="opacity-40">|</span>
                        <span className="font-semibold tracking-widest text-[10px] uppercase" style={{ color: '#725a3c' }}>
                            Curated in New Delhi
                        </span>
                    </div>
                </div>
            </aside>

            {/* ── Top Navigation Bar ── */}
            <header
                className="sticky top-0 z-40 transition-all border-b"
                style={{
                    background: 'rgba(252, 249, 244, 0.95)',
                    backdropFilter: 'blur(12px)',
                    borderColor: '#cfc5bd',
                }}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12 h-18 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="no-underline tracking-widest uppercase font-semibold text-lg md:text-xl"
                            style={{ fontFamily: 'var(--font-serif, "EB Garamond", serif)', color: '#1c1c19' }}
                        >
                            Souled Store Atelier
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-wider font-medium text-[#4c4640]">
                        <Link to="/" className="no-underline hover:text-black transition-colors" style={{ color: 'inherit' }}>
                            Collections
                        </Link>
                        <Link to="/" className="no-underline hover:text-black transition-colors" style={{ color: 'inherit' }}>
                            Monographs
                        </Link>
                        <Link to="/" className="no-underline hover:text-black transition-colors" style={{ color: 'inherit' }}>
                            Archives
                        </Link>
                        <Link to="/" className="no-underline hover:text-black transition-colors" style={{ color: 'inherit' }}>
                            Bespoke
                        </Link>
                    </nav>

                    {/* Trailing Controls */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold no-underline hover:opacity-80 transition-opacity"
                            style={{ color: '#725a3c' }}
                        >
                            <span>Continue Shopping</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── Main Workspace ── */}
            <main className="max-w-[1240px] mx-auto px-6 md:px-12 py-10 md:py-16">
                {/* ── Hero Confirmation Header ── */}
                <section className="border-b pb-12 mb-12" style={{ borderColor: '#cfc5bd' }}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                        <div>
                            {/* Archival Pill Badge */}
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold tracking-widest uppercase mb-4"
                                style={{
                                    background: 'rgba(255, 221, 182, 0.4)',
                                    border: '1px solid #725a3c',
                                    color: '#725a3c',
                                }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#725a3c' }}></span>
                                <span>ACQUISITION CONFIRMED • ARCHIVE RECORD #{orderId}</span>
                            </div>

                            <h1
                                className="text-3xl md:text-5xl font-normal tracking-tight"
                                style={{ fontFamily: 'var(--font-serif, "EB Garamond", serif)', color: '#000000' }}
                            >
                                Your Sartorial Order Is Confirmed
                            </h1>
                        </div>

                        {/* Invoice PDF CTA */}
                        <button
                            type="button"
                            onClick={handleDownloadInvoice}
                            className="inline-flex items-center gap-2 self-start md:self-auto px-4 py-2.5 rounded border text-xs uppercase tracking-wider font-semibold cursor-pointer transition-all hover:shadow-sm"
                            style={{
                                background: '#ffffff',
                                borderColor: '#cfc5bd',
                                color: '#1c1c19',
                            }}
                        >
                            <span className="material-symbols-outlined text-base" style={{ color: '#725a3c' }}>
                                download
                            </span>
                            <span>Download Archival Invoice</span>
                        </button>
                    </div>

                    <p
                        className="text-base md:text-lg italic font-normal max-w-3xl mb-8"
                        style={{ color: '#4c4640', fontFamily: 'var(--font-serif, "EB Garamond", serif)' }}
                    >
                        "Garments tailored with archival reverence are now being prepared by our master cutters in the New Delhi atelier."
                    </p>

                    {/* Metadata Ledger Ribbon */}
                    <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-6 border-t text-xs"
                        style={{ borderColor: 'rgba(207, 197, 189, 0.4)', color: '#4c4640' }}
                    >
                        <div>
                            <span className="block uppercase tracking-widest text-[10px] text-stone-500 mb-1">
                                Time of Acquisition
                            </span>
                            <span className="text-black font-medium">{orderDate}</span>
                        </div>
                        <div>
                            <span className="block uppercase tracking-widest text-[10px] text-stone-500 mb-1">
                                Estimated Courier Delivery
                            </span>
                            <span className="font-medium" style={{ color: '#725a3c' }}>
                                {deliveryWindow}
                            </span>
                        </div>
                        <div>
                            <span className="block uppercase tracking-widest text-[10px] text-stone-500 mb-1">
                                Settlement Method
                            </span>
                            <span className="text-black font-medium">{paymentMethod}</span>
                        </div>
                        <div>
                            <span className="block uppercase tracking-widest text-[10px] text-stone-500 mb-1">
                                Atelier Protocol
                            </span>
                            <span className="text-black font-medium flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                                Insured Priority Transit
                            </span>
                        </div>
                    </div>
                </section>

                {/* ── Luxury Milestone Delivery Tracker ── */}
                <section
                    className="rounded border p-6 md:p-8 mb-14"
                    style={{
                        background: '#ffffff',
                        borderColor: '#cfc5bd',
                        boxShadow: '0 4px 20px -2px rgba(26,23,20,0.03)',
                    }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-[11px] uppercase tracking-widest font-semibold text-stone-500">
                            Atelier Progression & White-Glove Fulfillment
                        </h2>
                        <span className="text-xs font-medium" style={{ color: '#725a3c' }}>
                            Stage 2 of 5: Active Curation
                        </span>
                    </div>

                    {/* Tracker Stepper Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                        {/* Step 1: Confirmed */}
                        <div className="flex flex-col relative">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold">
                                    <span className="material-symbols-outlined text-base">check</span>
                                </div>
                                <div className="hidden md:block flex-1 h-[1px] bg-black"></div>
                            </div>
                            <span className="font-semibold text-sm text-black">Order Confirmed</span>
                            <span className="text-xs text-stone-500 mt-0.5">{orderDate.split('•')[0] || "Today"}</span>
                            <span className="text-[11px] text-[#4c4640] mt-2">Archival entry logged</span>
                        </div>

                        {/* Step 2: In Atelier (Active) */}
                        <div className="flex flex-col relative">
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                                    style={{
                                        border: '2px solid #725a3c',
                                        background: '#ffffff',
                                        color: '#725a3c',
                                        boxShadow: '0 0 0 4px rgba(114, 90, 60, 0.15)',
                                    }}
                                >
                                    <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#725a3c' }}></span>
                                </div>
                                <div className="hidden md:block flex-1 h-[1px]" style={{ background: 'rgba(207, 197, 189, 0.6)' }}></div>
                            </div>
                            <span className="font-semibold text-sm" style={{ color: '#725a3c' }}>Curated in Atelier</span>
                            <span className="text-xs font-medium mt-0.5" style={{ color: '#725a3c' }}>In Progress</span>
                            <span className="text-[11px] text-[#4c4640] mt-2">Master cutters allocating fabric bolts</span>
                        </div>

                        {/* Step 3: Packaging */}
                        <div className="flex flex-col relative opacity-60">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full border border-stone-300 bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-medium">
                                    3
                                </div>
                                <div className="hidden md:block flex-1 h-[1px]" style={{ background: 'rgba(207, 197, 189, 0.6)' }}></div>
                            </div>
                            <span className="font-semibold text-sm text-black">Hand-Packaged</span>
                            <span className="text-xs text-stone-500 mt-0.5">Scheduled</span>
                            <span className="text-[11px] text-stone-500 mt-2">Cedar sachet & archival tissue</span>
                        </div>

                        {/* Step 4: Transit */}
                        <div className="flex flex-col relative opacity-60">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full border border-stone-300 bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-medium">
                                    4
                                </div>
                                <div className="hidden md:block flex-1 h-[1px]" style={{ background: 'rgba(207, 197, 189, 0.6)' }}></div>
                            </div>
                            <span className="font-semibold text-sm text-black">White-Glove Transit</span>
                            <span className="text-xs text-stone-500 mt-0.5">Airways Courier</span>
                            <span className="text-[11px] text-stone-500 mt-2">Sovereign express route</span>
                        </div>

                        {/* Step 5: Delivered */}
                        <div className="flex flex-col relative opacity-60">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full border border-stone-300 bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-medium">
                                    5
                                </div>
                            </div>
                            <span className="font-semibold text-sm text-black">Delivered</span>
                            <span className="text-xs text-stone-500 mt-0.5">{deliveryWindow}</span>
                            <span className="text-[11px] text-stone-500 mt-2">Signature required upon arrival</span>
                        </div>
                    </div>
                </section>

                {/* ── Two-Column Architectural Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* ── LEFT COLUMN: 7 Columns (Garments & Packaging) ── */}
                    <section className="lg:col-span-7 space-y-8">
                        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#cfc5bd' }}>
                            <h2 className="text-xs uppercase tracking-widest font-semibold text-black">
                                CURATED SELECTIONS ({displayItems.length} {displayItems.length === 1 ? 'ITEM' : 'ITEMS'})
                            </h2>
                            <span className="text-xs text-stone-500">Consignment Registry #1</span>
                        </div>

                        {/* Garment Cards */}
                        <div className="space-y-4">
                            {displayItems.map((item) => (
                                <article
                                    key={item.id}
                                    className="p-5 md:p-6 rounded border transition-all hover:shadow-[0_8px_24px_-4px_rgba(26,23,20,0.06)]"
                                    style={{
                                        background: '#ffffff',
                                        borderColor: '#cfc5bd',
                                    }}
                                >
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Image */}
                                        <div
                                            className="w-full sm:w-28 sm:h-36 h-48 rounded overflow-hidden flex-shrink-0 relative border"
                                            style={{ borderColor: 'rgba(207, 197, 189, 0.4)' }}
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                                            />
                                            {item.badge && (
                                                <div className="absolute top-2 left-2 bg-black text-white text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wider font-semibold">
                                                    {item.badge}
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3
                                                        className="text-lg md:text-xl font-normal leading-snug"
                                                        style={{ fontFamily: 'var(--font-serif, "EB Garamond", serif)' }}
                                                    >
                                                        {item.title}
                                                    </h3>
                                                    <span className="font-semibold text-base md:text-lg text-black tabular-nums">
                                                        {formatINR(item.total || item.price * item.quantity)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-stone-500 mb-3">{item.subtitle}</p>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#4c4640]">
                                                    {item.hue && (
                                                        <span className="flex items-center gap-1.5">
                                                            <strong className="font-normal text-stone-500">Hue:</strong>
                                                            <span
                                                                className="w-2.5 h-2.5 rounded-full inline-block border border-black/10"
                                                                style={{ backgroundColor: getColorHex(item.hue) }}
                                                            />
                                                            <strong className="text-black font-medium">{item.hue}</strong>
                                                        </span>
                                                    )}
                                                    {item.size && (
                                                        <>
                                                            <span className="opacity-40">•</span>
                                                            <span>
                                                                <strong className="font-normal text-stone-500">Size:</strong>{" "}
                                                                <strong className="text-black font-medium">{item.size}</strong>
                                                            </span>
                                                        </>
                                                    )}
                                                    <span className="opacity-40">•</span>
                                                    <span>
                                                        <strong className="font-normal text-stone-500">SKU:</strong>{" "}
                                                        <span className="font-mono text-[10px]">{item.sku}</span>
                                                    </span>
                                                    <span className="opacity-40">•</span>
                                                    <span>
                                                        <strong className="font-normal text-stone-500">Qty:</strong>{" "}
                                                        <strong className="text-black font-medium">{item.quantity}</strong>
                                                    </span>
                                                </div>
                                            </div>

                                            <div
                                                className="mt-4 pt-3 border-t flex items-center justify-between text-xs"
                                                style={{ borderColor: 'rgba(207, 197, 189, 0.4)' }}
                                            >
                                                <span
                                                    className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold"
                                                    style={{ color: '#725a3c' }}
                                                >
                                                    <span className="material-symbols-outlined text-sm">verified</span>
                                                    <span>{item.hallmark || "Master Artisan Hallmarked"}</span>
                                                </span>
                                                <span className="text-[11px] text-stone-500">{item.extra || "Complimentary Atelier Finishing"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Archival Preservation Coffret Card */}
                        <div
                            className="rounded border p-6 relative overflow-hidden"
                            style={{
                                background: '#f6f3ee',
                                borderColor: '#cfc5bd',
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: 'rgba(255, 221, 182, 0.5)',
                                        border: '1px solid #725a3c',
                                        color: '#725a3c',
                                    }}
                                >
                                    <span className="material-symbols-outlined text-xl">inventory_2</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h4
                                            className="text-lg font-normal"
                                            style={{ fontFamily: 'var(--font-serif, "EB Garamond", serif)' }}
                                        >
                                            Archival Preservation Coffret Included
                                        </h4>
                                        <span
                                            className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded"
                                            style={{
                                                background: 'rgba(114, 90, 60, 0.12)',
                                                color: '#725a3c',
                                                border: '1px solid rgba(114, 90, 60, 0.3)',
                                            }}
                                        >
                                            Complimentary
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#4c4640] leading-relaxed">
                                        Your consignment is packed within our signature solid beechwood presentation coffret, lined with acid-free Japanese archival paper, cedarwood moth repellents, and bespoke heavy-gauge garment dust covers.
                                    </p>
                                    <div className="pt-2 flex items-center gap-2 text-stone-500 text-[11px] tracking-wider uppercase font-medium">
                                        <span className="material-symbols-outlined text-base" style={{ color: '#725a3c' }}>
                                            edit_note
                                        </span>
                                        <span>Personal Calligraphy Gift Card: "Crafted for Atelier Patron"</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── RIGHT COLUMN: 5 Columns (Financial Ledger & Manifest) ── */}
                    <section className="lg:col-span-5 space-y-8">
                        {/* Financial Settlement Ledger */}
                        <div
                            className="rounded border p-6 md:p-8"
                            style={{
                                background: '#ffffff',
                                borderColor: '#cfc5bd',
                                boxShadow: '0 4px 24px -4px rgba(26,23,20,0.04)',
                            }}
                        >
                            <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: '#cfc5bd' }}>
                                <h3 className="text-xs uppercase tracking-widest font-semibold text-black">
                                    FINANCIAL LEDGER & SETTLEMENT
                                </h3>
                                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                                    {currency} • ₹
                                </span>
                            </div>

                            <div className="space-y-3.5 text-xs md:text-sm">
                                <div className="flex justify-between items-center text-[#4c4640]">
                                    <span>Item Subtotal ({displayItems.length} {displayItems.length === 1 ? 'garment' : 'garments'})</span>
                                    <span className="font-medium text-black tabular-nums">{formatINR(computedSubtotal)}</span>
                                </div>

                                <div className="flex justify-between items-center" style={{ color: '#725a3c' }}>
                                    <span className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-base">stars</span>
                                        <span>Atelier Patron Privilege</span>
                                    </span>
                                    <span className="font-semibold tabular-nums">Applied</span>
                                </div>

                                <div className="flex justify-between items-center text-[#4c4640]">
                                    <span>White-Glove Climate-Neutral Transit</span>
                                    <span className="text-[11px] font-semibold uppercase text-emerald-700 tracking-wider">
                                        COMPLIMENTARY
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-stone-500 text-xs">
                                    <span>Taxes & Artisan Surcharges (GST)</span>
                                    <span>Included</span>
                                </div>

                                <div className="border-t pt-4 mt-4" style={{ borderColor: '#cfc5bd' }}>
                                    <div className="flex justify-between items-baseline">
                                        <div>
                                            <span className="block text-xs uppercase tracking-widest font-semibold text-black">
                                                Total Settled
                                            </span>
                                            <span className="block text-[10px] text-stone-500 mt-0.5">
                                                Inclusive of all bespoke artisanal taxes
                                            </span>
                                        </div>
                                        <span
                                            className="text-2xl md:text-3xl font-normal text-black tabular-nums tracking-tight"
                                            style={{ fontFamily: 'var(--font-serif, "EB Garamond", serif)' }}
                                        >
                                            {formatINR(finalTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Verification Pill */}
                            <div
                                className="mt-6 p-3 rounded flex items-center justify-between text-xs"
                                style={{
                                    background: '#f6f3ee',
                                    border: '1px solid #cfc5bd',
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base" style={{ color: '#725a3c' }}>
                                        verified_user
                                    </span>
                                    <span className="text-black font-medium">{paymentMethod} • Settled</span>
                                </div>
                                <span className="font-mono text-[10px] text-stone-500 uppercase">{paymentRef}</span>
                            </div>
                        </div>

                        {/* Dispatch Manifest & Destination */}
                        <div
                            className="rounded border p-6 md:p-8"
                            style={{
                                background: '#ffffff',
                                borderColor: '#cfc5bd',
                                boxShadow: '0 4px 24px -4px rgba(26,23,20,0.04)',
                            }}
                        >
                            <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: '#cfc5bd' }}>
                                <h3 className="text-xs uppercase tracking-widest font-semibold text-black">
                                    DISPATCH MANIFEST & DESTINATION
                                </h3>
                                <span className="material-symbols-outlined text-lg text-stone-400">local_shipping</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="block text-[10px] uppercase tracking-widest text-stone-500 mb-1">
                                        Patron Delivery Address
                                    </span>
                                    <p className="font-semibold text-sm text-black">
                                        {user?.fullName || location.state?.address?.name || "Patron Singhania"}
                                    </p>
                                    {user?.email && (
                                        <p className="text-[11px] text-stone-500 mb-1">
                                            {user.email} {user?.contact ? `• ${user.contact}` : ""}
                                        </p>
                                    )}
                                    <p className="text-xs text-[#4c4640] leading-relaxed mt-0.5">
                                        {location.state?.address?.line1 || "Penthouse 4B, The Magnolias"}<br />
                                        {location.state?.address?.line2 || "Golf Course Road, DLF Phase 5"}<br />
                                        {location.state?.address?.city || "Gurugram, Haryana 122002"}
                                    </p>
                                </div>

                                <div className="pt-3 border-t" style={{ borderColor: 'rgba(207, 197, 189, 0.4)' }}>
                                    <span className="block text-[10px] uppercase tracking-widest text-stone-500 mb-1">
                                        Assigned Carrier & Waybill
                                    </span>
                                    <p className="text-xs font-medium text-black">Sovereign Express White-Glove Courier</p>
                                    <p className="text-[11px] text-stone-500 font-mono mt-0.5">Airways AWB #SV-991204-DEL</p>
                                </div>

                                <div className="pt-3 border-t" style={{ borderColor: 'rgba(207, 197, 189, 0.4)' }}>
                                    <span className="block text-[10px] uppercase tracking-widest text-stone-500 mb-1">
                                        Patron Protocol Notes
                                    </span>
                                    <p
                                        className="text-xs text-[#4c4640] p-3 rounded leading-relaxed italic"
                                        style={{ background: '#f6f3ee', border: '1px solid rgba(207, 197, 189, 0.5)' }}
                                    >
                                        “Call ahead 30 minutes before arrival. Direct concierge clearance at gate. Require physical recipient signature.”
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons Cluster */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => setTrackingModalOpen(true)}
                                className="w-full btn-dark py-3.5 px-6 rounded text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 group transition-all"
                            >
                                <span>Track White-Glove Dispatch</span>
                                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                                    arrow_forward
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadInvoice}
                                className="w-full py-3 px-6 rounded text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 border cursor-pointer hover:border-black transition-colors"
                                style={{
                                    background: '#ffffff',
                                    borderColor: '#cfc5bd',
                                    color: '#1c1c19',
                                }}
                            >
                                <span className="material-symbols-outlined text-base">description</span>
                                <span>Download Formal Tax Invoice (PDF)</span>
                            </button>

                            <div className="text-center pt-2">
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest font-semibold hover:underline"
                                    style={{ color: '#725a3c' }}
                                >
                                    <span>Continue Exploring Atelier Silhouette</span>
                                    <span className="material-symbols-outlined text-xs">north_east</span>
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ── Concierge Liaison Banner ── */}
                <section
                    className="mt-14 rounded border p-6 md:p-8"
                    style={{
                        background: '#ebe8e3',
                        borderColor: '#cfc5bd',
                    }}
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid #cfc5bd',
                                    color: '#1c1c19',
                                }}
                            >
                                <span className="material-symbols-outlined text-2xl">support_agent</span>
                            </div>
                            <div>
                                <h3
                                    className="text-lg font-normal text-black"
                                    style={{ fontFamily: 'var(--font-serif, "EB Garamond", serif)' }}
                                >
                                    Dedicated Atelier Liaison Available
                                </h3>
                                <p className="text-xs text-[#4c4640] mt-0.5">
                                    For immediate size adjustments, bespoke monogramming requests, or delivery date amendments prior to cutting.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => alert("Connecting to Atelier Client Concierge via WhatsApp (+91 11 4982 0000)...")}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold cursor-pointer border transition-colors hover:border-black"
                                style={{
                                    background: '#ffffff',
                                    borderColor: '#cfc5bd',
                                    color: '#1c1c19',
                                }}
                            >
                                <span className="material-symbols-outlined text-base text-emerald-700">chat</span>
                                <span>WhatsApp Liaison</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => alert("Initiating priority line call to Master Cutter...")}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold cursor-pointer border transition-colors hover:border-black"
                                style={{
                                    background: '#ffffff',
                                    borderColor: '#cfc5bd',
                                    color: '#1c1c19',
                                }}
                            >
                                <span className="material-symbols-outlined text-base">call</span>
                                <span>Private Line</span>
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Tracking Dispatch Modal ── */}
            {trackingModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setTrackingModalOpen(false)}
                >
                    <div
                        className="bg-white rounded border max-w-lg w-full p-6 sm:p-8 relative"
                        style={{ borderColor: '#cfc5bd' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setTrackingModalOpen(false)}
                            className="absolute top-4 right-4 p-1 rounded hover:bg-stone-100 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>

                        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-stone-500 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                            <span>Live Dispatch Waybill</span>
                        </div>

                        <h3
                            className="text-2xl font-normal mb-1"
                            style={{ fontFamily: 'var(--font-serif, "EB Garamond", serif)' }}
                        >
                            Sovereign Express Air AWB
                        </h3>
                        <p className="text-xs text-stone-500 font-mono mb-6">#SV-991204-DEL • Insured Transit</p>

                        <div className="space-y-4 border-l-2 border-black ml-2 pl-4 text-xs">
                            <div>
                                <span className="font-semibold text-black block">Archival Order Logged</span>
                                <span className="text-stone-500 text-[11px]">{orderDate} • New Delhi Atelier</span>
                            </div>
                            <div>
                                <span className="font-semibold text-[#725a3c] block">Fabric Allocation & Pattern Cutting</span>
                                <span className="text-stone-500 text-[11px]">Currently in progress with Master Cutter</span>
                            </div>
                            <div className="opacity-50">
                                <span className="font-medium text-stone-600 block">Cedar Coffret Packaging</span>
                                <span className="text-stone-400 text-[11px]">Scheduled prior to dispatch</span>
                            </div>
                            <div className="opacity-50">
                                <span className="font-medium text-stone-600 block">White-Glove Doorstep Delivery</span>
                                <span className="text-stone-400 text-[11px]">Expected arrival: {deliveryWindow}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t flex justify-end" style={{ borderColor: '#cfc5bd' }}>
                            <button
                                type="button"
                                onClick={() => setTrackingModalOpen(false)}
                                className="btn-dark px-6 py-2 rounded text-xs uppercase tracking-wider"
                            >
                                Close Manifest
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Editorial Footer ── */}
            <footer className="border-t py-10 px-6 md:px-12 mt-16" style={{ background: '#f6f3ee', borderColor: '#cfc5bd' }}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#4c4640]">
                    <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                        <span
                            className="uppercase tracking-widest font-semibold text-black"
                            style={{ fontFamily: 'var(--font-serif, "EB Garamond", serif)' }}
                        >
                            Souled Store Atelier
                        </span>
                        <span className="hidden sm:inline text-stone-400">•</span>
                        <p className="text-[11px] text-stone-500">
                            © {new Date().getFullYear()} SOULED STORE ATELIER. ARCHIVAL RESTRAINT & CRAFT.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 uppercase text-[10px] tracking-widest">
                        <Link to="/" className="no-underline hover:text-black transition-colors" style={{ color: 'inherit' }}>
                            Client Care
                        </Link>
                        <Link to="/" className="no-underline hover:text-black transition-colors" style={{ color: 'inherit' }}>
                            Appointments
                        </Link>
                        <Link to="/" className="no-underline hover:text-black transition-colors" style={{ color: 'inherit' }}>
                            Shipping & Customs
                        </Link>
                        <Link to="/" className="no-underline hover:text-black transition-colors" style={{ color: 'inherit' }}>
                            Discretion & Privacy
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default OrderSuccess;
