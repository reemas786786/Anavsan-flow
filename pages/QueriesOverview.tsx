
import React, { useMemo } from 'react';
import { queryListData } from '../data/dummyData';
import { IconClock, IconTrendingUp, IconRefresh, IconInfo } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const formatK = (val: number | string): string => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return Math.round(num).toLocaleString();
};

interface QueriesOverviewProps {
    onNavigate: (page: string) => void;
}

const QueriesOverview: React.FC<QueriesOverviewProps> = ({ onNavigate }) => {
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
                name: q.id,
                credits: q.costCredits,
                fullText: q.queryText
            }));
    }, []);

    const topRepeatedQueries = useMemo(() => {
        const groups: Record<string, { count: number; credits: number }> = {};
        queryListData.forEach(q => {
            if (!groups[q.queryText]) groups[q.queryText] = { count: 0, credits: 0 };
            groups[q.queryText].count++;
            groups[q.queryText].credits += q.costCredits;
        });
        return Object.entries(groups)
            .map(([text, data]) => ({ text, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, []);

    return (
        <div className="space-y-6 px-4 pt-4 pb-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[24px] border border-border-light shadow-sm flex flex-col h-[140px]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <IconTrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Credits</p>
                    </div>
                    <div className="mt-auto">
                        <p className="text-[32px] font-black text-text-strong tracking-tight leading-none">{stats.totalCredits}</p>
                        <p className="text-[10px] font-bold text-text-secondary mt-2 tracking-tight">Cumulative query cost</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-border-light shadow-sm flex flex-col h-[140px]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <IconInfo className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Queries</p>
                    </div>
                    <div className="mt-auto">
                        <p className="text-[32px] font-black text-text-strong tracking-tight leading-none">{stats.totalQueries}</p>
                        <p className="text-[10px] font-bold text-text-secondary mt-2 tracking-tight">Executions in last 30 days</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-border-light shadow-sm flex flex-col h-[140px]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <IconRefresh className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Repeated Patterns</p>
                    </div>
                    <div className="mt-auto">
                        <p className="text-[32px] font-black text-text-strong tracking-tight leading-none">{stats.repeatedCount}</p>
                        <p className="text-[10px] font-bold text-text-secondary mt-2 tracking-tight">Unique query groups</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-border-light shadow-sm flex flex-col h-[140px]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <IconClock className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Avg Duration</p>
                    </div>
                    <div className="mt-auto">
                        <p className="text-[32px] font-black text-text-strong tracking-tight leading-none">{stats.avgDuration}</p>
                        <p className="text-[10px] font-bold text-text-secondary mt-2 tracking-tight">Mean execution time</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expensive Queries Preview */}
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
                    <div className="space-y-4">
                        {topExpensiveQueries.map((q, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-surface-nested border border-border-light hover:border-primary/30 transition-all">
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-mono font-bold text-text-strong truncate">{q.name}</span>
                                    <span className="text-[10px] text-text-muted truncate mt-0.5">{q.fullText}</span>
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 ml-4">
                                    <span className="text-sm font-black text-primary">{q.credits.toFixed(2)}</span>
                                    <span className="text-[9px] font-bold text-text-muted uppercase">Credits</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Repeated Queries Preview */}
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
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-surface-nested border border-border-light hover:border-primary/30 transition-all">
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-mono font-bold text-text-strong truncate">{q.text}</span>
                                    <span className="text-[10px] text-text-muted mt-0.5">{q.credits.toFixed(1)} Total Credits</span>
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 ml-4">
                                    <span className="text-sm font-black text-text-strong">{q.count}x</span>
                                    <span className="text-[9px] font-bold text-text-muted uppercase">Runs</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueriesOverview;
