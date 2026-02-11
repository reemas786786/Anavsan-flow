
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { queryListData as initialData, warehousesData, similarQueriesData } from '../data/dummyData';
import { QueryListItem, QueryListFilters, SimilarQuery } from '../types';
import { IconSearch, IconDotsVertical, IconView, IconBeaker, IconWand, IconShare, IconAdjustments, IconChevronDown, IconChevronLeft, IconChevronRight, IconLayers, IconRefresh } from '../constants';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import DateRangeDropdown from '../components/DateRangeDropdown';
import ColumnSelector from '../components/ColumnSelector';

const allColumns = [
    { key: 'queryId', label: 'Query ID' },
    { key: 'credits', label: 'Credits' },
    { key: 'duration', label: 'Duration' },
    { key: 'warehouse', label: 'Warehouse' },
];

type QueryMode = 'All' | 'Similar' | 'Repeated';

interface QueryListViewProps {
    onShareQueryClick: (query: QueryListItem) => void;
    onSelectQuery: (query: QueryListItem) => void;
    onAnalyzeQuery: (query: QueryListItem) => void;
    onOptimizeQuery: (query: QueryListItem) => void;
    onSimulateQuery: (query: QueryListItem) => void;
    filters: QueryListFilters;
    setFilters: React.Dispatch<React.SetStateAction<QueryListFilters>>;
}

const QueryListView: React.FC<QueryListViewProps> = ({
    onShareQueryClick,
    onSelectQuery,
    onAnalyzeQuery,
    onOptimizeQuery,
    onSimulateQuery,
    filters,
    setFilters,
}) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [searchVisible, setSearchVisible] = useState(false);
    const [mode, setMode] = useState<QueryMode>('All');
    const [viewingPatternDetails, setViewingPatternDetails] = useState<string | null>(null);

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

    const similarPatterns = useMemo(() => {
        const groups: Record<string, { count: number; totalCredits: number; queries: SimilarQuery[] }> = {};
        similarQueriesData.forEach(q => {
            const pattern = q.pattern || 'Generic';
            if (!groups[pattern]) {
                groups[pattern] = { count: 0, totalCredits: 0, queries: [] };
            }
            groups[pattern].count++;
            groups[pattern].totalCredits += q.tokens;
            groups[pattern].queries.push(q);
        });
        return Object.entries(groups).map(([pattern, data]) => ({
            pattern,
            count: data.count,
            totalCredits: data.totalCredits,
            id: `pat-${pattern}`
        })).sort((a, b) => b.totalCredits - a.totalCredits);
    }, []);

    const queriesInPattern = useMemo(() => {
        if (!viewingPatternDetails) return [];
        return similarQueriesData.filter(q => q.pattern === viewingPatternDetails);
    }, [viewingPatternDetails]);

    const paginatedData = useMemo(() => {
        if (mode === 'All') {
            return initialData.slice((filters.currentPage - 1) * filters.itemsPerPage, filters.currentPage * filters.itemsPerPage);
        }
        if (mode === 'Repeated') {
            return repeatedQueries.slice((filters.currentPage - 1) * filters.itemsPerPage, filters.currentPage * filters.itemsPerPage);
        }
        return similarPatterns.slice((filters.currentPage - 1) * filters.itemsPerPage, filters.currentPage * filters.itemsPerPage);
    }, [filters.currentPage, filters.itemsPerPage, mode, repeatedQueries, similarPatterns]);

    const totalPages = Math.ceil((mode === 'All' ? initialData.length : mode === 'Repeated' ? repeatedQueries.length : similarPatterns.length) / filters.itemsPerPage);

    if (viewingPatternDetails) {
        return (
            <div className="flex flex-col h-full bg-background space-y-4 px-6 pt-4 pb-12">
                <div className="flex items-center gap-4">
                    <button onClick={() => setViewingPatternDetails(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-text-secondary border border-border-light hover:bg-surface-nested transition-all shadow-sm">
                        <IconChevronLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-text-strong">{viewingPatternDetails} Details</h1>
                        <p className="text-sm text-text-secondary">Instances of this query pattern.</p>
                    </div>
                </div>
                <div className="bg-surface rounded-2xl flex flex-col flex-grow min-h-0 shadow-sm border border-border-light overflow-hidden">
                    <div className="overflow-y-auto flex-grow min-h-0 no-scrollbar">
                        <table className="w-full text-[13px] border-separate border-spacing-0">
                            <thead className="bg-[#F8F9FA] text-[11px] text-text-secondary uppercase font-bold sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-left border-b border-border-light">Similarity</th>
                                    <th className="px-6 py-4 text-left border-b border-border-light">SQL text snippet</th>
                                    <th className="px-6 py-4 text-left border-b border-border-light">Credits</th>
                                    <th className="px-6 py-4 text-left border-b border-border-light">Warehouse</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {queriesInPattern.map(q => (
                                    <tr key={q.id} className="hover:bg-surface-nested transition-colors">
                                        <td className="px-6 py-4 font-bold text-primary">{q.similarity}%</td>
                                        <td className="px-6 py-4 font-mono text-[11px] truncate max-w-md">{q.name}</td>
                                        <td className="px-6 py-4 font-black">{q.tokens.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-text-secondary">{q.warehouse}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background space-y-3 px-6 pt-4 pb-12">
            <div className="flex-shrink-0 mb-8">
                <h1 className="text-[28px] font-bold text-text-strong tracking-tight">Queries</h1>
                <p className="text-sm text-text-secondary font-medium mt-1">View, group, and analyze Snowflake query executions.</p>
            </div>
            
            <div className="bg-surface rounded-2xl flex flex-col flex-grow min-h-0 shadow-sm border border-border-light overflow-hidden">
                {/* Segmented Control Mode Switcher */}
                <div className="px-6 pt-4 flex items-center border-b border-border-light bg-white">
                    <div className="flex gap-8">
                        {(['All', 'Similar', 'Repeated'] as QueryMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); handleFilterChange('currentPage', 1); }}
                                className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${
                                    mode === m 
                                    ? 'text-primary' 
                                    : 'text-text-muted hover:text-text-secondary'
                                }`}
                            >
                                {m === 'Similar' && <IconLayers className="w-3.5 h-3.5" />}
                                {m === 'Repeated' && <IconRefresh className="w-3.5 h-3.5" />}
                                {m} Queries
                                {mode === m && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Refined Filter Bar */}
                <div className="px-4 py-3 flex items-center gap-6 text-[12px] text-text-secondary border-b border-border-light whitespace-nowrap overflow-visible relative z-20 bg-white">
                    <DateRangeDropdown selectedValue={filters.dateFilter} onChange={(val) => handleFilterChange('dateFilter', val)} />
                    
                    <div className="w-px h-3 bg-border-color hidden sm:block"></div>
                    
                    <MultiSelectDropdown 
                        label="Warehouse" 
                        options={warehousesData.map(w => w.name)} 
                        selectedOptions={filters.warehouseFilter} 
                        onChange={(val) => handleFilterChange('warehouseFilter', val)} 
                    />
                    
                    {mode === 'All' && (
                        <>
                            <div className="w-px h-3 bg-border-color hidden sm:block"></div>
                            <MultiSelectDropdown 
                                label="Status" 
                                options={['Success', 'Failed']} 
                                selectedOptions={filters.statusFilter} 
                                onChange={(val) => handleFilterChange('statusFilter', val)} 
                            />
                        </>
                    )}

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
                            {mode === 'All' ? (
                                <tr>
                                    <th className="px-6 py-4 text-left border-b border-border-light">Query ID</th>
                                    <th className="px-6 py-4 text-left border-b border-border-light">Credits</th>
                                    <th className="px-6 py-4 text-left border-b border-border-light">Duration</th>
                                    <th className="px-6 py-4 text-left border-b border-border-light">Warehouse</th>
                                    <th className="px-6 py-4 text-right border-b border-border-light"></th>
                                </tr>
                            ) : mode === 'Repeated' ? (
                                <tr>
                                    <th className="px-6 py-4 text-left border-b border-border-light">SQL text snippet</th>
                                    <th className="px-6 py-4 text-left border-b border-border-light">Count</th>
                                    <th className="px-6 py-4 text-left border-b border-border-light">Total credits</th>
                                    <th className="px-6 py-4 text-left border-b border-border-light">Warehouse</th>
                                    <th className="px-6 py-4 text-right border-b border-border-light"></th>
                                </tr>
                            ) : (
                                <tr>
                                    <th className="px-6 py-4 text-left border-b border-border-light">Pattern group</th>
                                    <th className="px-6 py-4 text-left border-b border-border-light">Executions</th>
                                    <th className="px-6 py-4 text-left border-b border-border-light">Total credits</th>
                                    <th className="px-6 py-4 text-right border-b border-border-light"></th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="bg-white">
                            {mode === 'All' && (paginatedData as QueryListItem[]).map((query) => (
                                <tr key={query.id} className="group hover:bg-surface-hover transition-colors relative">
                                    <td className="px-6 py-4 relative">
                                        <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r ${query.status === 'Success' ? 'bg-status-success' : 'bg-status-error'}`}></div>
                                        <button onClick={() => onSelectQuery(query)} className="text-link hover:underline font-medium text-left truncate max-w-[200px] block font-mono text-[12px]">
                                            {query.id}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 font-black text-text-strong">{query.costCredits.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-text-secondary">{query.duration}</td>
                                    <td className="px-6 py-4 text-text-secondary">{query.warehouse}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative inline-block" ref={openMenuId === query.id ? menuRef : null}>
                                            <button onClick={() => setOpenMenuId(openMenuId === query.id ? null : query.id)} className="p-1 rounded-full text-text-muted hover:text-primary transition-colors"><IconDotsVertical className="h-5 w-5" /></button>
                                            {openMenuId === query.id && (
                                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl bg-surface shadow-xl z-20 border border-border-color overflow-hidden">
                                                    <div className="py-1">
                                                        <button onClick={() => { onSelectQuery(query); setOpenMenuId(null); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"><IconView className="w-4 h-4"/> View details</button>
                                                        <button onClick={() => { onAnalyzeQuery(query); setOpenMenuId(null); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"><IconSearch className="w-4 h-4"/> Analyze</button>
                                                        <button onClick={() => { onOptimizeQuery(query); setOpenMenuId(null); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"><IconWand className="w-4 h-4"/> Optimize</button>
                                                        <button onClick={() => { onSimulateQuery(query); setOpenMenuId(null); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"><IconBeaker className="h-4 w-4"/> Simulate</button>
                                                        <div className="my-1 border-t border-border-color"></div>
                                                        <button onClick={() => { onShareQueryClick(query); setOpenMenuId(null); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"><IconShare className="w-4 h-4"/> Assign query</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {mode === 'Repeated' && (paginatedData as any[]).map((group) => (
                                <tr key={group.id} className="group hover:bg-surface-hover transition-colors">
                                    <td onClick={() => onSelectQuery(group.representative)} className="px-6 py-4 max-w-xs overflow-hidden cursor-pointer">
                                        <span className="text-text-primary font-mono text-[11px] block truncate" title={group.queryText}>
                                            {group.queryText}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-text-strong">{group.count}x</td>
                                    <td className="px-6 py-4 font-black text-primary">{group.totalCredits.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-text-secondary">{group.warehouse}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => onSelectQuery(group.representative)} className="text-primary hover:underline text-xs font-bold uppercase tracking-tight">Group details</button>
                                    </td>
                                </tr>
                            ))}

                            {mode === 'Similar' && (paginatedData as any[]).map((pattern) => (
                                <tr key={pattern.id} className="group hover:bg-surface-hover transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                                            <span className="text-sm font-bold text-text-strong">{pattern.pattern}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-text-secondary">{pattern.count} executions</td>
                                    <td className="px-6 py-4 font-black text-text-strong">{pattern.totalCredits.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => setViewingPatternDetails(pattern.pattern)} className="text-primary hover:underline text-xs font-bold uppercase tracking-tight">Analyze pattern</button>
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
