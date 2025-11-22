

import React, { useState, useEffect, useCallback } from 'react';
import BaseModal from '../../modals/BaseModal';
import { useModal } from '../../../contexts/ModalContext';
import { getMediaAssets, uploadMediaAsset } from '../../../services/supabaseClient';
import { MediaAsset } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import MediaCard from './MediaCard';

const MediaSelectorModal: React.FC = () => {
    const { isOpen, closeModal, modalProps } = useModal();
    const { onSelect } = modalProps;

    const { user } = useAuth();
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMediaAssets();
            setAssets(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen && activeTab === 'library') {
            fetchAssets();
        }
    }, [isOpen, activeTab, fetchAssets]);

    const handleSelectAndClose = () => {
        if (selectedAsset && onSelect) {
            onSelect(selectedAsset.public_url);
            closeModal();
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const newAsset = await uploadMediaAsset(file, user?.id);
            if (onSelect) {
                // Auto-select and close after successful upload
                onSelect(newAsset.public_url);
                closeModal();
            }
        } catch (error: any) {
            alert('Upload failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <BaseModal isOpen={isOpen} onClose={closeModal} size="xl" title="Select Media">
            <div className="flex flex-col h-[70vh]">
                <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
                    <div className="flex gap-4">
                        <button onClick={() => setActiveTab('library')} className={`px-3 pb-2 font-bold text-sm ${activeTab === 'library' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}>Library</button>
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
                                    onSelect={() => setSelectedAsset(asset)}
                                    onDoubleClick={handleSelectAndClose}
                                    isSelectMode
                                />
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
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Your file will be used immediately.</p>
                                        </>
                                    )}
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} disabled={loading} />
                            </label>
                        </div>
                    )}
                </div>

                {activeTab === 'library' && (
                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                        <button onClick={closeModal} className="px-4 py-2 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>
                        <button onClick={handleSelectAndClose} disabled={!selectedAsset} className="px-6 py-2 rounded-lg font-bold text-sm text-white bg-primary hover:bg-indigo-600 shadow-lg disabled:opacity-50">
                            Select Image
                        </button>
                    </div>
                )}
            </div>
        </BaseModal>
    );
};

export default MediaSelectorModal;