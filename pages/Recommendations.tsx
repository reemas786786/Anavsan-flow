import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Recommendation, ResourceType, SeverityImpact, Account, RecommendationStatus, QueryListItem, Warehouse, User } from '../types';
import { recommendationsData as initialData, connectionsData } from '../data/dummyData';
import { IconSearch, IconDotsVertical, IconArrowUp, IconArrowDown, IconInfo, IconChevronRight, IconChevronDown, IconClose, IconChevronLeft, IconWand, IconUser, IconClock, IconClipboardCopy, IconCheck, IconDatabase } from '../constants';
import Pagination from '../components/Pagination';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import { RecommendationDetailView, SeverityBadge, StatusBadge } from '../components/RecommendationDetailView';

// --- MAIN PAGE COMPONENT ---

const Recommendations: React.FC<{ 
    accounts: Account[];
    currentUser: User | null;
    initialFilters?: { search?: string; account?: string; status?: string; selectedId?: string };
    onNavigateToQuery: (query: Partial<QueryListItem>) => void;
    onNavigateToWarehouse: (warehouse: Partial<Warehouse>) => void;
    onAssignTask?: (recommendation: Recommendation) => void;
    onOptimizeRecommendation?: (recommendation: Recommendation) => void;
    selectedRecommendation: Recommendation | null;
    onSelectRecommendation: (rec: Recommendation | null) => void;
    onPreviewQuery?: (query: Partial<QueryListItem>) => void;
    onBackToSource?: () => void;
    returnContext?: { account: Account; page: string; warehouse?: Warehouse | null } | null;
}> = ({ accounts, currentUser, initialFilters, onNavigateToQuery, onNavigateToWarehouse, onAssignTask, onOptimizeRecommendation, selectedRecommendation, onSelectRecommendation, onPreviewQuery, onBackToSource, returnContext }) => {
    const [data, setData] = useState<Recommendation[]>(initialData);
    const [search, setSearch] = useState('');
    const [isContextual, setIsContextual] = useState(false);
    const [resourceTypeFilter, setResourceTypeFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [accountFilter, setAccountFilter] = useState<string[]>([]);
    const [insightTypeFilter, setInsightTypeFilter] = useState<string[]>([]);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const [sortConfig, setSortConfig] = useState<{ key: keyof Recommendation; direction: 'ascending' | 'descending' } | null>({ key: 'timestamp', direction: 'descending' });

    useEffect(() => {
        if (initialFilters) {
            if (initialFilters.search || initialFilters.account || initialFilters.status) {
                if (initialFilters.search) setSearch(initialFilters.search);
                if (initialFilters.account) setAccountFilter([initialFilters.account]);
                if (initialFilters.status) setStatusFilter([initialFilters.status]);
                
                setIsContextual(true);
                setCurrentPage(1); 
            }

            if (initialFilters.selectedId) {
                const rec = initialData.find(r => r.id === initialFilters.selectedId);
                if (rec) {
                    onSelectRecommendation(rec);
                }
            }
        }
    }, [initialFilters, onSelectRecommendation]);

    const handleClearContext = () => {
        setSearch('');
        setAccountFilter([]);
        setInsightTypeFilter([]);
        setResourceTypeFilter([]);
        setStatusFilter([]);
        setIsContextual(false);
        setCurrentPage(1);
    };

    const filteredAndSortedData = useMemo(() => {
        let filtered = data.filter(rec => {
            const searchLower = search.toLowerCase();
            
            if (isContextual && search) {
                const matchesResource = rec.affectedResource.toLowerCase().includes(searchLower);
                const matchesAccount = rec.accountName.toLowerCase().includes(searchLower);
                if (!matchesResource && !matchesAccount) return false;
            } else if (search && !(
                rec.affectedResource.toLowerCase().includes(searchLower) ||
                rec.message.toLowerCase().includes(searchLower) ||
                rec.insightType.toLowerCase().includes(searchLower) ||
                rec.resourceType.toLowerCase().includes(searchLower) ||
                rec.accountName.toLowerCase().includes(searchLower)
            )) return false;

            if (resourceTypeFilter.length > 0 && !resourceTypeFilter.includes(rec.resourceType)) return false;
            if (statusFilter.length > 0 && !statusFilter.includes(rec.status)) return false;
            if (accountFilter.length > 0 && !accountFilter.includes(rec.accountName)) return false;
            if (insightTypeFilter.length > 0 && !insightTypeFilter.includes(rec.insightType)) return false;

            return true;
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [data, search, resourceTypeFilter, statusFilter, accountFilter, insightTypeFilter, sortConfig, isContextual]);

    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedData, currentPage, itemsPerPage]);

    const handleUpdateStatus = (id: string, status: RecommendationStatus) => {
        setData(prev => prev.map(rec => rec.id === id ? { ...rec, status } : rec));
        if (selectedRecommendation?.id === id) {
            onSelectRecommendation({ ...selectedRecommendation, status });
        }
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setCurrentPage(1);
    };

    const accountOptions = useMemo(() => connectionsData.map(a => a.name), []);
    const insightTypeOptions = useMemo(() => [...new Set(initialData.map(d => d.insightType))], []);

    const contextTagLabel = useMemo(() => {
        if (!isContextual) return null;
        if (initialFilters?.status) return `Status: ${initialFilters.status}`;
        if (initialFilters?.account) return initialFilters.account;
        if (initialFilters?.search) return initialFilters.search;
        return "Applied Filters";
    }, [isContextual, initialFilters]);

    if (selectedRecommendation) {
        return (
            <div className="p-4 pt-4 pb-12 h-full overflow-hidden">
                <RecommendationDetailView 
                    recommendation={selectedRecommendation}
                    onBack={() => onSelectRecommendation(null)}
                    onUpdateStatus={handleUpdateStatus}
                    onAssign={(rec) => onAssignTask?.(rec)}
                    onOptimize={(rec) => onOptimizeRecommendation?.(rec)}
                    onNavigateToQuery={onNavigateToQuery}
                    onNavigateToWarehouse={onNavigateToWarehouse}
                    currentUser={currentUser}
                    onBackToSource={onBackToSource}
                    returnContext={returnContext}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background gap-4 p-4 pb-12">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <div className="flex items-center gap-4">
                         <h1 className="text-[28px] font-bold text-text-strong tracking-tight">Recommendations</h1>
                         {returnContext && onBackToSource && (
                            <button 
                                onClick={onBackToSource}
                                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-border-light rounded-lg text-xs font-bold text-primary hover:bg-surface-hover transition-all shadow-sm"
                            >
                                <IconChevronLeft className="w-3.5 h-3.5" />
                                Back to {returnContext.warehouse?.name || returnContext.page}
                            </button>
                         )}
                    </div>
                    <p className="text-sm text-text-secondary font-medium mt-1">
                        Optimize your Snowflake environment with AI-powered insights tailored for performance, cost-efficiency, and operational excellence.
                    </p>
                </div>
                {isContextual && (
                    <div className="flex items-center gap-2 bg-primary/10 pl-3 pr-1 py-1 rounded-full border border-primary/20 animate-in fade-in slide-in-from-right-4 duration-300">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">CONTEXT:</span>
                        <span className="text-xs font-bold text-text-strong">{contextTagLabel}</span>
                        <button onClick={handleClearContext} className="p-1 hover:bg-primary/20 rounded-full text-primary">
                            <IconClose className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-border-light flex flex-col min-h-0">
                <div className="px-4 py-3 flex wrap items-center gap-4 text-[13px] text-text-secondary border-b border-border-light flex-shrink-0 bg-white relative z-20">
                    <div className="flex items-center gap-3">
                        <MultiSelectDropdown 
                            label="Account" 
                            options={accountOptions} 
                            selectedOptions={accountFilter} 
                            onChange={setAccountFilter} 
                            selectionMode="single"
                            layout="inline"
                        />
                        <div className="w-px h-4 bg-border-color"></div>
                        <MultiSelectDropdown 
                            label="Resource" 
                            options={['Query', 'Warehouse', 'Storage', 'Database', 'User', 'Application', 'Account']} 
                            selectedOptions={resourceTypeFilter} 
                            onChange={setResourceTypeFilter} 
                            selectionMode="single"
                            layout="inline"
                        />
                        <div className="w-px h-4 bg-border-color"></div>
                        <MultiSelectDropdown 
                            label="Type" 
                            options={insightTypeOptions} 
                            selectedOptions={insightTypeFilter} 
                            onChange={setInsightTypeFilter} 
                            selectionMode="single"
                            layout="inline"
                        />
                        <div className="w-px h-4 bg-border-color"></div>
                        <MultiSelectDropdown 
                            label="Status" 
                            options={['New', 'Read', 'In Progress', 'Pending', 'Resolved', 'Archived']} 
                            selectedOptions={statusFilter} 
                            onChange={setStatusFilter} 
                            selectionMode="single" 
                            layout="inline"
                        />
                    </div>
                    
                    <div className="relative flex-grow ml-auto max-w-xs">
                        <IconSearch className="h-4 w-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="search" 
                            value={search} 
                            onChange={e => handleSearchChange(e.target.value)} 
                            placeholder="Search..." 
                            className="w-full bg-[#F2F4F7] border-none rounded-lg py-2 pl-4 pr-10 text-[13px] font-medium focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-grow min-h-0 no-scrollbar">
                    <table className="w-full text-[13px] text-left border-separate border-spacing-0">
                        <thead className="bg-[#E0E2E5] sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 font-bold text-text-strong tracking-tight uppercase text-[11px] w-[140px]">Account</th>
                                <th className="px-6 py-4 font-bold text-text-strong tracking-tight uppercase text-[11px] w-[120px]">Resource Type</th>
                                <th className="px-6 py-4 font-bold text-text-strong tracking-tight uppercase text-[11px] w-[180px]">Resource ID</th>
                                <th className="px-6 py-4 font-bold text-text-strong tracking-tight uppercase text-[11px]">Recommendation</th>
                                <th className="px-6 py-4 font-bold text-text-strong tracking-tight uppercase text-[11px] w-[150px]">Status</th>
                                <th className="px-6 py-4 font-bold text-text-strong tracking-tight uppercase text-[11px] text-right w-[80px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {paginatedData.length > 0 ? paginatedData.map((rec) => (
                                <tr 
                                    key={rec.id} 
                                    onClick={() => onSelectRecommendation(rec)}
                                    className="hover:bg-surface-nested transition-colors cursor-pointer group border-b border-border-light"
                                >
                                    <td className="px-6 py-5 font-medium text-text-secondary whitespace-nowrap">
                                        {rec.accountName}
                                    </td>
                                    <td className="px-6 py-5 font-bold text-text-primary whitespace-nowrap">
                                        {rec.resourceType}
                                    </td>
                                    <td className="px-6 py-5 font-mono text-[12px] text-text-primary">
                                        <span className="truncate block max-w-[160px]" title={rec.affectedResource}>
                                            {rec.affectedResource}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-text-secondary">
                                        <div className="font-bold text-text-strong text-xs mb-0.5">{rec.insightType}</div>
                                        <div className="line-clamp-1">{rec.message}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusBadge status={rec.status} />
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {rec.resourceType === 'Query' && rec.metrics?.queryText && onPreviewQuery && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onPreviewQuery({
                                                            id: rec.affectedResource,
                                                            queryText: rec.metrics?.queryText,
                                                            warehouse: rec.warehouseName || 'SYSTEM',
                                                            timestamp: rec.timestamp,
                                                            severity: (rec.severity === 'High' || rec.severity === 'High Cost') ? 'High' : rec.severity === 'Medium' ? 'Medium' : 'Low',
                                                            user: rec.userName || 'System',
                                                            duration: rec.metrics?.executionTime || '0s',
                                                            bytesScanned: 0,
                                                            bytesWritten: 0,
                                                            status: 'Success',
                                                            costCredits: rec.metrics?.creditsBefore || 0,
                                                            estSavingsUSD: rec.metrics?.estimatedSavings || 0
                                                        } as any);
                                                    }}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                    title="Preview Query"
                                                >
                                                    <IconSearch className="h-5 w-5" />
                                                </button>
                                            )}
                                            <button className="p-2 text-text-muted hover:text-primary transition-colors">
                                                <IconInfo className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-surface-nested rounded-full flex items-center justify-center mb-4 border border-border-light">
                                                <IconSearch className="w-8 h-8 text-text-muted" />
                                            </div>
                                            <h3 className="text-base font-bold text-text-strong">No recommendations found</h3>
                                            <p className="text-sm text-text-secondary mt-1 max-w-sm">Try adjusting your filters or search criteria. If you've applied a context filter, clear it to see all entries.</p>
                                            {isContextual && (
                                                <button onClick={handleClearContext} className="mt-6 text-sm font-bold text-primary hover:underline underline-offset-4">
                                                    Clear context and show all
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex-shrink-0 border-t border-border-light">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredAndSortedData.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(page) => setCurrentPage(page)}
                        onItemsPerPageChange={(size) => {
                            setItemsPerPage(size);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Recommendations;