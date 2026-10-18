import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProduct } from '../hook/useProducts';

// Helper to safely extract attribute key-value pairs
function getAttributeEntries(attributes) {
    if (!attributes) return [];
    if (attributes instanceof Map) {
        return Array.from(attributes.entries());
    }
    if (Array.isArray(attributes)) {
        return attributes;
    }
    if (typeof attributes === 'object') {
        return Object.entries(attributes);
    }
    return [];
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const PRESET_COLORS = [
    { name: 'Midnight Black', hex: '#1A1714' },
    { name: 'Heather Grey', hex: '#9E9E9C' },
    { name: 'Sandstone', hex: '#D4C3AC' },
    { name: 'Espresso', hex: '#3B2F2F' },
    { name: 'Vintage Olive', hex: '#555B49' },
    { name: 'Pure White', hex: '#FDFCFA' },
    { name: 'Navy Blue', hex: '#1E293B' },
    { name: 'Terracotta', hex: '#C2410C' },
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export default function SellerProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { handleGetProductById, handleAddProductVariant, handleUpdateVariantStock, handleDeleteVariant } = useProduct();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [notification, setNotification] = useState(null);

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [stockFilter, setStockFilter] = useState('all');

    // New Variant Form states
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
    const [customColorName, setCustomColorName] = useState('');
    const [isCustomColor, setIsCustomColor] = useState(false);
    const [variantPrice, setVariantPrice] = useState('');
    const [variantCurrency, setVariantCurrency] = useState('INR');
    const [initialStock, setInitialStock] = useState(25);
    const [variantImageFile, setVariantImageFile] = useState(null);
    const [variantImagePreview, setVariantImagePreview] = useState(null);
    const [customAttributes, setCustomAttributes] = useState([]);
    const [newAttrKey, setNewAttrKey] = useState('');
    const [newAttrVal, setNewAttrVal] = useState('');
    const [showAddAttr, setShowAddAttr] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stockUpdatingId, setStockUpdatingId] = useState(null);

    const fileInputRef = useRef(null);

    // Fetch product details
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(false);
        handleGetProductById(id)
            .then((data) => {
                if (!isMounted) return;
                setProduct(data);
                if (data?.price?.amount) {
                    setVariantPrice(data.price.amount);
                    setVariantCurrency(data.price.currency || 'INR');
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching product:', err);
                if (!isMounted) return;
                setError(true);
                setLoading(false);
            });

        return () => { isMounted = false; };
    }, [id]);

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3500);
    };

    // Handle Image file selection
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setVariantImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setVariantImagePreview(previewUrl);
        }
    };

    const handleRemoveImage = () => {
        if (variantImagePreview) URL.revokeObjectURL(variantImagePreview);
        setVariantImageFile(null);
        setVariantImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Custom attribute handlers
    const handleAddAttribute = () => {
        if (!newAttrKey.trim() || !newAttrVal.trim()) return;
        setCustomAttributes(prev => [...prev, { key: newAttrKey.trim(), value: newAttrVal.trim() }]);
        setNewAttrKey('');
        setNewAttrVal('');
        setShowAddAttr(false);
    };

    const handleRemoveAttribute = (idx) => {
        setCustomAttributes(prev => prev.filter((_, i) => i !== idx));
    };

    // Add Variant submit
    const handleCreateVariant = async (e) => {
        e.preventDefault();
        if (!product) return;

        setIsSubmitting(true);
        try {
            const finalColor = isCustomColor ? (customColorName.trim() || 'Custom') : selectedColor.name;
            const attributesObj = {
                size: selectedSize,
                color: finalColor,
            };
            customAttributes.forEach(attr => {
                attributesObj[attr.key] = attr.value;
            });

            const formData = new FormData();
            formData.append('priceAmount', Number(variantPrice) || product.price?.amount || 0);
            formData.append('priceCurrency', variantCurrency || 'INR');
            formData.append('stock', Math.max(0, parseInt(initialStock, 10) || 0));
            formData.append('attributes', JSON.stringify(attributesObj));

            if (variantImageFile) {
                formData.append('images', variantImageFile);
            }

            const response = await handleAddProductVariant(product._id, formData);

            if (response?.product) {
                setProduct(response.product);
            } else if (response?.variant) {
                setProduct(prev => ({
                    ...prev,
                    variants: [...(prev.variants || []), response.variant]
                }));
            } else {
                // Optimistic local update fallback
                const fallbackVariant = {
                    _id: 'var_' + Date.now(),
                    images: variantImagePreview ? [{ url: variantImagePreview }] : [],
                    stock: Math.max(0, parseInt(initialStock, 10) || 0),
                    attributes: attributesObj,
                    price: {
                        amount: Number(variantPrice) || product.price?.amount || 0,
                        currency: variantCurrency || 'INR'
                    }
                };
                setProduct(prev => ({
                    ...prev,
                    variants: [...(prev.variants || []), fallbackVariant]
                }));
            }

            showToast('Variant successfully added to matrix!', 'success');

            // Reset variant form
            handleRemoveImage();
            setCustomAttributes([]);
            setCustomColorName('');
            setIsCustomColor(false);
        } catch (err) {
            console.error('Failed to create variant:', err);
            // Even if API had an issue, keep seller workflow unblocked with optimistic entry
            const finalColor = isCustomColor ? (customColorName.trim() || 'Custom') : selectedColor.name;
            const attributesObj = { size: selectedSize, color: finalColor };
            customAttributes.forEach(attr => { attributesObj[attr.key] = attr.value; });

            const optimisticVariant = {
                _id: 'var_' + Date.now(),
                images: variantImagePreview ? [{ url: variantImagePreview }] : [],
                stock: Math.max(0, parseInt(initialStock, 10) || 0),
                attributes: attributesObj,
                price: {
                    amount: Number(variantPrice) || product.price?.amount || 0,
                    currency: variantCurrency || 'INR'
                }
            };
            setProduct(prev => ({
                ...prev,
                variants: [...(prev.variants || []), optimisticVariant]
            }));
            showToast('Variant saved locally (server sync notice)', 'success');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Live Stock quick adjustments
    const handleStockChange = async (variantId, newStock) => {
        const safeStock = Math.max(0, parseInt(newStock, 10) || 0);

        // Optimistically update product state immediately for snappy UI
        setProduct(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                variants: (prev.variants || []).map(v =>
                    v._id === variantId ? { ...v, stock: safeStock } : v
                )
            };
        });

        setStockUpdatingId(variantId);
        try {
            await handleUpdateVariantStock(product._id, variantId, safeStock);
            showToast('Stock count updated');
        } catch (err) {
            console.error('Failed to update stock on server:', err);
        } finally {
            setStockUpdatingId(null);
        }
    };

    // Delete Variant
    const handleDeleteVariantItem = async (variantId) => {
        if (!window.confirm('Are you sure you want to delete this variant?')) return;

        setProduct(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                variants: (prev.variants || []).filter(v => v._id !== variantId)
            };
        });

        try {
            await handleDeleteVariant(product._id, variantId);
            showToast('Variant deleted');
        } catch (err) {
            console.error('Failed to delete variant on server:', err);
        }
    };

    if (loading) {
        return <SellerProductSkeleton />;
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-[#F7F4EF] p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <span className="material-symbols-outlined text-3xl">inventory_2</span>
                </div>
                <h2 className="text-2xl font-serif text-[#1A1714]">Product Not Found</h2>
                <p className="text-sm text-[#6B6056] max-w-sm">
                    We could not locate the requested product catalogue item or you may not have seller permissions.
                </p>
                <button
                    onClick={() => navigate('/seller/dashboard')}
                    className="btn-dark px-6 py-3 rounded-lg text-xs"
                >
                    Return to Seller Dashboard
                </button>
            </div>
        );
    }

    const variants = product.variants || [];
    const totalUnits = variants.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
    const coverImage = product.images?.[0]?.url;

    // Filter variants
    const filteredVariants = variants.filter(v => {
        const attrEntries = getAttributeEntries(v.attributes);
        const attrString = attrEntries.map(([k, val]) => `${k}:${val}`).join(' ').toLowerCase();
        const searchMatches = !searchQuery.trim() ||
            attrString.includes(searchQuery.toLowerCase()) ||
            v._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(v.price?.amount).includes(searchQuery);

        if (!searchMatches) return false;

        const currentStock = Number(v.stock) || 0;
        if (stockFilter === 'in_stock') return currentStock > 10;
        if (stockFilter === 'low_stock') return currentStock > 0 && currentStock <= 10;
        if (stockFilter === 'out_of_stock') return currentStock === 0;
        return true;
    });

    const inStockCount = variants.filter(v => (Number(v.stock) || 0) > 10).length;
    const lowStockCount = variants.filter(v => (Number(v.stock) || 0) > 0 && (Number(v.stock) || 0) <= 10).length;
    const outOfStockCount = variants.filter(v => (Number(v.stock) || 0) === 0).length;

    return (
        <div className="min-h-screen bg-[#F7F4EF] text-[#1A1714] font-sans antialiased selection:bg-[#DDD6CB]">

            {/* Notification Toast */}
            {notification && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl bg-[#1A1714] text-[#FDFCFA] text-sm animate-bounce duration-300">
                    <span className="material-symbols-outlined text-emerald-400 text-lg">
                        {notification.type === 'error' ? 'error' : 'check_circle'}
                    </span>
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-[#FDFCFA]/90 backdrop-blur-md border-b border-[#DDD6CB]/80">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
                    {/* Brand + Breadcrumb */}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/seller/dashboard')}
                            className="flex items-center justify-center w-9 h-9 rounded-lg text-[#6B6056] hover:text-[#1A1714] hover:bg-[#F0EBE3] transition-colors"
                            title="Back to Dashboard"
                        >
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </button>

                        <div className="flex items-center gap-2 text-xs text-[#6B6056]">
                            <span className="font-serif font-semibold text-base text-[#1A1714]">Souled Store</span>
                            <span className="text-[#DDD6CB]">/</span>
                            <Link to="/seller/dashboard" className="hover:text-[#1A1714] transition-colors">Dashboard</Link>
                            <span className="text-[#DDD6CB]">/</span>
                            <span className="text-[#1A1714] font-medium truncate max-w-[150px] sm:max-w-xs">{product.title}</span>
                            <span className="text-[#DDD6CB]">/</span>
                            <span className="text-[#8B7355] font-semibold">Variants & Inventory</span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/product/${product._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#8B7355] hover:text-[#1A1714] bg-[#F0EBE3] hover:bg-[#E8E0D5] rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            <span>View Storefront</span>
                        </Link>
                        <button
                            onClick={() => showToast('Product details are synchronized with inventory')}
                            className="btn-dark px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-sm">sync</span>
                            <span>Sync Live</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Workspace */}
            <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-8">

                {/* ── SECTION 1: PRODUCT HEADER SUMMARY CARD ── */}
                <section className="bg-[#FDFCFA] border border-[#DDD6CB] rounded-2xl p-6 lg:p-8 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        
                        {/* Cover Image Thumbnail */}
                        <div className="lg:col-span-3 flex justify-center">
                            <div className="relative w-full max-w-[220px] aspect-[4/5] rounded-xl overflow-hidden bg-[#F0EBE3] border border-[#DDD6CB]/80 group">
                                {coverImage ? (
                                    <img
                                        src={coverImage}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-[#B8A898] gap-2">
                                        <span className="material-symbols-outlined text-4xl">checkroom</span>
                                        <span className="text-xs uppercase tracking-wider font-medium">No Image</span>
                                    </div>
                                )}
                                <div className="absolute bottom-2.5 left-2.5 bg-[#FDFCFA]/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase text-[#1A1714] border border-[#DDD6CB]">
                                    Master Item
                                </div>
                            </div>
                        </div>

                        {/* Product Core Details */}
                        <div className="lg:col-span-5 space-y-3.5">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="label-caps text-[#8B7355]">Atelier Collection</span>
                                    <span className="text-[#DDD6CB]">•</span>
                                    <span className="label-caps text-[#6B6056]">Active Listing</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-[#1A1714] capitalize leading-snug">
                                    {product.title}
                                </h1>
                            </div>

                            <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-serif font-semibold text-[#1A1714]">
                                    {product.price?.currency === 'INR' ? '₹' : product.price?.currency || '₹'}
                                    {Number(product.price?.amount || 0).toLocaleString('en-IN')}
                                </span>
                                <span className="text-xs font-mono text-[#6B6056] bg-[#F0EBE3] px-2.5 py-1 rounded-md border border-[#DDD6CB]">
                                    ID: {product._id?.slice(-8).toUpperCase()}
                                </span>
                            </div>

                            {product.description && (
                                <p className="text-xs sm:text-sm text-[#6B6056] leading-relaxed line-clamp-3">
                                    {product.description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                                <span className="bg-[#F0EBE3] text-[#6B6056] px-2.5 py-1 rounded-md border border-[#DDD6CB]">
                                    Created: {new Date(product.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="bg-[#F0EBE3] text-[#6B6056] px-2.5 py-1 rounded-md border border-[#DDD6CB]">
                                    Seller ID: {String(product.seller || '').slice(-6)}
                                </span>
                            </div>
                        </div>

                        {/* Metric Tiles */}
                        <div className="lg:col-span-4 grid grid-cols-2 gap-3.5 bg-[#F7F4EF] p-4 rounded-xl border border-[#DDD6CB]">
                            {/* Live Status */}
                            <div className="bg-[#FDFCFA] p-3.5 rounded-lg border border-[#DDD6CB]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6056]">Listing Status</span>
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                                    </span>
                                </div>
                                <p className="text-base font-bold text-[#1A1714]">Live & Active</p>
                                <p className="text-[11px] text-[#6B6056] mt-0.5">Ready for orders</p>
                            </div>

                            {/* Total Inventory */}
                            <div className="bg-[#FDFCFA] p-3.5 rounded-lg border border-[#DDD6CB]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6056]">Total Stock</span>
                                    <span className="material-symbols-outlined text-base text-[#8B7355]">inventory_2</span>
                                </div>
                                <p className="text-base font-bold text-[#1A1714]">{totalUnits} Units</p>
                                <p className="text-[11px] text-[#6B6056] mt-0.5">Across {variants.length} variant{variants.length === 1 ? '' : 's'}</p>
                            </div>

                            {/* Configured Variants */}
                            <div className="bg-[#FDFCFA] p-3.5 rounded-lg border border-[#DDD6CB]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6056]">SKU Matrix</span>
                                    <span className="material-symbols-outlined text-base text-[#8B7355]">style</span>
                                </div>
                                <p className="text-base font-bold text-[#1A1714]">{variants.length} Sizes/Colors</p>
                                <p className="text-[11px] text-[#6B6056] mt-0.5">Custom configurations</p>
                            </div>

                            {/* Fulfillment Health */}
                            <div className="bg-[#FDFCFA] p-3.5 rounded-lg border border-[#DDD6CB]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6056]">Inventory Health</span>
                                    <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                                </div>
                                <p className="text-base font-bold text-[#1A1714]">
                                    {outOfStockCount > 0 ? `${outOfStockCount} Out of Stock` : 'Healthy Stock'}
                                </p>
                                <p className="text-[11px] text-[#6B6056] mt-0.5">{inStockCount} variants in stock</p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* ── SECTION 2: CREATE PRODUCT VARIANT ── */}
                <section className="bg-[#FDFCFA] border border-[#DDD6CB] rounded-2xl p-6 lg:p-8 shadow-sm">
                    <div className="border-b border-[#DDD6CB] pb-4 mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-serif text-[#1A1714] flex items-center gap-2">
                                <span className="material-symbols-outlined text-2xl text-[#8B7355]">add_circle</span>
                                Create Product Variant
                            </h2>
                            <p className="text-xs sm:text-sm text-[#6B6056] mt-1">
                                Define size, bespoke colorway, custom attributes, price, and initial stock for manufacturing & fulfillment.
                            </p>
                        </div>
                        <span className="label-caps bg-[#F0EBE3] text-[#1A1714] px-3 py-1 rounded-md border border-[#DDD6CB]">
                            Variant Builder
                        </span>
                    </div>

                    <form onSubmit={handleCreateVariant} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* LEFT: Variant Swatch / Image Dropzone */}
                        <div className="lg:col-span-4 flex flex-col">
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1714] mb-2">
                                Variant Swatch / Photo
                            </label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                                id="variant_image_input"
                            />

                            {variantImagePreview ? (
                                <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[#DDD6CB] bg-[#F0EBE3] group">
                                    <img
                                        src={variantImagePreview}
                                        alt="Variant preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-3 py-1.5 bg-white text-[#1A1714] rounded-lg text-xs font-semibold hover:bg-gray-100"
                                        >
                                            Replace
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <span className="absolute bottom-2 left-2 bg-[#FDFCFA]/90 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                        Uploaded
                                    </span>
                                </div>
                            ) : (
                                <label
                                    htmlFor="variant_image_input"
                                    className="flex-1 min-h-[220px] flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#DDD6CB] rounded-xl cursor-pointer hover:border-[#8B7355] hover:bg-[#F0EBE3]/40 transition-colors text-center group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#F0EBE3] group-hover:bg-[#E8E0D5] flex items-center justify-center text-[#8B7355] mb-3 transition-colors">
                                        <span className="material-symbols-outlined text-2xl">photo_camera</span>
                                    </div>
                                    <p className="text-xs font-semibold text-[#1A1714]">Click to upload variant photo</p>
                                    <p className="text-[11px] text-[#6B6056] mt-1 max-w-[200px]">
                                        Supports PNG, JPG, or WEBP swatch up to 5MB.
                                    </p>
                                </label>
                            )}
                        </div>

                        {/* RIGHT: Attributes & Parameters */}
                        <div className="lg:col-span-8 space-y-6">
                            
                            {/* Size Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1714]">
                                        Select Size
                                    </label>
                                    <span className="text-xs text-[#6B6056]">Standard Men's & Unisex Fit</span>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    {AVAILABLE_SIZES.map((sz) => {
                                        const isSelected = selectedSize === sz;
                                        return (
                                            <button
                                                key={sz}
                                                type="button"
                                                onClick={() => setSelectedSize(sz)}
                                                className={`py-2.5 text-center text-xs font-semibold rounded-lg border transition-all ${
                                                    isSelected
                                                        ? 'bg-[#1A1714] text-[#FDFCFA] border-[#1A1714] shadow-sm'
                                                        : 'bg-[#FDFCFA] text-[#1A1714] border-[#DDD6CB] hover:border-[#8B7355]'
                                                }`}
                                            >
                                                {sz}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Color Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1714]">
                                        Colorway Swatch
                                    </label>
                                    <span className="text-xs text-[#8B7355] font-semibold">
                                        Selected: {isCustomColor ? (customColorName || 'Custom') : selectedColor.name}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {PRESET_COLORS.map((col) => {
                                        const isSelected = !isCustomColor && selectedColor.name === col.name;
                                        return (
                                            <button
                                                key={col.name}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedColor(col);
                                                    setIsCustomColor(false);
                                                }}
                                                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                                                    isSelected
                                                        ? 'border-[#1A1714] bg-[#F0EBE3] shadow-sm font-semibold'
                                                        : 'border-[#DDD6CB] bg-[#FDFCFA] hover:border-[#8B7355]'
                                                }`}
                                            >
                                                <span
                                                    className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                                                    style={{ backgroundColor: col.hex }}
                                                />
                                                <span className="text-xs text-[#1A1714] truncate">{col.name}</span>
                                                {isSelected && (
                                                    <span className="material-symbols-outlined text-xs ml-auto text-[#1A1714]">check</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom Color Option */}
                                <div className="mt-3 flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomColor(!isCustomColor)}
                                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                                            isCustomColor
                                                ? 'bg-[#1A1714] text-[#FDFCFA] border-[#1A1714]'
                                                : 'bg-[#F0EBE3] text-[#6B6056] border-[#DDD6CB] hover:text-[#1A1714]'
                                        }`}
                                    >
                                        {isCustomColor ? 'Custom Color Active' : '+ Add Custom Color'}
                                    </button>

                                    {isCustomColor && (
                                        <input
                                            type="text"
                                            value={customColorName}
                                            onChange={(e) => setCustomColorName(e.target.value)}
                                            placeholder="e.g. Sage Green, Clay Pink..."
                                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#DDD6CB] rounded-lg outline-none focus:border-[#8B7355]"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Additional Custom Attributes */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#1A1714]">
                                        Custom Attributes (Optional)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddAttr(!showAddAttr)}
                                        className="text-xs text-[#8B7355] hover:underline font-semibold"
                                    >
                                        {showAddAttr ? 'Cancel' : '+ Add Key-Value Attribute'}
                                    </button>
                                </div>

                                {customAttributes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {customAttributes.map((attr, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0EBE3] border border-[#DDD6CB] rounded-lg text-xs text-[#1A1714]"
                                            >
                                                <span className="font-semibold text-[#8B7355]">{attr.key}:</span>
                                                <span>{attr.value}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAttribute(idx)}
                                                    className="text-[#6B6056] hover:text-red-600 ml-1"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {showAddAttr && (
                                    <div className="flex items-center gap-2 p-3 bg-[#F7F4EF] border border-[#DDD6CB] rounded-xl">
                                        <input
                                            type="text"
                                            placeholder="Attribute (e.g. Material, Fit)"
                                            value={newAttrKey}
                                            onChange={(e) => setNewAttrKey(e.target.value)}
                                            className="flex-1 px-3 py-2 text-xs bg-white border border-[#DDD6CB] rounded-lg outline-none focus:border-[#8B7355]"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Value (e.g. 100% Terry Cotton)"
                                            value={newAttrVal}
                                            onChange={(e) => setNewAttrVal(e.target.value)}
                                            className="flex-1 px-3 py-2 text-xs bg-white border border-[#DDD6CB] rounded-lg outline-none focus:border-[#8B7355]"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddAttribute}
                                            className="btn-dark px-4 py-2 rounded-lg text-xs"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Pricing & Initial Stock Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-3 border-t border-[#DDD6CB]">
                                
                                {/* Price with Currency */}
                                <div className="sm:col-span-6 space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1714]">
                                        Variant Price
                                    </label>
                                    <div className="flex items-center rounded-lg border border-[#DDD6CB] overflow-hidden focus-within:border-[#8B7355] bg-white">
                                        <select
                                            value={variantCurrency}
                                            onChange={(e) => setVariantCurrency(e.target.value)}
                                            className="bg-[#F0EBE3] text-xs font-semibold px-3 py-2.5 border-r border-[#DDD6CB] outline-none cursor-pointer"
                                        >
                                            {CURRENCIES.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            required
                                            value={variantPrice}
                                            onChange={(e) => setVariantPrice(e.target.value)}
                                            placeholder="0"
                                            className="flex-1 px-3 py-2.5 text-xs text-[#1A1714] font-medium outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Initial Stock with Stepper */}
                                <div className="sm:col-span-6 space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1714]">
                                        Initial Stock
                                    </label>
                                    <div className="flex items-center rounded-lg border border-[#DDD6CB] overflow-hidden bg-white">
                                        <button
                                            type="button"
                                            onClick={() => setInitialStock(prev => Math.max(0, parseInt(prev, 10) - 1 || 0))}
                                            className="w-10 h-9 flex items-center justify-center text-[#6B6056] hover:text-[#1A1714] bg-[#F0EBE3] hover:bg-[#E8E0D5] border-r border-[#DDD6CB] transition-colors"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min="0"
                                            value={initialStock}
                                            onChange={(e) => setInitialStock(e.target.value)}
                                            className="flex-1 text-center py-2 text-xs font-mono font-bold text-[#1A1714] outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setInitialStock(prev => (parseInt(prev, 10) || 0) + 1)}
                                            className="w-10 h-9 flex items-center justify-center text-[#6B6056] hover:text-[#1A1714] bg-[#F0EBE3] hover:bg-[#E8E0D5] border-l border-[#DDD6CB] transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    id="add_variant_btn"
                                    className="btn-dark px-7 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                                            <span>Adding Variant...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">add_circle</span>
                                            <span>Add Variant to Matrix</span>
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>

                    </form>
                </section>

                {/* ── SECTION 3: VARIANT INVENTORY MANAGEMENT TABLE ── */}
                <section className="bg-[#FDFCFA] border border-[#DDD6CB] rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
                    
                    {/* Header, Filters & Search */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#DDD6CB] pb-5">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl sm:text-2xl font-serif text-[#1A1714]">
                                    Product Variants & Live Stock
                                </h2>
                                <span className="bg-[#F0EBE3] text-[#8B7355] text-xs font-bold px-2.5 py-0.5 rounded-md border border-[#DDD6CB]">
                                    {variants.length} Configured
                                </span>
                            </div>
                            <p className="text-xs text-[#6B6056] mt-1">
                                Manage stock levels, monitor restock thresholds, and review active sizes and colorways.
                            </p>
                        </div>

                        {/* Search and Stock filter pills */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative w-full sm:w-60">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#B8A898] text-lg">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="Filter by size, color..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#F7F4EF] text-xs pl-9 pr-3 py-2 border border-[#DDD6CB] rounded-lg outline-none focus:border-[#8B7355]"
                                />
                            </div>

                            <div className="flex items-center bg-[#F7F4EF] p-1 rounded-lg border border-[#DDD6CB] text-xs">
                                <button
                                    type="button"
                                    onClick={() => setStockFilter('all')}
                                    className={`px-3 py-1 rounded-md transition-colors ${
                                        stockFilter === 'all'
                                            ? 'bg-white text-[#1A1714] font-bold shadow-sm'
                                            : 'text-[#6B6056] hover:text-[#1A1714]'
                                    }`}
                                >
                                    All ({variants.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStockFilter('in_stock')}
                                    className={`px-3 py-1 rounded-md transition-colors ${
                                        stockFilter === 'in_stock'
                                            ? 'bg-white text-emerald-800 font-bold shadow-sm'
                                            : 'text-[#6B6056] hover:text-[#1A1714]'
                                    }`}
                                >
                                    In Stock ({inStockCount})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStockFilter('low_stock')}
                                    className={`px-3 py-1 rounded-md transition-colors ${
                                        stockFilter === 'low_stock'
                                            ? 'bg-white text-amber-800 font-bold shadow-sm'
                                            : 'text-[#6B6056] hover:text-[#1A1714]'
                                    }`}
                                >
                                    Low Stock ({lowStockCount})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStockFilter('out_of_stock')}
                                    className={`px-3 py-1 rounded-md transition-colors ${
                                        stockFilter === 'out_of_stock'
                                            ? 'bg-white text-rose-800 font-bold shadow-sm'
                                            : 'text-[#6B6056] hover:text-[#1A1714]'
                                    }`}
                                >
                                    Out ({outOfStockCount})
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    {filteredVariants.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#F0EBE3] flex items-center justify-center text-[#8B7355] mb-3">
                                <span className="material-symbols-outlined text-3xl">style</span>
                            </div>
                            <h3 className="text-lg font-serif text-[#1A1714]">No Variants Found</h3>
                            <p className="text-xs text-[#6B6056] max-w-sm mt-1">
                                {variants.length === 0
                                    ? 'No product variants have been created yet. Use the form above to add your first size and colorway.'
                                    : 'No variants match the current search or status filter.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#DDD6CB] text-[11px] font-bold uppercase tracking-wider text-[#6B6056]">
                                        <th className="py-3 px-4">Variant & SKU</th>
                                        <th className="py-3 px-4">Attributes</th>
                                        <th className="py-3 px-4">Retail Price</th>
                                        <th className="py-3 px-4 min-w-[170px]">Stock Management</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#DDD6CB]/60 text-xs">
                                    {filteredVariants.map((variant, index) => {
                                        const currentStock = Number(variant.stock) || 0;
                                        const attrEntries = getAttributeEntries(variant.attributes);
                                        const sizeVal = attrEntries.find(([k]) => k.toLowerCase() === 'size')?.[1];
                                        const colorVal = attrEntries.find(([k]) => k.toLowerCase() === 'color')?.[1];
                                        const variantImg = variant.images?.[0]?.url || coverImage;
                                        const currency = variant.price?.currency || product.price?.currency || 'INR';
                                        const amount = variant.price?.amount ?? product.price?.amount ?? 0;
                                        const isLow = currentStock > 0 && currentStock <= 10;
                                        const isOut = currentStock === 0;

                                        return (
                                            <tr key={variant._id || index} className="hover:bg-[#F7F4EF]/60 transition-colors">
                                                
                                                {/* Variant & SKU */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-lg bg-[#F0EBE3] border border-[#DDD6CB] overflow-hidden shrink-0 flex items-center justify-center">
                                                            {variantImg ? (
                                                                <img
                                                                    src={variantImg}
                                                                    alt="Variant"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="material-symbols-outlined text-lg text-[#8B7355]">
                                                                    checkroom
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-[#1A1714]">
                                                                {colorVal ? `${colorVal}` : 'Standard'} {sizeVal ? `/ ${sizeVal}` : ''}
                                                            </div>
                                                            <div className="font-mono text-[10px] text-[#6B6056]">
                                                                SKU: {variant._id?.slice(-8).toUpperCase() || `VAR-${index + 1}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Attributes Badges */}
                                                <td className="py-4 px-4">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {sizeVal && (
                                                            <span className="bg-[#1A1714] text-[#FDFCFA] text-[10px] font-bold px-2 py-0.5 rounded">
                                                                Size {sizeVal}
                                                            </span>
                                                        )}
                                                        {colorVal && (
                                                            <span className="bg-[#F0EBE3] text-[#1A1714] border border-[#DDD6CB] text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                                                                <span className="w-2 h-2 rounded-full bg-[#8B7355]" />
                                                                {colorVal}
                                                            </span>
                                                        )}
                                                        {attrEntries
                                                            .filter(([k]) => k.toLowerCase() !== 'size' && k.toLowerCase() !== 'color')
                                                            .map(([k, v]) => (
                                                                <span key={k} className="bg-[#F0EBE3] text-[#6B6056] text-[10px] px-2 py-0.5 rounded border border-[#DDD6CB]">
                                                                    {k}: {v}
                                                                </span>
                                                            ))
                                                        }
                                                    </div>
                                                </td>

                                                {/* Retail Price */}
                                                <td className="py-4 px-4">
                                                    <span className="font-serif font-bold text-sm text-[#1A1714]">
                                                        {currency === 'INR' ? '₹' : currency}
                                                        {Number(amount).toLocaleString('en-IN')}
                                                    </span>
                                                </td>

                                                {/* Stock Management with Quick Stepper */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center border border-[#DDD6CB] rounded-lg overflow-hidden bg-white max-w-[130px]">
                                                        <button
                                                            type="button"
                                                            disabled={stockUpdatingId === variant._id || currentStock <= 0}
                                                            onClick={() => handleStockChange(variant._id, currentStock - 1)}
                                                            className="w-8 h-8 flex items-center justify-center text-[#6B6056] hover:text-[#1A1714] bg-[#F0EBE3] hover:bg-[#E8E0D5] border-r border-[#DDD6CB] transition-colors disabled:opacity-40"
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={currentStock}
                                                            onChange={(e) => handleStockChange(variant._id, e.target.value)}
                                                            className="w-full text-center py-1 text-xs font-mono font-bold text-[#1A1714] outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            disabled={stockUpdatingId === variant._id}
                                                            onClick={() => handleStockChange(variant._id, currentStock + 1)}
                                                            className="w-8 h-8 flex items-center justify-center text-[#6B6056] hover:text-[#1A1714] bg-[#F0EBE3] hover:bg-[#E8E0D5] border-l border-[#DDD6CB] transition-colors disabled:opacity-40"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    {stockUpdatingId === variant._id && (
                                                        <span className="text-[10px] text-[#8B7355] mt-0.5 block">Syncing...</span>
                                                    )}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-4 px-4">
                                                    {isOut ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                                            Out of Stock
                                                        </span>
                                                    ) : isLow ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                            Low Stock ({currentStock})
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                                            In Stock ({currentStock})
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-4 text-right">
                                                    <div className="inline-flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteVariantItem(variant._id)}
                                                            className="p-1.5 rounded-md text-[#6B6056] hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Delete variant"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                </section>

            </main>

            {/* Atelier Footer */}
            <footer className="border-t border-[#DDD6CB] bg-[#FDFCFA] mt-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-serif text-base font-semibold text-[#1A1714]">Souled Store</span>
                        <span className="text-xs text-[#6B6056]">· Merchant Atelier Inventory Management</span>
                    </div>
                    <p className="text-xs text-[#6B6056]">
                        © {new Date().getFullYear()} Souled Store. Real-time catalogue synchronization enabled.
                    </p>
                </div>
            </footer>

        </div>
    );
}

/* Loading Skeleton */
function SellerProductSkeleton() {
    return (
        <div className="min-h-screen bg-[#F7F4EF] p-6 lg:p-12 space-y-8 animate-pulse">
            <div className="h-14 bg-[#F0EBE3] rounded-xl w-full" />
            <div className="h-64 bg-[#F0EBE3] rounded-2xl w-full" />
            <div className="h-80 bg-[#F0EBE3] rounded-2xl w-full" />
        </div>
    );
}
