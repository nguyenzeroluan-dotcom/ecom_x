
import React from 'react';

interface CategoryChartProps {
    data: { name: string, value: number }[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#3B82F6', '#8B5CF6'];
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulative = 0;

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-400"><p>No category data.</p></div>;
    }

    const slices = data.map((item, index) => {
        const percentage = (item.value / total);
        const startAngle = (cumulative / total) * 360;
        cumulative += item.value;
        const endAngle = (cumulative / total) * 360;
        const largeArcFlag = percentage > 0.5 ? 1 : 0;
        
        const x1 = 50 + 40 * Math.cos(Math.PI * (startAngle - 90) / 180);
        const y1 = 50 + 40 * Math.sin(Math.PI * (startAngle - 90) / 180);
        const x2 = 50 + 40 * Math.cos(Math.PI * (endAngle - 90) / 180);
        const y2 = 50 + 40 * Math.sin(Math.PI * (endAngle - 90) / 180);

        return (
            <path
                key={item.name}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={colors[index % colors.length]}
            >
                <title>{`${item.name}: ${item.value} (${(percentage * 100).toFixed(1)}%)`}</title>
            </path>
        );
    });

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-full p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Category Distribution</h3>
            <div className="flex flex-col md:flex-row items-center gap-6 h-full">
                <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">{slices}</svg>
                <div className="flex-1 space-y-2">
                    {data.slice(0, 5).map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }}></div>
                                <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-white">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryChart;
