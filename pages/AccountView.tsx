import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Account, SQLFile, BigScreenWidget, QueryListItem, PullRequest, User, QueryListFilters, SlowQueryFilters, BreadcrumbItem, Warehouse, AssignedQuery, CortexModel, AssignmentStatus } from '../types';
import AccountOverviewDashboard from './AccountOverviewDashboard';
import { accountNavItems, IconChevronRight, IconChevronDown, IconList, IconSearch, IconSparkles, IconClock, IconChevronLeft, IconTrendingUp } from '../constants';
import Breadcrumb from '../components/Breadcrumb';
import QueryListView from './QueryListView';
import StorageSummaryView from './StorageSummaryView';
import DatabasesView from './DatabasesView';
import QueryDetailView from './QueryDetailView';
import PullRequestsView from './PullRequestsView';
import PullRequestDetailView from './PullRequestDetailView';
import MyBranchesView from './Dashboard'; 
import QueryVersionsView from './QueryWorkspace'; 
import QueryAnalyzerView from './QueryAnalyzerView';
import QueryOptimizerView from './QueryOptimizerView';
import QuerySimulatorView from './QuerySimulatorView';
import SlowQueriesView from './SlowQueriesView';
import AllWarehouses from './AllWarehouses';
import WarehouseDetailView from './WarehouseDetailView';
import ContextualSidebar from '../components/ContextualSidebar';
import ApplicationsView from './ApplicationsView';
import WorkloadsListView from './WorkloadsListView';
import AccountServicesView from './AccountServicesView';
import AccountUsersListView from './AccountUsersListView';
import CreditTrendView from './CreditTrendView';
import { cortexModelsData, storageSummaryData, connectionsData, queryListData } from '../data/dummyData';

interface AccountViewProps {
    account: Account;
    accounts: Account[];
    onSwitchAccount: (account: Account) => void;
    onBackToAccounts: () => void;
    backLabel?: string;
    sqlFiles: SQLFile[];
    onSaveQueryClick: (tag: string) => void;
    onSetBigScreenWidget: (widget: BigScreenWidget) => void;
    activePage: string;
    onPageChange: (page: string) => void;
    onShareQueryClick: (query: QueryListItem) => void;
    onPreviewQuery: (query: QueryListItem) => void;
    selectedQuery: QueryListItem | null;
    setSelectedQuery: (query: QueryListItem | null) => void;
    analyzingQuery: QueryListItem | null;
    onAnalyzeQuery: (query: QueryListItem | null, source: string) => void;
    onOptimizeQuery: (query: QueryListItem | null, source: string) => void;
    onSimulateQuery: (query: QueryListItem | null, source: string) => void;
    pullRequests: PullRequest[];
    selectedPullRequest: PullRequest | null;
    setSelectedPullRequest: (pr: PullRequest | null) => void;
    users: User[];
    navigationSource: string | null;
    selectedWarehouse: Warehouse | null;
    setSelectedWarehouse: (warehouse: Warehouse | null) => void;
    warehouses: Warehouse[];
    assignment?: AssignedQuery;
    currentUser: User | null;
    onUpdateAssignmentStatus: (assignmentId: string, status: AssignmentStatus) => void;
    onAssignToEngineer: (query: QueryListItem) => void;
    onResolveAssignment: (assignmentId: string) => void;
    selectedApplicationId?: string | null;
    setSelectedApplicationId: (id: string | null) => void;
    breadcrumbItems: BreadcrumbItem[];
    onNavigateToRecommendations?: (filters: { search?: string; account?: string }) => void;
}

const KPILabel: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-white px-5 py-2.5 rounded-full border border-border-light shadow-sm flex items-center gap-2 flex-shrink-0 transition-all hover:border-primary/30">
        <span className="text-[12px] text-text-secondary font-bold whitespace-nowrap">{label}:</span>
        <span className="text-[13px] font-black text-text-strong whitespace-nowrap">{value}</span>
    </div>
);

const MobileNav: React.FC<{
    activePage: string;
    onPageChange: (page: string) => void;
    accountNavItems: any[];
}> = ({ activePage, onPageChange, accountNavItems }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={navRef} className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between text-left px-4 py-2 rounded-lg bg-surface-nested border border-border-color">
                <span className="font-semibold text-text-primary">{activePage}</span>
                <IconChevronDown className={`h-5 w-5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 w-full bg-surface rounded-lg shadow-lg mt-1 z-20 border border-border-color">
                    <ul className="py-1">
                        {accountNavItems.map(item => (
                            <React.Fragment key={item.name}>
                                {item.children.length === 0 ? (
                                    <li>
                                        <button onClick={() => { onPageChange(item.name); setIsOpen(false); }} className={`w-full text-left px-4 py-2 text-sm font-medium ${activePage === item.name ? 'text-primary bg-primary/10' : 'text-text-strong'}`}>
                                            {item.name}
                                        </button>
                                    </li>
                                ) : (
                                    <>
                                        <li className="px-4 pt-2 pb-1 text-xs font-bold uppercase text-text-muted">{item.name}</li>
                                        {item.children.map((child: any) => (
                                            <li key={child.name}>
                                                <button onClick={() => { onPageChange(child.name); setIsOpen(false); }} className={`w-full text-left pl-6 pr-4 py-2 text-sm ${activePage === child.name ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
                                                    {child.name}
                                                </button>
                                            </li>
                                        ))}
                                    </>
                                )}
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const CortexListView: React.FC<{
    onNavigateToRecommendations?: (filters: { search?: string; account?: string }) => void;
}> = ({ onNavigateToRecommendations }) => {
    const [search, setSearch] = useState('');
    
    const filteredModels = useMemo(() => {
        return cortexModelsData.filter(m => 
            m.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const globalMetrics = useMemo(() => {
        const parseTokens = (t: string): number => {
            const val = parseFloat(t.replace(/[KM]/g, ''));
            if (t.includes('M')) return val * 1000000;
            if (t.includes('K')) return val * 1000;
            return val;
        };

        const formatTokens = (n: number): string => {
            if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
            if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
            return n.toString();
        };

        const totals = filteredModels.reduce((acc, m) => {
            acc.input += parseTokens(m.inputTokens);
            acc.output += parseTokens(m.outputTokens);
            acc.total += parseTokens(m.tokens);
            acc.credits += m.credits;
            acc.insights += m.insightCount;
            return acc;
        }, { input: 0, output: 0, total: 0, credits: 0, insights: 0 });

        return {
            ...totals,
            input: formatTokens(totals.input),
            output: formatTokens(totals.output),
            total: formatTokens(totals.total),
            credits: totals.credits.toFixed(1) + 'K',
            insights: totals.insights.toString(),
            modelCount: filteredModels.length.toString()
        };
    }, [filteredModels]);

    return (
        <div className="flex flex-col h-full bg-background p-4 pb-12 gap-4">
            <div className="flex-shrink-0 mb-4">
                <h1 className="text-[28px] font-bold text-text-strong tracking-tight">Cortex models</h1>
                <p className="text-sm text-text-secondary font-medium mt-1">Manage and monitor Snowflake Cortex AI models active in this account.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar pb-1 flex-shrink-0">
                <KPILabel label="Models" value={globalMetrics.modelCount} />
                <KPILabel label="Total tokens" value={globalMetrics.total} />
                <KPILabel label="Input tokens" value={globalMetrics.input} />
                <KPILabel label="Output tokens" value={globalMetrics.output} />
                <KPILabel label="Total credits" value={globalMetrics.credits} />
                <KPILabel label="Insights" value={globalMetrics.insights} />
            </div>

            <div className="bg-white rounded-2xl flex flex-col flex-grow min-h-0 shadow-sm border border-border-light overflow-hidden">
                <div className="px-4 py-3 flex justify-end items-center border-b border-border-light bg-white flex-shrink-0">
                    <div className="relative">
                        <IconSearch className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none pr-8 placeholder:text-text-muted w-64 text-right"
                            placeholder="Search models..."
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-grow min-h-0 no-scrollbar">
                    <table className="w-full text-[13px] border-separate border-spacing-0">
                        <thead className="bg-[#F8F9FA] sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-left uppercase tracking-widest">Model name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-left uppercase tracking-widest">Input tokens</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-left uppercase tracking-widest">Output tokens</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-left uppercase tracking-widest">Token usage</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-left uppercase tracking-widest">Credits</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right uppercase tracking-widest">Insights</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-border-light">
                            {filteredModels.length > 0 ? (
                                filteredModels.map(model => (
                                    <tr key={model.id} className="hover:bg-surface-nested transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                                    <IconSparkles className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{model.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-medium text-text-secondary">{model.inputTokens}</td>
                                        <td className="px-6 py-5 font-medium text-text-secondary">{model.outputTokens}</td>
                                        <td className="px-6 py-5 font-medium text-text-primary">{model.tokens}</td>
                                        <td className="px-6 py-5 font-black text-text-strong">{model.credits}K</td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end">
                                                <button 
                                                    onClick={() => onNavigateToRecommendations?.({ search: model.name })}
                                                    className="inline-flex items-center gap-1 bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10 hover:bg-primary hover:text-white transition-all shadow-sm"
                                                >
                                                    <span className="text-xs font-black">{model.insightCount}</span>
                                                    <span className="text-[9px] font-bold uppercase">Insights</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-text-muted italic">
                                        No models found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StorageTabbedView: React.FC<{ 
    onSetBigScreenWidget: (widget: BigScreenWidget) => void;
    selectedDatabaseId: string | null;
    setSelectedDatabaseId: (id: string | null) => void;
}> = ({ onSetBigScreenWidget, selectedDatabaseId, setSelectedDatabaseId }) => {
    const [activeTab, setActiveTab] = useState<'Storage overview' | 'Databases'>('Storage overview');

    if (selectedDatabaseId) {
        return (
            <div className="p-4 bg-background h-full">
                <DatabasesView 
                    selectedDatabaseId={selectedDatabaseId} 
                    onSelectDatabase={setSelectedDatabaseId} 
                    onBackToList={() => setSelectedDatabaseId(null)} 
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="px-4 pt-4 pb-0 flex flex-col gap-4 flex-shrink-0 bg-surface border-b border-border-light mb-0">
                <div>
                    <h1 className="text-[28px] font-bold text-text-strong tracking-tight">Storage</h1>
                    <p className="text-sm text-text-secondary font-medium mt-1 mb-2">Explore and manage storage costs, table health, and database efficiency.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                    <KPILabel label="Storage credits" value={`${storageSummaryData.totalCredits.toLocaleString()} cr`} />
                    <KPILabel label="Total size" value={`${(storageSummaryData.totalStorageGB / 1000).toFixed(1)} TB`} />
                    <KPILabel label="Est. monthly cost" value={`$${storageSummaryData.totalSpend.toLocaleString()}`} />
                </div>

                <div className="flex gap-8">
                    {(['Storage overview', 'Databases'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
                                activeTab === tab 
                                ? 'text-primary' 
                                : 'text-text-muted hover:text-text-secondary'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
                            )}
                        </button>
                    ))}
                </div>
            </header>
            <main className="flex-1 p-4 pb-12 overflow-y-auto no-scrollbar">
                {activeTab === 'Storage overview' ? (
                    <StorageSummaryView 
                        onSelectDatabase={(id) => { setActiveTab('Databases'); setSelectedDatabaseId(id === '__view_all__' ? null : id); }} 
                        onSetBigScreenWidget={onSetBigScreenWidget} 
                    />
                ) : (
                    <DatabasesView 
                        selectedDatabaseId={null} 
                        onSelectDatabase={setSelectedDatabaseId} 
                        onBackToList={() => setSelectedDatabaseId(null)} 
                />
                )}
            </main>
        </div>
    );
};

const AccountView: React.FC<AccountViewProps> = ({ account, accounts, onSwitchAccount, onBackToAccounts, backLabel, sqlFiles, onSaveQueryClick, onSetBigScreenWidget, activePage, onPageChange, onShareQueryClick, onPreviewQuery, selectedQuery, setSelectedQuery, analyzingQuery, onAnalyzeQuery, onOptimizeQuery, onSimulateQuery, pullRequests, selectedPullRequest, setSelectedPullRequest, users, navigationSource, selectedWarehouse, setSelectedWarehouse, warehouses, assignment, currentUser, onUpdateAssignmentStatus, onAssignToEngineer, onResolveAssignment, selectedApplicationId, setSelectedApplicationId, breadcrumbItems, onNavigateToRecommendations }) => {
    const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(null);
    
    // State for All Queries filters
    const [allQueriesFilters, setAllQueriesFilters] = useState<QueryListFilters>({
        search: '',
        dateFilter: '7d',
        userFilter: [],
        statusFilter: [],
        warehouseFilter: [],
        queryTypeFilter: [],
        durationFilter: { min: null, max: null },
        currentPage: 1,
        itemsPerPage: 10,
        visibleColumns: ['queryId', 'user', 'warehouse', 'duration', 'bytesScanned', 'cost', 'startTime', 'actions'],
    });

    // State for Slow Queries filters
    const [slowQueriesFilters, setSlowQueriesFilters] = useState<SlowQueryFilters>({
        search: '',
        dateFilter: '7d',
        warehouseFilter: [],
        severityFilter: ['Medium', 'High'],
    });

    // Generate account-specific warehouses
    const generatedAccountWarehouses = useMemo(() => {
        const count = account.warehousesCount;
        const accountIdx = connectionsData.findIndex(c => c.id === account.id);
        const mockCredits = [4900, 4250, 3400, 2400, 1900, 1600, 1200, 800];
        const totalCreditsForAccount = mockCredits[accountIdx % mockCredits.length] || 1000;
        
        const generated: Warehouse[] = [];
        for (let i = 0; i < count; i++) {
            const share = 1 / count;
            const whCredits = Math.round(totalCreditsForAccount * (share * (0.8 + Math.random() * 0.4)));
            const sizes: Warehouse['size'][] = ['X-Small', 'Small', 'Medium', 'Large'];
            generated.push({
                id: `wh-${account.id}-${i}`,
                name: i === 0 ? 'COMPUTE_WH' : i === 1 ? 'ETL_WH' : `WH_CLUSTER_${i + 1}`,
                size: sizes[i % sizes.length],
                avgUtilization: Math.floor(Math.random() * 60) + 20,
                peakUtilization: Math.floor(Math.random() * 30) + 70,
                status: Math.random() > 0.3 ? 'Active' : 'Suspended',
                cost: whCredits * 2.5,
                tokens: whCredits,
                credits: whCredits,
                queriesExecuted: Math.floor(Math.random() * 1000) + 100,
                lastActive: 'Just now',
                health: Math.random() > 0.7 ? 'Optimized' : Math.random() > 0.5 ? 'Under-utilized' : 'Over-provisioned'
            });
        }
        return generated;
    }, [account]);

    const handleBackFromTool = () => {
        onPageChange(navigationSource || 'Queries');
        onAnalyzeQuery(null, ''); 
    };

    const handleSidebarPageChange = (newPage: string) => {
        if (selectedApplicationId) {
            setSelectedApplicationId(null);
        }
        setSelectedWarehouse(null);
        setSelectedQuery(null);
        setSelectedPullRequest(null);
        setSelectedDatabaseId(null);
        onPageChange(newPage);
    };

    const isDatabaseDetailView = !!selectedDatabaseId;
    const isDeepDrillDown = !!selectedWarehouse || !!selectedQuery || !!selectedPullRequest || isDatabaseDetailView;
    
    const renderContent = () => {
        if (selectedWarehouse) {
            return <WarehouseDetailView 
                warehouse={selectedWarehouse} 
                onBack={() => setSelectedWarehouse(null)} 
                warehouses={generatedAccountWarehouses}
                onSelectWarehouse={setSelectedWarehouse}
                onNavigateToRecommendations={onNavigateToRecommendations}
            />;
        }
        if (selectedPullRequest) {
            return <PullRequestDetailView pullRequest={selectedPullRequest} onBack={() => setSelectedPullRequest(null)} users={users} />;
        }
        if (selectedQuery) {
            return <QueryDetailView 
                query={queryListData.find(q => q.id === selectedQuery.id) || selectedQuery} 
                onBack={() => setSelectedQuery(null)} 
                onAnalyzeQuery={onAnalyzeQuery}
                onOptimizeQuery={onOptimizeQuery}
                onSimulateQuery={onSimulateQuery}
                sourcePage={activePage}
                assignment={assignment}
                currentUser={currentUser}
                /* Fix: Change handleUpdateAssignmentStatus to onUpdateAssignmentStatus to correctly use the prop */
                onUpdateAssignmentStatus={onUpdateAssignmentStatus}
                onAssignToEngineer={onAssignToEngineer}
                onResolveAssignment={onResolveAssignment}
            />;
        }

        switch (activePage) {
            case 'Account overview':
                return <AccountOverviewDashboard 
                    account={account} 
                    onNavigate={onPageChange} 
                    onSelectWarehouse={setSelectedWarehouse}
                    onSelectQuery={setSelectedQuery}
                />;
            case 'Credit trend':
                return <CreditTrendView account={account} />;
            case 'Applications':
                return <ApplicationsView 
                    selectedAppId={selectedApplicationId} 
                    onSelectApp={setSelectedApplicationId} 
                    onNavigateToRecommendations={onNavigateToRecommendations} 
                />;
            case 'Warehouses':
                return <AllWarehouses 
                    warehouses={generatedAccountWarehouses} 
                    onSelectWarehouse={setSelectedWarehouse} 
                    onNavigateToRecommendations={onNavigateToRecommendations} 
                />;
            case 'Queries':
                return <QueryListView 
                    onShareQueryClick={onShareQueryClick} 
                    onSelectQuery={setSelectedQuery} 
                    onAnalyzeQuery={(q) => onAnalyzeQuery(q, 'Queries')} 
                    onOptimizeQuery={(q) => onOptimizeQuery(q, 'Queries')} 
                    onSimulateQuery={(q) => onSimulateQuery(q, 'Queries')} 
                    filters={allQueriesFilters} 
                    setFilters={setAllQueriesFilters} 
                />;
            case 'Slow queries':
                return <SlowQueriesView 
                    onAnalyzeQuery={(q) => onAnalyzeQuery(q, 'Slow queries')} 
                    onOptimizeQuery={(q) => onOptimizeQuery(q, 'Slow queries')} 
                    onSimulateQuery={(q) => onSimulateQuery(q, 'Slow queries')} 
                    onPreviewQuery={onPreviewQuery} 
                    filters={slowQueriesFilters} 
                    setFilters={setAllQueriesFilters as any} 
                />;
            case 'Query analyzer':
                return <QueryAnalyzerView 
                    query={analyzingQuery} 
                    onBack={handleBackFromTool} 
                    onSaveClick={onSaveQueryClick} 
                    onBrowseQueries={() => handleSidebarPageChange('Queries')} 
                    onOptimizeQuery={(q) => onOptimizeQuery(q, activePage)} 
                />;
            case 'Query optimizer':
                return <QueryOptimizerView 
                    query={analyzingQuery} 
                    onBack={handleBackFromTool} 
                    onSaveClick={onSaveQueryClick} 
                    onSimulateQuery={(q) => onSimulateQuery(q, activePage)} 
                />;
            case 'Query simulator':
                return <QuerySimulatorView 
                    query={analyzingQuery} 
                    onBack={handleBackFromTool} 
                    onSaveClick={onSaveQueryClick} 
                />;
            case 'Storage':
                return (
                    <StorageTabbedView 
                        onSetBigScreenWidget={onSetBigScreenWidget} 
                        selectedDatabaseId={selectedDatabaseId}
                        setSelectedDatabaseId={setSelectedDatabaseId}
                    />
                );
            case 'Workloads':
                return <WorkloadsListView accountName={account.name} onNavigateToRecommendations={onNavigateToRecommendations} />;
            case 'Services':
                return <AccountServicesView accountName={account.name} onNavigateToRecommendations={onNavigateToRecommendations} />;
            case 'Users':
                return <AccountUsersListView accountName={account.name} onNavigateToRecommendations={onNavigateToRecommendations} />;
            case 'Cortex':
                return <CortexListView onNavigateToRecommendations={onNavigateToRecommendations} />;
            default:
                return <AccountOverviewDashboard 
                    account={account} 
                    onNavigate={onPageChange} 
                    onSelectWarehouse={setSelectedWarehouse}
                    onSelectQuery={setSelectedQuery}
                />;
        }
    };

    const isListView = ['Queries', 'Slow queries', 'Similar query patterns', 'Query analyzer', 'Query optimizer', 'Query simulator', 'Warehouses', 'Applications', 'Cortex', 'Storage', 'Workloads', 'Services', 'Users', 'Credit trend'].includes(activePage);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            <div className="flex flex-1 overflow-hidden">
                <ContextualSidebar 
                    account={account} 
                    accounts={accounts} 
                    onSwitchAccount={onSwitchAccount} 
                    activePage={activePage} 
                    onPageChange={handleSidebarPageChange} 
                    onBackToAccounts={onBackToAccounts} 
                    backLabel={backLabel}
                    selectedApplicationId={selectedApplicationId}
                    isDeepDrillDown={isDeepDrillDown}
                />
                <main className="flex-1 flex flex-col overflow-hidden relative">
                    <div className="bg-surface shadow-sm flex-shrink-0 z-10 border-b border-border-light">
                        <div className="h-[42px] px-4 flex items-center">
                            <Breadcrumb items={breadcrumbItems} />
                        </div>
                    </div>
                    
                    {/* Explicitly hide horizontal scroll to meet the user's request */}
                    <div className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar ${isDeepDrillDown || activePage === 'Storage' ? '' : (isListView && !selectedWarehouse ? "" : "p-4 pb-12")}`}>
                        <div className="lg:hidden p-4 pb-0">
                             <MobileNav activePage={activePage} onPageChange={handleSidebarPageChange} accountNavItems={accountNavItems} />
                        </div>
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AccountView;