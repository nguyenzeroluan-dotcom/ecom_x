import React, { useState, useEffect, useCallback } from 'react';
import BaseModal from '../../modals/BaseModal';
import { useModal } from '../../../contexts/ModalContext';
import { MediaAsset } from '../../../types';
import { getCollectionDetails, removeAssetsFromCollection } from '../../../services/mediaService';
import MediaCard from './MediaCard';
import { useNotification } from '../../../contexts/NotificationContext';

const CollectionDetailModal: React.FC = () => {
    const { isOpen, closeModal, modalProps } = useModal();
    const { collectionId, collectionName } = modalProps as { collectionId: number; collectionName: string };
    const { addNotification } = useNotification();

    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAssets = useCallback(async () => {
        if (!collectionId) return;
        setLoading(true);
        try {
            const data = await getCollectionDetails(collectionId);
            setAssets(data);
        } catch (error: any) {
            addNotification('error', `Failed to load collection: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [collectionId, addNotification]);

    useEffect(() => {
        if (isOpen) {
            fetchAssets();
        }
    }, [isOpen, fetchAssets]);

    const handleRemoveAsset = async (assetId: number) => {
        try {
            await removeAssetsFromCollection(collectionId, [assetId]);
            // Optimistic update
            setAssets(prev => prev.filter(a => a.id !== assetId));
            addNotification('info', 'Asset removed from collection.');
        } catch (error: any) {
            addNotification('error', `Failed to remove asset: ${error.message}`);
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={closeModal} size="xl" title={`Collection: ${collectionName}`}>
            <div className="flex flex-col h-[70vh]">
                <div className="flex-grow overflow-y-auto custom-scrollbar -mr-6 pr-6">
                    {loading ? (
                         <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {[...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>)}
                        </div>
                    ) : assets.length > 0 ? (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {assets.map(asset => (
                                <MediaCard
                                    key={asset.id}
                                    asset={asset}
                                    isSelected={false}
                                    onSelect={() => {}} // Not selectable in this view
                                    onRemove={() => handleRemoveAsset(asset.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                             <i className="fas fa-folder-open text-4xl mb-3"></i>
                             <p>This collection is empty.</p>
                        </div>
                    )}
                </div>
                 <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <button onClick={closeModal} className="px-6 py-2 rounded-lg font-bold text-sm text-white bg-primary hover:bg-indigo-600 shadow-lg">
                        Done
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default CollectionDetailModal;
