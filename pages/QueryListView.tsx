
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
    const [searchVisible, setSearchVisible] = useState(false);
    const [mode, setMode] = useState<QueryMode>('High-impact');
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
        const groups: Record<string, { count: number; totalCredits: number; queries: QueryListItem[] }> = {};
        
        initialData.forEach(q => {
            if (!groups[q.queryText]) {
                groups[q.queryText] = { count: 0, totalCredits: 0, queries: [] };
            }
            groups[q.queryText].count++;
            groups[q.queryText].totalCredits += q.costCredits;
            groups[q.queryText].queries.push(q);
        });

        return Object.entries(groups)
            .map(([text, data]) => ({
                id: `grp-${data.queries[0].id}`,
                queryText: text,
                count: data.count,
                totalCredits: data.totalCredits,
                warehouse: data.queries[0].warehouse,
                representative: data.queries[0]
            }))
            .filter(g => g.count > 1)
            .sort((a, b) => b.totalCredits - a.totalCredits);
    }, []);

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
                                    <p className="text-sm text-text-secondary font-medium mt-1">Detailed analysis for this high-impact query group.</p>
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
        <div className="flex flex-col h-full bg-background space-y-3 px-4 pt-4 pb-12">
            <div className="flex-shrink-0 mb-8">
                <h1 className="text-[28px] font-bold text-text-strong tracking-tight">High-impact queries</h1>
                <p className="text-sm text-text-secondary font-medium mt-1">View, group, and analyze high-impact Snowflake query executions.</p>
            </div>
            
            <div className="bg-surface rounded-2xl flex flex-col flex-grow min-h-0 shadow-sm border border-border-light overflow-hidden">
                {/* Segmented Control Mode Switcher Removed */}

                {/* Refined Filter Bar */}
                <div className="px-4 py-3 flex items-center gap-6 text-[12px] text-text-secondary border-b border-border-light whitespace-nowrap overflow-visible relative z-20 bg-white">
                    <div className="flex items-center gap-4 ml-auto">
                        {searchVisible ? (
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Search..." 
                                className="bg-background border-none rounded-full px-3 py-1 text-[11px] focus:ring-1 focus:ring-primary w-32"
                                onBlur={() => setSearchVisible(false)}
                            />
                        ) : (
                            <button onClick={() => setSearchVisible(true)} className="text-text-muted hover:text-primary transition-colors">
                                <IconSearch className="w-4 h-4" />
                            </button>
                        )}
                        <ColumnSelector 
                            columns={allColumns} 
                            visibleColumns={filters.visibleColumns} 
                            onVisibleColumnsChange={(cols) => handleFilterChange('visibleColumns', cols)} 
                            defaultColumns={['queryId']} 
                        />
                    </div>
                </div>

                {/* Table Body */}
                <div className="overflow-y-auto flex-grow min-h-0 no-scrollbar">
                    <table className="w-full text-[13px] border-separate border-spacing-0">
                        <thead className="text-[11px] text-text-secondary uppercase font-bold sticky top-0 z-10 bg-white border-b border-border-light">
                            <tr>
                                <th className="px-6 py-4 text-left border-b border-border-light">SQL text snippet</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">Count</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">Total credits</th>
                                <th className="px-6 py-4 text-right border-b border-border-light">Insights</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {(paginatedData as any[]).map((group) => (
                                <tr key={group.id} className="group hover:bg-surface-hover transition-colors">
                                    <td onClick={() => setViewingHighImpactGroup(group.queryText)} className="px-6 py-4 cursor-pointer relative group/sql">
                                        <div className="max-w-[200px]">
                                            <span className="text-link hover:underline font-mono text-[11px] block truncate">
                                                {group.queryText}
                                            </span>
                                        </div>
                                        
                                        {/* Hover Preview */}
                                        <div className="invisible group-hover/sql:visible absolute left-6 top-full z-50 w-[450px] p-4 bg-white border border-border-light shadow-2xl rounded-xl animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Full SQL Preview</span>
                                            </div>
                                            <pre className="text-[11px] font-mono text-text-secondary whitespace-pre-wrap break-all bg-surface-nested p-3 rounded-lg border border-border-light max-h-[250px] overflow-y-auto no-scrollbar">
                                                {group.queryText}
                                            </pre>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-text-strong">{group.count}x</td>
                                    <td className="px-6 py-4 font-black text-primary">{group.totalCredits.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setViewingHighImpactGroup(group.queryText)}
                                            className="inline-flex items-center gap-1 bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10 hover:bg-primary hover:text-white transition-all shadow-sm"
                                        >
                                            <span className="text-xs font-black">{(group.queryText.length % 5) + 1}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-tighter">Insights</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Refined Pagination */}
                <div className="px-4 py-3 flex items-center justify-between bg-white border-t border-border-light text-[11px] font-medium text-text-secondary">
                    <div className="flex items-center gap-2">
                        <span>Items per page:</span>
                        <div className="relative group">
                            <select 
                                value={filters.itemsPerPage}
                                onChange={(e) => handleFilterChange('itemsPerPage', Number(e.target.value))}
                                className="appearance-none bg-transparent pr-4 font-bold text-text-strong cursor-pointer focus:outline-none"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <IconChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        <span>Page {filters.currentPage} of {totalPages}</span>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={filters.currentPage === 1}
                                onClick={() => handleFilterChange('currentPage', filters.currentPage - 1)}
                                className="p-1 rounded hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <IconChevronLeft className="w-4 h-4" />
                            </button>
                            <button 
                                disabled={filters.currentPage === totalPages}
                                onClick={() => handleFilterChange('currentPage', filters.currentPage + 1)}
                                className="p-1 rounded hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
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
