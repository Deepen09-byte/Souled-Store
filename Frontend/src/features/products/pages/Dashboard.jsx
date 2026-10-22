import React, { useEffect, useState } from "react";
import { useProduct } from "../hook/useProducts";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    const { handleGetSellerProducts } = useProduct();
    const sellerProducts = useSelector((state) => state.product.sellerProducts);
    const user = useSelector((state) => state.auth?.user);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            await handleGetSellerProducts();
            setLoading(false);
        }
        fetchProducts();
    }, []);

    const filtered = (sellerProducts || []).filter((p) =>
        p.title?.toLowerCase().includes(search.toLowerCase())
    );

    const totalValue = (sellerProducts || []).reduce(
        (sum, p) => sum + (p.price?.amount || 0),
        0
    );

    const formatINR = (val) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(val);

    return (
        <div style={{ background: "var(--color-background)", minHeight: "100dvh", color: "var(--color-on-surface)" }}>

            {/* ── Announcement Banner ── */}
            <aside
                className="py-2.5 px-6 border-b text-center"
                style={{ background: "var(--color-surface-container-high)", borderColor: "var(--color-outline-variant)" }}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                    <span className="hidden md:inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]" style={{ color: "var(--color-secondary)" }}>workspace_premium</span>
                        Seller Atelier — Manage your curated collection with precision and elegance.
                    </span>
                    <span className="md:hidden mx-auto font-medium">Seller Atelier Dashboard</span>
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/" className="label-caps no-underline text-[10px] hover:opacity-70 transition-opacity" style={{ color: "var(--color-on-surface-variant)" }}>
                            Storefront
                        </Link>
                        <span className="opacity-40">|</span>
                        <span className="label-caps text-[10px]" style={{ color: "var(--color-secondary)" }}>
                            {user?.fullName || "Artisan Seller"}
                        </span>
                    </div>
                </div>
            </aside>

            {/* ── Sticky Header ── */}
            <header
                className="sticky top-0 z-40 border-b transition-all"
                style={{
                    background: "rgba(253,252,250,0.94)",
                    backdropFilter: "blur(12px)",
                    borderColor: "var(--color-outline-variant)",
                }}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="no-underline tracking-widest uppercase font-semibold text-lg md:text-xl"
                            style={{ fontFamily: "var(--font-serif)", color: "var(--color-on-surface)" }}
                        >
                            Souled Store Atelier
                        </Link>
                        <span className="hidden md:flex items-center gap-2 text-xs" style={{ color: "var(--color-outline)" }}>
                            <span>/</span>
                            <span className="label-caps" style={{ color: "var(--color-secondary)" }}>Dashboard</span>
                        </span>
                    </div>

                    <button
                        id="create_product_btn"
                        onClick={() => navigate("/seller/create-product")}
                        className="btn-dark px-5 py-2.5 inline-flex items-center gap-2 rounded"
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span className="hidden sm:inline">Add Product</span>
                    </button>
                </div>
            </header>

            {/* ── Main Content ── */}
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">

                {/* Page Title */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b pb-6 gap-4" style={{ borderColor: "var(--color-outline-variant)" }}>
                    <div>
                        <span className="label-caps block mb-1" style={{ color: "var(--color-secondary)", fontSize: "10px" }}>Seller Portal</span>
                        <h1 className="text-3xl md:text-4xl font-normal tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
                            My Products
                        </h1>
                    </div>
                    <p className="text-xs md:text-sm italic max-w-md" style={{ color: "var(--color-on-surface-variant)", lineHeight: "1.6" }}>
                        "Manage and curate your archival collection with artisan precision."
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                    {[
                        { label: "Total Listings", value: loading ? "—" : (sellerProducts?.length ?? 0), icon: "inventory_2", caption: "Listed pieces" },
                        { label: "Catalogue Value", value: loading ? "—" : formatINR(totalValue), icon: "payments", caption: "Combined price" },
                        { label: "Avg. Price", value: loading ? "—" : (sellerProducts?.length ? formatINR(Math.round(totalValue / sellerProducts.length)) : "₹0"), icon: "analytics", caption: "Per piece" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="p-6 rounded border flex items-center gap-5"
                            style={{ background: "var(--color-surface)", borderColor: "var(--color-outline-variant)", boxShadow: "0 4px 20px -2px rgba(26,23,20,0.03)" }}
                        >
                            <div className="w-11 h-11 rounded flex items-center justify-center shrink-0" style={{ background: "var(--color-surface-container)" }}>
                                <span className="material-symbols-outlined text-[22px]" style={{ color: "var(--color-secondary)" }}>{stat.icon}</span>
                            </div>
                            <div>
                                <p className="label-caps" style={{ color: "var(--color-on-surface-variant)", fontSize: "9px" }}>{stat.label}</p>
                                <p className="text-2xl font-normal mt-0.5" style={{ fontFamily: "var(--font-serif)" }}>{stat.value}</p>
                                <p className="text-[11px] mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>{stat.caption}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search + Count Bar */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative flex-1 max-w-sm">
                        <span
                            className="material-symbols-outlined text-[18px] absolute top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "var(--color-outline)", left: 0 }}
                        >search</span>
                        <input
                            id="search_products"
                            type="text"
                            placeholder="Search products…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="field-underline"
                            style={{ paddingLeft: "28px" }}
                        />
                    </div>
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="label-caps text-[10px] underline"
                            style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer" }}
                        >
                            Clear
                        </button>
                    )}
                    <span className="ml-auto label-caps text-[10px]" style={{ color: "var(--color-on-surface-variant)" }}>
                        {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
                    </span>
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingSkeleton />
                ) : filtered.length === 0 ? (
                    <EmptyState search={search} onAdd={() => navigate("/seller/create-product")} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                        {filtered.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t mt-16" style={{ borderColor: "var(--color-outline-variant)", background: "var(--color-surface)" }}>
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <Link to="/" className="no-underline" style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--color-on-surface)" }}>
                        Souled Store Atelier
                    </Link>
                    <p className="label-caps text-center" style={{ color: "var(--color-outline)", fontSize: "0.625rem" }}>
                        © {new Date().getFullYear()} Souled Store. All rights reserved.
                    </p>
                    <Link to="/" className="label-caps no-underline text-[10px]" style={{ color: "var(--color-on-surface-variant)" }}>
                        Back to Storefront
                    </Link>
                </div>
            </footer>
        </div>
    );
}

/* ─── Product Card ──────────────────────────────────────────────────────── */
function ProductCard({ product }) {
    const coverImage = product.images?.[0]?.url;
    const price = product.price?.amount;
    const currency = product.price?.currency || "INR";
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/seller/product/${product._id}`)}
            className="group cursor-pointer rounded border overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-outline-variant)", boxShadow: "0 2px 12px -2px rgba(26,23,20,0.04)" }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 24px -4px rgba(26,23,20,0.08)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 12px -2px rgba(26,23,20,0.04)"}
        >
            {/* Image */}
            <div className="relative overflow-hidden" style={{ aspectRatio: "3/4", background: "var(--color-surface-container)" }}>
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={product.title}
                        className="w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ color: "var(--color-outline)" }}>
                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'wght' 200" }}>image</span>
                        <span className="label-caps text-[9px]">No image</span>
                    </div>
                )}
                {product.images?.length > 1 && (
                    <span
                        className="absolute bottom-3 right-3 label-caps text-[9px] px-2 py-0.5 rounded"
                        style={{ background: "rgba(253,252,250,0.9)", color: "var(--color-on-surface-variant)", backdropFilter: "blur(4px)" }}
                    >
                        +{product.images.length - 1}
                    </span>
                )}
                <span
                    className="absolute top-3 left-3 label-caps text-[9px] px-2 py-0.5 rounded border"
                    style={{ background: "rgba(253,252,250,0.9)", borderColor: "var(--color-outline-variant)" }}
                >
                    Live
                </span>
            </div>

            {/* Info */}
            <div className="p-4 space-y-1.5">
                <span className="label-caps block" style={{ color: "var(--color-secondary)", fontSize: "9px" }}>Archival Cut</span>
                <h3 className="text-base font-normal leading-snug line-clamp-1" style={{ fontFamily: "var(--font-serif)" }}>
                    {product.title}
                </h3>
                {product.description && (
                    <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                        {product.description}
                    </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--color-outline-variant)" }}>
                    <span className="text-lg font-normal" style={{ fontFamily: "var(--font-serif)" }}>
                        {currency === "INR" ? "₹" : currency}{price?.toLocaleString("en-IN")}
                    </span>
                    <span className="material-symbols-outlined text-[16px]" style={{ color: "var(--color-secondary)", fontVariationSettings: "'wght' 300" }}>
                        arrow_forward
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ─── Loading Skeleton ─────────────────────────────────────────────────── */
function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded border overflow-hidden animate-pulse" style={{ background: "var(--color-surface)", borderColor: "var(--color-outline-variant)" }}>
                    <div style={{ aspectRatio: "3/4", background: "var(--color-surface-container)" }} />
                    <div className="p-4 space-y-2">
                        <div className="h-2 rounded" style={{ background: "var(--color-surface-container)", width: "40%" }} />
                        <div className="h-4 rounded" style={{ background: "var(--color-surface-container)", width: "80%" }} />
                        <div className="h-3 rounded" style={{ background: "var(--color-surface-container)", width: "60%" }} />
                        <div className="h-5 rounded mt-2" style={{ background: "var(--color-surface-container)", width: "35%" }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Empty State ──────────────────────────────────────────────────────── */
function EmptyState({ search, onAdd }) {
    return (
        <div
            className="flex flex-col items-center justify-center py-24 text-center rounded border"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-outline-variant)" }}
        >
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "var(--color-surface-container)" }}>
                <span className="material-symbols-outlined text-3xl" style={{ color: "var(--color-secondary)", fontVariationSettings: "'wght' 200" }}>
                    inventory_2
                </span>
            </div>
            <h2 className="text-2xl md:text-3xl mb-3 font-normal" style={{ fontFamily: "var(--font-serif)" }}>
                {search ? `No results for "${search}"` : "Your Collection is Empty"}
            </h2>
            <p className="text-sm max-w-sm mx-auto mb-8" style={{ color: "var(--color-on-surface-variant)", lineHeight: "1.7" }}>
                {search
                    ? "Try a different search term to find your pieces."
                    : "Begin your archival catalogue by listing your first garment on the Souled Store Atelier."}
            </p>
            {!search && (
                <button
                    id="empty_add_product_btn"
                    onClick={onAdd}
                    className="btn-dark px-8 py-4 inline-flex items-center gap-2 rounded"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add First Product</span>
                </button>
            )}
        </div>
    );
}