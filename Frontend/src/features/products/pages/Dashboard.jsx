import React, { useEffect, useState } from "react";
import { useProduct } from "../hook/useProducts";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    const { handleGetSellerProducts } = useProduct();
    const sellerProducts = useSelector((state) => state.product.sellerProducts);
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

    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased">

            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 text-lg tracking-tight">Snitch</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-gray-300">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                        <span className="text-sm font-semibold text-amber-500">Seller Dashboard</span>
                    </div>
                    <button
                        id="create_product_btn"
                        onClick={() => navigate("/seller/create-product")}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 active:scale-[0.97] text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_-4px_rgba(251,191,36,0.5)] hover:shadow-[0_6px_20px_-4px_rgba(251,191,36,0.6)] transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add Product
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Products</h1>
                    <p className="mt-1 text-sm text-gray-400 font-medium">
                        Manage and track all your listed products.
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <StatCard
                        label="Total Listings"
                        value={loading ? "—" : (sellerProducts?.length ?? 0)}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                        }
                        color="amber"
                    />
                    <StatCard
                        label="Catalogue Value"
                        value={loading ? "—" : `₹${totalValue.toLocaleString("en-IN")}`}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                            </svg>
                        }
                        color="green"
                    />
                    <StatCard
                        label="Avg. Price"
                        value={
                            loading ? "—"
                                : sellerProducts?.length
                                    ? `₹${Math.round(totalValue / sellerProducts.length).toLocaleString("en-IN")}`
                                    : "₹0"
                        }
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        }
                        color="blue"
                    />
                </div>

                {/* Search + Count Bar */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            id="search_products"
                            type="text"
                            placeholder="Search products…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 bg-white border border-gray-200 rounded-xl outline-none focus:border-amber-400 focus:ring-3 focus:ring-amber-100 transition-all duration-200"
                        />
                    </div>
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="text-xs text-gray-400 hover:text-gray-700 font-medium transition-colors"
                        >
                            Clear
                        </button>
                    )}
                    <span className="ml-auto text-xs text-gray-400 font-medium">
                        {filtered.length} {filtered.length === 1 ? "product" : "products"}
                    </span>
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingSkeleton />
                ) : filtered.length === 0 ? (
                    <EmptyState search={search} onAdd={() => navigate("/seller/create-product")} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon, color }) {
    const colors = {
        amber: "bg-amber-50 text-amber-500",
        green: "bg-green-50 text-green-500",
        blue: "bg-blue-50 text-blue-500",
    };
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
        </div>
    );
}

/* ─── Product Card ───────────────────────────────────────────────────────── */
function ProductCard({ product }) {
    const coverImage = product.images?.[0]?.url;
    const price = product.price?.amount;
    const currency = product.price?.currency || "INR";

    return (
        <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            {/* Image */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span className="text-xs font-medium">No image</span>
                    </div>
                )}
                {product.images?.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                        +{product.images.length - 1}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-1.5">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-amber-500 transition-colors duration-150">
                    {product.title}
                </h3>
                {product.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                )}
                <div className="flex items-center justify-between pt-1">
                    <span className="text-base font-extrabold text-gray-900">
                        {currency === "INR" ? "₹" : currency}
                        {price?.toLocaleString("en-IN")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Live
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ─── Loading Skeleton ───────────────────────────────────────────────────── */
function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
                    <div className="aspect-square bg-gray-100" />
                    <div className="p-4 space-y-2">
                        <div className="h-3.5 bg-gray-100 rounded-lg w-3/4" />
                        <div className="h-3 bg-gray-100 rounded-lg w-full" />
                        <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
                        <div className="h-4 bg-gray-100 rounded-lg w-1/3 mt-2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Empty State ────────────────────────────────────────────────────────── */
function EmptyState({ search, onAdd }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9 text-amber-400">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
                {search ? `No results for "${search}"` : "No products yet"}
            </h2>
            <p className="mt-2 text-sm text-gray-400 max-w-xs">
                {search
                    ? "Try a different search term."
                    : "Get started by listing your first product on Snitch."}
            </p>
            {!search && (
                <button
                    id="empty_add_product_btn"
                    onClick={onAdd}
                    className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 active:scale-[0.97] text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_-4px_rgba(251,191,36,0.5)] transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add First Product
                </button>
            )}
        </div>
    );
}