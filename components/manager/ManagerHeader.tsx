import React from 'react';

interface ManagerHeaderProps {
    title: string;
    onSeedData: () => void;
    seeding: boolean;
}

const ManagerHeader: React.FC<ManagerHeaderProps> = ({ title, onSeedData, seeding }) => {
    return (
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">{title}</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your store's {title.toLowerCase()} from here.</p>
            </div>
            <button
                onClick={onSeedData}
                disabled={seeding}
                className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {seeding ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-database mr-2"></i>}
                {seeding ? "Adding Data..." : "Generate Demo Data"}
            </button>
      </div>
    );
};

export default ManagerHeader;
