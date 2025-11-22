
import React, { useEffect, useState } from 'react';
import { LibraryItem, ViewState } from '../types';
import { getLibrary } from '../services/libraryService';
import { useAuth } from '../contexts/AuthContext';

interface LibraryViewProps {
    setView: (view: ViewState) => void;
    onReadBook: (item: LibraryItem) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ setView, onReadBook }) => {
    const { user } = useAuth();
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLibrary = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const data = await getLibrary(user.id);
                setItems(data);
            } catch (e) {
                console.error("Failed to load library", e);
            } finally {
                setLoading(false);
            }
        };
        fetchLibrary();
    }, [user]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <i className="fas fa-lock text-4xl text-slate-300 mb-4"></i>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Sign in to view your library</h2>
                <p className="text-slate-500 mb-6">Access your purchased books and reading progress.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">My Library</h1>
                <button onClick={() => setView(ViewState.HOME)} className="text-primary font-medium hover:underline">Browse Store</button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><i className="fas fa-spinner fa-spin text-3xl text-primary"></i></div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <i className="fas fa-book-open text-6xl text-slate-300 dark:text-slate-700 mb-4"></i>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Your library is empty</h3>
                    <p className="text-slate-500 mb-6">Explore our collection of E-Books to get started.</p>
                    <button onClick={() => setView(ViewState.HOME)} className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-600 transition-all">
                        Discover Books
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="group cursor-pointer" onClick={() => onReadBook(item)}>
                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 mb-3 bg-slate-200 dark:bg-slate-800">
                                <img 
                                    src={item.product.image_url} 
                                    alt={item.product.name} 
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <button className="bg-white/90 text-slate-900 px-4 py-2 rounded-full font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                                        Read Now
                                    </button>
                                </div>
                                {/* Progress Bar */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                                    <div className="h-full bg-green-500" style={{ width: `${item.last_position || 0}%` }}></div>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">{item.product.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Purchased {new Date(item.purchase_date).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LibraryView;
