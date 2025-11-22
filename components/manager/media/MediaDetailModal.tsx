import React from 'react';
import BaseModal from '../../modals/BaseModal';
import { useModal } from '../../../contexts/ModalContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { MediaAsset, ModalType } from '../../../types';
import { deleteMediaAsset } from '../../../services/mediaService';

const MediaDetailModal: React.FC = () => {
    const { isOpen, closeModal, modalProps } = useModal();
    const { asset, onDeleteSuccess } = modalProps as { asset: MediaAsset, onDeleteSuccess: () => void };
    const { addNotification } = useNotification();
    const { openModal } = useModal();

    if (!asset) return null;

    const isVideo = asset.mime_type.startsWith('video');

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(asset.public_url);
        addNotification('success', 'URL copied to clipboard!');
    };

    const handleDelete = () => {
        openModal(ModalType.CONFIRM, {
            title: "Delete Media",
            message: `Are you sure you want to permanently delete "${asset.file_name}"? This cannot be undone.`,
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await deleteMediaAsset(asset);
                    addNotification('info', 'Media asset deleted.');
                    if (onDeleteSuccess) onDeleteSuccess();
                    closeModal();
                } catch (error: any) {
                    addNotification('error', `Failed to delete: ${error.message}`);
                }
            }
        });
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <BaseModal isOpen={isOpen} onClose={closeModal} size="xl" title="Media Details">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Preview */}
                <div className="w-full md:w-2/3 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden">
                    {isVideo ? (
                        <video src={asset.public_url} controls autoPlay className="max-h-[70vh] max-w-full" />
                    ) : (
                        <img src={asset.public_url} alt={asset.alt_text || asset.file_name} className="max-h-[70vh] max-w-full object-contain" />
                    )}
                </div>

                {/* Info & Actions */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white break-words">{asset.file_name}</h3>
                        <p className="text-xs text-slate-500 font-mono">{asset.mime_type}</p>
                    </div>

                    <div className="space-y-3 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Size:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{formatBytes(asset.size)}</span>
                        </div>
                        {asset.width && asset.height && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Dimensions:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-200">{asset.width} x {asset.height} px</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Uploaded:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{new Date(asset.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button onClick={handleCopyUrl} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-semibold text-slate-800 dark:text-slate-200 transition-colors">
                            <i className="fas fa-copy"></i> Copy URL
                        </button>
                        <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl font-semibold text-red-600 dark:text-red-400 transition-colors">
                            <i className="fas fa-trash"></i> Delete Asset
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default MediaDetailModal;
