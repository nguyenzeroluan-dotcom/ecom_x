
import React, { useState, useEffect } from 'react';
import { Product, EBookMetadata, ModalType } from '../../types';
import { getDigitalProducts, getEBookMetadata, saveEBookMetadata, uploadPDF } from '../../services/ebookService';
import { useModal } from '../../contexts/ModalContext';
import { useNotification } from '../../contexts/NotificationContext';
import RichTextEditor from './ebooks/RichTextEditor';
import EBookSettings from './ebooks/EBookSettings';

const EBookManager: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [metadata, setMetadata] = useState<EBookMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');
    
    const { addNotification } = useNotification();
    const { openModal } = useModal();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getDigitalProducts();
            setProducts(data);
        } catch (e: any) {
            console.error(e);
            if (e.message.includes('ebook_metadata')) {
                openModal(ModalType.CONFIRM, { 
                    title: "Database Update Required", 
                    message: "The E-Book system requires new database tables. Please run the SQL script in the 'SQL Setup' tab (Script #13).",
                    isDestructive: true
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSelectProduct = async (product: Product) => {
        setSelectedProduct(product);
        // Try to load metadata, or create default
        const existing = await getEBookMetadata(product.id);
        if (existing) {
            setMetadata(existing);
        } else {
            setMetadata({
                product_id: product.id,
                format: 'studio',
                allow_download: false,
                drm_enabled: true,
                content_html: product.digital_content || '',
                preview_percentage: 10
            });
        }
    };

    const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0] && metadata) {
            try {
                setSaving(true);
                const url = await uploadPDF(e.target.files[0]);
                setMetadata({ ...metadata, source_url: url, format: 'pdf' });
                addNotification('success', 'PDF Uploaded successfully');
            } catch (err: any) {
                addNotification('error', err.message);
            } finally {
                setSaving(false);
            }
        }
    };

    const handleSave = async () => {
        if (!metadata) return;
        setSaving(true);
        try {
            await saveEBookMetadata(metadata);
            addNotification('success', 'E-Book saved successfully');
            fetchProducts(); // Refresh list
        } catch (err: any) {
            addNotification('error', 'Failed to save: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
            {/* Left Sidebar: Book List */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-bold text-slate-800 dark:text-white">Digital Products</h3>
                    <p className="text-xs text-slate-500">{products.length} items found</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="p-4 text-center"><i className="fas fa-spinner fa-spin text-primary"></i></div>
                    ) : products.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <p className="text-sm">No digital products found. Add a product with "Is Digital" checked in the Products tab.</p>
                        </div>
                    ) : (
                        products.map(p => (
                            <div 
                                key={p.id}
                                onClick={() => handleSelectProduct(p)}
                                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 border ${selectedProduct?.id === p.id ? 'bg-primary/10 border-primary/30 dark:bg-primary/20' : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                <img src={p.image_url} alt="" className="w-10 h-10 rounded-md object-cover bg-slate-200" />
                                <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{p.name}</h4>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        {p.ebook_metadata ? <i className="fas fa-check-circle text-green-500"></i> : <i className="far fa-circle"></i>}
                                        {p.ebook_metadata?.format === 'pdf' ? 'PDF' : 'Studio'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Area: Editor */}
            <div className="lg:col-span-3 flex flex-col gap-4">
                {selectedProduct && metadata ? (
                    <>
                        {/* Toolbar */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center">
                            <div className="flex gap-4">
                                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                    <button 
                                        onClick={() => setActiveTab('content')} 
                                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'content' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-500'}`}
                                    >
                                        Content
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('settings')} 
                                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-500'}`}
                                    >
                                        Permissions
                                    </button>
                                </div>
                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-600"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Format:</span>
                                    <select 
                                        value={metadata.format}
                                        onChange={(e) => setMetadata({...metadata, format: e.target.value as 'pdf' | 'studio'})}
                                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm px-2 py-1 focus:outline-none"
                                    >
                                        <option value="studio">Studio Writer</option>
                                        <option value="pdf">PDF Upload</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                onClick={handleSave} 
                                disabled={saving}
                                className="bg-primary hover:bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                                Save Changes
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {activeTab === 'content' ? (
                                metadata.format === 'pdf' ? (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-600 h-full flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                                            <i className="fas fa-file-pdf text-4xl text-red-500"></i>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Upload PDF Document</h3>
                                        {metadata.source_url ? (
                                            <div className="mb-6">
                                                <p className="text-green-600 font-medium mb-2"><i className="fas fa-check-circle"></i> File Uploaded</p>
                                                <a href={metadata.source_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm">View Current PDF</a>
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 mb-6">Upload the final PDF for user distribution.</p>
                                        )}
                                        <label className="cursor-pointer bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                                            Choose PDF File
                                            <input type="file" accept="application/pdf" onChange={handlePDFUpload} className="hidden" />
                                        </label>
                                    </div>
                                ) : (
                                    <RichTextEditor 
                                        initialContent={metadata.content_html || ''} 
                                        onChange={(html) => setMetadata({...metadata, content_html: html})}
                                    />
                                )
                            ) : (
                                <EBookSettings 
                                    metadata={metadata}
                                    onChange={(updates) => setMetadata({...metadata, ...updates})}
                                />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <i className="fas fa-book-open text-6xl mb-4 opacity-20"></i>
                        <p className="text-lg">Select a digital product to manage its E-Book content.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EBookManager;
