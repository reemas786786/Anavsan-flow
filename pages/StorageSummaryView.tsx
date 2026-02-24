
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { storageSummaryData, storageGrowthData, databasesData, storageByTypeData, databaseTablesData, unusedTablesData } from '../data/dummyData';
import InfoTooltip from '../components/InfoTooltip';
import { BigScreenWidget } from '../types';
import { IconDotsVertical, IconList, IconInfo } from '../constants';
import SidePanel from '../components/SidePanel';
import TableView from '../components/TableView';


const WidgetCard: React.FC<{ children: React.ReactNode, className?: string, title?: string, actions?: React.ReactNode }> = ({ children, className = '', title, actions }) => (
    <div className={`bg-surface rounded-3xl shadow-sm border border-border-color p-4 break-inside-avoid mb-4 flex flex-col ${className}`}>
        {(title || actions) && (
            <div className="flex justify-between items-center mb-4">
                {title && (
                    <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-semibold text-text-strong">{title}</h3>
                        <IconInfo className="w-4 h-4 text-text-muted cursor-help" />
                    </div>
                )}
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        )}
        {children}
    </div>
);

interface WidgetActionMenuProps {
    widgetId: string;
    onExpand: () => void;
    onTableView: (() => void) | null;
    onDownload: () => void;
    openMenu: string | null;
    handleMenuClick: (id: string) => void;
    menuRef: React.RefObject<HTMLDivElement>;
}

const WidgetActionMenu: React.FC<WidgetActionMenuProps> = ({ widgetId, onExpand, onTableView, onDownload, openMenu, handleMenuClick, menuRef }) => (
    <div className="relative" ref={openMenu === widgetId ? menuRef : null}>
        <button
            onClick={() => handleMenuClick(widgetId)}
            className="p-1 rounded-full text-text-secondary hover:bg-surface-hover hover:text-primary focus:outline-none"
            aria-label={`${widgetId} options`}
            aria-haspopup="true"
            aria-expanded={openMenu === widgetId}
        >
            <IconDotsVertical className="h-5 w-5" />
        </button>
        {openMenu === widgetId && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-surface ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                    <button onClick={onExpand} className="w-full text-left block px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover" role="menuitem">Expand View</button>
                    {onTableView && <button onClick={onTableView} className="w-full text-left block px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover" role="menuitem">Table View</button>}
                    <button onClick={onDownload} className="w-full text-left block px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover" role="menuitem">Download CSV</button>
                </div>
            </div>
        )}
    </div>
);


const KPILabel: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-white px-5 py-2.5 rounded-full border border-border-light shadow-sm flex items-center gap-2 flex-shrink-0 transition-all hover:border-primary/30">
        <span className="text-[13px] text-text-secondary font-medium whitespace-nowrap">{label}:</span>
        <span className="text-[13px] font-black text-text-strong whitespace-nowrap">{value}</span>
    </div>
);

const StorageSummaryView: React.FC<{ onSelectDatabase: (databaseId: string) => void, onSetBigScreenWidget: (widget: BigScreenWidget) => void }> = ({ onSelectDatabase, onSetBigScreenWidget }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [tableViewData, setTableViewData] = useState<{
        title: string;
        data: { name: string; cost: number; credits: number; percentage: number }[];
    } | null>(null);
    
    const topDatabasesBySize = [...databasesData].sort((a, b) => b.sizeGB - a.sizeGB).slice(0, 5);
    
    const schemasBySize = useMemo(() => {
        const map: Record<string, number> = {};
        databaseTablesData.forEach(t => {
            map[t.schemaName] = (map[t.schemaName] || 0) + t.totalSizeGB;
        });
        return Object.entries(map)
            .map(([name, size]) => ({ name, size }))
            .sort((a, b) => b.size - a.size)
            .slice(0, 5);
    }, []);

    const topTablesBySize = [...databaseTablesData].sort((a, b) => b.totalSizeGB - a.totalSizeGB).slice(0, 5);

    const storageByTypeChartData = storageByTypeData.filter(item => item.type !== 'Staging');
    const totalStorageByType = storageByTypeChartData.reduce((sum, item) => sum + item.storageGB, 0);

    const failsafeData = storageByTypeData.find(d => d.type === 'Fail-safe');
    const timeTravelData = storageByTypeData.find(d => d.type === 'Time Travel');
    const totalUnusedGB = unusedTablesData.reduce((sum, t) => sum + t.sizeGB, 0);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuClick = (menuId: string) => {
        setOpenMenu(prev => (prev === menuId ? null : menuId));
    };

    const downloadCSV = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName.replace(/\s+/g, '_')}_${date}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadCSV = (widgetType: string) => {
        let headers: string[] = [];
        let dataRows: (string | number)[][] = [];
        let fileName = '';

        switch (widgetType) {
            case 'top-db-size':
                fileName = 'top_databases_by_size';
                headers = ['Database Name', 'Size (GB)'];
                dataRows = databasesData.map(db => [db.name, db.sizeGB]);
                break;
            case 'top-schema-size':
                fileName = 'top_schemas_by_size';
                headers = ['Schema Name', 'Size (GB)'];
                dataRows = schemasBySize.map(s => [s.name, s.size]);
                break;
            case 'top-table-size':
                fileName = 'top_tables_by_size';
                headers = ['Table Name', 'Size (GB)'];
                dataRows = databaseTablesData.map(t => [t.name, t.totalSizeGB]);
                break;
            case 'storage-by-type':
                fileName = 'storage_by_type';
                headers = ['Storage Type', 'Storage (GB)', 'Cost ($)'];
                dataRows = storageByTypeData.map(item => [item.type, item.storageGB, item.cost]);
                break;
            case 'storage-growth':
                fileName = 'storage_growth_trend';
                headers = ['Date', 'Active Storage (GB)', 'Time Travel (GB)'];
                dataRows = storageGrowthData.map(item => [item.date, item['Active Storage (GB)'], item['Time Travel (GB)']]);
                break;
        }
        
        if (headers.length > 0) {
            const csvContent = [headers.join(','), ...dataRows.map(row => row.join(','))].join('\n');
            downloadCSV(csvContent, fileName);
        }
        setOpenMenu(null);
    };

    const handleOpenTableView = (widgetType: string) => {
        if (widgetType === 'top-db-size') {
            const totalSize = databasesData.reduce((acc, db) => acc + db.sizeGB, 0);
            setTableViewData({
                title: 'Top databases by size',
                data: databasesData.map(db => ({
                    name: db.name,
                    cost: db.sizeGB,
                    credits: db.sizeGB,
                    percentage: totalSize > 0 ? (db.sizeGB / totalSize) * 100 : 0
                }))
            });
        } else if (widgetType === 'storage-by-type') {
            const totalCost = storageByTypeData.reduce((acc, item) => acc + item.cost, 0);
            setTableViewData({
                title: 'Storage by type',
                data: storageByTypeData.map(item => ({
                    name: item.type,
                    cost: item.cost,
                    credits: item.storageGB,
                    percentage: totalCost > 0 ? (item.cost / totalCost) * 100 : 0
                }))
            });
        }
        setOpenMenu(null);
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <WidgetCard 
                title="Storage summary"
                actions={
                    <>
                        <button className="p-1 rounded-full text-text-secondary hover:bg-surface-hover hover:text-primary transition-colors">
                            <IconList className="w-5 h-5" />
                        </button>
                        <WidgetActionMenu
                            widgetId="storage-summary"
                            openMenu={openMenu}
                            handleMenuClick={handleMenuClick}
                            menuRef={menuRef}
                            onExpand={() => {}}
                            onTableView={null}
                            onDownload={() => {}}
                        />
                    </>
                }
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    <div className="bg-surface-nested p-5 rounded-[24px] border border-border-light/50">
                        <p className="text-sm font-medium text-text-muted mb-2">Storage credits</p>
                        <p className="text-2xl font-black text-text-strong">{(storageSummaryData.totalCredits / 1000).toFixed(1)}K</p>
                        <p className="text-xs font-bold text-text-muted mt-1">{(storageSummaryData.totalStorageGB / 1000).toFixed(0)} TB</p>
                    </div>
                    <div className="bg-surface-nested p-5 rounded-[24px] border border-border-light/50">
                        <p className="text-sm font-medium text-text-muted mb-2">Databases</p>
                        <p className="text-2xl font-black text-text-strong">12</p>
                        <p className="text-xs font-bold text-text-muted mt-1">Active</p>
                    </div>
                    <div className="bg-surface-nested p-5 rounded-[24px] border border-border-light/50">
                        <p className="text-sm font-medium text-text-muted mb-2">Schemas</p>
                        <p className="text-2xl font-black text-text-strong">45</p>
                        <p className="text-xs font-bold text-text-muted mt-1">Across all DBs</p>
                    </div>
                    <div className="bg-surface-nested p-5 rounded-[24px] border border-border-light/50">
                        <p className="text-sm font-medium text-text-muted mb-2">Tables</p>
                        <p className="text-2xl font-black text-text-strong">850</p>
                        <p className="text-xs font-bold text-text-muted mt-1">Total count</p>
                    </div>
                    <div className="bg-surface-nested p-5 rounded-[24px] border border-border-light/50">
                        <p className="text-sm font-medium text-text-muted mb-2">Unused tables</p>
                        <p className="text-2xl font-black text-text-strong">{totalUnusedGB.toLocaleString()} GB</p>
                        <p className="text-xs font-bold text-text-muted mt-1">{unusedTablesData.length} count</p>
                    </div>
                    <div className="bg-surface-nested p-5 rounded-[24px] border border-border-light/50">
                        <p className="text-sm font-medium text-text-muted mb-2">Failsafe</p>
                        <p className="text-2xl font-black text-text-strong">{failsafeData?.storageGB.toLocaleString()} GB</p>
                        <p className="text-xs font-bold text-text-muted mt-1">650 count</p>
                    </div>
                    <div className="bg-surface-nested p-5 rounded-[24px] border border-border-light/50">
                        <p className="text-sm font-medium text-text-muted mb-2">Time travel</p>
                        <p className="text-2xl font-black text-text-strong">{timeTravelData?.storageGB.toLocaleString()} GB</p>
                        <p className="text-xs font-bold text-text-muted mt-1">650 count</p>
                    </div>
                </div>
            </WidgetCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Table Type Widget */}
                <WidgetCard title="Table type breakdown">
                    <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                        <div className="relative w-48 h-48 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Permanent', value: 650, color: '#6932D5' },
                                            { name: 'Transient', value: 120, color: '#A78BFA' },
                                            { name: 'Temporary', value: 45, color: '#C4B5FD' },
                                            { name: 'Hybrid', value: 25, color: '#10B981' },
                                            { name: 'Dynamic', value: 10, color: '#F59E0B' },
                                        ]}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="60%"
                                        outerRadius="80%"
                                        paddingAngle={5}
                                        stroke="none"
                                    >
                                        {[
                                            { name: 'Permanent', value: 650, color: '#6932D5' },
                                            { name: 'Transient', value: 120, color: '#A78BFA' },
                                            { name: 'Temporary', value: 45, color: '#C4B5FD' },
                                            { name: 'Hybrid', value: 25, color: '#10B981' },
                                            { name: 'Dynamic', value: 10, color: '#F59E0B' },
                                        ].map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-text-primary">850</span>
                                <span className="text-xs text-text-secondary uppercase font-bold tracking-widest">Tables</span>
                            </div>
                        </div>
                        <div className="flex-1 grid grid-cols-1 gap-3 w-full">
                            {[
                                { name: 'Permanent', value: 650, color: '#6932D5' },
                                { name: 'Transient', value: 120, color: '#A78BFA' },
                                { name: 'Temporary', value: 45, color: '#C4B5FD' },
                                { name: 'Hybrid', value: 25, color: '#10B981' },
                                { name: 'Dynamic', value: 10, color: '#F59E0B' },
                            ].map(item => (
                                <div key={item.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-nested transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs font-bold text-text-secondary">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-text-strong">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </WidgetCard>

                {/* Storage Usage Widget */}
                <WidgetCard title="Storage usage breakdown">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-2">
                        {[
                            { label: 'Active Bytes', value: '45.0 TB', color: 'text-primary', bgColor: 'bg-primary/5' },
                            { label: 'Time Travel', value: '1.5 TB', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
                            { label: 'Fail-safe', value: '800 GB', color: 'text-violet-600', bgColor: 'bg-violet-50' },
                            { label: 'Staged Bytes', value: '350 GB', color: 'text-amber-600', bgColor: 'bg-amber-50' },
                            { label: 'Hybrid Bytes', value: '120 GB', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
                            { label: 'Unused Bytes', value: '450 GB', color: 'text-red-600', bgColor: 'bg-red-50' },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col p-4 rounded-2xl border border-border-light bg-white shadow-sm">
                                <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                                    <div className={`w-2 h-2 rounded-full ${stat.color.replace('text-', 'bg-')}`} />
                                </div>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{stat.label}</span>
                                <span className={`text-lg font-black text-text-strong`}>{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </WidgetCard>
            </div>

            <div className="columns-1 lg:columns-2 gap-4">
                {/* Widget: Top Databases by Size */}
                <WidgetCard title="Top databases by size">
                    <div className="h-64 mt-2">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={topDatabasesBySize} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" stroke="#9A9AB2" fontSize={12} tickFormatter={(value) => `${(value/1000).toFixed(1)}k`} />
                                <YAxis dataKey="name" type="category" stroke="#9A9AB2" fontSize={12} width={100} tick={{width: 90}} />
                                <Tooltip
                                    cursor={{ fill: '#F3F0FA' }}
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: '1rem' }}
                                    formatter={(value: number) => [`${value.toLocaleString()} GB`, 'Size']}
                                />
                                <Bar dataKey="sizeGB" fill="#6932D5" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </WidgetCard>

                {/* Widget: Top Schemas by Size */}
                <WidgetCard title="Top schemas by size">
                    <div className="h-64 mt-2">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={schemasBySize} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" stroke="#9A9AB2" fontSize={12} tickFormatter={(value) => `${(value/1000).toFixed(1)}k`} />
                                <YAxis dataKey="name" type="category" stroke="#9A9AB2" fontSize={12} width={100} tick={{width: 90}} />
                                <Tooltip
                                    cursor={{ fill: '#F3F0FA' }}
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: '1rem' }}
                                    formatter={(value: number) => [`${value.toLocaleString()} GB`, 'Size']}
                                />
                                <Bar dataKey="size" fill="#A78BFA" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </WidgetCard>

                {/* Widget: Top Tables by Size */}
                <WidgetCard title="Top tables by size">
                    <div className="h-64 mt-2">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={topTablesBySize} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" stroke="#9A9AB2" fontSize={12} tickFormatter={(value) => `${(value/1000).toFixed(1)}k`} />
                                <YAxis dataKey="name" type="category" stroke="#9A9AB2" fontSize={12} width={100} tick={{width: 90}} />
                                <Tooltip
                                    cursor={{ fill: '#F3F0FA' }}
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: '1rem' }}
                                    formatter={(value: number) => [`${value.toLocaleString()} GB`, 'Size']}
                                />
                                <Bar dataKey="totalSizeGB" fill="#C4B5FD" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </WidgetCard>

                {/* Widget 4: Storage by Type */}
                <WidgetCard>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            <h3 className="text-base font-semibold text-text-strong">Storage by type</h3>
                            <InfoTooltip text="Breakdown of storage usage by category." />
                        </div>
                         <WidgetActionMenu
                            widgetId="storage-by-type"
                            openMenu={openMenu}
                            handleMenuClick={handleMenuClick}
                            menuRef={menuRef}
                            onExpand={() => { onSetBigScreenWidget({ type: 'storage_by_type', title: 'Storage by type' }); setOpenMenu(null); }}
                            onTableView={() => handleOpenTableView('storage-by-type')}
                            onDownload={() => handleDownloadCSV('storage-by-type')}
                        />
                    </div>
                    <div className="flex-grow flex flex-col items-center justify-center mt-4">
                        <div className="relative w-48 h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={storageByTypeChartData.map(item => ({...item}))}
                                        dataKey="storageGB"
                                        nameKey="type"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="60%"
                                        outerRadius="80%"
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        stroke="none"
                                    >
                                        {storageByTypeChartData.map((entry) => (
                                            <Cell key={`cell-${entry.type}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [`${value.toLocaleString()} GB`, 'Storage']}
                                        contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: '1rem' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-text-primary">
                                    {totalStorageByType.toLocaleString(undefined, {maximumFractionDigits: 1})}
                                </span>
                                <span className="text-sm text-text-secondary">GB</span>
                            </div>
                        </div>
                        <div className="w-full mt-4 space-y-2">
                            {storageByTypeChartData.map(item => (
                                <div key={item.type} className="flex items-center justify-between text-sm px-2">
                                    <div className="flex items-center">
                                        <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                                        <span className="text-text-secondary">{item.type}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-text-strong">{item.storageGB.toLocaleString()} GB</p>
                                        <p className="text-xs text-text-muted">${item.cost.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </WidgetCard>

                {/* Widget 3: Storage Growth Trend */}
                <WidgetCard>
                     <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            <h3 className="text-base font-semibold text-text-strong">Storage growth trend</h3>
                            <InfoTooltip text="Historical growth pattern for active storage and time travel usage." />
                        </div>
                        <WidgetActionMenu
                            widgetId="storage-growth"
                            openMenu={openMenu}
                            handleMenuClick={handleMenuClick}
                            menuRef={menuRef}
                            onExpand={() => { onSetBigScreenWidget({ type: 'storage_growth_trend', title: 'Storage growth trend' }); setOpenMenu(null); }}
                            onTableView={null} // Data structure not compatible with simple TableView
                            onDownload={() => handleDownloadCSV('storage-growth')}
                        />
                    </div>
                    <div className="h-80 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={storageGrowthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="date" stroke="#9A9AB2" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9A9AB2" fontSize={12} unit=" GB" tickFormatter={(value) => (value/1000).toLocaleString() + 'k'} tickLine={false} axisLine={false}/>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: '1rem' }}
                                    labelStyle={{ color: '#1E1E2D', fontWeight: 'bold' }}
                                    formatter={(value: number, name: string) => [`${value.toLocaleString()} GB`, name.replace(/ \(.*/, '')]}
                                />
                                <defs>
                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6932D5" stopOpacity={0.7}/>
                                        <stop offset="95%" stopColor="#6932D5" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorTimeTravel" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C4B5FD" stopOpacity={0.6}/>
                                        <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="Active Storage (GB)" stroke="#6932D5" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                                <Area type="monotone" dataKey="Time Travel (GB)" stroke="#A78BFA" strokeWidth={2} fillOpacity={1} fill="url(#colorTimeTravel)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </WidgetCard>
            </div>
            <SidePanel
                isOpen={!!tableViewData}
                onClose={() => setTableViewData(null)}
                title="Table View"
            >
                {tableViewData && (
                    <TableView
                        title={tableViewData.title}
                        data={tableViewData.data}
                    />
                )}
            </SidePanel>
        </div>
    );
};
export default StorageSummaryView;
