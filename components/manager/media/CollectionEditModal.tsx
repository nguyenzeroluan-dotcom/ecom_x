import React, { useState, useEffect } from 'react';
import BaseModal from '../../modals/BaseModal';
import { useModal } from '../../../contexts/ModalContext';
import { MediaCollection } from '../../../types';
import { updateMediaCollection } from '../../../services/supabaseClient';

const CollectionEditModal: React.FC = () => {
    const { isOpen, closeModal, modalProps } = useModal();
    const { collection, onSuccess } = modalProps as { collection: MediaCollection, onSuccess: () => void };

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (collection) {
            setName(collection.name);
            setDescription(collection.description || '');
        }
    }, [collection]);
    
    const handleConfirm = async () => {
        if (!collection || !name.trim()) return;
        
        setIsLoading(true);
        try {
            await updateMediaCollection(collection.id, { name, description });
            if (onSuccess) onSuccess();
            closeModal();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!collection) return null;

    return (
        <BaseModal isOpen={isOpen} onClose={closeModal} size="sm" title={`Edit Collection`}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Collection Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none dark:bg-slate-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                    <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none dark:bg-slate-900 dark:text-white resize-none"
                    />
                </div>
                
                <div className="pt-4 flex gap-3">
                    <button onClick={closeModal} className="flex-1 py-3 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                    <button onClick={handleConfirm} disabled={isLoading} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-600 shadow-lg disabled:opacity-50">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default CollectionEditModal;
