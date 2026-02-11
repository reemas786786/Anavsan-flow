
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    connectionsData, 
    recommendationsData,
    cortexModelsData,
    workloadsData,
    servicesData
} from '../data/dummyData';
import { Account, ResourceType } from '../types';
import { 
    IconSearch, 
    IconChevronDown,
    IconArrowUp,
    IconArrowDown
} from '../constants';
import Pagination from '../components/Pagination';
import InfoTooltip from '../components/InfoTooltip';

type ResourceCategory = 'Accounts' | 'Compute' | 'Storage' | 'Workloads' | 'Services' | 'Cortex' | 'User' | 'Queries';

const categories: { id: ResourceCategory; label: string }[] = [
    { id: 'Accounts', label: 'Accounts' },
    { id: 'Compute', label: 'Compute' },
    { id: 'Storage', label: 'Storage' },
    { id: 'Workloads', label: 'Workloads' },
    { id: 'Services', label: 'Services' },
    { id: 'Cortex', label: 'Cortex' },
    { id: 'User', label: 'Users' },
    { id: 'Queries', label: 'Queries' }
];

/**
 * Format numeric values to shorthand 'K' or 'M' format for credits and high volume counts.
 */
const formatK = (val: any): string => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'number') {
        if (val >= 1000000) {
            return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (val >= 1000) {
            return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return Math.round(val).toLocaleString();
    }
    return String(val);
};

interface ResourceSummaryProps {
    initialTab?: string;
    onNavigateToRecommendations?: (filters: { search?: string; account?: string }) => void;
    onSelectAccount?: (account: Account, subPage?: string, sourceTab?: string) => void;
    onSelectApplication?: (applicationName: string) => void;
}

const KPILabel: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-white px-5 py-2.5 rounded-full border border-border-light shadow-sm flex items-center gap-2 flex-shrink-0 transition-all hover:border-primary/30">
        <span className="text-[13px] text-text-secondary font-medium whitespace-nowrap">{label}:</span>
        <span className="text-[13px] font-black text-text-strong whitespace-nowrap">{value}</span>
    </div>
);

const ResourceSummary: React.FC<ResourceSummaryProps> = ({ initialTab, onNavigateToRecommendations, onSelectAccount, onSelectApplication }) => {
    const normalizedInitialTab = useMemo(() => {
        if (!initialTab) return 'Accounts';
        const found = categories.find(c => c.id === initialTab || c.label === initialTab);
        return (found?.id || 'Accounts') as ResourceCategory;
    }, [initialTab]);

    const [activeCategory, setActiveCategory] = useState<ResourceCategory>(normalizedInitialTab);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setActiveCategory(normalizedInitialTab);
    }, [normalizedInitialTab]);

    const handleAccountClickByName = (accountName: string) => {
        const account = connectionsData.find(acc => acc.name === accountName);
        if (account && onSelectAccount) {
            const subPageMap: Record<ResourceCategory, string> = {
                'Accounts': 'Account overview',
                'Compute': 'Warehouses',
                'Storage': 'Storage',
                'Workloads': 'Workloads',
                'Services': 'Services',
                'Cortex': 'Cortex',
                'User': 'Users',
                'Queries': 'All queries'
            };
            
            onSelectAccount(account, subPageMap[activeCategory], activeCategory);
        }
    };

    const getInsightCount = (accountName: string, category: ResourceCategory, resourceName?: string) => {
        const typesForCategory: Record<ResourceCategory, ResourceType[]> = {
            'Accounts': ['Account', 'All'],
            'Compute': ['Query', 'Warehouse'],
            'Storage': ['Storage', 'Database'],
            'Workloads': ['Warehouse', 'Query'],
            'Services': ['Account'],
            'Cortex': ['Query'],
            'User': ['User'],
            'Queries': ['Query']
        };
        
        const relevantTypes = typesForCategory[category] || ['All'];

        const count = recommendationsData.filter(r => {
            const matchesAccount = r.accountName.toLowerCase().includes(accountName.toLowerCase()) || 
                                   r.affectedResource.toLowerCase().includes(accountName.toLowerCase());
            const matchesResource = resourceName ? r.affectedResource.toLowerCase().includes(resourceName.toLowerCase()) : true;
            const matchesType = relevantTypes.includes(r.resourceType) || r.resourceType === 'All';
            return matchesAccount && matchesType && matchesResource;
        }).length;

        return count > 0 ? count : Math.floor(Math.random() * 5) + 2;
    };

    const tableData = useMemo(() => {
        const prepareData = (): any[] => {
            switch (activeCategory) {
                case 'Workloads':
                    return workloadsData.map(wl => ({
                        ...wl,
                        accountName: wl.account, 
                        totalRaw: wl.credits,
                        workloadsRaw: wl.workloads,
                        queriesRaw: wl.queryCount,
                        serviceCredits: wl.credits.toLocaleString(),
                        queriesFormatted: wl.queryCount.toLocaleString(),
                        insights: getInsightCount(wl.account, 'Workloads')
                    }));
                case 'Services':
                    return servicesData.map(svc => ({
                        ...svc,
                        accountName: svc.account,
                        totalRaw: svc.credits,
                        countRaw: svc.count,
                        queriesRaw: svc.queryCount,
                        serviceCredits: svc.credits.toLocaleString(),
                        queries: svc.queryCount.toLocaleString(), 
                        insights: getInsightCount(svc.account, 'Services', svc.type)
                    }));
                case 'Accounts':
                    return connectionsData.map(acc => ({
                        id: acc.id,
                        accountName: acc.name,
                        accountIdentifier: acc.identifier,
                        totalRaw: acc.tokens,
                        computeRaw: Math.round(acc.tokens * 0.82),
                        storageRaw: Math.round(acc.tokens * 0.12),
                        serviceCreditsRaw: Math.round(acc.tokens * 0.06),
                        workloadsRaw: acc.warehousesCount,
                        usersRaw: acc.usersCount,
                        queriesRaw: parseInt(acc.queriesCount.replace('K', '')) * 1000,
                        total: formatK(acc.tokens),
                        compute: formatK(Math.round(acc.tokens * 0.82)),
                        storage: formatK(Math.round(acc.tokens * 0.12)), 
                        serviceCredits: formatK(Math.round(acc.tokens * 0.06)),
                        workloads: acc.warehousesCount.toString(),
                        users: acc.usersCount.toString(),
                        queries: acc.queriesCount,
                        insights: getInsightCount(acc.name, 'Accounts')
                    }));
                case 'Compute':
                    return connectionsData.map((acc, idx) => {
                        const mockCredits = [4900, 4250, 3400, 2400, 1900, 1600, 1200, 800];
                        const computeCredits = mockCredits[idx % mockCredits.length];
                        return {
                            id: acc.id,
                            accountName: acc.name,
                            accountIdentifier: acc.identifier,
                            computeRaw: computeCredits,
                            compute: formatK(computeCredits),
                            workloadsRaw: acc.warehousesCount,
                            workloads: acc.warehousesCount.toString(),
                            queriesRaw: parseInt(acc.queriesCount.replace('K', '')) * 1000,
                            queries: acc.queriesCount,
                            insights: getInsightCount(acc.name, 'Compute')
                        };
                    });
                case 'Storage':
                    return connectionsData.map(acc => {
                        const storageCredits = Math.round(acc.tokens * 0.12);
                        const unusedGB = Math.round(acc.storageGB * (0.05 + Math.random() * 0.15));
                        return {
                            id: acc.id,
                            accountName: acc.name,
                            accountIdentifier: acc.identifier,
                            totalRaw: storageCredits,
                            storage: formatK(storageCredits), 
                            sizeRaw: acc.storageGB,
                            size: acc.storageGB >= 1000 ? `${(acc.storageGB / 1000).toFixed(1)} TB` : `${acc.storageGB} GB`,
                            unusedRaw: unusedGB,
                            unused: unusedGB >= 1000 ? `${(unusedGB / 1000).toFixed(1)} TB` : `${unusedGB} GB`,
                            insights: getInsightCount(acc.name, 'Storage')
                        };
                    });
                case 'Cortex':
                    return [
                        {
                            id: 'c-1',
                            accountName: 'Finance Prod',
                            accountIdentifier: 'acme.us-east-1',
                            count: cortexModelsData.length.toString(),
                            countRaw: cortexModelsData.length,
                            tokens: '12.4M',
                            tokensRaw: 12400000,
                            creditsRaw: 1500,
                            credits: '1.5K',
                            insights: getInsightCount('Finance Prod', 'Cortex')
                        },
                        {
                            id: 'c-2',
                            accountName: 'Account B',
                            accountIdentifier: 'acme.us-east-2',
                            count: '4',
                            countRaw: 4,
                            tokens: '8.2M',
                            tokensRaw: 8200000,
                            creditsRaw: 900,
                            credits: '0.9K',
                            insights: getInsightCount('Account B', 'Cortex')
                        },
                        {
                            id: 'c-3',
                            accountName: 'Account E',
                            accountIdentifier: 'acme.us-west-2',
                            count: '2',
                            countRaw: 2,
                            tokens: '4.1M',
                            tokensRaw: 4100000,
                            creditsRaw: 450,
                            credits: '0.4K',
                            insights: getInsightCount('Account E', 'Cortex')
                        }
                    ];
                case 'User':
                    return connectionsData.map(acc => ({
                        id: acc.id,
                        accountName: acc.name,
                        accountIdentifier: acc.identifier,
                        userCountRaw: acc.usersCount,
                        userCount: acc.usersCount.toString(),
                        queriesRaw: parseInt(acc.queriesCount.replace('K', '')) * 1000,
                        queries: acc.queriesCount,
                        insights: getInsightCount(acc.name, 'User')
                    }));
                case 'Queries':
                    return connectionsData.map(acc => ({
                        id: acc.id,
                        accountName: acc.name,
                        accountIdentifier: acc.identifier,
                        queriesCountRaw: parseInt(acc.queriesCount.replace('K', '')) * 1000,
                        queriesCount: acc.queriesCount,
                        totalRaw: acc.tokens,
                        total: formatK(acc.tokens),
                        insights: getInsightCount(acc.name, 'Queries')
                    }));
                default:
                    return [];
            }
        };

        let rows: any[] = prepareData();

        rows = rows.filter((item: any) => {
            const searchField = (item.accountName || item.modelName || '').toLowerCase();
            return searchField.includes(searchTerm.toLowerCase());
        });

        if (sortConfig) {
            rows.sort((a: any, b: any) => {
                const key = sortConfig.key.toLowerCase().split(' ')[0];
                let valA = a[key + 'Raw'] !== undefined ? a[key + 'Raw'] : a[key];
                let valB = b[key + 'Raw'] !== undefined ? b[key + 'Raw'] : b[key];
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        const headers = (() => {
            switch (activeCategory) {
                case 'Accounts': return ['Account name', 'Total credits', 'Compute credits', 'Storage credits', 'Service credits', 'Insights'];
                case 'Compute': return ['Account name', 'Compute credits', 'Warehouses', 'Queries', 'Insights'];
                case 'Storage': return ['Account name', 'Storage credits', 'Storage size', 'Unused table size', 'Insights'];
                case 'Cortex': return ['Account name', 'Model count', 'Tokens', 'Credits', 'Insights'];
                case 'User': return ['Account name', 'User count', 'Queries', 'Insights'];
                case 'Queries': return ['Account name', 'Queries count', 'Total credits', 'Insights'];
                case 'Workloads': return ['Account name', 'Workloads', 'Service credits', 'Insights'];
                case 'Services': return ['Account name', 'Service credits', 'Services used', 'Insights'];
                default: return ['Account name', 'Total credits', 'Insights'];
            }
        })();

        return { headers, rows };
    }, [activeCategory, searchTerm, sortConfig]);

    const paginatedRows = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return tableData.rows.slice(startIndex, startIndex + itemsPerPage);
    }, [tableData.rows, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(tableData.rows.length / itemsPerPage);

    const activePills = useMemo(() => {
        const rows = tableData.rows;
        
        switch (activeCategory) {
            case 'Accounts':
                return [
                    { label: 'Total accounts', value: rows.length.toString() },
                    { label: 'Total credits', value: formatK(rows.reduce((s, r) => s + (r.totalRaw || 0), 0)) },
                    { label: 'Total compute credits', value: formatK(rows.reduce((s, r) => s + (r.computeRaw || 0), 0)) },
                    { label: 'Total storage credits', value: formatK(rows.reduce((s, r) => s + (r.storageRaw || 0), 0)) },
                    { label: 'Total service credits', value: formatK(rows.reduce((s, r) => s + (r.serviceCreditsRaw || 0), 0)) }
                ];
            case 'Compute':
                return [
                    { label: 'Total compute credits', value: formatK(rows.reduce((s, r) => s + (r.computeRaw || 0), 0)) },
                    { label: 'Total warehouses', value: rows.reduce((s, r) => s + (r.workloadsRaw || 0), 0).toLocaleString() },
                    { label: 'Total queries', value: formatK(rows.reduce((s, r) => s + (r.queriesRaw || 0), 0)) }
                ];
            case 'Storage':
                const storSize = rows.reduce((s, r) => s + (r.sizeRaw || 0), 0);
                const storUnused = rows.reduce((s, r) => s + (r.unusedRaw || 0), 0);
                return [
                    { label: 'Total storage credits', value: formatK(rows.reduce((s, r) => s + (r.totalRaw || 0), 0)) },
                    { label: 'Total storage size', value: storSize >= 1000 ? `${(storSize / 1000).toFixed(1)} TB` : `${storSize} GB` },
                    { label: 'Total unused table size', value: storUnused >= 1000 ? `${(storUnused / 1000).toFixed(1)} TB` : `${storUnused} GB` }
                ];
            case 'Workloads':
                return [
                    { label: 'Total workloads', value: rows.reduce((s, r) => s + (r.workloadsRaw || 0), 0).toLocaleString() },
                    { label: 'Total service credits', value: formatK(rows.reduce((s, r) => s + (r.totalRaw || 0), 0)) }
                ];
            case 'Services':
                return [
                    { label: 'Total service credits', value: formatK(rows.reduce((s, r) => s + (r.totalRaw || 0), 0)) },
                    { label: 'Total services used', value: rows.reduce((s, r) => s + (r.countRaw || 0), 0).toLocaleString() },
                    { label: 'Total queries', value: formatK(rows.reduce((s, r) => s + (r.queriesRaw || 0), 0)) }
                ];
            case 'Cortex':
                return [
                    { label: 'Total credits', value: formatK(rows.reduce((s, r) => s + (r.creditsRaw || 0), 0)) },
                    { label: 'Total tokens', value: formatK(rows.reduce((s, r) => s + (r.tokensRaw || 0), 0)) },
                    { label: 'Total model count', value: rows.reduce((s, r) => s + (r.countRaw || 0), 0).toLocaleString() }
                ];
            case 'User':
                return [
                    { label: 'Total user count', value: rows.reduce((s, r) => s + (r.userCountRaw || 0), 0).toLocaleString() },
                    { label: 'Total queries', value: formatK(rows.reduce((s, r) => s + (r.queriesRaw || 0), 0)) }
                ];
            case 'Queries':
                return [
                    { label: 'Total queries count', value: formatK(rows.reduce((s, r) => s + (r.queriesCountRaw || 0), 0)) },
                    { label: 'Total credits', value: formatK(rows.reduce((s, r) => s + (r.totalRaw || 0), 0)) }
                ];
            default:
                return [];
        }
    }, [activeCategory, tableData.rows]);

    const getColumnWidth = (header: string) => {
        if (header.includes('name') || header.includes('type') || header.includes('Account')) return 'w-auto min-w-[180px]';
        if (header === 'Insights') return 'w-[100px]';
        return 'w-[120px]';
    };

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    return (
        <div className="flex flex-col h-full bg-background p-4 pb-12 overflow-y-auto no-scrollbar gap-4">
            <div className="flex flex-col flex-shrink-0">
                <h1 className="text-[28px] font-bold text-text-strong tracking-tight">Resource summary</h1>
                <div className="mt-4 border-b border-border-light flex items-center gap-8 overflow-x-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setCurrentPage(1); }}
                            className={`pb-4 text-sm font-semibold transition-all relative whitespace-nowrap ${
                                activeCategory === cat.id 
                                ? 'text-primary font-bold' 
                                : 'text-text-muted hover:text-text-secondary'
                            }`}
                        >
                            {cat.label}
                            {activeCategory === cat.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar flex-shrink-0">
                {activePills.map((pill, idx) => (
                    <KPILabel key={idx} label={pill.label} value={pill.value} />
                ))}
            </div>

            <div className="bg-white rounded-[12px] border border-border-light shadow-sm flex flex-col min-h-0">
                <div className="px-4 py-3 flex justify-end items-center border-b border-border-light bg-white rounded-t-[12px] relative z-20 overflow-visible flex-shrink-0">
                    <div className="relative">
                        <IconSearch className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none pr-8 placeholder:text-text-muted w-64 text-right"
                            placeholder="Search..."
                        />
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[500px] no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#F8F9FA] sticky top-0 z-10">
                            <tr>
                                {tableData.headers.map((h) => (
                                    <th 
                                        key={h} 
                                        onClick={() => h !== 'Insights' ? requestSort(h) : undefined}
                                        className={`px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light ${h !== 'Insights' ? 'cursor-pointer' : ''} select-none hover:text-primary transition-colors group ${getColumnWidth(h)} ${h === 'Insights' ? 'text-right' : ''}`}
                                    >
                                        <div className={`flex items-center gap-1 ${h === 'Insights' ? 'justify-end' : ''}`}>
                                            <span className="whitespace-nowrap">{h}</span>
                                            {h === 'Unused table size' && (
                                                <InfoTooltip text="Total size of tables that have not been queried or modified in the last 90 days." position="bottom" />
                                            )}
                                            {h !== 'Insights' && (
                                                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                                    {sortConfig?.key === h ? (
                                                        sortConfig.direction === 'asc' ? <IconArrowUp className="w-2.5 h-2.5" /> : <IconArrowDown className="w-2.5 h-2.5" />
                                                    ) : (
                                                        <IconChevronDown className="w-2.5 h-2.5 opacity-30" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-border-light">
                            {paginatedRows.map((row: any) => (
                                <tr key={row.id} className="hover:bg-surface-nested transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <button 
                                                onClick={() => handleAccountClickByName(row.accountName)}
                                                className="text-sm font-bold text-link hover:underline text-left"
                                            >
                                                {row.accountName}
                                            </button>
                                            {row.accountIdentifier && (
                                                <span className="text-[10px] text-text-muted font-mono mt-0.5">{row.accountIdentifier}</span>
                                            )}
                                        </div>
                                    </td>
                                    {tableData.headers.slice(1).map((h) => {
                                        if (h === 'Insights') {
                                            return (
                                                <td key={h} className={`px-6 py-5 text-right ${getColumnWidth(h)}`}>
                                                    <div className="flex items-center justify-end">
                                                        <button 
                                                            onClick={() => onNavigateToRecommendations?.({ search: row.accountName || row.modelName })}
                                                            className="inline-flex items-center gap-1 bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10 hover:bg-primary hover:text-white transition-all shadow-sm"
                                                        >
                                                            <span className="text-xs font-black">{row.insights}</span>
                                                            <span className="text-[9px] font-bold uppercase tracking-tighter">Insights</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            );
                                        }

                                        const valKey = (() => {
                                            if (h === 'Total credits') return 'total';
                                            if (h === 'Compute credits') return 'compute';
                                            if (h === 'Storage credits') return 'storage';
                                            if (h === 'Service credits') return 'serviceCredits';
                                            if (h === 'Workloads') return 'workloads';
                                            if (h === 'Warehouses') return 'workloads';
                                            if (h === 'Users') return 'users';
                                            if (h === 'Queries') return 'queries';
                                            
                                            if (h === 'Credits') return 'credits';
                                            if (h === 'Trend %') return 'trend';
                                            if (h === 'Volume') return 'volume';
                                            if (h === 'Unit cost') return 'unitCost';
                                            if (h === 'Idle %') return 'idleTime';
                                            if (h === 'Queries count') return 'queriesCount';
                                            if (h === 'Avg runtime') return 'avgRuntime';
                                            if (h === 'Services used') return 'count';
                                            if (h === 'Top service') return 'type';
                                            if (h === 'Model name') return 'modelName';
                                            if (h === 'Model count') return 'count';
                                            if (h === 'User count') return 'userCount';
                                            if (h === 'Storage size') return 'size';
                                            if (h === 'Unused table size') return 'unused';
                                            
                                            const keyMap: Record<string, string> = {
                                                'compute': 'compute',
                                                'storage': 'storage',
                                                'ai': 'ai',
                                                'auto': 'auto',
                                                'serverless': 'serverless',
                                                'data': 'ingest',
                                                'warehouse': 'compute',
                                                'search': 'search',
                                                'query': 'accelerate',
                                                'active': 'active',
                                                'staged': 'staged',
                                                'failsafe': 'failsafe',
                                                'hybrid': 'hybrid',
                                                'time': 'timetravel',
                                                'model': 'model'
                                            };
                                            const key = h.toLowerCase().split(' ')[0];
                                            return keyMap[key] || key;
                                        })();

                                        const val = row[valKey];
                                        
                                        return (
                                            <td key={h} className={`px-6 py-5 ${getColumnWidth(h)}`}>
                                                <span className={`text-sm font-medium ${h === 'Trend %' && val?.includes('↑') ? 'text-status-error font-bold' : h === 'Trend %' && val?.includes('↓') ? 'text-status-success font-bold' : 'text-text-primary'}`}>
                                                    {val || '—'}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex-shrink-0 bg-white border-t border-border-light">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={tableData.rows.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
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

export default ResourceSummary;
