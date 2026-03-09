
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { queryListData as initialData, warehousesData } from '../data/dummyData';
import { QueryListItem, QueryListFilters } from '../types';
import { IconSearch, IconDotsVertical, IconView, IconBeaker, IconWand, IconShare, IconAdjustments, IconChevronDown, IconChevronLeft, IconChevronRight, IconRefresh, IconTrendingUp, IconInfo, IconClipboardCopy, IconCheck } from '../constants';
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
    onNavigateToRecommendations?: (page: any) => void;
    filters: QueryListFilters;
    setFilters: React.Dispatch<React.SetStateAction<QueryListFilters>>;
    onDrillDownChange?: (isDrillingDown: boolean) => void;
    initialGroupId?: string | null;
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
    onNavigateToRecommendations,
    filters,
    setFilters,
    onDrillDownChange,
    initialGroupId = null,
}) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('Last 7 days');
    const [viewingHighImpactGroup, setViewingHighImpactGroup] = useState<string | null>(initialGroupId);
    const [detailTab, setDetailTab] = useState<'Details' | 'Query list'>('Details');
    const [isHashCopied, setIsHashCopied] = useState(false);
    const [subSearchTerm, setSubSearchTerm] = useState('');
    const [subWarehouseFilter, setSubWarehouseFilter] = useState('All');
    const [subUserFilter, setSubUserFilter] = useState('All');

    const [groupQueriesColumns, setGroupQueriesColumns] = useState([
        { key: 'id', label: 'Query ID' },
        { key: 'status', label: 'Status' },
        { key: 'user', label: 'User' },
        { key: 'warehouse', label: 'Warehouse' },
        { key: 'costCredits', label: 'Credits' },
        { key: 'duration', label: 'Duration' },
        { key: 'startTime', label: 'Start Time' },
        { key: 'endTime', label: 'End Time' },
        { key: 'queryType', label: 'Query Type' },
        { key: 'severity', label: 'Severity' },
        { key: 'bytesScanned', label: 'Bytes Scanned' },
        { key: 'bytesWritten', label: 'Bytes Written' },
    ]);
    const [visibleGroupQueriesColumns, setVisibleGroupQueriesColumns] = useState(['id', 'status', 'user', 'warehouse', 'costCredits', 'duration']);

    const generateHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    };

    const formatBytes = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

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

        const baseGroups = Object.entries(groups)
            .map(([text, data]) => {
                const firstExec = data.queries.reduce((min, q) => q.timestamp < min ? q.timestamp : min, data.queries[0].timestamp);
                const lastExec = data.queries.reduce((max, q) => q.timestamp > max ? q.timestamp : max, data.queries[0].timestamp);
                
                return {
                    id: `grp-${data.queries[0].id}`,
                    queryText: text,
                    parameterizedHash: generateHash(text),
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
            });

        // Generate up to 100 dummy items if needed
        if (baseGroups.length > 0 && baseGroups.length < 100) {
            const dummyItems = [];
            for (let i = baseGroups.length; i < 100; i++) {
                const base = baseGroups[i % baseGroups.length];
                dummyItems.push({
                    ...base,
                    id: `${base.id}-dummy-${i}`,
                    parameterizedHash: generateHash(`${base.queryText}-${i}`),
                    count: Math.floor(Math.random() * 500) + 2,
                    totalCredits: Math.random() * 5000,
                    avgCredits: Math.random() * 50,
                });
            }
            return [...baseGroups, ...dummyItems].sort((a, b) => b.totalCredits - a.totalCredits);
        }

        return baseGroups.sort((a, b) => b.totalCredits - a.totalCredits);
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

    const filteredGroupQueries = useMemo(() => {
        const baseQueries = groupQueries.filter(q => {
            const matchesSearch = q.id.toLowerCase().includes(subSearchTerm.toLowerCase());
            const matchesWarehouse = subWarehouseFilter === 'All' || q.warehouse === subWarehouseFilter;
            const matchesUser = subUserFilter === 'All' || q.user === subUserFilter;
            return matchesSearch && matchesWarehouse && matchesUser;
        });

        // Generate up to 100 dummy items if needed
        if (baseQueries.length > 0 && baseQueries.length < 100) {
            const dummyItems = [];
            for (let i = baseQueries.length; i < 100; i++) {
                const base = baseQueries[i % baseQueries.length];
                dummyItems.push({
                    ...base,
                    id: `QID-R${i}-${Math.floor(Math.random() * 1000)}`,
                    costCredits: Math.random() * 10,
                    duration: `${Math.floor(Math.random() * 5)}m ${Math.floor(Math.random() * 60)}s`,
                });
            }
            return [...baseQueries, ...dummyItems];
        }

        return baseQueries;
    }, [groupQueries, subSearchTerm, subWarehouseFilter, subUserFilter]);

    const subWarehouses = useMemo(() => ['All', ...Array.from(new Set(groupQueries.map(q => q.warehouse)))], [groupQueries]);
    const subUsers = useMemo(() => ['All', ...Array.from(new Set(groupQueries.map(q => q.user)))], [groupQueries]);

    if (viewingHighImpactGroup && groupData) {
        return (
            <div className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar px-4 pt-4 pb-12">
                <div className="max-w-[1440px] mx-auto w-full space-y-6">
                    {/* Header Area */}
                    <header className="flex flex-col gap-6">
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                <button 
                                    onClick={() => setViewingHighImpactGroup(null)} 
                                    className="mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-white text-text-secondary border border-border-light hover:bg-surface-hover transition-all shadow-sm flex-shrink-0"
                                    aria-label="Back"
                                >
                                    <IconChevronLeft className="h-6 w-6" />
                                </button>
                                
                                <div className="flex flex-col min-w-0 flex-1">
                                    <h1 className="text-[28px] font-bold text-text-strong tracking-tight">
                                        Repeated query
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-sm text-text-secondary font-medium">
                                            Parameterized hash: <span className="font-mono">{groupData.parameterizedHash}</span>
                                        </p>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(groupData.parameterizedHash);
                                                setIsHashCopied(true);
                                                setTimeout(() => setIsHashCopied(false), 2000);
                                            }}
                                            className="text-text-muted hover:text-primary transition-colors"
                                        >
                                            {isHashCopied ? <IconCheck className="w-3.5 h-3.5 text-status-success" /> : <IconClipboardCopy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <DateRangeDropdown selectedValue={dateRange} onChange={(val) => setDateRange(val as string)} />
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border-light gap-8">
                            {(['Details', 'Query list'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setDetailTab(tab)}
                                    className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap ${
                                        detailTab === tab 
                                        ? 'text-primary' 
                                        : 'text-text-muted hover:text-text-secondary'
                                    }`}
                                >
                                    {tab}
                                    {detailTab === tab && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </header>

                    {/* Recommendation Banner */}
                    <div className="bg-blue-50 border border-blue-100 border-l-4 border-l-[#0f62fe] p-4 flex items-center justify-between gap-3 shadow-sm mb-6 rounded-r-lg">
                        <div className="flex items-center gap-3">
                            <IconInfo className="w-5 h-5 text-[#0f62fe] flex-shrink-0" />
                            <div>
                                <p className="text-[14px] font-bold text-[#1e1e1e]">Optimization Opportunity Detected</p>
                                <p className="text-[13px] text-[#4b5563]">
                                    This query pattern has been identified for potential scan optimization which could reduce credits by up to 30%.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => onNavigateToRecommendations?.({ search: 'Scan Optimization', selectedId: 'REC-005' })}
                            className="px-4 py-2 bg-[#0f62fe] text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                            View Recommendation
                        </button>
                    </div>

                    {/* Content Area */}
                    <main className="animate-in fade-in duration-500">
                        {detailTab === 'Details' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Details Card */}
                                <div className="bg-white p-8 rounded-[24px] border border-border-light shadow-sm">
                                    <h3 className="text-sm font-bold text-text-strong mb-8">Details</h3>
                                    <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                                        <div>
                                            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1">Execution count</p>
                                            <p className="text-xl font-black text-text-strong">{groupData.count}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1">Total credits</p>
                                            <p className="text-xl font-black text-text-strong">{groupData.totalCredits.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1">Avg credits per execution</p>
                                            <p className="text-xl font-black text-text-strong">{groupData.avgCredits.toFixed(0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1">Avg duration</p>
                                            <p className="text-xl font-black text-text-strong">00:00:10</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1">Max single run credit</p>
                                            <p className="text-xl font-black text-text-strong">2</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1">Max single run duration</p>
                                            <p className="text-xl font-black text-text-strong">00:00:10</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Query Text Card */}
                                <div className="bg-white p-8 rounded-[24px] border border-border-light shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-text-strong">Query text</h3>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(groupData.queryText)}
                                            className="p-2 hover:bg-surface-nested rounded-lg transition-colors text-text-muted"
                                        >
                                            <IconClipboardCopy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="bg-[#F8F9FA] p-4 rounded-xl border border-border-light overflow-x-auto">
                                        <div className="flex gap-4 font-mono text-[12px] leading-relaxed">
                                            <div className="text-text-muted text-right select-none">
                                                {groupData.queryText.split('\n').map((_, i) => (
                                                    <div key={i}>{i + 1}</div>
                                                ))}
                                            </div>
                                            <pre className="text-text-primary whitespace-pre">
                                                {groupData.queryText}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Summary Pills */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <KPILabel label="Execution count" value={groupData.count.toString()} />
                                    <KPILabel label="Total credits" value={groupData.totalCredits.toFixed(0)} />
                                    <KPILabel label="Avg credits per execution" value={groupData.avgCredits.toFixed(0)} />
                                    <KPILabel label="Avg duration" value="12" />
                                </div>

                                {/* Table Section */}
                                <div className="bg-white rounded-[12px] border border-border-light shadow-sm flex flex-col relative">
                                    {/* Sub-toolbar */}
                                    <div className="px-4 py-3 flex items-center border-b border-border-light bg-white relative z-30">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-text-secondary">Warehouse:</span>
                                                <div className="relative">
                                                    <select
                                                        className="appearance-none pl-0 pr-6 py-1 bg-transparent text-xs font-bold text-text-strong focus:outline-none cursor-pointer"
                                                        value={subWarehouseFilter}
                                                        onChange={(e) => setSubWarehouseFilter(e.target.value)}
                                                    >
                                                        {subWarehouses.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                                                        <IconChevronDown className="h-3 w-3 text-text-muted" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-4 w-px bg-border-light" />

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-text-secondary">User:</span>
                                                <div className="relative">
                                                    <select
                                                        className="appearance-none pl-0 pr-6 py-1 bg-transparent text-xs font-bold text-text-strong focus:outline-none cursor-pointer"
                                                        value={subUserFilter}
                                                        onChange={(e) => setSubUserFilter(e.target.value)}
                                                    >
                                                        {subUsers.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                                                        <IconChevronDown className="h-3 w-3 text-text-muted" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-grow"></div>

                                        <div className="flex items-center gap-4">
                                            <IconSearch className="w-4 h-4 text-text-muted cursor-pointer" />
                                            <ColumnSelector 
                                                columns={groupQueriesColumns} 
                                                visibleColumns={visibleGroupQueriesColumns} 
                                                onVisibleColumnsChange={setVisibleGroupQueriesColumns} 
                                                onColumnsOrderChange={setGroupQueriesColumns}
                                                defaultColumns={['id']} 
                                            />
                                        </div>
                                    </div>

                                     <div className="overflow-auto no-scrollbar max-h-[600px]">
                                        <table className="w-full text-[13px] border-separate border-spacing-0 min-w-max">
                                            <thead className="bg-[#F8F9FA] text-[10px] font-black text-text-muted uppercase tracking-widest sticky top-0 z-20">
                                                <tr>
                                                    {groupQueriesColumns.filter(col => visibleGroupQueriesColumns.includes(col.key)).map(col => (
                                                        <th key={col.key} className="px-6 py-4 text-left border-b border-border-light whitespace-nowrap">
                                                            {col.label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-light bg-white">
                                                {filteredGroupQueries.map((query) => (
                                                    <tr key={query.id} className="group hover:bg-surface-nested transition-colors">
                                                        {groupQueriesColumns.filter(col => visibleGroupQueriesColumns.includes(col.key)).map(col => {
                                                            const value = (query as any)[col.key];
                                                            
                                                            if (col.key === 'id') {
                                                                return (
                                                                    <td key={col.key} className="px-6 py-4 text-text-strong font-medium font-mono text-xs whitespace-nowrap sticky left-0 bg-white z-10 border-r border-border-light shadow-[2px_0_5px_rgba(0,0,0,0.05)] group-hover:bg-surface-nested">
                                                                        {value}
                                                                    </td>
                                                                );
                                                            }
                                                            
                                                            if (col.key === 'status') {
                                                                return (
                                                                    <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                                            value === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                                        }`}>
                                                                            {value}
                                                                        </span>
                                                                    </td>
                                                                );
                                                            }

                                                            if (col.key === 'costCredits') {
                                                                return (
                                                                    <td key={col.key} className="px-6 py-4 text-text-strong font-black whitespace-nowrap">
                                                                        {value.toFixed(2)}
                                                                    </td>
                                                                );
                                                            }

                                                            if (col.key === 'startTime' || col.key === 'endTime') {
                                                                return (
                                                                    <td key={col.key} className="px-6 py-4 text-text-secondary whitespace-nowrap">
                                                                        {value ? new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                                    </td>
                                                                );
                                                            }

                                                            if (col.key === 'bytesScanned' || col.key === 'bytesWritten') {
                                                                return (
                                                                    <td key={col.key} className="px-6 py-4 text-text-secondary whitespace-nowrap">
                                                                        {formatBytes(value)}
                                                                    </td>
                                                                );
                                                            }

                                                            return (
                                                                <td key={col.key} className="px-6 py-4 text-text-secondary whitespace-nowrap">
                                                                    {value?.toString() || '—'}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Bar */}
                                    <div className="px-4 py-3 flex items-center justify-between bg-white border-t border-border-light text-[13px] text-text-secondary rounded-b-[12px]">
                                        <div className="flex items-center gap-2">
                                            <span>Items per page:</span>
                                            <div className="relative flex items-center gap-1 cursor-pointer hover:text-text-strong">
                                                <select 
                                                    value={100}
                                                    onChange={() => {}}
                                                    className="appearance-none bg-transparent pr-4 font-bold text-text-strong cursor-pointer focus:outline-none"
                                                >
                                                    <option value={100}>100</option>
                                                </select>
                                                <IconChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="h-10 w-px bg-border-light" />
                                            <span>1–100 of 100 items</span>
                                            <div className="h-10 w-px bg-border-light" />
                                            
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex items-center gap-1 cursor-pointer hover:text-text-strong">
                                                    <span className="font-bold">1</span>
                                                    <IconChevronDown className="w-3 h-3" />
                                                </div>
                                                <span>of 10 pages</span>
                                            </div>

                                            <div className="flex items-center border-l border-border-light">
                                                <button className="p-3 hover:bg-surface-hover border-r border-border-light">
                                                    <IconChevronLeft className="w-4 h-4" />
                                                </button>
                                                <button className="p-3 hover:bg-surface-hover">
                                                    <IconChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
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
            
            <div className="bg-white rounded-[12px] border border-border-light shadow-sm flex flex-col min-h-0 relative">
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
                <div className="overflow-auto no-scrollbar max-h-[600px]">
                    <table className="w-full text-[13px] border-separate border-spacing-0">
                        <thead className="text-[11px] text-text-strong uppercase font-bold sticky top-0 z-10 bg-[#F8F9FA] border-b border-border-light">
                            <tr>
                                <th className="px-6 py-4 text-left border-b border-border-light">Parameterized Hash</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">Execution Count</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">Total Credits</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">Avg Credits p...</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">First Execution</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">Last Execution</th>
                                <th className="px-6 py-4 text-right border-b border-border-light">Insights</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {(paginatedData as any[]).map((group, idx) => (
                                <tr key={group.id} className="group hover:bg-surface-hover transition-colors cursor-pointer border-b border-border-light last:border-0" onClick={() => setViewingHighImpactGroup(group.queryText)}>
                                    <td className="px-6 py-4">
                                        <span className="text-link font-mono font-medium hover:underline block truncate max-w-[300px]">
                                            {group.parameterizedHash}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary font-medium">{group.count}</td>
                                    <td className="px-6 py-4 text-text-secondary font-medium">{group.totalCredits.toFixed(0)}</td>
                                    <td className="px-6 py-4 text-text-secondary font-medium">{group.avgCredits.toFixed(1)}</td>
                                    <td className="px-6 py-4 text-text-secondary font-medium">{new Date(group.firstExecution).toLocaleDateString([], { month: 'short', day: 'numeric' })}</td>
                                    <td className="px-6 py-4 text-text-secondary font-medium">{new Date(group.lastExecution).toLocaleDateString([], { month: 'short', day: 'numeric' })}</td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        {idx % 4 === 0 ? (
                                            <div className="flex items-center justify-end">
                                                <button 
                                                    onClick={() => onNavigateToRecommendations?.({ search: 'Scan Optimization', selectedId: 'REC-005' })}
                                                    className="inline-flex items-center gap-1 bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10 hover:bg-primary hover:text-white transition-all shadow-sm"
                                                >
                                                    <span className="text-xs font-black">1</span>
                                                    <span className="text-[9px] font-bold uppercase">Insights</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-text-muted text-[11px]">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Bar - Matching Reference Image */}
                <div className="px-4 py-3 flex items-center justify-between bg-white border-t border-border-light text-[13px] text-text-secondary rounded-b-[12px]">
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
