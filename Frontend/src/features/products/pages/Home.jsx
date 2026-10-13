import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useProduct } from '../hook/useProducts';

// Helper to safely extract image URLs whether object or string
const getProductImage = (product, index = 0) => {
    if (!product?.images || !Array.isArray(product.images) || product.images.length === 0) return null;
    const img = product.images[index] || product.images[0];
    if (typeof img === 'string') return img;
    return img?.url || img?.secure_url || null;
};

const getAllProductImages = (product) => {
    if (!product?.images || !Array.isArray(product.images)) return [];
    return product.images.map((img) => {
        if (typeof img === 'string') return img;
        return img?.url || img?.secure_url || '';
    }).filter(Boolean);
};

export default function Home() {
    const navigate = useNavigate();
    const { handleGetAllProducts } = useProduct();
    const products = useSelector((state) => state.product.products) || [];
    const user = useSelector((state) => state.auth.user);

    // Page state
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest'); // newest, price-asc, price-desc, name
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Interactive Cart & Wishlist state (persisted in localStorage)
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('snitch_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [wishlist, setWishlist] = useState(() => {
        try {
            const saved = localStorage.getItem('snitch_wishlist');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [quickViewImageIdx, setQuickViewImageIdx] = useState(0);
    const [selectedSize, setSelectedSize] = useState('L');
    const [notification, setNotification] = useState(null);

    // Save cart & wishlist to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('snitch_cart', JSON.stringify(cart));
        } catch (e) {
            console.error('Failed to save cart', e);
        }
    }, [cart]);

    useEffect(() => {
        try {
            localStorage.setItem('snitch_wishlist', JSON.stringify(wishlist));
        } catch (e) {
            console.error('Failed to save wishlist', e);
        }
    }, [wishlist]);

    // Notification toast timer
    const showToast = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // Fetch products on mount
    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            try {
                await handleGetAllProducts();
            } catch (err) {
                console.error('Error loading products:', err);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    // Filter & Sort Logic
    const filteredProducts = useMemo(() => {
        let list = [...products];

        // Search query
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((p) =>
                p.title?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.seller?.toLowerCase().includes(q)
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            if (selectedCategory === 'hoodies') {
                list = list.filter((p) =>
                    p.title?.toLowerCase().includes('hoodie') ||
                    p.title?.toLowerCase().includes('choodie') ||
                    p.description?.toLowerCase().includes('hoodie') ||
                    p.description?.toLowerCase().includes('choodie')
                );
            } else if (selectedCategory === 'oversized') {
                list = list.filter((p) =>
                    p.title?.toLowerCase().includes('oversized') ||
                    p.description?.toLowerCase().includes('oversized')
                );
            } else if (selectedCategory === 'under3k') {
                list = list.filter((p) => (p.price?.amount || 0) <= 3000);
            } else if (selectedCategory === 'premium') {
                list = list.filter((p) => (p.price?.amount || 0) > 3000);
            }
        }

        // Sorting
        if (sortBy === 'newest') {
            list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        } else if (sortBy === 'price-asc') {
            list.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0));
        } else if (sortBy === 'price-desc') {
            list.sort((a, b) => (b.price?.amount || 0) - (a.price?.amount || 0));
        } else if (sortBy === 'name') {
            list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }

        return list;
    }, [products, search, selectedCategory, sortBy]);

    // Computed metrics for dashboard
    const metrics = useMemo(() => {
        const count = products.length;
        if (count === 0) return { count: 0, minPrice: 0, maxPrice: 0, avgPrice: 0, totalWorth: 0 };
        const prices = products.map((p) => p.price?.amount || 0);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const totalWorth = prices.reduce((acc, curr) => acc + curr, 0);
        const avgPrice = Math.round(totalWorth / count);
        return { count, minPrice, maxPrice, avgPrice, totalWorth };
    }, [products]);

    // Cart actions
    const addToCart = (product, size = 'L') => {
        setCart((prev) => {
            const existingIndex = prev.findIndex((item) => item._id === product._id && item.size === size);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex].quantity += 1;
                return updated;
            }
            return [
                ...prev,
                {
                    _id: product._id,
                    title: product.title,
                    price: product.price?.amount || 0,
                    currency: product.price?.currency || 'INR',
                    image: getProductImage(product),
                    size,
                    quantity: 1,
                },
            ];
        });
        showToast(`Added "${product.title}" to Cart`);
    };

    const removeFromCart = (index) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
    };

    const updateCartQty = (index, delta) => {
        setCart((prev) => {
            const updated = [...prev];
            const newQty = updated[index].quantity + delta;
            if (newQty <= 0) {
                return prev.filter((_, i) => i !== index);
            }
            updated[index].quantity = newQty;
            return updated;
        });
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Wishlist actions
    const toggleWishlist = (product) => {
        const isFavorited = wishlist.some((item) => item._id === product._id);
        if (isFavorited) {
            setWishlist((prev) => prev.filter((item) => item._id !== product._id));
            showToast(`Removed from saved drops`);
        } else {
            setWishlist((prev) => [...prev, product]);
            showToast(`Added to saved drops`);
        }
    };

    // Featured product for dashboard hero highlight
    const featuredProduct = products.length > 0 ? products[0] : null;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#131315] text-[#e5e1e4] font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">

            {/* ─── TOAST NOTIFICATION ────────────────────────────────────────── */}
            {notification && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#201f22] border border-amber-500/40 text-amber-300 px-4 py-3 rounded-xl shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    <span className="text-sm font-medium">{notification}</span>
                </div>
            )}

            {/* ─── DESKTOP & MOBILE SIDEBAR ──────────────────────────────────── */}
            {/* Mobile backdrop */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
                />
            )}

            <aside
                className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-[#171619] border-r border-[#262529] flex flex-col transition-transform duration-300 ease-in-out shrink-0 ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Brand / Logo */}
                <div className="h-20 px-6 flex items-center justify-between border-b border-[#262529]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <span className="text-black font-black text-xl tracking-tighter">S</span>
                        </div>
                        <div>
                            <span className="font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5">
                                SNITCH
                                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                                    HUB
                                </span>
                            </span>
                            <p className="text-[11px] text-gray-400 font-medium tracking-tight">Luxury Streetwear & Drops</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1.5 text-gray-400 hover:text-white lg:hidden rounded-lg hover:bg-[#201f22]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Sidebar Navigation Links */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-none">
                    {/* Discover Section */}
                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Explore Drops</p>
                        <nav className="space-y-1">
                            <button
                                onClick={() => { setSelectedCategory('all'); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                    selectedCategory === 'all'
                                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                                        : 'text-gray-300 hover:bg-[#201f22] hover:text-white'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    All Products
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                    selectedCategory === 'all' ? 'bg-black/20 text-black' : 'bg-[#2a2a2c] text-gray-400'
                                }`}>
                                    {products.length}
                                </span>
                            </button>

                            <button
                                onClick={() => { setSelectedCategory('hoodies'); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                    selectedCategory === 'hoodies'
                                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                                        : 'text-gray-300 hover:bg-[#201f22] hover:text-white'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Hoodies & Choodies
                                </span>
                            </button>

                            <button
                                onClick={() => { setSelectedCategory('oversized'); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                    selectedCategory === 'oversized'
                                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                                        : 'text-gray-300 hover:bg-[#201f22] hover:text-white'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                    </svg>
                                    Oversized Drops
                                </span>
                                <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">Hot</span>
                            </button>

                            <button
                                onClick={() => { setSelectedCategory('premium'); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                    selectedCategory === 'premium'
                                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                                        : 'text-gray-300 hover:bg-[#201f22] hover:text-white'
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    Premium & Luxury
                                </span>
                            </button>
                        </nav>
                    </div>

                    {/* Quick Filters */}
                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Price Curations</p>
                        <div className="space-y-1">
                            <button
                                onClick={() => { setSelectedCategory('under3k'); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                                    selectedCategory === 'under3k'
                                        ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30 font-semibold'
                                        : 'text-gray-400 hover:bg-[#201f22] hover:text-gray-200'
                                }`}
                            >
                                <span>Under ₹3,000</span>
                                <span className="text-[10px] text-gray-500">Affordable</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions / Seller Portals */}
                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Workspace & Roles</p>
                        <div className="space-y-1.5">
                            {user?.isSeller ? (
                                <Link
                                    to="/seller/dashboard"
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-amber-400/10 border border-amber-400/25 text-amber-300 hover:bg-amber-400 hover:text-black transition-all group"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-400 group-hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Seller Dashboard
                                </Link>
                            ) : (
                                <Link
                                    to="/register"
                                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#201f22] border border-[#2e2d32] text-gray-300 hover:text-amber-400 hover:border-amber-400/30 transition-all"
                                >
                                    <span className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Become a Seller
                                    </span>
                                    <span className="text-[10px] text-amber-400 font-bold">Earn</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Footer User Profile */}
                <div className="p-4 border-t border-[#262529] bg-[#141416]">
                    {user ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-white truncate">{user.fullName || 'User'}</p>
                                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                                </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-[#201f22] text-amber-400 border border-amber-400/20">
                                {user.isSeller ? 'Seller' : 'Buyer'}
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs text-gray-400">Join the Snitch drop club.</p>
                            <div className="flex gap-2">
                                <Link
                                    to="/login"
                                    className="flex-1 py-1.5 px-3 rounded-lg text-center text-xs font-semibold bg-[#201f22] text-white hover:bg-[#28272b] border border-[#2e2d32] transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex-1 py-1.5 px-3 rounded-lg text-center text-xs font-bold bg-amber-400 text-black hover:bg-amber-500 transition-colors shadow-sm"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* ─── MAIN CONTENT VIEWPORT ────────────────────────────────────── */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#131315]">

                {/* Top Dashboard Header Bar */}
                <header className="h-16 border-b border-[#262529] bg-[#171619]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-30">
                    <div className="flex items-center gap-3 flex-1 max-w-xl">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#201f22] lg:hidden"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Search Input Bar */}
                        <div className="relative w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                id="dashboard_product_search"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search drops, oversized hoodies, styles, seller ID…"
                                className="w-full pl-10 pr-10 py-2 bg-[#201f22] border border-[#2e2d32] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/10 transition-all"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-bold"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Header Controls */}
                    <div className="flex items-center gap-3">
                        {/* View Switcher (Grid vs Table List) */}
                        <div className="hidden sm:flex items-center bg-[#201f22] p-0.5 rounded-xl border border-[#2e2d32]">
                            <button
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                                className={`p-1.5 rounded-lg text-xs transition-all ${
                                    viewMode === 'grid' ? 'bg-[#2a2a2c] text-amber-400 font-bold shadow-sm' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                title="List / Table View"
                                className={`p-1.5 rounded-lg text-xs transition-all ${
                                    viewMode === 'table' ? 'bg-[#2a2a2c] text-amber-400 font-bold shadow-sm' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>

                        {/* Wishlist Pill */}
                        <button
                            onClick={() => {
                                if (wishlist.length > 0) {
                                    showToast(`${wishlist.length} item(s) in your saved wishlist`);
                                } else {
                                    showToast('Your wishlist is currently empty');
                                }
                            }}
                            className="relative p-2 bg-[#201f22] border border-[#2e2d32] rounded-xl text-gray-300 hover:text-amber-400 hover:border-amber-400/30 transition-colors"
                            title="Saved Wishlist"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={wishlist.length > 0 ? '#f59e0b' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {wishlist.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-amber-400 text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                                    {wishlist.length}
                                </span>
                            )}
                        </button>

                        {/* Cart Trigger Button */}
                        <button
                            id="open_cart_btn"
                            onClick={() => setIsCartOpen(true)}
                            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span className="hidden sm:inline">Bag</span>
                            <span className="bg-black text-amber-400 px-1.5 py-0.5 rounded-full text-[10px] font-black">
                                {cartCount}
                            </span>
                        </button>

                        {/* Seller shortcut */}
                        {user?.isSeller && (
                            <button
                                onClick={() => navigate('/seller/create-product')}
                                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-[#201f22] border border-[#2e2d32] hover:border-amber-400/40 text-amber-300 text-xs font-semibold rounded-xl transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Product
                            </button>
                        )}
                    </div>
                </header>

                {/* Main Scrollable Canvas */}
                <main className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* ─── DASHBOARD STATS WIDGETS STRIP ─────────────────────── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                            {/* Card 1: Total Live Drops */}
                            <div className="bg-[#1a191c] border border-[#262529] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Drops</p>
                                    </div>
                                    <p className="text-2xl font-black text-white mt-1">
                                        {loading ? '—' : metrics.count}
                                    </p>
                                    <p className="text-[10px] text-emerald-400 font-medium">100% Verified In-Stock</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>

                            {/* Card 2: Price Spectrum */}
                            <div className="bg-[#1a191c] border border-[#262529] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Price Spectrum</p>
                                    <p className="text-xl font-black text-amber-300 mt-1">
                                        {loading || metrics.count === 0 ? '—' : `₹${metrics.minPrice.toLocaleString('en-IN')} - ₹${metrics.maxPrice.toLocaleString('en-IN')}`}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">INR Standard Pricing</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Card 3: Free Express Shipping */}
                            <div className="bg-[#1a191c] border border-[#262529] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Express Delivery</p>
                                    <p className="text-2xl font-black text-white mt-1">Free 48h</p>
                                    <p className="text-[10px] text-gray-400 font-medium">On orders &gt; ₹1,999</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Card 4: Quality & Authenticity */}
                            <div className="bg-[#1a191c] border border-[#262529] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Authentic Snitch</p>
                                    <p className="text-2xl font-black text-white mt-1">100% Real</p>
                                    <p className="text-[10px] text-amber-400 font-medium">Direct Seller Line</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* ─── FEATURED HERO SPOTLIGHT BANNER ────────────────────── */}
                        {featuredProduct && !search && selectedCategory === 'all' && (
                            <div className="relative rounded-3xl bg-gradient-to-r from-[#1f1d22] via-[#242229] to-[#1c1b1f] border border-[#2d2b33] p-6 lg:p-8 overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="space-y-3 max-w-xl">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                            Spotlight Drop of the Week
                                        </div>
                                        <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight capitalize">
                                            {featuredProduct.title}
                                        </h2>
                                        <p className="text-xs lg:text-sm text-gray-300 leading-relaxed line-clamp-2">
                                            {featuredProduct.description || "Limited edition drop crafted with heavyweight French Terry cotton and relaxed silhouette."}
                                        </p>
                                        <div className="flex items-baseline gap-3 pt-1">
                                            <span className="text-2xl font-black text-amber-400">
                                                ₹{featuredProduct.price?.amount?.toLocaleString('en-IN') || 0}
                                            </span>
                                            <span className="text-xs text-gray-400 line-through">
                                                ₹{Math.round((featuredProduct.price?.amount || 0) * 1.35).toLocaleString('en-IN')}
                                            </span>
                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                                In Stock Now
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                onClick={() => addToCart(featuredProduct)}
                                                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-400/25 transition-all flex items-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                Instant Add to Bag
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setQuickViewProduct(featuredProduct);
                                                    setQuickViewImageIdx(0);
                                                }}
                                                className="px-4 py-2.5 bg-[#2a292e] hover:bg-[#34333a] text-white font-semibold text-xs rounded-xl border border-[#3b3a42] transition-colors"
                                            >
                                                Inspect Product
                                            </button>
                                        </div>
                                    </div>

                                    {/* Spotlight Product Image Preview */}
                                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-black/40 border border-[#33313a] shadow-inner shrink-0 relative group">
                                        {getProductImage(featuredProduct) ? (
                                            <img
                                                src={getProductImage(featuredProduct)}
                                                alt={featuredProduct.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-xs">
                                                No preview image
                                            </div>
                                        )}
                                        {featuredProduct.images?.length > 1 && (
                                            <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                                                +{featuredProduct.images.length - 1} angles
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── CONTROLS BAR: CATEGORIES, SORTS, COUNT ───────────── */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                                {[
                                    { id: 'all', label: 'All Catalog' },
                                    { id: 'hoodies', label: 'Hoodies & Choodies' },
                                    { id: 'oversized', label: 'Oversized' },
                                    { id: 'under3k', label: 'Under ₹3,000' },
                                    { id: 'premium', label: 'Premium Drops' },
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                            selectedCategory === cat.id
                                                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                                                : 'bg-[#1e1d21] text-gray-400 hover:text-white border border-[#2a292d]'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Sort Dropdown & Product Count */}
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-gray-400 font-medium">
                                    <strong className="text-white">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'item' : 'items'}
                                </span>

                                <div className="flex items-center gap-1.5 bg-[#1e1d21] border border-[#2a292d] px-3 py-1.5 rounded-xl">
                                    <span className="text-[11px] text-gray-500 font-bold uppercase">Sort:</span>
                                    <select
                                        id="sort_by_select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-transparent text-xs text-gray-200 font-semibold focus:outline-none cursor-pointer"
                                    >
                                        <option value="newest" className="bg-[#1e1d21] text-white">Latest Drops</option>
                                        <option value="price-asc" className="bg-[#1e1d21] text-white">Price: Low to High</option>
                                        <option value="price-desc" className="bg-[#1e1d21] text-white">Price: High to Low</option>
                                        <option value="name" className="bg-[#1e1d21] text-white">Title: A to Z</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ─── PRODUCTS VIEW: GRID OR TABLE ─────────────────────── */}
                        {loading ? (
                            <DashboardLoadingSkeleton />
                        ) : filteredProducts.length === 0 ? (
                            <div className="bg-[#171619] border border-[#262529] rounded-2xl p-12 text-center max-w-lg mx-auto my-8">
                                <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">No Drops Found</h3>
                                <p className="text-xs text-gray-400 mb-6">
                                    {search
                                        ? `No products match your search query "${search}". Try a different term or clear filters.`
                                        : 'No products are currently available in this filter.'}
                                </p>
                                <button
                                    onClick={() => {
                                        setSearch('');
                                        setSelectedCategory('all');
                                    }}
                                    className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black text-xs font-bold rounded-xl transition-all"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : viewMode === 'grid' ? (
                            /* ─── GRID VIEW ────────────────────────────────────────── */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {filteredProducts.map((product) => (
                                    <ProductDashboardCard
                                        key={product._id}
                                        product={product}
                                        isFavorited={wishlist.some((item) => item._id === product._id)}
                                        onToggleWishlist={() => toggleWishlist(product)}
                                        onAddToCart={() => addToCart(product)}
                                        onQuickView={() => {
                                            setQuickViewProduct(product);
                                            setQuickViewImageIdx(0);
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            /* ─── DASHBOARD TABLE VIEW ─────────────────────────────── */
                            <div className="bg-[#171619] border border-[#262529] rounded-2xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#1e1d21] text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#262529]">
                                            <tr>
                                                <th className="py-3.5 px-4 font-bold">Product</th>
                                                <th className="py-3.5 px-4 font-bold">Seller</th>
                                                <th className="py-3.5 px-4 font-bold">Date Added</th>
                                                <th className="py-3.5 px-4 font-bold">Price</th>
                                                <th className="py-3.5 px-4 font-bold">Status</th>
                                                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#262529]">
                                            {filteredProducts.map((product) => {
                                                const coverImg = getProductImage(product);
                                                const isFav = wishlist.some((item) => item._id === product._id);
                                                return (
                                                    <tr key={product._id} className="hover:bg-[#1e1d21]/60 transition-colors">
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 rounded-xl bg-black/40 border border-[#2e2d32] overflow-hidden shrink-0">
                                                                    {coverImg ? (
                                                                        <img src={coverImg} alt={product.title} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">
                                                                            N/A
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-white capitalize line-clamp-1">{product.title}</p>
                                                                    <p className="text-[11px] text-gray-400 line-clamp-1">{product.description || 'Exclusive drop'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span className="font-mono text-[11px] text-gray-400 bg-[#201f22] px-2 py-1 rounded-md border border-[#2e2d32]">
                                                                {product.seller ? `${product.seller.slice(0, 8)}…` : 'Snitch Studio'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-gray-400">
                                                            {product.createdAt
                                                                ? new Date(product.createdAt).toLocaleDateString('en-IN', {
                                                                      day: 'numeric',
                                                                      month: 'short',
                                                                      year: 'numeric',
                                                                  })
                                                                : 'Recently'}
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span className="font-black text-amber-300 text-sm">
                                                                ₹{product.price?.amount?.toLocaleString('en-IN') || 0}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                                Live Drop
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => toggleWishlist(product)}
                                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-[#201f22]"
                                                                    title="Save to Wishlist"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={isFav ? '#f59e0b' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setQuickViewProduct(product);
                                                                        setQuickViewImageIdx(0);
                                                                    }}
                                                                    className="px-2.5 py-1.5 bg-[#201f22] hover:bg-[#28272b] text-gray-200 font-semibold rounded-lg border border-[#2e2d32] text-xs"
                                                                >
                                                                    Inspect
                                                                </button>
                                                                <button
                                                                    onClick={() => addToCart(product)}
                                                                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-lg text-xs transition-colors"
                                                                >
                                                                    + Bag
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ─── QUICK VIEW PRODUCT MODAL ──────────────────────────────────── */}
            {quickViewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#1c1b1f] border border-[#2f2d35] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
                    >
                        {/* Gallery Section */}
                        <div className="w-full md:w-1/2 p-6 bg-[#161518] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#2a292e]">
                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/50 border border-[#2a292e]">
                                {getAllProductImages(quickViewProduct)[quickViewImageIdx] ? (
                                    <img
                                        src={getAllProductImages(quickViewProduct)[quickViewImageIdx]}
                                        alt={quickViewProduct.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                        No image preview
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Row */}
                            {getAllProductImages(quickViewProduct).length > 1 && (
                                <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                                    {getAllProductImages(quickViewProduct).map((imgUrl, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setQuickViewImageIdx(idx)}
                                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                                                quickViewImageIdx === idx ? 'border-amber-400 scale-105' : 'border-[#2a292e] opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            <img src={imgUrl} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                                        Streetwear Drop
                                    </span>
                                    <button
                                        onClick={() => setQuickViewProduct(null)}
                                        className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#262529]"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <h2 className="text-2xl font-black text-white capitalize">{quickViewProduct.title}</h2>

                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-3xl font-black text-amber-400">
                                        ₹{quickViewProduct.price?.amount?.toLocaleString('en-IN') || 0}
                                    </span>
                                    <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                                        Tax Included
                                    </span>
                                </div>

                                <p className="text-xs text-gray-300 mt-4 leading-relaxed">
                                    {quickViewProduct.description || 'Premium design drop featuring drop-shoulder fit, ultra-durable ribbing, and soft interior touch.'}
                                </p>

                                {/* Size Picker */}
                                <div className="mt-5">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Select Size</p>
                                    <div className="flex items-center gap-2">
                                        {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                                            <button
                                                key={sz}
                                                onClick={() => setSelectedSize(sz)}
                                                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                                                    selectedSize === sz
                                                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                                                        : 'bg-[#201f22] text-gray-300 border border-[#2e2d32] hover:border-gray-500'
                                                }`}
                                            >
                                                {sz}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Meta details */}
                                <div className="mt-5 p-3 rounded-xl bg-[#171619] border border-[#262529] space-y-1.5 text-[11px]">
                                    <div className="flex justify-between text-gray-400">
                                        <span>Seller Identifier:</span>
                                        <span className="font-mono text-gray-300">{quickViewProduct.seller || 'Snitch Official'}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Dispatch:</span>
                                        <span className="text-emerald-400 font-semibold">Ready in 24 Hours</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        addToCart(quickViewProduct, selectedSize);
                                        setQuickViewProduct(null);
                                    }}
                                    className="flex-1 py-3 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Add to Bag ({selectedSize})
                                </button>
                                <button
                                    onClick={() => toggleWishlist(quickViewProduct)}
                                    className="p-3 bg-[#201f22] hover:bg-[#2a292e] text-white rounded-xl border border-[#2e2d32]"
                                    title="Wishlist"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={wishlist.some(i => i._id === quickViewProduct._id) ? '#f59e0b' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── SLIDE-OUT CART DRAWER ──────────────────────────────────────── */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-[#171619] border-l border-[#262529] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
                    >
                        {/* Cart Header */}
                        <div className="p-5 border-b border-[#262529] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold text-white">Your Shopping Bag</h3>
                                <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {cartCount}
                                </span>
                            </div>
                            <button
                                id="close_cart_btn"
                                onClick={() => setIsCartOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#201f22]"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Cart List */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-16 space-y-3">
                                    <div className="w-16 h-16 rounded-2xl bg-[#201f22] border border-[#2e2d32] text-gray-500 flex items-center justify-center mx-auto">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-bold text-white">Your bag is empty</p>
                                    <p className="text-xs text-gray-400">Discover all the latest drops on the dashboard.</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={`${item._id}-${item.size}-${index}`} className="flex gap-3 bg-[#1c1b1f] border border-[#2a292e] p-3 rounded-2xl">
                                        <div className="w-16 h-16 rounded-xl bg-black/40 border border-[#2a292e] overflow-hidden shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">
                                                    N/A
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-xs font-bold text-white capitalize truncate">{item.title}</h4>
                                                <button
                                                    onClick={() => removeFromCart(index)}
                                                    className="text-gray-500 hover:text-red-400 text-xs"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-amber-400 font-bold mt-0.5">
                                                ₹{item.price.toLocaleString('en-IN')}
                                                <span className="text-gray-400 font-normal ml-2">Size: {item.size}</span>
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => updateCartQty(index, -1)}
                                                    className="w-6 h-6 rounded-lg bg-[#252428] hover:bg-[#302f35] text-white flex items-center justify-center text-xs font-bold"
                                                >
                                                    -
                                                </button>
                                                <span className="text-xs font-bold text-white px-1">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateCartQty(index, 1)}
                                                    className="w-6 h-6 rounded-lg bg-[#252428] hover:bg-[#302f35] text-white flex items-center justify-center text-xs font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Cart Footer Checkout */}
                        {cart.length > 0 && (
                            <div className="p-5 border-t border-[#262529] bg-[#141416] space-y-3">
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between text-gray-400">
                                        <span>Subtotal</span>
                                        <span className="font-semibold text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Shipping</span>
                                        <span className="text-emerald-400 font-semibold">{cartTotal > 1999 ? 'FREE' : '₹149'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[#262529]">
                                        <span>Total</span>
                                        <span className="text-amber-400">₹{(cartTotal + (cartTotal > 1999 ? 0 : 149)).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        showToast('Order placed successfully! (Demo)');
                                        setCart([]);
                                        setIsCartOpen(false);
                                    }}
                                    className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-400/20 transition-all text-center"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── PRODUCT DASHBOARD CARD COMPONENT ───────────────────────────────────── */
function ProductDashboardCard({ product, isFavorited, onToggleWishlist, onAddToCart, onQuickView }) {
    const coverImage = getProductImage(product, 0);
    const hoverImage = getProductImage(product, 1) || coverImage;
    const allImages = getAllProductImages(product);
    const price = product.price?.amount || 0;

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group bg-[#18171b] border border-[#27262b] hover:border-amber-400/40 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300"
        >
            {/* Image Container */}
            <div className="relative aspect-square bg-[#100f12] overflow-hidden">
                {coverImage ? (
                    <img
                        src={isHovered && hoverImage ? hoverImage : coverImage}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                            <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
                            <polyline points="21 15 16 10 5 21" strokeWidth="1.5" />
                        </svg>
                        <span className="text-[11px] font-medium text-gray-500">No Image</span>
                    </div>
                )}

                {/* Multiple Images Badge */}
                {allImages.length > 1 && (
                    <span className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                        +{allImages.length - 1} photos
                    </span>
                )}

                {/* Live Drop Badge */}
                <span className="absolute top-2.5 left-2.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Live
                </span>

                {/* Wishlist Heart Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist();
                    }}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white transition-all active:scale-90"
                    title="Add to Wishlist"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={isFavorited ? '#f59e0b' : 'none'} viewBox="0 0 24 24" stroke={isFavorited ? '#f59e0b' : 'currentColor'}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                {/* Hover Quick View Trigger Pill */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <button
                        onClick={onQuickView}
                        className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl shadow-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-1.943-9.542-7z" />
                        </svg>
                        Quick Inspect
                    </button>
                </div>
            </div>

            {/* Info Body */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                        <span>Drop #{product._id?.slice(-4) || '00'}</span>
                        <span className="font-mono text-gray-400">
                            {product.seller ? `ID: ${product.seller.slice(0, 6)}` : 'Store'}
                        </span>
                    </div>

                    <h3 className="text-sm font-bold text-white capitalize line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {product.title}
                    </h3>

                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mt-1">
                        {product.description || 'Premium Snitch streetwear drop with oversized cut.'}
                    </p>
                </div>

                <div className="pt-3 border-t border-[#262529] flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 block">Price</span>
                        <span className="text-base font-black text-amber-300">
                            ₹{price.toLocaleString('en-IN')}
                        </span>
                    </div>

                    <button
                        onClick={onAddToCart}
                        className="px-3.5 py-1.5 bg-[#252429] hover:bg-amber-400 hover:text-black text-gray-200 text-xs font-bold rounded-xl border border-[#2e2d33] transition-all flex items-center gap-1.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── SKELETON LOADER ────────────────────────────────────────────────────── */
function DashboardLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[#18171b] border border-[#262529] rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-[#201f22]" />
                    <div className="p-4 space-y-2.5">
                        <div className="h-3 bg-[#242327] rounded w-1/3" />
                        <div className="h-4 bg-[#242327] rounded w-3/4" />
                        <div className="h-3 bg-[#242327] rounded w-full" />
                        <div className="h-5 bg-[#242327] rounded w-1/2 pt-2" />
                    </div>
                </div>
            ))}
        </div>
    );
}