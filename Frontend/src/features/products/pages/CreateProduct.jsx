import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
            formData.append('priceCurrency', 'INR')
            images.forEach((img) => {
                if (img) formData.append('images', img);
            });

            await handleCreateProduct(formData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to create product:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const uploadedCount = images.filter(Boolean).length;

    return (
        <div className="min-h-screen bg-white font-sans antialiased">

            {/* Top Navigation */}
            <header className="border-b border-gray-100 bg-white sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all duration-150 active:scale-95"
                            aria-label="Go back"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                <path d="M19 12H5M12 5l-7 7 7 7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="font-semibold text-gray-800 text-base tracking-tight">Souled Store</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-gray-300">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                            <span>Dashboard</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-gray-300">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                            <span className="text-gray-600 font-medium">Create Product</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-150"
                        >
                            Discard
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-10">

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Create Product
                    </h1>
                    <p className="mt-1.5 text-base text-gray-400 font-medium">
                        Fill in the details below to list your product on Snitch.
                    </p>
                </div>

                {/* Responsive two-column form on lg+ */}
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col lg:flex-row lg:gap-10 xl:gap-14">

                        {/* Left Column: Text fields */}
                        <div className="flex-1 min-w-0 space-y-8">

                            {/* Product Title */}
                            <div className="space-y-2">
                                <label htmlFor="product_title" className="block text-sm font-semibold text-gray-700">
                                    Product Title
                                    <span className="text-amber-500 ml-0.5">*</span>
                                </label>
                                <input
                                    id="product_title"
                                    name="title"
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Oversized Cotton Hoodie"
                                    className="w-full px-4 py-3.5 text-gray-900 placeholder:text-gray-300 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-amber-400 focus:ring-3 focus:ring-amber-100 transition-all duration-200 hover:border-gray-300"
                                />
                                <p className="text-xs text-gray-400">{title.length}/100 characters</p>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label htmlFor="product_description" className="block text-sm font-semibold text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    id="product_description"
                                    name="description"
                                    rows={6}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your product — material, fit, care instructions..."
                                    className="w-full px-4 py-3.5 text-gray-900 placeholder:text-gray-300 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-amber-400 focus:ring-3 focus:ring-amber-100 transition-all duration-200 hover:border-gray-300 resize-none leading-relaxed"
                                />
                                <p className="text-xs text-gray-400">{description.length} characters</p>
                            </div>

                            {/* Price Amount */}
                            <div className="space-y-2">
                                <label htmlFor="product_price" className="block text-sm font-semibold text-gray-700">
                                    Price
                                    <span className="text-amber-500 ml-0.5">*</span>
                                </label>
                                <div className="flex items-stretch border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 focus-within:border-amber-400 focus-within:ring-3 focus-within:ring-amber-100 transition-all duration-200">
                                    <div className="flex items-center px-4 bg-gray-50 border-r border-gray-200">
                                        <span className="text-sm font-semibold text-gray-500 select-none whitespace-nowrap">INR</span>
                                    </div>
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
                                        className="flex-1 px-4 py-3.5 text-gray-900 placeholder:text-gray-300 bg-white text-sm font-medium outline-none"
                                    />
                                </div>
                                <p className="text-xs text-gray-400">Enter the selling price in US Dollars.</p>
                            </div>

                            {/* Mobile-only: Images + Submit stacked below text fields */}
                            <div className="lg:hidden space-y-8 pb-10">
                                <ImagesPanel
                                    images={images}
                                    previews={previews}
                                    fileInputRefs={fileInputRefs}
                                    uploadedCount={uploadedCount}
                                    onSelect={handleImageSelect}
                                    onRemove={handleRemoveImage}
                                />
                                <SubmitRow
                                    isSubmitting={isSubmitting}
                                    title={title}
                                    priceAmount={priceAmount}
                                    onCancel={() => navigate(-1)}
                                />
                            </div>
                        </div>

                        {/* Right Column: Images + Submit (desktop only, sticky) */}
                        <div className="hidden lg:flex flex-col gap-6 w-80 xl:w-96 shrink-0">
                            <div className="sticky top-24 space-y-6">
                                <ImagesPanel
                                    images={images}
                                    previews={previews}
                                    fileInputRefs={fileInputRefs}
                                    uploadedCount={uploadedCount}
                                    onSelect={handleImageSelect}
                                    onRemove={handleRemoveImage}
                                />
                                <SubmitRow
                                    isSubmitting={isSubmitting}
                                    title={title}
                                    priceAmount={priceAmount}
                                    onCancel={() => navigate(-1)}
                                />
                            </div>
                        </div>

                    </div>
                </form>
            </main>
        </div>
    );
}

/* Images Panel Sub-component */
function ImagesPanel({ images, previews, fileInputRefs, uploadedCount, onSelect, onRemove }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">
                    Product Images
                </label>
                <span className="text-xs text-gray-400 font-medium">
                    {uploadedCount}/4 uploaded
                </span>
            </div>
            <p className="text-xs text-gray-400 -mt-1">
                Upload up to 4 images. First image will be the cover.
            </p>

            <div className="grid grid-cols-2 gap-3">
                {images.map((_, index) => (
                    <div key={index} className="relative aspect-square group">
                        <input
                            ref={fileInputRefs[index]}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => onSelect(index, e)}
                            id={`image_upload_${index}`}
                        />

                        {previews[index] ? (
                            <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 relative">
                                <img
                                    src={previews[index]}
                                    alt={`Product image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRefs[index].current?.click()}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 bg-white/90 text-gray-700 rounded-lg hover:bg-white"
                                        aria-label="Replace image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onRemove(index)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 bg-white/90 text-red-500 rounded-lg hover:bg-white"
                                        aria-label="Remove image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                            <path d="M10 11v6M14 11v6" />
                                            <path d="M9 6V4h6v2" />
                                        </svg>
                                    </button>
                                </div>
                                {index === 0 && (
                                    <span className="absolute top-2 left-2 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                                        Cover
                                    </span>
                                )}
                            </div>
                        ) : (
                            <label
                                htmlFor={`image_upload_${index}`}
                                className="flex flex-col items-center justify-center w-full h-full rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-200 group/slot"
                            >
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover/slot:bg-amber-100 flex items-center justify-center transition-colors duration-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400 group-hover/slot:text-amber-500 transition-colors duration-200">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] font-medium text-gray-400 group-hover/slot:text-amber-500 transition-colors duration-200">
                                        {index === 0 ? 'Cover' : `Photo ${index + 1}`}
                                    </span>
                                </div>
                            </label>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* Submit Row Sub-component */
function SubmitRow({ isSubmitting, title, priceAmount, onCancel }) {
    return (
        <div className="space-y-3 pt-2">
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-gray-400">
                    <span className="text-amber-500 font-bold">*</span> Required
                </p>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-150 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !title.trim() || !priceAmount}
                        id="publish_product_btn"
                        className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-500 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_-4px_rgba(251,191,36,0.5)] hover:shadow-[0_6px_20px_-4px_rgba(251,191,36,0.6)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span>Publishing...</span>
                            </>
                        ) : (
                            <>
                                <span>Publish Product</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
