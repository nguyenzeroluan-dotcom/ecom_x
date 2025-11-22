import React from 'react';
import { MediaCollection, ModalType } from '../../../types';
import { useModal } from '../../../contexts/ModalContext';

interface CollectionCardProps {
    collection: MediaCollection;
    onDelete: () => void;
    onEditSuccess: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onDelete, onEditSuccess }) => {
    const { openModal } = useModal();
    const images = collection.media_assets || [];
    const imageCount = images.length;

    const handleEdit = () => {
        openModal(ModalType.COLLECTION_EDIT, {
            collection,
            onSuccess: onEditSuccess
        });
    };

    return (
        <div className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
            <div className="relative aspect-square w-full p-4 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center cursor-pointer">
                {imageCount === 0 && (
                    <div className="w-2/3 h-2/3 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                        <i className="fas fa-folder text-4xl"></i>
                    </div>
                )}
                {imageCount === 1 && (
                    <img src={images[0].public_url} alt={collection.name} className="w-full h-full object-cover rounded-lg shadow-md" />
                )}
                {imageCount > 1 && (
                    <div className="relative w-full h-full">
                        <img src={images[1].public_url} alt="" className="absolute w-[80%] h-[80%] object-cover rounded-lg shadow-md top-0 right-0 transform rotate-3 transition-transform group-hover:rotate-6" />
                        <img src={images[0].public_url} alt="" className="absolute w-[85%] h-[85%] object-cover rounded-lg shadow-lg bottom-0 left-0 transform -rotate-3 transition-transform group-hover:-rotate-6" />
                    </div>
                )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">{collection.name}</h3>
                <p className="text-xs text-slate-500">{imageCount} items</p>

                <div className="mt-auto pt-4 flex gap-2">
                    <button onClick={() => alert('View collection feature coming soon!')} className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 py-2 rounded-lg text-xs font-bold" title="View Contents">
                        <i className="fas fa-eye"></i> View
                    </button>
                    <button onClick={handleEdit} className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 p-2 rounded-lg text-xs" title="Edit Name">
                        <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={onDelete} className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-600 dark:text-red-400 p-2 rounded-lg text-xs" title="Delete Collection">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CollectionCard;
