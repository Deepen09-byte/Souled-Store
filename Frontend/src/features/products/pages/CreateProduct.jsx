import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProduct } from '../hook/useProducts';

export default function CreateProduct() {
    const navigate = useNavigate();
    const { handleCreateProduct } = useProduct();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priceAmount, setPriceAmount] = useState('');
    const [images, setImages] = useState([null, null, null, null]);
    const [previews, setPreviews] = useState([null, null, null, null]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    function handleImageSelect(index, e) {
        const file = e.target.files[0];
        if (!file) return;
        const newImages = [...images];
        const newPreviews = [...previews];
        newImages[index] = file;
        newPreviews[index] = URL.createObjectURL(file);
        setImages(newImages);
        setPreviews(newPreviews);
    }

    function handleRemoveImage(index) {
        const newImages = [...images];
        const newPreviews = [...previews];
        if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]);
        newImages[index] = null;
        newPreviews[index] = null;
        setImages(newImages);
        setPreviews(newPreviews);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim() || !priceAmount) return;
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            formData.append('priceAmount', parseFloat(priceAmount));
            formData.append('priceCurrency', 'INR');
            images.forEach((img) => { if (img) formData.append('images', img); });
            await handleCreateProduct(formData);
            navigate('/seller/dashboard');
        } catch (error) {
            console.error('Failed to create product:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const uploadedCount = images.filter(Boolean).length;

    return (
        <div style={{ background: "var(--color-background)", minHeight: "100dvh", color: "var(--color-on-surface)" }}>

            {/* ── Sticky Header ── */}
            <header
                className="sticky top-0 z-40 border-b"
                style={{ background: "rgba(253,252,250,0.94)", backdropFilter: "blur(12px)", borderColor: "var(--color-outline-variant)" }}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="p-1 cursor-pointer transition-colors"
                            style={{ background: "none", border: "none", color: "var(--color-on-surface-variant)" }}
                            aria-label="Go back"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </button>
                        <Link
                            to="/"
                            className="no-underline tracking-widest uppercase font-semibold text-lg md:text-xl"
                            style={{ fontFamily: "var(--font-serif)", color: "var(--color-on-surface)" }}
                        >
                            Souled Store Atelier
                        </Link>
                        <nav className="hidden md:flex items-center gap-2 text-xs label-caps" style={{ color: "var(--color-on-surface-variant)" }}>
                            <span>/</span>
                            <Link to="/seller/dashboard" className="no-underline hover:opacity-70 transition-opacity" style={{ color: "inherit" }}>Dashboard</Link>
                            <span>/</span>
                            <span style={{ color: "var(--color-secondary)" }}>Create Product</span>
                        </nav>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="label-caps text-[10px] underline"
                        style={{ background: "none", border: "none", color: "var(--color-on-surface-variant)", cursor: "pointer" }}
                    >
                        Discard
                    </button>
                </div>
            </header>

            {/* ── Main Content ── */}
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">

                {/* Page Header */}
                <div className="mb-10 border-b pb-6" style={{ borderColor: "var(--color-outline-variant)" }}>
                    <span className="label-caps block mb-1" style={{ color: "var(--color-secondary)", fontSize: "10px" }}>Seller Portal</span>
                    <h1 className="text-3xl md:text-4xl font-normal tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
                        List New Piece
                    </h1>
                    <p className="mt-2 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                        Fill in the archival details below to list your garment on the Souled Store Atelier.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">

                        {/* ── Left Column: Text Fields ── */}
                        <div className="flex-1 min-w-0 space-y-10">

                            {/* Product Title */}
                            <div>
                                <label htmlFor="product_title" className="label-caps block mb-3">
                                    Product Title <span style={{ color: "var(--color-secondary)" }}>*</span>
                                </label>
                                <input
                                    id="product_title"
                                    name="title"
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Archival Brushed Cotton Overshirt"
                                    className="field-underline"
                                    style={{ fontSize: "1.0625rem" }}
                                />
                                <p className="mt-2 text-[11px]" style={{ color: "var(--color-outline)" }}>{title.length}/100 characters</p>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="product_description" className="label-caps block mb-3">
                                    Description
                                </label>
                                <textarea
                                    id="product_description"
                                    name="description"
                                    rows={6}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the garment — material, artisanal construction, care instructions, silhouette notes..."
                                    style={{
                                        border: "none",
                                        borderBottom: "1px solid var(--color-outline-variant)",
                                        background: "transparent",
                                        outline: "none",
                                        width: "100%",
                                        padding: "10px 0",
                                        fontSize: "0.9375rem",
                                        color: "var(--color-on-surface)",
                                        fontFamily: "var(--font-sans)",
                                        resize: "none",
                                        lineHeight: "1.7",
                                        transition: "border-color 0.2s ease",
                                    }}
                                    onFocus={(e) => e.target.style.borderBottomColor = "var(--color-primary)"}
                                    onBlur={(e) => e.target.style.borderBottomColor = "var(--color-outline-variant)"}
                                />
                                <p className="mt-2 text-[11px]" style={{ color: "var(--color-outline)" }}>{description.length} characters</p>
                            </div>

                            {/* Price */}
                            <div>
                                <label htmlFor="product_price" className="label-caps block mb-3">
                                    Price (INR) <span style={{ color: "var(--color-secondary)" }}>*</span>
                                </label>
                                <div className="flex items-center gap-0" style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
                                    <span className="label-caps pr-3 pb-2.5" style={{ color: "var(--color-secondary)", fontSize: "12px", borderBottom: "none" }}>₹</span>
                                    <input
                                        id="product_price"
                                        name="priceAmount"
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={priceAmount}
                                        onChange={(e) => setPriceAmount(e.target.value)}
                                        placeholder="0.00"
                                        style={{
                                            border: "none",
                                            background: "transparent",
                                            outline: "none",
                                            flex: 1,
                                            padding: "10px 0",
                                            fontSize: "1.0625rem",
                                            color: "var(--color-on-surface)",
                                            fontFamily: "var(--font-sans)",
                                        }}
                                    />
                                </div>
                                <p className="mt-2 text-[11px]" style={{ color: "var(--color-outline)" }}>Enter the selling price in Indian Rupees.</p>
                            </div>

                            {/* Mobile: Images + Submit stacked below text fields */}
                            <div className="lg:hidden space-y-10 pb-10">
                                <ImagesPanel
                                    images={images}
                                    previews={previews}
                                    fileInputRefs={fileInputRefs}
                                    uploadedCount={uploadedCount}
                                    onSelect={handleImageSelect}
                                    onRemove={handleRemoveImage}
                                />
                                <SubmitRow isSubmitting={isSubmitting} title={title} priceAmount={priceAmount} onCancel={() => navigate(-1)} />
                            </div>
                        </div>

                        {/* ── Right Column: Images + Submit (desktop only, sticky) ── */}
                        <div className="hidden lg:flex flex-col gap-8 w-80 xl:w-96 shrink-0">
                            <div className="sticky top-24 space-y-8">
                                <ImagesPanel
                                    images={images}
                                    previews={previews}
                                    fileInputRefs={fileInputRefs}
                                    uploadedCount={uploadedCount}
                                    onSelect={handleImageSelect}
                                    onRemove={handleRemoveImage}
                                />
                                <SubmitRow isSubmitting={isSubmitting} title={title} priceAmount={priceAmount} onCancel={() => navigate(-1)} />
                            </div>
                        </div>

                    </div>
                </form>
            </main>
        </div>
    );
}

/* ── Images Panel ──────────────────────────────────────────────────────── */
function ImagesPanel({ images, previews, fileInputRefs, uploadedCount, onSelect, onRemove }) {
    return (
        <div
            className="p-6 rounded border"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-outline-variant)", boxShadow: "0 4px 20px -2px rgba(26,23,20,0.03)" }}
        >
            <div className="flex items-center justify-between mb-1">
                <span className="label-caps" style={{ fontSize: "9px", color: "var(--color-secondary)" }}>Archival Photography</span>
                <span className="label-caps text-[10px]" style={{ color: "var(--color-on-surface-variant)" }}>{uploadedCount}/4</span>
            </div>
            <h3 className="text-xl font-normal mb-1" style={{ fontFamily: "var(--font-serif)" }}>Product Images</h3>
            <p className="text-xs mb-5" style={{ color: "var(--color-on-surface-variant)", lineHeight: "1.6" }}>
                Upload up to 4 archival-quality images. The first will serve as the cover photograph.
            </p>

            <div className="grid grid-cols-2 gap-3">
                {images.map((_, index) => (
                    <div key={index} className="relative" style={{ aspectRatio: "1/1" }}>
                        <input
                            ref={fileInputRefs[index]}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => onSelect(index, e)}
                            id={`image_upload_${index}`}
                        />

                        {previews[index] ? (
                            <div className="w-full h-full rounded border overflow-hidden relative group" style={{ borderColor: "var(--color-outline-variant)" }}>
                                <img src={previews[index]} alt={`Product image ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(26,23,20,0.4)" }}>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRefs[index].current?.click()}
                                        className="p-1.5 rounded cursor-pointer transition-colors"
                                        style={{ background: "rgba(253,252,250,0.9)", border: "none", color: "var(--color-on-surface)" }}
                                        aria-label="Replace image"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">upload</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onRemove(index)}
                                        className="p-1.5 rounded cursor-pointer transition-colors"
                                        style={{ background: "rgba(253,252,250,0.9)", border: "none", color: "var(--color-error)" }}
                                        aria-label="Remove image"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                </div>
                                {index === 0 && (
                                    <span
                                        className="absolute top-2 left-2 label-caps text-[9px] px-1.5 py-0.5 rounded"
                                        style={{ background: "var(--color-secondary)", color: "var(--color-on-secondary)" }}
                                    >Cover</span>
                                )}
                            </div>
                        ) : (
                            <label
                                htmlFor={`image_upload_${index}`}
                                className="flex flex-col items-center justify-center w-full h-full rounded border-2 border-dashed cursor-pointer transition-all duration-200"
                                style={{ borderColor: "var(--color-outline-variant)" }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--color-secondary)"}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--color-outline-variant)"}
                            >
                                <span className="material-symbols-outlined text-[28px] mb-1" style={{ color: "var(--color-outline)", fontVariationSettings: "'wght' 200" }}>
                                    {index === 0 ? "add_photo_alternate" : "photo_library"}
                                </span>
                                <span className="label-caps text-[9px]" style={{ color: "var(--color-outline)" }}>
                                    {index === 0 ? "Cover" : `Photo ${index + 1}`}
                                </span>
                            </label>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Submit Row ────────────────────────────────────────────────────────── */
function SubmitRow({ isSubmitting, title, priceAmount, onCancel }) {
    return (
        <div
            className="p-6 rounded border"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-outline-variant)", boxShadow: "0 4px 20px -2px rgba(26,23,20,0.03)" }}
        >
            <div className="mb-4 space-y-1.5 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]" style={{ color: title ? "var(--color-success)" : "var(--color-outline)" }}>
                        {title ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span>Product title</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]" style={{ color: priceAmount ? "var(--color-success)" : "var(--color-outline)" }}>
                        {priceAmount ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span>Selling price</span>
                </div>
            </div>

            <div className="pt-4 border-t flex items-center gap-3" style={{ borderColor: "var(--color-outline-variant)" }}>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="btn-ghost px-5 py-3 flex-1 flex items-center justify-center rounded"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !priceAmount}
                    id="publish_product_btn"
                    className="btn-dark px-5 py-3 flex-1 flex items-center justify-center gap-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <span className="material-symbols-outlined text-[16px] animate-spin">autorenew</span>
                            <span>Publishing...</span>
                        </>
                    ) : (
                        <>
                            <span>Publish Piece</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
