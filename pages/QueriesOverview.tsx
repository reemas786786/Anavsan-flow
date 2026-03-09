
import React, { useMemo } from 'react';
import { queryListData } from '../data/dummyData';
import { IconClock, IconTrendingUp, IconRefresh, IconInfo } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const formatK = (val: number | string): string => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return Math.round(num).toLocaleString();
};

const StatPill: React.FC<{ icon: React.ReactNode; label: string; value: string; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className="bg-white px-4 py-2 rounded-full border border-border-light shadow-sm flex items-center gap-3 flex-shrink-0 transition-all hover:border-primary/30">
        <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center`}>
            {icon}
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-none mb-1">{label}</span>
            <span className="text-sm font-black text-text-strong leading-none">{value}</span>
        </div>
    </div>
);

interface QueriesOverviewProps {
    onNavigate: (page: string) => void;
    onSelectQuery?: (query: any) => void;
    onSelectRepeatedPattern?: (hash: string) => void;
}

const QueriesOverview: React.FC<QueriesOverviewProps> = ({ onNavigate, onSelectQuery, onSelectRepeatedPattern }) => {
    const stats = useMemo(() => {
        const totalQueries = queryListData.length;
        const totalCredits = queryListData.reduce((sum, q) => sum + q.costCredits, 0);
        const avgDuration = queryListData.reduce((sum, q) => {
            const [m, s] = q.duration.split(':').map(Number);
            return sum + (m * 60 + s);
        }, 0) / totalQueries;

        // Group by text for repeated
        const groups: Record<string, number> = {};
        queryListData.forEach(q => {
            groups[q.queryText] = (groups[q.queryText] || 0) + 1;
        });
        const repeatedCount = Object.values(groups).filter(c => c > 1).length;

        return {
            totalQueries: totalQueries.toLocaleString(),
            totalCredits: totalCredits.toFixed(1),
            avgDuration: `${Math.floor(avgDuration / 60)}m ${Math.round(avgDuration % 60)}s`,
            repeatedCount: repeatedCount.toLocaleString()
        };
    }, []);

    const topExpensiveQueries = useMemo(() => {
        return [...queryListData]
            .sort((a, b) => b.costCredits - a.costCredits)
            .slice(0, 5)
            .map(q => ({
                id: q.id,
                name: q.id.substring(0, 8),
                credits: q.costCredits,
                fullText: q.queryText,
                original: q
            }));
    }, []);

    const generateHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    };

    const topRepeatedQueries = useMemo(() => {
        const groups: Record<string, { count: number; credits: number; hash: string }> = {};
        queryListData.forEach(q => {
            if (!groups[q.queryText]) groups[q.queryText] = { count: 0, credits: 0, hash: generateHash(q.queryText) };
            groups[q.queryText].count++;
            groups[q.queryText].credits += q.costCredits;
        });
        return Object.entries(groups)
            .map(([text, data]) => ({ text, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, []);

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="px-4 pt-4 pb-4 flex flex-col gap-6 flex-shrink-0 mb-0">
                <div>
                    <h1 className="text-[28px] font-bold text-text-strong tracking-tight">Queries overview</h1>
                    <p className="text-sm text-text-secondary font-medium mt-1">Analyze query performance, credit consumption, and common execution patterns.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <StatPill 
                        icon={<IconInfo className="w-4 h-4" />} 
                        label="Total Queries" 
                        value={stats.totalQueries} 
                        colorClass="bg-blue-500/10 text-blue-500" 
                    />
                    <StatPill 
                        icon={<IconRefresh className="w-4 h-4" />} 
                        label="Repeated Patterns" 
                        value={stats.repeatedCount} 
                        colorClass="bg-amber-500/10 text-amber-500" 
                    />
                    <StatPill 
                        icon={<IconClock className="w-4 h-4" />} 
                        label="Avg Duration" 
                        value={stats.avgDuration} 
                        colorClass="bg-emerald-500/10 text-emerald-500" 
                    />
                </div>
            </header>
            
            <div className="flex-1 space-y-6 px-4 pb-12 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Repeated Queries Preview - Moved to first column */}
                <div className="bg-white p-6 rounded-[24px] border border-border-light shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-text-strong uppercase tracking-widest">Most Repeated Patterns</h3>
                        <button 
                            onClick={() => onNavigate('Repeated queries')}
                            className="text-[11px] font-bold text-primary hover:underline"
                        >
                            View all
                        </button>
                    </div>
                    <div className="space-y-4">
                        {topRepeatedQueries.map((q, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => onSelectRepeatedPattern?.(q.hash)}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-nested border border-border-light hover:border-primary/30 transition-all text-left"
                            >
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-mono font-bold text-text-strong truncate">{q.text}</span>
                                    <span className="text-[10px] text-text-muted mt-0.5">{q.credits.toFixed(1)} Total Credits</span>
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 ml-4">
                                    <span className="text-sm font-black text-text-strong">{q.count}x</span>
                                    <span className="text-[9px] font-bold text-text-muted uppercase">Runs</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expensive Queries Preview - Now a Bar Chart */}
                <div className="bg-white p-6 rounded-[24px] border border-border-light shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-text-strong uppercase tracking-widest">Top Expensive Queries</h3>
                        <button 
                            onClick={() => onNavigate('Expensive queries')}
                            className="text-[11px] font-bold text-primary hover:underline"
                        >
                            View all
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={topExpensiveQueries}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    stroke="#94a3b8" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 border border-border-light shadow-xl rounded-xl max-w-xs">
                                                    <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Query ID: {data.id}</p>
                                                    <p className="text-xs font-mono text-text-strong line-clamp-3 mb-2">{data.fullText}</p>
                                                    <p className="text-sm font-black text-primary">{data.credits.toFixed(2)} Credits</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar 
                                    dataKey="credits" 
                                    fill="#6366f1" 
                                    radius={[0, 4, 4, 0]} 
                                    barSize={20}
                                    onClick={(data) => onSelectQuery?.(data.original)}
                                    className="cursor-pointer"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default QueriesOverview;
