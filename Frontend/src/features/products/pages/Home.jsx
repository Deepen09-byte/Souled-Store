import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hook/useProducts';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

// ─── Skeleton Loader ───────────────────────────────────────────────
const SkeletonCard = () => (
    <div
        className="rounded-2xl overflow-hidden"
        style={{
            background: 'var(--color-surface-container)',
            border: '1px solid var(--color-outline-variant)',
        }}
    >
        <div
            className="animate-pulse"
            style={{ aspectRatio: '3/4', background: 'var(--color-surface-container-high)' }}
        />
        <div className="p-4 flex flex-col gap-2">
            <div
                className="h-4 rounded-full animate-pulse"
                style={{ background: 'var(--color-surface-container-high)', width: '75%' }}
            />
            <div
                className="h-3 rounded-full animate-pulse"
                style={{ background: 'var(--color-surface-container-high)', width: '50%' }}
            />
            <div className="flex justify-between items-center mt-1">
                <div
                    className="h-5 rounded-full animate-pulse"
                    style={{ background: 'var(--color-surface-container-high)', width: '35%' }}
                />
                <div
                    className="h-9 w-9 rounded-xl animate-pulse"
                    style={{ background: 'var(--color-surface-container-high)' }}
                />
            </div>
        </div>
    </div>
);

// ─── Navbar ────────────────────────────────────────────────────────
const Navbar = ({ user, productCount }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 transition-all duration-300"
            style={{
                height: '64px',
                background: scrolled
                    ? 'rgba(19,19,21,0.85)'
                    : 'transparent',
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--color-outline-variant)' : '1px solid transparent',
            }}
        >
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 no-underline">
                <div
                    className="flex items-center justify-center rounded-xl"
                    style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))',
                    }}
                >
                    <span className="material-symbols-outlined text-black" style={{ fontSize: '20px' }}>storefront</span>
                </div>
                <span
                    className="text-xl font-bold tracking-tight"
                    style={{
                        color: 'var(--color-on-surface)',
                        fontFamily: 'var(--font-display-lg)',
                        letterSpacing: '-0.02em',
                    }}
                >
                    Snitch
                </span>
            </Link>

            {/* Center: Search bar */}
            <div
                className="hidden md:flex items-center gap-2 rounded-2xl px-4 py-2 flex-1 max-w-sm mx-8 input-focus-glow transition-all duration-200"
                style={{
                    background: 'var(--color-surface-container)',
                    border: '1px solid var(--color-outline-variant)',
                }}
            >
                <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)', fontSize: '18px' }}>search</span>
                <input
                    type="text"
                    placeholder="Search products..."
                    className="bg-transparent outline-none w-full text-sm"
                    style={{
                        color: 'var(--color-on-surface)',
                        fontFamily: 'var(--font-body-sm)',
                    }}
                />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
                {user ? (
                    <>
                        {user.isSeller && (
                            <Link
                                to="/seller/dashboard"
                                className="hidden sm:flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium no-underline transition-all duration-200"
                                style={{
                                    background: 'var(--color-surface-container-high)',
                                    color: 'var(--color-on-surface)',
                                    border: '1px solid var(--color-outline-variant)',
                                    fontFamily: 'var(--font-body-sm)',
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>dashboard</span>
                                Dashboard
                            </Link>
                        )}
                        <div
                            className="flex items-center justify-center rounded-xl text-sm font-bold"
                            style={{
                                width: '36px',
                                height: '36px',
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))',
                                color: 'var(--color-on-primary)',
                                fontFamily: 'var(--font-label-md)',
                            }}
                        >
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="rounded-xl px-4 py-2 text-sm font-medium no-underline transition-all duration-200"
                            style={{
                                color: 'var(--color-on-surface-variant)',
                                fontFamily: 'var(--font-body-sm)',
                            }}
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="rounded-xl px-4 py-2 text-sm font-semibold no-underline transition-all duration-200"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))',
                                color: 'var(--color-on-primary)',
                                fontFamily: 'var(--font-body-sm)',
                            }}
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

// ─── Hero Banner ───────────────────────────────────────────────────
const HeroBanner = ({ productCount }) => (
    <div
        className="relative flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
            paddingTop: '120px',
            paddingBottom: '64px',
            minHeight: '340px',
        }}
    >
        {/* Ambient glow */}
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                background: 'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(245,158,11,0.15), transparent)',
            }}
        />
        {/* Decorative ring */}
        <div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: '600px',
                height: '600px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -60%)',
                border: '1px solid rgba(245,158,11,0.06)',
            }}
        />
        <div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: '900px',
                height: '900px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -60%)',
                border: '1px solid rgba(245,158,11,0.04)',
            }}
        />

        <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-5"
            style={{
                background: 'rgba(245,158,11,0.12)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(245,158,11,0.2)',
                fontFamily: 'var(--font-label-sm)',
            }}
        >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span>
            New Arrivals
        </span>

        <h1
            className="text-4xl md:text-6xl font-bold leading-tight mb-4 px-4"
            style={{
                color: 'var(--color-on-surface)',
                fontFamily: 'var(--font-display-lg)',
                letterSpacing: '-0.03em',
            }}
        >
            Dress to{' '}
            <span
                style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                Impress
            </span>
        </h1>

        <p
            className="text-base md:text-lg max-w-md mx-auto mb-8 px-4"
            style={{
                color: 'var(--color-on-surface-variant)',
                fontFamily: 'var(--font-body-md)',
                lineHeight: '1.6',
            }}
        >
            Explore our curated collection of premium streetwear — bold styles, unmatched quality.
        </p>

        {productCount > 0 && (
            <span
                className="text-sm"
                style={{
                    color: 'var(--color-on-surface-variant)',
                    fontFamily: 'var(--font-label-sm)',
                }}
            >
                {productCount} product{productCount !== 1 ? 's' : ''} available
            </span>
        )}
    </div>
);

// ─── Filter Bar ────────────────────────────────────────────────────
const FilterBar = ({ sortOption, setSortOption, layout, setLayout }) => {
    const sortOptions = [
        { value: 'default', label: 'Latest' },
        { value: 'price-asc', label: 'Price: Low → High' },
        { value: 'price-desc', label: 'Price: High → Low' },
        { value: 'name', label: 'A → Z' },
    ];

    return (
        <div
            className="flex items-center justify-between mb-8 gap-4 flex-wrap"
        >
            <h2
                className="text-lg font-semibold"
                style={{
                    color: 'var(--color-on-surface)',
                    fontFamily: 'var(--font-headline-md)',
                }}
            >
                All Products
            </h2>

            <div className="flex items-center gap-3">
                {/* Sort */}
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
                    style={{
                        background: 'var(--color-surface-container)',
                        color: 'var(--color-on-surface)',
                        border: '1px solid var(--color-outline-variant)',
                        fontFamily: 'var(--font-body-sm)',
                    }}
                >
                    {sortOptions.map((o) => (
                        <option key={o.value} value={o.value} style={{ background: 'var(--color-surface-container)' }}>
                            {o.label}
                        </option>
                    ))}
                </select>

                {/* Layout toggle */}
                <div
                    className="flex items-center rounded-xl overflow-hidden"
                    style={{
                        border: '1px solid var(--color-outline-variant)',
                        background: 'var(--color-surface-container)',
                    }}
                >
                    {[
                        { icon: 'grid_view', value: 'grid' },
                        { icon: 'view_list', value: 'list' },
                    ].map((btn) => (
                        <button
                            key={btn.value}
                            onClick={() => setLayout(btn.value)}
                            className="flex items-center justify-center px-3 py-2 transition-all duration-200"
                            style={{
                                background: layout === btn.value ? 'var(--color-primary)' : 'transparent',
                                color: layout === btn.value ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                            }}
                            aria-label={btn.value}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{btn.icon}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Empty State ───────────────────────────────────────────────────
const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
            className="flex items-center justify-center rounded-3xl mb-6"
            style={{
                width: '80px',
                height: '80px',
                background: 'var(--color-surface-container)',
                border: '1px solid var(--color-outline-variant)',
            }}
        >
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--color-outline)' }}>
                shopping_bag
            </span>
        </div>
        <h3
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-headline-md)' }}
        >
            No Products Yet
        </h3>
        <p
            className="text-sm"
            style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-body-sm)' }}
        >
            Check back soon — new drops are on the way.
        </p>
    </div>
);

// ─── Home Page ─────────────────────────────────────────────────────
const Home = () => {
    const products = useSelector((state) => state.product.products);
    const user = useSelector((state) => state.auth.user);
    const { handleGetAllProducts } = useProduct();

    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState('default');
    const [layout, setLayout] = useState('grid');

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
        <div
            style={{
                minHeight: '100dvh',
                background: 'var(--color-background)',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}
        >
            <Navbar user={user} productCount={products?.length ?? 0} />

            <HeroBanner productCount={products?.length ?? 0} />

            {/* Main Content */}
            <main
                className="mx-auto px-4 md:px-8 pb-24"
                style={{ maxWidth: '1400px' }}
            >
                {/* Divider */}
                <div
                    className="mb-8"
                    style={{
                        height: '1px',
                        background: 'linear-gradient(to right, transparent, var(--color-outline-variant), transparent)',
                    }}
                />

                <FilterBar
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    layout={layout}
                    setLayout={setLayout}
                />

                {loading ? (
                    <div
                        className={
                            layout === 'grid'
                                ? 'grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                                : 'flex flex-col gap-4'
                        }
                    >
                        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <EmptyState />
                ) : layout === 'grid' ? (
                    <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {sortedProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    /* List layout */
                    <div className="flex flex-col gap-4">
                        {sortedProducts.map((product) => (
                            <div
                                key={product._id}
                                className="flex gap-5 rounded-2xl overflow-hidden p-4 transition-all duration-200 cursor-pointer"
                                style={{
                                    background: 'var(--color-surface-container)',
                                    border: '1px solid var(--color-outline-variant)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-outline-variant)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div
                                    className="rounded-xl overflow-hidden flex-shrink-0"
                                    style={{ width: '100px', height: '130px', background: 'var(--color-surface-container-low)' }}
                                >
                                    {product.images?.[0]?.url ? (
                                        <img
                                            src={product.images[0].url}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)', fontSize: '32px' }}>image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-between flex-1 py-1">
                                    <div>
                                        <h3
                                            className="font-semibold text-base mb-1 capitalize"
                                            style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-body-md)' }}
                                        >
                                            {product.title}
                                        </h3>
                                        <p
                                            className="text-sm line-clamp-2"
                                            style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-body-sm)' }}
                                        >
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-lg font-bold"
                                            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-label-md)' }}
                                        >
                                            {new Intl.NumberFormat('en-IN', {
                                                style: 'currency',
                                                currency: product.price?.currency || 'INR',
                                                maximumFractionDigits: 0,
                                            }).format(product.price?.amount ?? 0)}
                                        </span>
                                        <button
                                            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200"
                                            style={{
                                                background: 'var(--color-surface-container-high)',
                                                color: 'var(--color-on-surface)',
                                                border: '1px solid var(--color-outline-variant)',
                                                fontFamily: 'var(--font-label-sm)',
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add_shopping_cart</span>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer
                className="text-center py-6 text-xs"
                style={{
                    color: 'var(--color-on-surface-variant)',
                    fontFamily: 'var(--font-label-sm)',
                    borderTop: '1px solid var(--color-outline-variant)',
                }}
            >
                © {new Date().getFullYear()} Snitch — All Rights Reserved
            </footer>
        </div>
    );
};

export default Home;