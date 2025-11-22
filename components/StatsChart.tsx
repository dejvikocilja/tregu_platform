import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ListingStats } from '../types';

interface StatsChartProps {
    stats: ListingStats;
}

const StatsChart: React.FC<StatsChartProps> = ({ stats }) => {
    return (
        <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={stats.viewsHistory}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area type="monotone" dataKey="views" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StatsChart;