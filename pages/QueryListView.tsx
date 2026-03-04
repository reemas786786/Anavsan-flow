
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { queryListData as initialData, warehousesData } from '../data/dummyData';
import { QueryListItem, QueryListFilters } from '../types';
import { IconSearch, IconDotsVertical, IconView, IconBeaker, IconWand, IconShare, IconAdjustments, IconChevronDown, IconChevronLeft, IconChevronRight, IconRefresh, IconTrendingUp, IconInfo } from '../constants';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import DateRangeDropdown from '../components/DateRangeDropdown';
import ColumnSelector from '../components/ColumnSelector';

const allColumns = [
    { key: 'queryId', label: 'Query ID' },
    { key: 'credits', label: 'Credits' },
    { key: 'duration', label: 'Duration' },
];

type QueryMode = 'High-impact';

interface QueryListViewProps {
    onShareQueryClick: (query: QueryListItem) => void;
    onSelectQuery: (query: QueryListItem) => void;
    onAnalyzeQuery: (query: QueryListItem) => void;
    onOptimizeQuery: (query: QueryListItem) => void;
    onSimulateQuery: (query: QueryListItem) => void;
    filters: QueryListFilters;
    setFilters: React.Dispatch<React.SetStateAction<QueryListFilters>>;
    onDrillDownChange?: (isDrillingDown: boolean) => void;
}

const KPILabel: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-white px-5 py-2.5 rounded-full border border-border-light shadow-sm flex items-center gap-2 flex-shrink-0 transition-all hover:border-primary/30">
        <span className="text-[13px] text-text-secondary font-medium whitespace-nowrap">{label}:</span>
        <span className="text-[13px] font-black text-text-strong whitespace-nowrap">{value}</span>
    </div>
);

const QueryListView: React.FC<QueryListViewProps> = ({
    onShareQueryClick,
    onSelectQuery,
    onAnalyzeQuery,
    onOptimizeQuery,
    onSimulateQuery,
    filters,
    setFilters,
    onDrillDownChange,
}) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('Last 7 days');
    const [viewingHighImpactGroup, setViewingHighImpactGroup] = useState<string | null>(null);
    const [detailTab, setDetailTab] = useState<'Details' | 'Query List'>('Details');

    useEffect(() => {
        onDrillDownChange?.(!!viewingHighImpactGroup);
    }, [viewingHighImpactGroup, onDrillDownChange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFilterChange = <K extends keyof QueryListFilters>(key: K, value: QueryListFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value, currentPage: 1 }));
    };

    // --- DATA PROCESSING FOR MODES ---

    const repeatedQueries = useMemo(() => {
        const groups: Record<string, { count: number; totalCredits: number; queries: QueryListItem[]; users: Set<string> }> = {};
        
        initialData.forEach(q => {
            if (!groups[q.queryText]) {
                groups[q.queryText] = { count: 0, totalCredits: 0, queries: [], users: new Set() };
            }
            groups[q.queryText].count++;
            groups[q.queryText].totalCredits += q.costCredits;
            groups[q.queryText].queries.push(q);
            groups[q.queryText].users.add(q.user);
        });

        return Object.entries(groups)
            .map(([text, data]) => {
                const firstExec = data.queries.reduce((min, q) => q.timestamp < min ? q.timestamp : min, data.queries[0].timestamp);
                const lastExec = data.queries.reduce((max, q) => q.timestamp > max ? q.timestamp : max, data.queries[0].timestamp);
                
                return {
                    id: `grp-${data.queries[0].id}`,
                    queryText: text,
                    count: data.count,
                    totalCredits: data.totalCredits,
                    avgCredits: data.totalCredits / data.count,
                    warehouse: data.queries[0].warehouse,
                    userCount: data.users.size,
                    firstExecution: firstExec,
                    lastExecution: lastExec,
                    representative: data.queries[0]
                };
            })
            .filter(g => {
                const matchesSearch = g.queryText.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCount = g.count > 1;
                return matchesSearch && matchesCount;
            })
            .sort((a, b) => b.totalCredits - a.totalCredits);
    }, [searchTerm]);

    const paginatedData = useMemo(() => {
        return repeatedQueries.slice((filters.currentPage - 1) * filters.itemsPerPage, filters.currentPage * filters.itemsPerPage);
    }, [filters.currentPage, filters.itemsPerPage, repeatedQueries]);

    const totalPages = Math.ceil(repeatedQueries.length / filters.itemsPerPage);

    const groupData = useMemo(() => {
        if (!viewingHighImpactGroup) return null;
        return repeatedQueries.find(g => g.queryText === viewingHighImpactGroup);
    }, [viewingHighImpactGroup, repeatedQueries]);

    const groupQueries = useMemo(() => {
        if (!viewingHighImpactGroup) return [];
        return initialData.filter(q => q.queryText === viewingHighImpactGroup);
    }, [viewingHighImpactGroup]);

    if (viewingHighImpactGroup && groupData) {
        return (
            <div className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar px-4 pt-4 pb-12">
                <div className="max-w-[1440px] mx-auto w-full space-y-8">
                    {/* Header Area */}
                    <header className="flex flex-col gap-8">
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                <button 
                                    onClick={() => setViewingHighImpactGroup(null)} 
                                    className="mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-white text-text-secondary border border-border-light hover:bg-surface-hover transition-all shadow-sm flex-shrink-0"
                                    aria-label="Back"
                                >
                                    <IconChevronLeft className="h-6 w-6" />
                                </button>
                                
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-[24px] md:text-[28px] font-bold text-text-strong tracking-tight break-words line-clamp-2" title={viewingHighImpactGroup}>
                                            {viewingHighImpactGroup}
                                        </h1>
                                    </div>
                                    <p className="text-sm text-text-secondary font-medium mt-1">Detailed analysis for this repeated query group.</p>
                                </div>
                            </div>

                            {/* Actionable Notification */}
                            <div className="flex items-center justify-between bg-[#edf5ff] border border-[#d0e2ff] border-l-[4px] border-l-[#0f62fe] px-4 py-3 w-full lg:w-auto lg:min-w-[420px] shadow-sm flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 text-[#0f62fe]">
                                        <IconInfo className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col text-sm leading-tight text-[#161616]">
                                        <span className="font-bold">Platform AI</span>
                                        <span className="text-xs">Detected potential scan optimizations for this query pattern.</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 ml-4">
                                    <button className="text-sm font-semibold text-[#0f62fe] hover:underline whitespace-nowrap">
                                        View optimizations
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Horizontal Tab Navigation */}
                        <div className="flex border-b border-border-light overflow-x-auto no-scrollbar gap-8">
                            {(['Details', 'Query List'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setDetailTab(tab)}
                                    className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
                                        detailTab === tab 
                                        ? 'text-primary' 
                                        : 'text-text-muted hover:text-text-secondary'
                                    }`}
                                >
                                    {tab} {tab === 'Query List' && `(${groupQueries.length})`}
                                    {detailTab === tab && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </header>

                    {/* Content Area */}
                    <main className="animate-in fade-in duration-500">
                        {detailTab === 'Details' ? (
                            <div className="space-y-8">
                                {/* Summary Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    <div className="bg-white p-6 rounded-[24px] border border-border-light shadow-sm flex flex-col h-[120px]">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Executions</p>
                                        <div className="mt-auto">
                                            <p className="text-[32px] font-black text-text-strong tracking-tight leading-none">{groupData.count}</p>
                                            <p className="text-[10px] font-bold text-text-secondary mt-2 tracking-tight">Across all warehouses</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-[24px] border border-border-light shadow-sm flex flex-col h-[120px]">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Credits</p>
                                        <div className="mt-auto">
                                            <p className="text-[32px] font-black text-primary tracking-tight leading-none">{groupData.totalCredits.toFixed(2)}</p>
                                            <p className="text-[10px] font-bold text-text-secondary mt-2 tracking-tight">Cumulative consumption</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-[24px] border border-border-light shadow-sm flex flex-col h-[120px]">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Avg Credits / Run</p>
                                        <div className="mt-auto">
                                            <p className="text-[32px] font-black text-text-strong tracking-tight leading-none">{(groupData.totalCredits / groupData.count).toFixed(2)}</p>
                                            <p className="text-[10px] font-bold text-text-secondary mt-2 tracking-tight">Per execution average</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-[24px] border border-border-light shadow-sm flex flex-col h-[120px]">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Warehouse</p>
                                        <div className="mt-auto">
                                            <p className="text-[20px] font-black text-text-strong tracking-tight leading-none truncate" title={groupData.warehouse}>{groupData.warehouse}</p>
                                            <p className="text-[10px] font-bold text-text-secondary mt-2 tracking-tight">Primary compute cluster</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-[24px] border border-border-light shadow-sm flex flex-col h-[120px]">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">User</p>
                                        <div className="mt-auto">
                                            <p className="text-[20px] font-black text-text-strong tracking-tight leading-none truncate" title={groupData.representative.user}>{groupData.representative.user}</p>
                                            <p className="text-[10px] font-bold text-text-secondary mt-2 tracking-tight">Top execution owner</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    {/* Left Column: Metadata */}
                                    <div className="lg:col-span-4 space-y-6">
                                        <div className="bg-white p-8 rounded-[24px] border border-border-light shadow-sm space-y-8">
                                            <h3 className="text-sm font-black text-text-strong uppercase tracking-[0.2em] border-b border-border-light pb-4">Query Metadata</h3>
                                            <div className="grid grid-cols-1 gap-y-8">
                                                <div>
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Primary Warehouse</p>
                                                    <div className="text-sm font-black text-text-primary mt-1">{groupData.warehouse}</div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Top User</p>
                                                    <div className="text-sm font-black text-text-primary mt-1">{groupData.representative.user}</div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Query Type</p>
                                                    <div className="text-sm font-black text-text-primary mt-1">
                                                        {groupData.representative.type.join(', ')}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Avg Bytes Scanned</p>
                                                    <div className="text-sm font-black text-text-primary mt-1">
                                                        {(groupData.representative.bytesScanned / 1024 / 1024).toFixed(2)} MB
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: SQL Text */}
                                    <div className="lg:col-span-8">
                                        <div className="bg-white p-8 rounded-[24px] border border-border-light shadow-sm space-y-6 h-full">
                                            <h3 className="text-sm font-black text-text-strong uppercase tracking-[0.2em] border-b border-border-light pb-4">SQL Text</h3>
                                            <div className="bg-surface-nested p-6 rounded-[20px] border border-border-light">
                                                <pre className="text-[13px] font-mono whitespace-pre-wrap break-all text-text-secondary leading-relaxed">
                                                    {groupData.queryText}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[12px] border border-border-light shadow-sm overflow-hidden flex flex-col">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[13px] border-separate border-spacing-0">
                                        <thead className="bg-[#F8F9FA] text-[10px] font-black text-text-muted uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4 text-left border-b border-border-light">Query ID</th>
                                                <th className="px-6 py-4 text-left border-b border-border-light">Credits</th>
                                                <th className="px-6 py-4 text-left border-b border-border-light">Duration</th>
                                                <th className="px-6 py-4 text-right border-b border-border-light"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-light bg-white">
                                            {groupQueries.map((query) => (
                                                <tr key={query.id} className="hover:bg-surface-nested group transition-colors">
                                                    <td className="px-6 py-5">
                                                        <button onClick={() => onSelectQuery(query)} className="text-link font-bold hover:underline font-mono text-xs">
                                                            {query.id}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-5 font-black text-text-strong">{query.costCredits.toFixed(2)}</td>
                                                    <td className="px-6 py-5 text-text-secondary font-medium">{query.duration}</td>
                                                    <td className="px-6 py-5 text-right">
                                                        <button onClick={() => onSelectQuery(query)} className="text-primary hover:underline text-xs font-bold uppercase">Details</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background space-y-4 px-6 pt-6 pb-12 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex flex-col">
                    <h1 className="text-[28px] font-bold text-text-strong tracking-tight">Repeated queries</h1>
                    <p className="text-sm text-text-secondary font-medium mt-1">Feb 17 to Feb 23 2026 (Last 7 days)</p>
                </div>
                <DateRangeDropdown 
                    selectedValue={dateRange} 
                    onChange={(val) => { setDateRange(val as string); handleFilterChange('currentPage', 1); }} 
                />
            </div>

            {/* Pill-style Summary Metrics */}
            <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar flex-shrink-0">
                <KPILabel label="Query pattern" value={repeatedQueries.length.toString()} />
            </div>
            
            <div className="bg-white rounded-[12px] border border-border-light shadow-sm flex flex-col min-h-0 overflow-hidden">
                {/* Integrated Filter Bar */}
                <div className="px-4 py-3 flex flex-wrap items-center gap-6 border-b border-border-light bg-white relative z-20">
                    <div className="flex-grow"></div>

                    <div className="relative w-64">
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); handleFilterChange('currentPage', 1); }}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none pr-8 placeholder:text-text-muted w-full text-right"
                            placeholder="Search queries..."
                        />
                        <IconSearch className="w-4 h-4 text-text-muted absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer" />
                    </div>
                </div>

                {/* Table Body */}
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-[13px] border-separate border-spacing-0">
                        <thead className="text-[11px] text-text-strong uppercase font-bold sticky top-0 z-10 bg-[#F8F9FA] border-b border-border-light">
                            <tr>
                                <th className="px-6 py-4 text-left border-b border-border-light">Query Pattern</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">Execution Count</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">Total Credits</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">Avg Credits p...</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">First Execution</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">Last Execution</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {(paginatedData as any[]).map((group) => (
                                <tr key={group.id} className="group hover:bg-surface-hover transition-colors cursor-pointer border-b border-border-light last:border-0" onClick={() => setViewingHighImpactGroup(group.queryText)}>
                                    <td className="px-6 py-4">
                                        <span className="text-link font-medium hover:underline block truncate max-w-[300px]">
                                            {group.queryText.includes('Prod Analytics') ? 'Prod Analytics' : 
                                             group.queryText.includes('Database Spend Alert') ? 'Database Spend Alert' :
                                             group.queryText.includes('Database System') ? 'Database System' :
                                             group.queryText.includes('Database Query Optimization') ? 'Database Query Optimization' :
                                             group.queryText.includes('Database Security') ? 'Database Security' :
                                             group.queryText.includes('Database Insight') ? 'Database Insight' :
                                             group.queryText}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary font-medium">{group.count}</td>
                                    <td className="px-6 py-4 text-text-secondary font-medium">{group.totalCredits.toFixed(0)}</td>
                                    <td className="px-6 py-4 text-text-secondary font-medium">{group.avgCredits.toFixed(1)}</td>
                                    <td className="px-6 py-4 text-text-secondary font-medium">{new Date(group.firstExecution).toLocaleDateString([], { month: 'short', day: 'numeric' })}</td>
                                    <td className="px-6 py-4 text-text-secondary font-medium">{new Date(group.lastExecution).toLocaleDateString([], { month: 'short', day: 'numeric' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Bar - Matching Reference Image */}
                <div className="px-4 py-3 flex items-center justify-between bg-white border-t border-border-light text-[13px] text-text-secondary">
                    <div className="flex items-center gap-2">
                        <span>Items per page:</span>
                        <div className="relative flex items-center gap-1 cursor-pointer hover:text-text-strong">
                            <select 
                                value={filters.itemsPerPage}
                                onChange={(e) => handleFilterChange('itemsPerPage', Number(e.target.value))}
                                className="appearance-none bg-transparent pr-4 font-bold text-text-strong cursor-pointer focus:outline-none"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <IconChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="h-10 w-px bg-border-light" />
                        <span>1–{Math.min(filters.itemsPerPage, repeatedQueries.length)} of {repeatedQueries.length} items</span>
                        <div className="h-10 w-px bg-border-light" />
                        
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center gap-1 cursor-pointer hover:text-text-strong">
                                <span className="font-bold">{filters.currentPage}</span>
                                <IconChevronDown className="w-3 h-3" />
                            </div>
                            <span>of {totalPages} pages</span>
                        </div>

                        <div className="flex items-center border-l border-border-light">
                            <button 
                                disabled={filters.currentPage === 1}
                                onClick={(e) => { e.stopPropagation(); handleFilterChange('currentPage', filters.currentPage - 1); }}
                                className="p-3 hover:bg-surface-hover disabled:opacity-30 border-r border-border-light"
                            >
                                <IconChevronLeft className="w-4 h-4" />
                            </button>
                            <button 
                                disabled={filters.currentPage === totalPages}
                                onClick={(e) => { e.stopPropagation(); handleFilterChange('currentPage', filters.currentPage + 1); }}
                                className="p-3 hover:bg-surface-hover disabled:opacity-30"
                            >
                                <IconChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueryListView;
