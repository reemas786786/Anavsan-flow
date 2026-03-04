
import React, { useState, useMemo } from 'react';
import { queryListData } from '../data/dummyData';
import { QueryListItem } from '../types';
import SingleSelectDropdown from '../components/SingleSelectDropdown';
import DateRangeDropdown from '../components/DateRangeDropdown';
import QueryDetailDrawer from '../components/QueryDetailDrawer';
import ColumnSelector from '../components/ColumnSelector';
import { 
    IconSearch, 
    IconChevronDown, 
    IconChevronLeft, 
    IconChevronRight, 
    IconDatabase, 
    IconUser, 
    IconClock, 
    IconTrendingUp,
    IconBolt,
    IconCalendar,
    IconAdjustments
} from '../constants';

interface ExpensiveQueriesViewProps {
    onSelectQuery: (query: QueryListItem) => void;
}

const KPILabel: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-white px-5 py-2.5 rounded-full border border-border-light shadow-sm flex items-center gap-2 flex-shrink-0 transition-all hover:border-primary/30">
        <span className="text-[13px] text-text-secondary font-medium whitespace-nowrap">{label}:</span>
        <span className="text-[13px] font-black text-text-strong whitespace-nowrap">{value}</span>
    </div>
);

const ExpensiveQueriesView: React.FC<ExpensiveQueriesViewProps> = ({ onSelectQuery }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('Last 7 days');
    const [warehouseFilter, setWarehouseFilter] = useState('All');
    const [userFilter, setUserFilter] = useState('All');
    const [visibleColumns, setVisibleColumns] = useState(['queryId', 'warehouse', 'user', 'totalCredits', 'computeCredits', 'qasCredits', 'duration', 'startTime', 'endTime']);
    const [minCredits, setMinCredits] = useState(0);
    const [limit, setLimit] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedQueryForDrawer, setSelectedQueryForDrawer] = useState<QueryListItem | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const itemsPerPage = 15;

    const warehouses = useMemo(() => Array.from(new Set(queryListData.map(q => q.warehouse))), []);
    const users = useMemo(() => Array.from(new Set(queryListData.map(q => q.user))), []);

    const warehouseOptions = useMemo(() => [
        { value: 'All', label: 'All Warehouses' },
        ...warehouses.map(w => ({ value: w, label: w }))
    ], [warehouses]);

    const userOptions = useMemo(() => [
        { value: 'All', label: 'All Users' },
        ...users.map(u => ({ value: u, label: u }))
    ], [users]);

    const limitOptions = [
        { value: '10', label: 'Top 10' },
        { value: '25', label: 'Top 25' },
        { value: '50', label: 'Top 50' },
        { value: '100', label: 'Top 100' },
    ];

    const allColumns = [
        { key: 'queryId', label: 'Query ID' },
        { key: 'warehouse', label: 'Warehouse' },
        { key: 'user', label: 'User' },
        { key: 'totalCredits', label: 'Total Credits' },
        { key: 'computeCredits', label: 'Compute Credits' },
        { key: 'qasCredits', label: 'QAS Credits' },
        { key: 'duration', label: 'Duration' },
        { key: 'startTime', label: 'Start Time' },
        { key: 'endTime', label: 'End Time' },
    ];

    const filteredData = useMemo(() => {
        return [...queryListData]
            .filter(q => {
                const matchesSearch = q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    q.queryText.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesWarehouse = warehouseFilter === 'All' || q.warehouse === warehouseFilter;
                const matchesUser = userFilter === 'All' || q.user === userFilter;
                const matchesMinCredits = q.costCredits >= minCredits;
                const matchesNonZero = q.costCredits > 0; // Edge case: exclude zero compute credits

                return matchesSearch && matchesWarehouse && matchesUser && matchesMinCredits && matchesNonZero;
            })
            .sort((a, b) => b.costCredits - a.costCredits);
    }, [searchTerm, warehouseFilter, userFilter, minCredits]);

    const topNData = useMemo(() => {
        return filteredData.slice(0, limit);
    }, [filteredData, limit]);

    const metrics = useMemo(() => {
        const totalQueries = filteredData.length;
        const topNCredits = topNData.reduce((sum, q) => sum + q.costCredits, 0);
        const highestCredits = topNData.length > 0 ? topNData[0].costCredits : 0;
        const totalQasCredits = topNData.reduce((sum, q) => sum + (q.qasCredits || 0), 0);

        return {
            totalQueries,
            topNCredits,
            highestCredits,
            totalQasCredits
        };
    }, [filteredData, topNData]);

    const totalPages = Math.ceil(topNData.length / itemsPerPage);
    const paginatedData = topNData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatTime = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const handleRowClick = (query: QueryListItem) => {
        setSelectedQueryForDrawer(query);
        setIsDrawerOpen(true);
    };

    const getQueryName = (query: QueryListItem) => {
        const match = query.queryText.match(/\/\* (.*?) \*\//);
        return match ? match[1] : query.id;
    };

    return (
        <div className="flex flex-col h-full bg-background space-y-4 px-6 pt-6 pb-12 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex flex-col">
                    <h1 className="text-[28px] font-bold text-text-strong tracking-tight">Expensive queries</h1>
                    <p className="text-sm text-text-secondary font-medium mt-1">Feb 17 to Feb 23 2026 (Last 7 days)</p>
                </div>
                <DateRangeDropdown 
                    selectedValue={dateRange} 
                    onChange={(val) => { setDateRange(val as string); setCurrentPage(1); }} 
                />
            </div>

            {/* Pill-style Summary Metrics */}
            <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar flex-shrink-0">
                <KPILabel label="Expensive queries" value={metrics.totalQueries.toString()} />
                <KPILabel label="Total credits" value={`${metrics.topNCredits.toFixed(1)} TB`} />
                <KPILabel label="Query acceleration credits" value={`${(metrics.totalQasCredits / 1000).toFixed(1)}K`} />
            </div>

            {/* Integrated Table and Filters */}
            <div className="bg-white rounded-[12px] border border-border-light shadow-sm flex flex-col min-h-0 overflow-hidden">
                {/* Integrated Filter Bar */}
                <div className="px-4 py-3 flex flex-wrap items-center gap-6 border-b border-border-light bg-white relative z-20">
                    <SingleSelectDropdown 
                        label="Warehouses"
                        options={warehouseOptions}
                        selectedValue={warehouseFilter}
                        onChange={(val) => { setWarehouseFilter(val); setCurrentPage(1); }}
                    />

                    <div className="h-4 w-px bg-border-light hidden md:block" />

                    <SingleSelectDropdown 
                        label="Users"
                        options={userOptions}
                        selectedValue={userFilter}
                        onChange={(val) => { setUserFilter(val); setCurrentPage(1); }}
                    />

                    <div className="h-4 w-px bg-border-light hidden md:block" />

                    <SingleSelectDropdown 
                        label="Show"
                        options={limitOptions}
                        selectedValue={limit.toString()}
                        onChange={(val) => { setLimit(parseInt(val)); setCurrentPage(1); }}
                    />

                    <div className="flex-grow"></div>

                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <input 
                                type="text"
                                placeholder="Search queries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none text-[13px] focus:ring-0 placeholder:text-text-muted text-right pr-8"
                            />
                            <IconSearch className="w-4 h-4 text-text-muted absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer" />
                        </div>
                        <ColumnSelector 
                            columns={allColumns} 
                            visibleColumns={visibleColumns} 
                            onVisibleColumnsChange={setVisibleColumns} 
                            defaultColumns={['queryId', 'warehouse', 'user', 'totalCredits']} 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-[13px] border-separate border-spacing-0">
                        <thead className="text-[11px] text-text-strong uppercase font-bold sticky top-0 z-10 bg-[#F8F9FA] border-b border-border-light">
                            <tr>
                                {visibleColumns.includes('queryId') && <th className="px-6 py-4 text-left border-b border-border-light">Query ID</th>}
                                {visibleColumns.includes('warehouse') && <th className="px-6 py-4 text-left border-b border-border-light">Warehouse</th>}
                                {visibleColumns.includes('user') && <th className="px-6 py-4 text-left border-b border-border-light">User</th>}
                                {visibleColumns.includes('totalCredits') && <th className="px-6 py-4 text-left border-b border-border-light">Total Cr...</th>}
                                {visibleColumns.includes('computeCredits') && <th className="px-6 py-4 text-left border-b border-border-light">Compu...</th>}
                                {visibleColumns.includes('qasCredits') && <th className="px-6 py-4 text-left border-b border-border-light">QAS Cre...</th>}
                                {visibleColumns.includes('duration') && <th className="px-6 py-4 text-left border-b border-border-light">Duration</th>}
                                {visibleColumns.includes('startTime') && <th className="px-6 py-4 text-left border-b border-border-light">Start time</th>}
                                {visibleColumns.includes('endTime') && <th className="px-6 py-4 text-left border-b border-border-light">End time</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {paginatedData.map((query) => (
                                <tr key={query.id} className="group hover:bg-surface-hover transition-colors cursor-pointer border-b border-border-light last:border-0" onClick={() => handleRowClick(query)}>
                                    {visibleColumns.includes('queryId') && (
                                        <td className="px-6 py-4">
                                            <span className="text-link font-medium hover:underline">
                                                {getQueryName(query)}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.includes('warehouse') && <td className="px-6 py-4 text-text-secondary font-medium">{query.warehouse}</td>}
                                    {visibleColumns.includes('user') && <td className="px-6 py-4 text-text-secondary font-medium">{query.user}</td>}
                                    {visibleColumns.includes('totalCredits') && <td className="px-6 py-4 text-text-secondary font-medium">{query.costCredits.toFixed(0)}</td>}
                                    {visibleColumns.includes('computeCredits') && <td className="px-6 py-4 text-text-secondary font-medium">{query.computeCredits.toFixed(0)}</td>}
                                    {visibleColumns.includes('qasCredits') && <td className="px-6 py-4 text-text-secondary font-medium">{query.qasCredits.toFixed(0)}</td>}
                                    {visibleColumns.includes('duration') && <td className="px-6 py-4 text-text-secondary font-medium">{query.duration}</td>}
                                    {visibleColumns.includes('startTime') && <td className="px-6 py-4 text-text-secondary font-medium">{formatTime(query.startTime)}</td>}
                                    {visibleColumns.includes('endTime') && <td className="px-6 py-4 text-text-secondary font-medium">{formatTime(query.endTime)}</td>}
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
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
                                className="appearance-none bg-transparent pr-4 font-bold text-text-strong cursor-pointer focus:outline-none"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <IconChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="h-10 w-px bg-border-light" />
                        <span>{((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, topNData.length)} of {topNData.length} items</span>
                        <div className="h-10 w-px bg-border-light" />
                        
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center gap-1 cursor-pointer hover:text-text-strong">
                                <span className="font-bold">{currentPage}</span>
                                <IconChevronDown className="w-3 h-3" />
                            </div>
                            <span>of {totalPages} pages</span>
                        </div>

                        <div className="flex items-center border-l border-border-light">
                            <button 
                                disabled={currentPage === 1}
                                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                                className="p-3 hover:bg-surface-hover disabled:opacity-30 border-r border-border-light"
                            >
                                <IconChevronLeft className="w-4 h-4" />
                            </button>
                            <button 
                                disabled={currentPage === totalPages}
                                onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                                className="p-3 hover:bg-surface-hover disabled:opacity-30"
                            >
                                <IconChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <QueryDetailDrawer 
                query={selectedQueryForDrawer}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </div>
    );
};

export default ExpensiveQueriesView;
