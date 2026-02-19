
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Account, TopQuery, Warehouse, QueryListItem } from '../types';
import { accountSpend, topQueriesData, accountCostBreakdown, warehousesData, spendTrendsData, storageGrowthData, queryListData } from '../data/dummyData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, AreaChart, Area, CartesianGrid } from 'recharts';
import { IconDotsVertical, IconInfo, IconList } from '../constants';
import SidePanel from '../components/SidePanel';
import TableView from '../components/TableView';
import InfoTooltip from '../components/InfoTooltip';

// --- SHARED SUB-COMPONENTS ---

const SummaryMetricCard: React.FC<{ 
    label: string; 
    value: string; 
    subValue?: string; 
    onClick?: () => void 
}> = ({ label, value, subValue, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-surface-nested p-4 rounded-[16px] border border-border-light flex flex-col h-[90px] text-left hover:border-primary/40 hover:bg-surface-hover transition-all group shadow-sm w-full"
    >
        <p className="text-[10px] font-bold text-[#9A9AB2] group-hover:text-primary transition-colors uppercase tracking-widest">{label}</p>
        <div className="mt-auto">
            <p className="text-[18px] font-black text-[#161616] tracking-tight leading-none">{value}</p>
            {subValue && <p className="text-[10px] font-bold text-[#5A5A72] mt-1 tracking-tight">{subValue}</p>}
        </div>
    </button>
);

const WidgetCard: React.FC<{ 
    children: React.ReactNode, 
    title: string, 
    hasMenu?: boolean, 
    infoText?: string, 
    headerActions?: React.ReactNode,
    onTableView?: () => void
}> = ({ children, title, hasMenu = true, infoText, headerActions, onTableView }) => (
    <div className="bg-surface p-6 rounded-[24px] shadow-sm flex flex-col border border-border-light h-full min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-1.5">
                <h4 className="text-[14px] font-bold text-text-strong tracking-tight">{title}</h4>
                {infoText && <InfoTooltip text={infoText} />}
            </div>
            <div className="flex items-center gap-2">
                {headerActions}
                {onTableView && (
                    <button 
                        onClick={onTableView}
                        className="text-text-muted hover:text-primary transition-colors p-1"
                        title="View as table"
                    >
                        <IconList className="h-4 w-4" />
                    </button>
                )}
                {hasMenu && (
                    <button className="text-text-muted hover:text-text-primary transition-colors p-1">
                        <IconDotsVertical className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
        <div className="flex-grow">
            {children}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        return (
            <div className="bg-surface p-2 rounded-lg shadow-lg border border-border-color">
                <p className="font-mono text-xs mb-1 max-w-xs break-words">{label}</p>
                <div className="text-sm text-primary flex items-baseline">
                    <span className="font-semibold text-text-secondary mr-2">Usage:</span>
                    <span className="font-semibold text-text-primary">{value.toLocaleString()} credits</span>
                </div>
            </div>
        );
    }
    return null;
};

const SpendTrendsCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-surface p-3 rounded-lg shadow-xl border border-border-color min-w-[180px]">
                <p className="text-sm font-semibold text-text-strong mb-2 border-b border-border-light pb-1">{label}</p>
                <div className="space-y-1.5 mb-2">
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-xs text-text-secondary">Warehouse:</span>
                        <span className="text-xs font-bold text-text-primary">{data.warehouse.toLocaleString()} cr</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-xs text-text-secondary">Storage:</span>
                        <span className="text-xs font-bold text-text-primary">{data.storage.toLocaleString()} cr</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-xs text-text-secondary">Cloud Service:</span>
                        <span className="text-xs font-bold text-text-primary">{(data.cloud || 0).toLocaleString()} cr</span>
                    </div>
                </div>
                <div className="flex justify-between items-center border-t border-border-light pt-2 mt-2">
                    <span className="text-xs font-black text-text-muted uppercase tracking-tighter">Total Credits</span>
                    <span className="text-sm font-black text-primary">{data.total.toLocaleString()} cr</span>
                </div>
            </div>
        );
    }
    return null;
};

const formatK = (val: number): string => {
    if (val >= 1000) return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return Math.round(val).toLocaleString();
};

// --- MAIN COMPONENT ---

interface AccountOverviewDashboardProps {
    account: Account;
    onNavigate: (page: string) => void;
    onSelectWarehouse: (warehouse: Warehouse) => void;
    onSelectQuery: (query: QueryListItem) => void;
}

const AccountOverviewDashboard: React.FC<AccountOverviewDashboardProps> = ({ account, onNavigate, onSelectWarehouse, onSelectQuery }) => {
    const [tableViewData, setTableViewData] = useState<{
        title: string;
        data: { name: string; cost: number; credits: number; percentage: number }[];
    } | null>(null);

    // Mock data expansion for charts to ensure 10 items
    const expandedQueries = useMemo(() => {
        const base = [...topQueriesData];
        const mocked = [
            { id: 'q-2', queryText: 'INSERT INTO ANALYTICS_DB.PUBLIC.WEB_LOGS...', tokens: 3.2, cost: 8.5, user: 'mike_de', duration: '01:45', severity: 'Medium', status: 'Success', warehouse: 'COMPUTE_WH', timestamp: '2023-11-20T10:00:00Z', costCredits: 3.2, bytesScanned: 100000, bytesWritten: 0 },
            { id: 'q-3', queryText: 'SELECT COUNT(*) FROM RAW_DATA.STRIPE...', tokens: 2.8, cost: 7.2, user: 'jane_doe', duration: '00:30', severity: 'Medium', status: 'Success', warehouse: 'COMPUTE_WH', timestamp: '2023-11-20T10:00:00Z', costCredits: 2.8, bytesScanned: 100000, bytesWritten: 0 },
            { id: 'q-4', queryText: 'UPDATE FINANCE_STG.TRANS.CURRENCY_MAP...', tokens: 2.1, cost: 5.4, user: 'system_etl', duration: '05:12', severity: 'Medium', status: 'Success', warehouse: 'COMPUTE_WH', timestamp: '2023-11-20T10:00:00Z', costCredits: 2.1, bytesScanned: 100000, bytesWritten: 0 },
            { id: 'q-5', queryText: 'DELETE FROM TEMP_WORKSPACE.ARCHIVE...', tokens: 1.8, cost: 4.1, user: 'alex_analyst', duration: '02:00', severity: 'Medium', status: 'Success', warehouse: 'COMPUTE_WH', timestamp: '2023-11-20T10:00:00Z', costCredits: 1.8, bytesScanned: 100000, bytesWritten: 0 },
            { id: 'q-6', queryText: 'SELECT * FROM FACT_INVENTORY...', tokens: 1.5, cost: 3.8, user: 'mike_de', duration: '00:50', severity: 'Medium', status: 'Success', warehouse: 'COMPUTE_WH', timestamp: '2023-11-20T10:00:00Z', costCredits: 1.5, bytesScanned: 100000, bytesWritten: 0 },
            { id: 'q-7', queryText: 'MERGE INTO CORE.SESSIONS...', tokens: 1.2, cost: 3.1, user: 'jane_doe', duration: '10:15', severity: 'Medium', status: 'Success', warehouse: 'COMPUTE_WH', timestamp: '2023-11-20T10:00:00Z', costCredits: 1.2, bytesScanned: 100000, bytesWritten: 0 },
            { id: 'q-8', queryText: 'SELECT SUM(PRICE) FROM ORDERS...', tokens: 0.9, cost: 2.2, user: 'system_etl', duration: '00:15', severity: 'Medium', status: 'Success', warehouse: 'COMPUTE_WH', timestamp: '2023-11-20T10:00:00Z', costCredits: 0.9, bytesScanned: 100000, bytesWritten: 0 },
            { id: 'q-9', queryText: 'WITH RECURSIVE CATEGORY_TREE...', tokens: 0.7, cost: 1.8, user: 'alex_analyst', duration: '01:20', severity: 'Medium', status: 'Success', warehouse: 'COMPUTE_WH', timestamp: '2023-11-20T10:00:00Z', costCredits: 0.7, bytesScanned: 100000, bytesWritten: 0 },
            { id: 'q-10', queryText: 'CREATE TABLE BACKUP_USERS_OCT...', tokens: 0.5, cost: 1.2, user: 'system_etl', duration: '00:05', severity: 'Medium', status: 'Success', warehouse: 'COMPUTE_WH', timestamp: '2023-11-20T10:00:00Z', costCredits: 0.5, bytesScanned: 100000, bytesWritten: 0 },
        ];
        return [...base, ...mocked].sort((a,b) => b.tokens - a.tokens).slice(0, 10);
    }, []);

    const expandedWarehouses = useMemo(() => {
        const base = [...warehousesData];
        const mocked = [
            { id: 'wh-2', name: 'ETL_WH', tokens: 1400, credits: 1400, size: 'Small', status: 'Active', avgUtilization: 30, peakUtilization: 60, cost: 3500, queriesExecuted: 500, lastActive: '5 mins ago', health: 'Optimized' },
            { id: 'wh-3', name: 'TRANSFORM_WH', tokens: 950, credits: 950, size: 'Small', status: 'Idle', avgUtilization: 20, peakUtilization: 45, cost: 2300, queriesExecuted: 300, lastActive: '10 mins ago', health: 'Optimized' },
            { id: 'wh-4', name: 'BI_REPORTING_WH', tokens: 820, credits: 820, size: 'Medium', status: 'Active', avgUtilization: 55, peakUtilization: 90, cost: 2000, queriesExecuted: 1200, lastActive: 'Just now', health: 'Optimized' },
            { id: 'wh-5', name: 'AD_HOC_WH', tokens: 610, credits: 610, size: 'X-Small', status: 'Suspended', avgUtilization: 10, peakUtilization: 25, cost: 1500, queriesExecuted: 150, lastActive: '2 hours ago', health: 'Under-utilized' },
            { id: 'wh-6', name: 'SANDBOX_WH', tokens: 420, credits: 420, size: 'X-Small', status: 'Suspended', avgUtilization: 5, peakUtilization: 15, cost: 1000, queriesExecuted: 80, lastActive: '1 day ago', health: 'Under-utilized' },
            { id: 'wh-7', name: 'DE_TOOLS_WH', tokens: 380, credits: 380, size: 'Small', status: 'Idle', avgUtilization: 15, peakUtilization: 35, cost: 950, queriesExecuted: 200, lastActive: '1 hour ago', health: 'Optimized' },
            { id: 'wh-8', name: 'MARKETING_WH', tokens: 210, credits: 210, size: 'X-Small', status: 'Suspended', avgUtilization: 8, peakUtilization: 20, cost: 500, queriesExecuted: 110, lastActive: '4 hours ago', health: 'Under-utilized' },
            { id: 'wh-9', name: 'FINANCE_WH', tokens: 150, credits: 150, size: 'X-Small', status: 'Active', avgUtilization: 40, peakUtilization: 75, cost: 380, queriesExecuted: 450, lastActive: 'Just now', health: 'Optimized' },
            { id: 'wh-10', name: 'LEGAL_WH', tokens: 45, credits: 45, size: 'X-Small', status: 'Suspended', avgUtilization: 2, peakUtilization: 5, cost: 110, queriesExecuted: 20, lastActive: '3 days ago', health: 'Under-utilized' },
        ];
        return [...base, ...mocked].sort((a, b) => b.tokens - a.tokens).slice(0, 10);
    }, []);

    const handleWarehouseClick = (data: any) => {
        if (data && data.payload) {
            onSelectWarehouse(data.payload as Warehouse);
        }
    };

    const handleQueryClick = (data: any) => {
        if (data && data.payload) {
            const tq = data.payload as TopQuery;
            const fullQuery = queryListData.find(q => q.id === tq.id) || {
                id: tq.id,
                queryText: tq.queryText,
                user: tq.user,
                duration: tq.duration,
                costCredits: tq.tokens,
                costUSD: tq.cost,
                status: 'Success',
                warehouse: 'COMPUTE_WH',
                timestamp: new Date().toISOString(),
                bytesScanned: 0,
                bytesWritten: 0,
                severity: 'Medium'
            } as QueryListItem;
            onSelectQuery(fullQuery);
        }
    };

    return (
        <div className="space-y-8 pb-16">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-[28px] font-bold text-text-strong tracking-tight">{account.name}</h1>
                    <p className="text-sm text-text-secondary font-medium mt-1">Snapshot of this account's Snowflake resource consumption.</p>
                </div>
            </div>

            {/* AI Data Cloud Style Resource Summary Grid */}
            <div className="bg-white rounded-[24px] border border-border-light shadow-sm p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[14px] font-bold text-text-primary tracking-tight">Resource summary</h2>
                        <IconInfo className="w-4 h-4 text-[#9A9AB2]" />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                    <SummaryMetricCard 
                        label="Account" 
                        value="1" 
                        subValue={`${formatK(account.tokens)} Credits`}
                        onClick={() => onNavigate('Credit trend')} 
                    />
                    <SummaryMetricCard 
                        label="Compute" 
                        value={formatK(account.tokens * 0.82)} 
                        subValue="Credits" 
                        onClick={() => onNavigate('Warehouses')} 
                    />
                    <SummaryMetricCard 
                        label="Storage" 
                        value={account.storageGB >= 1000 ? `${(account.storageGB / 1000).toFixed(1)} TB` : `${account.storageGB} GB`} 
                        subValue={`${formatK(account.tokens * 0.12)} Credits`}
                        onClick={() => onNavigate('Storage')} 
                    />
                    <SummaryMetricCard 
                        label="Workloads" 
                        value={account.warehousesCount.toString()} 
                        subValue="Active Clusters"
                        onClick={() => onNavigate('Workloads')} 
                    />
                    <SummaryMetricCard 
                        label="Services" 
                        value="7" 
                        subValue={`${formatK(account.tokens * 0.06)} Credits`}
                        onClick={() => onNavigate('Services')} 
                    />
                    <SummaryMetricCard 
                        label="Cortex" 
                        value={formatK(account.tokens * 0.02)} 
                        subValue="Credits"
                        onClick={() => onNavigate('Cortex')} 
                    />
                    <SummaryMetricCard 
                        label="Users" 
                        value={account.usersCount.toString()} 
                        onClick={() => onNavigate('Users')} 
                    />
                    <SummaryMetricCard 
                        label="High-impact queries" 
                        value={account.queriesCount} 
                        onClick={() => onNavigate('High-impact queries')} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Top Warehouses Bar Chart - Click handler moved to Bar for reliable detail drill-down */}
                <div className="lg:col-span-12">
                    <WidgetCard title="Top warehouses by credits" infoText="Resource-intensive warehouses ranked by credit usage." headerActions={<button onClick={() => onNavigate('Warehouses')} className="text-[11px] font-bold text-link hover:underline">View all</button>}>
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    layout="vertical" 
                                    data={expandedWarehouses} 
                                    margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2DDEB" opacity={0.5} />
                                    <XAxis type="number" stroke="#9A9AB2" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="name" stroke="#5A5A72" tickLine={false} axisLine={false} interval={0} width={120} tick={{ fill: '#5A5A72', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip cursor={{ fill: 'rgba(105, 50, 213, 0.05)' }} content={<CustomTooltip />} />
                                    <Bar 
                                        dataKey="tokens" 
                                        fill="#6932D5" 
                                        barSize={14} 
                                        radius={[0, 4, 4, 0]} 
                                        onClick={handleWarehouseClick}
                                        className="cursor-pointer"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </WidgetCard>
                </div>

                {/* 2. Top Queries Bar Chart - Click handler moved to Bar for reliable detail drill-down */}
                <div className="lg:col-span-12">
                    <WidgetCard title="Top queries by credits" infoText="Queries in this account consuming the highest amount of credits." headerActions={<button onClick={() => onNavigate('High-impact queries')} className="text-[11px] font-bold text-link hover:underline">View all</button>}>
                        <div className="h-[380px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    layout="vertical" 
                                    data={expandedQueries} 
                                    margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2DDEB" opacity={0.5} />
                                    <XAxis type="number" stroke="#9A9AB2" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="queryText" stroke="#5A5A72" tickLine={false} axisLine={false} interval={0} width={150} tick={{ fill: '#5A5A72', fontSize: 10, fontWeight: 700 }} tickFormatter={(val) => val.length > 30 ? `${val.substring(0, 27)}...` : val} />
                                    <Tooltip cursor={{ fill: 'rgba(105, 50, 213, 0.05)' }} content={<CustomTooltip />} />
                                    <Bar 
                                        dataKey="tokens" 
                                        fill="#6932D5" 
                                        barSize={16} 
                                        radius={[0, 4, 4, 0]} 
                                        onClick={handleQueryClick}
                                        className="cursor-pointer"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </WidgetCard>
                </div>

                {/* 3. Spend Trends Area Chart */}
                <div className="lg:col-span-6">
                    <WidgetCard title="Spend trends" infoText="Daily credit consumption pattern across compute and storage." headerActions={<button onClick={() => onNavigate('Credit trend')} className="text-[11px] font-bold text-link hover:underline">View analysis</button>}>
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={spendTrendsData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorSpendTrendAcc" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6932D5" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#6932D5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2DDEB" opacity={0.5} />
                                    <XAxis dataKey="date" stroke="#9A9AB2" fontSize={10} axisLine={false} tickLine={false} tick={{fontWeight: 700}} />
                                    <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fontWeight: 700}} />
                                    <Tooltip content={<SpendTrendsCustomTooltip />} cursor={{ stroke: '#6932D5', strokeWidth: 2, strokeDasharray: '4 4' }} />
                                    {/* High visibility line with increased strokeWidth */}
                                    <Area type="monotone" dataKey="total" name="Total Credits" stroke="#6932D5" strokeWidth={4} fillOpacity={1} fill="url(#colorSpendTrendAcc)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </WidgetCard>
                </div>

                {/* 4. Storage Growth Trend Area Chart */}
                <div className="lg:col-span-6">
                    <WidgetCard title="Storage growth trend" infoText="Data volume expansion in GB/TB over time." headerActions={<button onClick={() => onNavigate('Storage')} className="text-[11px] font-bold text-link hover:underline">Explore storage</button>}>
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={storageGrowthData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorStorageGrowthAcc" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2DDEB" opacity={0.5} />
                                    <XAxis dataKey="date" stroke="#9A9AB2" fontSize={10} axisLine={false} tickLine={false} tick={{fontWeight: 700}} />
                                    <YAxis stroke="#9A9AB2" fontSize={10} axisLine={false} tickLine={false} tick={{fontWeight: 700}} />
                                    {/* Fix: changed 'shadow' to 'boxShadow' */}
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="Active Storage (GB)" stroke="#A78BFA" strokeWidth={4} fillOpacity={1} fill="url(#colorStorageGrowthAcc)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </WidgetCard>
                </div>
            </div>

            <SidePanel isOpen={!!tableViewData} onClose={() => setTableViewData(null)} title="Table View">
                {tableViewData && <TableView title={tableViewData.title} data={tableViewData.data} />}
            </SidePanel>
        </div>
    );
};

export default AccountOverviewDashboard;
