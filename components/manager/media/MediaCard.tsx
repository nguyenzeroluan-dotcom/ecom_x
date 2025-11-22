

import React, { useState, useEffect } from 'react';
import { MediaAsset } from '../../../types';

interface UploadingFile {
    id: string;
    file: File;
    status: 'uploading' | 'success' | 'error';
    error?: string;
}

interface MediaCardProps {
    asset?: MediaAsset;
    uploadingFile?: UploadingFile;
    isSelected: boolean;
    onSelect: () => void;
    isSelectMode?: boolean;
    onDoubleClick?: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ asset, uploadingFile, isSelected, onSelect, isSelectMode = false, onDoubleClick }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (uploadingFile) {
            const url = URL.createObjectURL(uploadingFile.file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [uploadingFile]);

    const isVideo = asset?.mime_type.startsWith('video') || uploadingFile?.file.type.startsWith('video');
    const displayUrl = asset?.public_url || previewUrl;
    const fileName = asset?.file_name || uploadingFile?.file.name;

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const renderOverlay = () => {
        if (!uploadingFile) return null;

        switch (uploadingFile.status) {
            case 'uploading':
                return (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-2">
                        <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                        <span className="text-xs font-bold text-center">Uploading...</span>
                    </div>
                );
            case 'error':
                return (
                    <div className="absolute inset-0 bg-red-800/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-2 text-center">
                        <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
                        <span className="text-xs font-bold">Upload Failed</span>
                    </div>
                );
            case 'success':
                 // Success is transient, the component will be replaced by a real Asset card
                 return (
                    <div className="absolute inset-0 bg-green-800/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-2 text-center">
                        <i className="fas fa-check-circle text-2xl"></i>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div
            className={`relative aspect-square rounded-xl overflow-hidden group border-2 transition-all duration-200
                ${isSelected ? 'border-primary shadow-lg' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}
                ${isSelectMode ? 'cursor-pointer' : ''}`}
            onClick={isSelectMode ? onSelect : undefined}
            onDoubleClick={onDoubleClick}
        >
            {isVideo ? (
                <video src={displayUrl || ''} className="w-full h-full object-cover bg-slate-900" muted playsInline />
            ) : (
                <img src={displayUrl || ''} alt={asset?.alt_text || fileName} className="w-full h-full object-cover bg-slate-100 dark:bg-slate-700" loading="lazy" />
            )}
            
            {renderOverlay()}

            {/* Default Overlay */}
            {!uploadingFile && (
                <div className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${isSelectMode ? '' : 'opacity-0 group-hover:opacity-100'}`}></div>
            )}

            {/* Checkbox */}
            {!uploadingFile && (
                <div
                    className={`absolute top-2 left-2 w-5 h-5 rounded-md border-2 bg-white/50 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-all
                        ${isSelected ? 'bg-primary border-primary' : 'border-white/50'}
                        ${isSelectMode ? 'hidden' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onSelect(); }}
                >
                    {isSelected && <i className="fas fa-check text-white text-xs"></i>}
                </div>
            )}


            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                <p className="text-xs font-bold truncate">{fileName}</p>
                <div className="flex justify-between text-[10px] opacity-70">
                    <span>{formatBytes(asset?.size || uploadingFile?.file.size || 0)}</span>
                    {isVideo && <i className="fas fa-video"></i>}
                </div>
            </div>
            
            {/* Selection indicator for select mode */}
            {isSelectMode && isSelected && !uploadingFile && (
                 <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                    <i className="fas fa-check-circle text-white text-4xl"></i>
                 </div>
            )}
        </div>
    );
};

export default MediaCard;