import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hook/useProducts';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

// ─── Navbar ────────────────────────────────────────────────────────
const Navbar = ({ user }) => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

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
                {/* Brand */}
                <Link
                    to="/"
                    className="no-underline"
                    style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: '1.35rem', color: 'var(--color-on-surface)', letterSpacing: '-0.01em' }}
                >
                    Souled Store
                </Link>

                {/* Center nav links */}
                <div className="hidden md:flex items-center gap-8">
                    {['New In', 'Men', 'Women', 'Accessories'].map((item) => (
                        <button
                            key={item}
                            className="label-caps"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-5">
                    <button
                        className="hidden md:flex"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}
                        aria-label="Search"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'wght' 300" }}>search</span>
                    </button>
                    <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}
                        aria-label="Wishlist"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'wght' 300" }}>favorite</span>
                    </button>
                    <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}
                        aria-label="Cart"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'wght' 300" }}>shopping_bag</span>
                    </button>

                    {user ? (
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                            style={{ background: 'var(--color-on-surface)', color: 'var(--color-on-primary)', fontFamily: 'var(--font-sans)' }}
                        >
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="label-caps no-underline hidden md:block"
                            style={{ color: 'var(--color-on-surface)' }}
                        >
                            Sign In
                        </Link>
                    )}

                    {user?.isSeller && (
                        <Link
                            to="/seller/dashboard"
                            className="btn-dark px-4 py-2 no-underline hidden md:block text-xs"
                        >
                            Dashboard
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

// ─── Skeleton Card ─────────────────────────────────────────────────
const SkeletonCard = () => (
    <div>
        <div
            className="w-full animate-pulse"
            style={{ aspectRatio: '3/4', background: 'var(--color-surface-container)' }}
        />
        <div className="mt-3 space-y-1.5">
            <div className="h-3 animate-pulse rounded" style={{ background: 'var(--color-surface-container)', width: '70%' }} />
            <div className="h-3 animate-pulse rounded" style={{ background: 'var(--color-surface-container)', width: '40%' }} />
        </div>
    </div>
);

// ─── Home Page ─────────────────────────────────────────────────────
const Home = () => {
    const products = useSelector((state) => state.product.products);
    const user = useSelector((state) => state.auth.user);
    const { handleGetAllProducts } = useProduct();

    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState('default');

    useEffect(() => {
        (async () => {
            await handleGetAllProducts();
            setLoading(false);
        })();
    }, []);

    const sortedProducts = [...(products || [])].sort((a, b) => {
        if (sortOption === 'price-asc') return (a.price?.amount ?? 0) - (b.price?.amount ?? 0);
        if (sortOption === 'price-desc') return (b.price?.amount ?? 0) - (a.price?.amount ?? 0);
        if (sortOption === 'name') return a.title.localeCompare(b.title);
        return 0;
    });

    return (
        <div style={{ background: 'var(--color-background)', minHeight: '100dvh', overflowX: 'hidden' }}>
            <Navbar user={user} />

            {/* ── Hero Banner ── */}
            <div
                className="relative w-full overflow-hidden"
                style={{ marginTop: '64px', aspectRatio: '16/9', maxHeight: '90vh' }}
            >
                <img
                    src="/hero-wide.jpg"
                    alt="New Collection"
                    className="w-full h-full object-cover object-center"
                />
                {/* Text overlay */}
                <div
                    className="absolute inset-0 flex flex-col justify-end p-8 md:p-16"
                    style={{ background: 'linear-gradient(to top, rgba(12,8,4,0.6) 0%, rgba(12,8,4,0.15) 55%, transparent 100%)' }}
                >
                    <div className="max-w-2xl">
                        <p className="label-caps mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>New Collection — 2026</p>
                        <h1
                            className="text-4xl md:text-6xl lg:text-7xl leading-none text-white mb-6"
                            style={{ fontFamily: 'var(--font-serif)', fontWeight: 300 }}
                        >
                            Effortless<br /><em>Elegance</em>
                        </h1>
                        <p
                            className="text-white/70 mb-8 hidden md:block"
                            style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: '0.9375rem', maxWidth: '36ch', lineHeight: '1.7' }}
                        >
                            Discover curated styles for every moment — from city streets to weekend escapes.
                        </p>
                        <Link
                            to="#products"
                            onClick={(e) => { e.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                            className="btn-dark inline-flex items-center gap-3 px-8 py-4 no-underline"
                            style={{ background: 'var(--color-surface)', color: 'var(--color-on-surface)', letterSpacing: '0.1em' }}
                        >
                            Shop Now
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'wght' 300" }}>arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Value props strip ── */}
            <div
                className="border-b border-t"
                style={{ borderColor: 'var(--color-outline-variant)', background: 'var(--color-surface)' }}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: 'local_shipping', text: 'Free Delivery above ₹999' },
                        { icon: 'autorenew',      text: '7-Day Easy Returns'        },
                        { icon: 'verified',       text: '100% Authentic'            },
                        { icon: 'payments',       text: 'Secure Payments'           },
                    ].map((item) => (
                        <div key={item.text} className="flex items-center gap-3 py-2">
                            <span
                                className="material-symbols-outlined flex-shrink-0"
                                style={{ fontSize: '18px', color: 'var(--color-secondary)', fontVariationSettings: "'wght' 300" }}
                            >
                                {item.icon}
                            </span>
                            <span className="label-caps" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.625rem' }}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Products Grid ── */}
            <section id="products" className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">

                {/* Section header */}
                <div className="flex items-end justify-between mb-10 md:mb-14">
                    <div>
                        <p className="label-caps mb-2" style={{ color: 'var(--color-secondary)' }}>Curated for you</p>
                        <h2
                            className="text-3xl md:text-4xl"
                            style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--color-on-surface)' }}
                        >
                            All Products
                            {!loading && products?.length > 0 && (
                                <span
                                    className="ml-3 text-lg align-middle"
                                    style={{ color: 'var(--color-outline)', fontFamily: 'var(--font-sans)', fontWeight: 300 }}
                                >
                                    ({products.length})
                                </span>
                            )}
                        </h2>
                    </div>

                    {/* Sort */}
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="label-caps"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid var(--color-outline-variant)',
                            color: 'var(--color-on-surface-variant)',
                            outline: 'none',
                            cursor: 'pointer',
                            padding: '4px 0',
                        }}
                    >
                        <option value="default">Latest</option>
                        <option value="price-asc">Price ↑</option>
                        <option value="price-desc">Price ↓</option>
                        <option value="name">A → Z</option>
                    </select>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-5">
                        <span className="material-symbols-outlined text-6xl" style={{ color: 'var(--color-outline)', fontVariationSettings: "'wght' 200" }}>
                            shopping_bag
                        </span>
                        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-on-surface-variant)', fontWeight: 300 }}>
                            No products yet
                        </p>
                        <p className="label-caps" style={{ color: 'var(--color-outline)' }}>New drops coming soon</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                        {sortedProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* ── Footer ── */}
            <footer
                className="border-t"
                style={{ borderColor: 'var(--color-outline-variant)', background: 'var(--color-surface)' }}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <span
                        style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-on-surface)', fontWeight: 400 }}
                    >
                        Souled Store
                    </span>
                    <p className="label-caps text-center" style={{ color: 'var(--color-outline)', fontSize: '0.625rem' }}>
                        © {new Date().getFullYear()} Souled Store. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {['Terms', 'Privacy', 'Contact'].map((link) => (
                            <Link key={link} to={`/${link.toLowerCase()}`} className="label-caps no-underline" style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.625rem' }}>
                                {link}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;