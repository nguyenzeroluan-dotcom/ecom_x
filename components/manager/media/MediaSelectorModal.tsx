

import React, { useState, useEffect, useCallback } from 'react';
import BaseModal from '../../modals/BaseModal';
import { useModal } from '../../../contexts/ModalContext';
import { getMediaAssets, uploadMediaAsset, getMediaCollections } from '../../../services/mediaService';
import { MediaAsset, MediaCollection } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import MediaCard from './MediaCard';

const MediaSelectorModal: React.FC = () => {
    const { isOpen, closeModal, modalProps } = useModal();
    const { onSelect } = modalProps;

    const { user } = useAuth();
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [collections, setCollections] = useState<MediaCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
    const [selectedCollection, setSelectedCollection] = useState<MediaCollection | null>(null);
    const [activeTab, setActiveTab] = useState<'library' | 'collections' | 'upload'>('library');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'library' && assets.length === 0) {
                const data = await getMediaAssets();
                setAssets(data);
            } else if (activeTab === 'collections' && collections.length === 0) {
                const data = await getMediaCollections();
                setCollections(data);
            }
        } finally {
            setLoading(false);
        }
    }, [activeTab, assets.length, collections.length]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, fetchData]);
    
    // When switching tabs, fetch data if not already loaded
    useEffect(() => {
        if(isOpen) fetchData();
    }, [activeTab, isOpen, fetchData]);

    const handleConfirmSelection = () => {
        if (onSelect) {
            if (selectedAsset) {
                // When a single asset is chosen, collectionId is null.
                onSelect({ imageUrl: selectedAsset.public_url, collectionId: null });
            } else if (selectedCollection) {
                // When a collection is chosen, its first image is the cover.
                const coverImage = selectedCollection.media_assets?.[0]?.public_url || '';
                onSelect({
                    imageUrl: coverImage,
                    collectionId: selectedCollection.id
                });
            }
        }
        closeModal();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const newAsset = await uploadMediaAsset(file, user?.id);
            if (onSelect) {
                onSelect({ imageUrl: newAsset.public_url, collectionId: null });
                closeModal();
            }
        } catch (error: any) {
            alert('Upload failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <BaseModal isOpen={isOpen} onClose={closeModal} size="xl" title="Set Product Media">
            <div className="flex flex-col h-[70vh]">
                <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
                    <div className="flex gap-4">
                        <button onClick={() => setActiveTab('library')} className={`px-3 pb-2 font-bold text-sm ${activeTab === 'library' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}>Set Cover Image</button>
                        <button onClick={() => setActiveTab('collections')} className={`px-3 pb-2 font-bold text-sm ${activeTab === 'collections' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}>Assign Gallery</button>
                        <button onClick={() => setActiveTab('upload')} className={`px-3 pb-2 font-bold text-sm ${activeTab === 'upload' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}>Upload New</button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar -mr-6 pr-6">
                    {activeTab === 'library' && (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {loading && [...Array(12)].map((_, i) => <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>)}
                            {!loading && assets.map(asset => (
                                <MediaCard
                                    key={asset.id}
                                    asset={asset}
                                    isSelected={selectedAsset?.id === asset.id}
                                    onSelect={() => {
                                        setSelectedAsset(asset);
                                        setSelectedCollection(null); // Enforce mutual exclusivity
                                    }}
                                    isSelectMode
                                />
                            ))}
                        </div>
                    )}
                    {activeTab === 'collections' && (
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {loading && [...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>)}
                            {!loading && collections.map(collection => (
                                <div
                                    key={collection.id}
                                    onClick={() => {
                                        setSelectedCollection(collection);
                                        setSelectedAsset(null); // Enforce mutual exclusivity
                                    }}
                                    className={`relative aspect-square rounded-xl overflow-hidden group border-2 transition-all duration-200 cursor-pointer
                                        ${selectedCollection?.id === collection.id ? 'border-primary shadow-lg' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
                                >
                                    <img src={collection.media_assets?.[0]?.public_url || 'https://via.placeholder.com/200'} alt={collection.name} className="w-full h-full object-cover bg-slate-100 dark:bg-slate-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3 text-white">
                                        <h4 className="font-bold text-sm truncate">{collection.name}</h4>
                                        <p className="text-xs opacity-80">{collection.media_assets?.length || 0} items</p>
                                    </div>
                                     {selectedCollection?.id === collection.id && (
                                        <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                                            <i className="fas fa-check-circle text-white text-4xl"></i>
                                        </div>
                                    )}
                                </div>
                            ))}
                         </div>
                    )}
                    {activeTab === 'upload' && (
                        <div className="h-full flex items-center justify-center p-4">
                            <label className="flex flex-col items-center justify-center w-full h-full border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin text-4xl text-primary mb-3"></i>
                                            <p className="text-sm text-slate-500">Uploading...</p>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-3"></i>
                                            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Your file will be used immediately as cover image.</p>
                                        </>
                                    )}
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} disabled={loading} />
                            </label>
                        </div>
                    )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div className="text-xs text-slate-500">
                        {selectedAsset && `Selected Image: ${selectedAsset.file_name}`}
                        {selectedCollection && `Selected Gallery: ${selectedCollection.name}`}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={closeModal} className="px-4 py-2 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>
                        <button onClick={handleConfirmSelection} disabled={!selectedAsset && !selectedCollection} className="px-6 py-2 rounded-lg font-bold text-sm text-white bg-primary hover:bg-indigo-600 shadow-lg disabled:opacity-50">
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default MediaSelectorModal;
