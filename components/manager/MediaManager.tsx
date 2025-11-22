

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getMediaAssets, uploadMediaAsset, deleteMediaAssets, syncProductImagesToAssets } from '../../services/supabaseClient';
import { MediaAsset, ModalType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';
import { useNotification } from '../../contexts/NotificationContext';
import MediaCard from './media/MediaCard';

interface UploadingFile {
    id: string;
    file: File;
    status: 'uploading' | 'success' | 'error';
    error?: string;
}

const MediaManager: React.FC = () => {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { openModal } = useModal();
    const { addNotification } = useNotification();
    const [selectedAssets, setSelectedAssets] = useState<number[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const dropzoneRef = useRef<HTMLDivElement>(null);

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMediaAssets();
            setAssets(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleFileUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const newUploads: UploadingFile[] = Array.from(files).map(file => ({
            id: `${file.name}-${file.lastModified}`,
            file,
            status: 'uploading'
        }));

        setUploadingFiles(prev => [...newUploads, ...prev]);

        newUploads.forEach(upload => {
            uploadMediaAsset(upload.file, user?.id)
                .then(() => {
                    setUploadingFiles(prev => prev.map(f => f.id === upload.id ? { ...f, status: 'success' } : f));
                    fetchAssets(); // Refresh list after each successful upload
                })
                .catch(err => {
                    setUploadingFiles(prev => prev.map(f => f.id === upload.id ? { ...f, status: 'error', error: err.message } : f));
                });
        });
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const count = await syncProductImagesToAssets();
            if (count > 0) {
                addNotification('success', `Synced ${count} new product images to the library.`);
                await fetchAssets();
            } else {
                addNotification('info', 'All product images are already in the library.');
            }
        } catch (e: any) {
            if (e.message.includes('relation "public.media_assets" does not exist')) {
                 openModal(ModalType.CONFIRM, { 
                     title: "Database Table Missing", 
                     message: "The 'media_assets' table was not found. Please run the required script from the 'SQL Setup' tab to create it.",
                     isDestructive: true 
                 });
            } else {
                openModal(ModalType.CONFIRM, { title: "Sync Failed", message: e.message, isDestructive: true });
            }
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteSelected = () => {
        const assetsToDelete = assets.filter(a => selectedAssets.includes(a.id));
        if (assetsToDelete.length === 0) return;

        openModal(ModalType.CONFIRM, {
            title: `Delete ${assetsToDelete.length} files?`,
            message: "This action is irreversible and will remove the files from storage.",
            isDestructive: true,
            onConfirm: async () => {
                await deleteMediaAssets(assetsToDelete);
                setSelectedAssets([]);
                fetchAssets();
            }
        });
    };

    const toggleSelect = (id: number) => {
        setSelectedAssets(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Drag and Drop handlers
    useEffect(() => {
        const dropzone = dropzoneRef.current;
        const handleDragOver = (e: DragEvent) => e.preventDefault();
        const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer?.files) {
                handleFileUpload(e.dataTransfer.files);
            }
        };

        dropzone?.addEventListener('dragover', handleDragOver);
        dropzone?.addEventListener('drop', handleDrop);
        return () => {
            dropzone?.removeEventListener('dragover', handleDragOver);
            dropzone?.removeEventListener('drop', handleDrop);
        };
    }, []);

    const filteredAssets = assets.filter(asset => {
        const matchFilter = filter === 'all' || asset.mime_type.startsWith(filter);
        const matchSearch = search === '' || asset.file_name.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <div className="space-y-6 animate-fade-in" ref={dropzoneRef}>
            {/* Header */}
             <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Media Library</h2>
                        <p className="text-sm text-slate-500">{assets.length} total assets</p>
                    </div>
                     <div className="flex items-center gap-3 w-full md:w-auto">
                        <button onClick={handleSync} disabled={isSyncing} className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-4 py-2 rounded-xl font-bold text-sm hover:bg-purple-200 flex items-center">
                            {isSyncing ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sync mr-2"></i>}
                            Sync Product Images
                        </button>
                        <button onClick={() => document.getElementById('media-upload-input')?.click()} className="bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center">
                            <i className="fas fa-upload mr-2"></i> Upload
                        </button>
                        <input type="file" id="media-upload-input" multiple onChange={(e) => handleFileUpload(e.target.files)} className="hidden" />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center">
                <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-lg text-sm font-bold ${filter === 'all' ? 'bg-primary/10 text-primary' : 'text-slate-500'}`}>All</button>
                    <button onClick={() => setFilter('image')} className={`px-3 py-1 rounded-lg text-sm font-bold ${filter === 'image' ? 'bg-primary/10 text-primary' : 'text-slate-500'}`}>Images</button>
                    <button onClick={() => setFilter('video')} className={`px-3 py-1 rounded-lg text-sm font-bold ${filter === 'video' ? 'bg-primary/10 text-primary' : 'text-slate-500'}`}>Videos</button>
                </div>
                {selectedAssets.length > 0 && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{selectedAssets.length} selected</span>
                        <button onClick={handleDeleteSelected} className="text-red-500 font-bold text-sm hover:underline">Delete</button>
                    </div>
                )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {uploadingFiles.map(upload => (
                    <MediaCard
                        key={upload.id}
                        uploadingFile={upload}
                        isSelected={false}
                        onSelect={() => {}}
                    />
                ))}
                {loading ? (
                    [...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>)
                ) : filteredAssets.length > 0 ? (
                    filteredAssets.map(asset => (
                        <MediaCard
                            key={asset.id}
                            asset={asset}
                            isSelected={selectedAssets.includes(asset.id)}
                            onSelect={() => toggleSelect(asset.id)}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 text-slate-400">
                        <i className="fas fa-photo-video text-4xl mb-3"></i>
                        <p>No media found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaManager;