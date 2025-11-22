
import React, { useState, useEffect } from 'react';
import BaseModal from '../../modals/BaseModal';
import { useModal } from '../../../contexts/ModalContext';
import { MediaCollection } from '../../../types';
import { getMediaCollections, createMediaCollection, addAssetsToCollection } from '../../../services/supabaseClient';

const CollectionManagerModal: React.FC = () => {
    const { isOpen, closeModal, modalProps } = useModal();
    const { selectedAssetIds, onSuccess } = modalProps as { selectedAssetIds: number[], onSuccess: () => void };

    const [collections, setCollections] = useState<MediaCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'select' | 'create'>('select');
    
    // Form state
    const [selectedCollectionId, setSelectedCollectionId] = useState<number | ''>('');
    const [newCollectionName, setNewCollectionName] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchCollections = async () => {
                setLoading(true);
                const data = await getMediaCollections();
                setCollections(data);
                // Pre-select the first collection if it exists
                if (data.length > 0) {
                    setSelectedCollectionId(data[0].id);
                } else {
                    setMode('create'); // Force create mode if no collections exist
                }
                setLoading(false);
            };
            fetchCollections();
        } else {
             // Reset form on close
            setNewCollectionName('');
            setSelectedCollectionId('');
            setMode('select');
        }
    }, [isOpen]);
    
    const handleConfirm = async () => {
        setLoading(true);
        try {
            let collectionIdToAddTo: number;

            if (mode === 'create') {
                if (!newCollectionName.trim()) {
                    alert('Please provide a name for the new collection.');
                    setLoading(false);
                    return;
                }
                const newCollection = await createMediaCollection({ name: newCollectionName });
                collectionIdToAddTo = newCollection.id;
            } else {
                if (!selectedCollectionId) {
                    alert('Please select a collection.');
                    setLoading(false);
                    return;
                }
                collectionIdToAddTo = Number(selectedCollectionId);
            }
            
            await addAssetsToCollection(collectionIdToAddTo, selectedAssetIds);
            
            if (onSuccess) onSuccess();
            closeModal();

        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={closeModal} size="sm" title={`Add ${selectedAssetIds.length} assets to collection`}>
            <div className="space-y-6">
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                    <button onClick={() => setMode('select')} disabled={collections.length === 0} className={`flex-1 py-2 text-sm font-bold rounded-lg disabled:opacity-50 ${mode === 'select' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-500'}`}>
                        Existing Collection
                    </button>
                    <button onClick={() => setMode('create')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${mode === 'create' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-500'}`}>
                        New Collection
                    </button>
                </div>

                {loading ? (
                    <div className="h-24 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-primary"></i></div>
                ) : mode === 'select' ? (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select a collection</label>
                        <select
                            value={selectedCollectionId}
                            onChange={(e) => setSelectedCollectionId(Number(e.target.value))}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none bg-white dark:bg-slate-900 dark:text-white"
                        >
                            {collections.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.media_assets?.length || 0} items)</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New collection name</label>
                        <input
                            type="text"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            placeholder="e.g., Summer 2024 Photoshoot"
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none dark:bg-slate-900 dark:text-white"
                        />
                    </div>
                )}
                
                <div className="pt-4 flex gap-3">
                    <button onClick={closeModal} className="flex-1 py-3 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                    <button onClick={handleConfirm} disabled={loading} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-600 shadow-lg disabled:opacity-50">
                        {loading ? 'Processing...' : 'Add to Collection'}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default CollectionManagerModal;
