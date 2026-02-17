import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Recommendation, ResourceType, SeverityImpact, Account, RecommendationStatus, QueryListItem, Warehouse, User } from '../types';
import { recommendationsData as initialData, connectionsData } from '../data/dummyData';
import { IconSearch, IconDotsVertical, IconArrowUp, IconArrowDown, IconInfo, IconChevronRight, IconChevronDown, IconClose, IconChevronLeft, IconWand, IconUser, IconClock, IconClipboardCopy, IconCheck, IconDatabase } from '../constants';
import Pagination from '../components/Pagination';
import MultiSelectDropdown from '../components/MultiSelectDropdown';

// --- SUB-COMPONENTS ---

const SeverityBadge: React.FC<{ severity: SeverityImpact }> = ({ severity }) => {
    const colorClasses: Record<SeverityImpact, string> = {
        'High': 'bg-red-50 text-red-700 border-red-200',
        'High Cost': 'bg-red-50 text-red-700 border-red-200',
        'Medium': 'bg-amber-50 text-amber-800 border-amber-200',
        'Low': 'bg-slate-50 text-slate-700 border-slate-200',
        'Cost Saving': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Performance Boost': 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider ${colorClasses[severity] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
            {severity}
        </span>
    );
};

const StatusBadge: React.FC<{ status: RecommendationStatus }> = ({ status }) => {
    const colorClasses: Record<RecommendationStatus, string> = {
        'New': 'bg-blue-50 text-blue-700 border-blue-200',
        'Read': 'bg-slate-50 text-slate-600 border-slate-200',
        'In Progress': 'bg-amber-50 text-amber-800 border-amber-200',
        'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-300',
        'Archived': 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider ${colorClasses[status]}`}>
            {status}
        </span>
    );
};

// --- NEW FULL SCREEN DETAIL VIEW ---

interface RecommendationDetailViewProps {
    recommendation: Recommendation;
    onBack: () => void;
    onUpdateStatus: (id: string, status: RecommendationStatus) => void;
    onAssign: (rec: Recommendation) => void;
    onOptimize: (rec: Recommendation) => void;
    onNavigateToQuery: (query: Partial<QueryListItem>) => void;
    onNavigateToWarehouse: (warehouse: Partial<Warehouse>) => void;
    currentUser: User | null;
}

const RecommendationDetailView: React.FC<RecommendationDetailViewProps> = ({ 
    recommendation, 
    onBack, 
    onUpdateStatus,
    onAssign,
    onOptimize,
    onNavigateToQuery,
    onNavigateToWarehouse,
    currentUser
}) => {
    const [isCopiedOriginal, setIsCopiedOriginal] = useState(false);

    const handleCopyOriginal = () => {
        if (recommendation.metrics?.queryText) {
            navigator.clipboard.writeText(recommendation.metrics.queryText);
            setIsCopiedOriginal(true);
            setTimeout(() => setIsCopiedOriginal(false), 2000);
        }
    };

    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        });
    };

    const StatusOption: React.FC<{ status: RecommendationStatus }> = ({ status }) => (
        <button 
            onClick={() => onUpdateStatus(recommendation.id, status)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                recommendation.status === status 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'bg-white text-text-secondary border-border-color hover:border-primary hover:text-primary'
            }`}
        >
            {status}
        </button>
    );

    const DetailItem = ({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon?: any }) => (
        <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </span>
            <span className="text-sm font-black text-text-primary mt-1.5 leading-tight">{value}</span>
        </div>
    );

    const isEngineer = currentUser?.role === 'DataEngineer';

    return (
        <div className="flex flex-col h-full bg-background gap-4">
            <header className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-text-secondary border border-border-light hover:bg-surface-hover transition-all shadow-sm flex-shrink-0"
                        >
                            <IconChevronLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-text-strong tracking-tight">Recommendation Details</h1>
                            <p className="text-sm text-text-secondary mt-0.5">Ref: {recommendation.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isEngineer ? (
                            <button 
                                onClick={() => onOptimize(recommendation)}
                                className="px-8 py-2.5 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
                            >
                                <IconWand className="w-4 h-4" />
                                Optimize Now
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={() => onOptimize(recommendation)}
                                    className="px-6 py-2.5 bg-white text-primary border-2 border-primary font-bold text-sm rounded-full hover:bg-primary/5 transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <IconWand className="w-4 h-4" />
                                    Optimize
                                </button>
                                <button 
                                    onClick={() => onAssign(recommendation)}
                                    className="px-8 py-2.5 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <IconUser className="w-4 h-4" />
                                    Assign Task
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto no-scrollbar pb-12">
                <div className="lg:col-span-8 space-y-4">
                    <div className="bg-white p-4 rounded-[24px] border border-border-light shadow-sm space-y-6">
                        <div>
                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Workflow Status</h4>
                            <div className="flex flex-wrap gap-2">
                                {(['New', 'Read', 'In Progress', 'Resolved', 'Archived'] as RecommendationStatus[]).map(s => (
                                    <StatusOption key={s} status={s} />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border-light">
                             <DetailItem label="Insight Type" value={<span className="text-primary">{recommendation.insightType}</span>} />
                             <DetailItem icon={IconDatabase} label="Warehouse" value={recommendation.warehouseName || 'SYSTEM'} />
                        </div>

                        <div className="space-y-4">
                            <div className="bg-surface-nested p-4 rounded-[20px] border border-border-light">
                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Message</h4>
                                <p className="text-text-primary text-[15px] font-semibold leading-relaxed">{recommendation.message}</p>
                            </div>
                            
                            <div className="bg-primary/5 p-4 rounded-[20px] border border-primary/10">
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Suggestion</h4>
                                <p className="text-text-primary text-[15px] font-semibold leading-relaxed italic">
                                    "{recommendation.suggestion || 'Implement recommended configuration changes to improve performance and reduce cost.'}"
                                </p>
                            </div>
                        </div>

                        {recommendation.detailedExplanation && (
                            <div className="bg-[#F8FAFC] p-4 rounded-[20px] border border-border-light">
                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Detailed Explanation</h4>
                                <p className="text-text-secondary text-sm leading-relaxed">{recommendation.detailedExplanation}</p>
                            </div>
                        )}
                    </div>

                    {recommendation.metrics?.queryText && (
                        <div className="bg-white p-4 rounded-[24px] border border-border-light shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-border-light pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-surface-nested flex items-center justify-center text-text-muted">
                                        <IconSearch className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-sm font-black text-text-strong uppercase tracking-[0.2em]">Analyzed Query</h4>
                                </div>
                                <button onClick={handleCopyOriginal} className="text-[10px] font-black text-text-muted flex items-center gap-1 hover:text-primary transition-colors">
                                    {isCopiedOriginal ? <IconCheck className="w-3 h-3 text-status-success" /> : <IconClipboardCopy className="w-3 h-3" />}
                                    {isCopiedOriginal ? 'COPIED' : 'COPY ORIGINAL SQL'}
                                </button>
                            </div>
                            <div className="bg-[#0D1117] p-6 rounded-[24px] border border-white/5 shadow-2xl max-h-[500px] overflow-y-auto custom-scrollbar">
                                <pre className="text-[14px] font-mono text-gray-300 leading-relaxed whitespace-pre">
                                    <code>{recommendation.metrics.queryText}</code>
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white p-4 rounded-[24px] border border-border-light shadow-sm space-y-6">
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border-light pb-4">Metadata</h4>
                        <div className="space-y-6">
                            <DetailItem icon={IconUser} label="User" value={recommendation.userName || 'Unknown'} />
                            <DetailItem label="Account" value={recommendation.accountName} />
                            <DetailItem label="Resource Type" value={recommendation.resourceType} />
                            <DetailItem label="Severity" value={<SeverityBadge severity={recommendation.severity} />} />
                            <DetailItem icon={IconClock} label="Detected At" value={formatTimestamp(recommendation.timestamp)} />
                            <DetailItem label="Resource Identifier" value={<span className="font-mono text-xs">{recommendation.affectedResource}</span>} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

const Recommendations: React.FC<{ 
    accounts: Account[];
    currentUser: User | null;
    initialFilters?: { search?: string; account?: string };
    onNavigateToQuery: (query: Partial<QueryListItem>) => void;
    onNavigateToWarehouse: (warehouse: Partial<Warehouse>) => void;
    onAssignTask?: (recommendation: Recommendation) => void;
    onOptimizeRecommendation?: (recommendation: Recommendation) => void;
    selectedRecommendation: Recommendation | null;
    onSelectRecommendation: (rec: Recommendation | null) => void;
    onBackToSource?: () => void;
    returnContext?: { account: Account; page: string; warehouse?: Warehouse | null } | null;
}> = ({ accounts, currentUser, initialFilters, onNavigateToQuery, onNavigateToWarehouse, onAssignTask, onOptimizeRecommendation, selectedRecommendation, onSelectRecommendation, onBackToSource, returnContext }) => {
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
        if (initialFilters?.search || initialFilters?.account) {
            if (initialFilters.search) setSearch(initialFilters.search);
            if (initialFilters.account) setAccountFilter([initialFilters.account]);
            
            setIsContextual(true);
            setCurrentPage(1); 
        }
    }, [initialFilters]);

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
                            options={['New', 'Read', 'In Progress', 'Resolved', 'Archived']} 
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
                                        <button className="p-2 text-text-muted hover:text-primary transition-colors">
                                            <IconInfo className="h-5 w-5" />
                                        </button>
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