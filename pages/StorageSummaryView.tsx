
import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { storageSummaryData, storageGrowthData, databasesData, storageByTypeData } from '../data/dummyData';
import InfoTooltip from '../components/InfoTooltip';
import { BigScreenWidget } from '../types';
import { IconDotsVertical } from '../constants';
import SidePanel from '../components/SidePanel';
import TableView from '../components/TableView';


const WidgetCard: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ children, className = '', title }) => (
    <div className={`bg-surface rounded-3xl shadow-sm border border-border-color p-4 break-inside-avoid mb-4 flex flex-col ${className}`}>
        {title && <h3 className="text-base font-semibold text-text-strong mb-4">{title}</h3>}
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


const StorageSummaryView: React.FC<{ onSelectDatabase: (databaseId: string) => void, onSetBigScreenWidget: (widget: BigScreenWidget) => void }> = ({ onSelectDatabase, onSetBigScreenWidget }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [tableViewData, setTableViewData] = useState<{
        title: string;
        data: { name: string; cost: number; credits: number; percentage: number }[];
    } | null>(null);
    
    const topDatabases = [...databasesData].sort((a, b) => b.cost - a.cost).slice(0, 5);
    const storageByTypeChartData = storageByTypeData.filter(item => item.type !== 'Staging');
    const totalStorageByType = storageByTypeChartData.reduce((sum, item) => sum + item.storageGB, 0);

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
            case 'top-spend-db':
                fileName = 'top_spend_by_databases';
                headers = ['Database Name', 'Cost ($)', 'Storage (GB)'];
                dataRows = databasesData.map(db => [db.name, db.cost, db.sizeGB]);
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
        if (widgetType === 'top-spend-db') {
            const totalCost = databasesData.reduce((acc, db) => acc + db.cost, 0);
            setTableViewData({
                title: 'Top spend by databases',
                data: databasesData.map(db => ({
                    name: db.name,
                    cost: db.cost,
                    credits: db.sizeGB, // using size as a proxy for a second metric
                    percentage: totalCost > 0 ? (db.cost / totalCost) * 100 : 0
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
        <div className="space-y-4">
            <div className="columns-1 lg:columns-2 gap-4">
                {/* Widget 1: Total Storage & Spend */}
                <WidgetCard>
                    <div className="flex items-center">
                        <h3 className="text-base font-semibold text-text-strong">Total storage summary</h3>
                        <InfoTooltip text="Overall storage usage and associated credit/monetary spend for the selected time period." />
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-surface-nested p-4 rounded-3xl sm:col-span-2">
                            <p className="text-sm text-text-secondary">Storage credits</p>
                            <p className="text-3xl font-black text-primary mt-1">{storageSummaryData.totalCredits.toLocaleString()} cr</p>
                        </div>
                        <div className="bg-surface-nested p-4 rounded-3xl">
                            <p className="text-sm text-text-secondary">Total storage used</p>
                            <p className="text-2xl font-bold text-text-primary mt-1">{storageSummaryData.totalStorageGB.toLocaleString()} GB</p>
                        </div>
                        <div className="bg-surface-nested p-4 rounded-3xl">
                            <p className="text-sm text-text-secondary">Est. monthly cost</p>
                            <p className="text-2xl font-bold text-text-primary mt-1">${storageSummaryData.totalSpend.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
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

                {/* Widget 2: Top Spend by Databases */}
                <WidgetCard>
                    <div className="flex justify-between items-start">
                        <div className="flex-grow">
                            <div className="flex items-center">
                                <h3 className="text-base font-semibold text-text-strong">Top spend by databases</h3>
                                <InfoTooltip text="Databases ranked by storage cost. Click a bar to view details." />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => onSelectDatabase('__view_all__')}
                                className="text-sm font-semibold text-link hover:underline whitespace-nowrap"
                            >
                                View All
                            </button>
                             <WidgetActionMenu
                                widgetId="top-spend-db"
                                openMenu={openMenu}
                                handleMenuClick={handleMenuClick}
                                menuRef={menuRef}
                                onExpand={() => { onSetBigScreenWidget({ type: 'top_spend_by_db', title: 'Top spend by databases' }); setOpenMenu(null); }}
                                onTableView={() => handleOpenTableView('top-spend-db')}
                                onDownload={() => handleDownloadCSV('top-spend-db')}
                            />
                        </div>
                    </div>
                    <div className="h-80 mt-4">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={topDatabases} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" stroke="#9A9AB2" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                                <YAxis dataKey="name" type="category" stroke="#9A9AB2" fontSize={12} width={100} tick={{width: 90}} />
                                <Tooltip
                                    cursor={{ fill: '#F3F0FA' }}
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: '1rem' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
                                />
                                <Bar dataKey="cost" fill="#A78BFA" radius={[0, 4, 4, 0]}>
                                    {topDatabases.map((entry) => (
                                        <Cell key={`cell-${entry.id}`} cursor="pointer" onClick={() => onSelectDatabase(entry.id)} className="hover:fill-primary" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
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
