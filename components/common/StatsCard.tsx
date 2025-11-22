
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  colorClass: string;
  bgClass: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, colorClass, bgClass }) => {
  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center flex-1 min-w-[140px]">
      <div className={`p-2 rounded-lg mr-3 ${bgClass}`}>
        <i className={`fas ${icon} ${colorClass}`}></i>
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase font-bold">{title}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
