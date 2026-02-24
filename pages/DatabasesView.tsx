
import React, { useState, useMemo } from 'react';
import { Database, DatabaseTable, User } from '../types';
import { databasesData, databaseTablesData, usersData } from '../data/dummyData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { IconChevronLeft, IconSearch, IconAdjustments, IconChevronDown } from '../constants';

const WidgetCard: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ children, className = '', title }) => (
    <div className={`bg-surface rounded-3xl p-4 break-inside-avoid mb-4 ${className}`}>
        {title && <h3 className="text-base font-semibold text-text-strong mb-4">{title}</h3>}
        {children}
    </div>
);

const UserAvatar: React.FC<{ name: string; avatarUrl?: string }> = ({ name, avatarUrl }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return (
        <div className="h-8 w-8 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0" title={name}>
            {initials}
        </div>
    );
};

const KPILabel: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-white px-5 py-2.5 rounded-full border border-border-light shadow-sm flex items-center gap-2 flex-shrink-0 transition-all hover:border-primary/30">
        <span className="text-[13px] text-text-secondary font-medium whitespace-nowrap">{label}:</span>
        <span className="text-[13px] font-black text-text-strong whitespace-nowrap">{value}</span>
    </div>
);

const DatabaseDetailView: React.FC<{ database: Database, onBack: () => void }> = ({ database, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const users = useMemo(() => database.users.map(u => usersData.find(ud => ud.id === u.id)).filter((u): u is User => !!u), [database.users]);

    const tablesWithUsers = useMemo(() => {
        // Filter tables for this database
        let tables = databaseTablesData.filter(t => t.databaseName === database.name);
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            tables = tables.filter(t => 
                t.name.toLowerCase().includes(query) || 
                t.schemaName.toLowerCase().includes(query)
            );
        }

        if (users.length === 0) {
            return tables.map(table => ({...table, user: null}));
        }
        return tables.map(table => ({
            ...table,
            user: users[Math.floor(Math.random() * users.length)]
        }));
    }, [database.name, users, searchQuery]);

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center gap-4 flex-shrink-0">
                <button 
                    onClick={onBack} 
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-text-secondary border border-border-light hover:bg-surface-nested transition-all shadow-sm flex-shrink-0"
                    aria-label="Back to databases list"
                >
                    <IconChevronLeft className="h-6 w-6" />
                </button>
                <h1 className="text-[28px] font-bold text-text-strong tracking-tight">{database.name}</h1>
            </div>

            {/* Pill Section for Database Level Metrics */}
            <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar flex-shrink-0">
                <KPILabel label="Total size" value={`${database.sizeGB.toLocaleString()} GB`} />
                <KPILabel label="Est. cost" value={`$${database.cost.toLocaleString()}`} />
                <KPILabel label="Tables" value={database.tableCount.toString()} />
                <KPILabel label="Users" value={database.userCount.toString()} />
            </div>
            
            <div className="bg-white rounded-[12px] border border-border-light shadow-sm flex flex-col min-h-0">
                <div className="px-4 py-3 flex justify-between items-center border-b border-border-light bg-white rounded-t-[12px] relative z-20 overflow-visible flex-shrink-0">
                    <h3 className="text-sm font-bold text-text-strong">Table storage analysis</h3>
                    <div className="relative flex-1 max-w-xs ml-4">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none pr-8 placeholder:text-text-muted w-full text-right"
                            placeholder="Search tables or schemas..."
                        />
                        <IconSearch className="w-4 h-4 text-text-muted absolute right-0 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[500px] no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#F8F9FA] sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light">Table name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light">Schema name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Total size (GB)</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Active size (GB)</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Fail safe (GB)</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Time travel (GB)</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Retention time (Days)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-border-light">
                            {tablesWithUsers.length > 0 ? (
                                tablesWithUsers.map(table => (
                                    <tr key={table.id} className="hover:bg-surface-nested transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono font-bold text-text-primary">{table.name}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-text-secondary">{table.schemaName}</td>
                                        <td className="px-6 py-4 text-sm text-right font-black text-primary">{table.totalSizeGB.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-text-strong">{table.activeSizeGB.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-text-secondary">{table.failSafeSizeGB.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-text-secondary">{table.timeTravelSizeGB.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-text-muted">{table.retentionTimeDays}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-text-muted italic">
                                        No table data found for this database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const DatabaseListView: React.FC<{ onSelectDatabase: (databaseId: string) => void }> = ({ onSelectDatabase }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDb, setSelectedDb] = useState('All databases');
    const [selectedSchema, setSelectedSchema] = useState('All schemas');

    const dbOptions = useMemo(() => ['All databases', ...Array.from(new Set(databaseTablesData.map(t => t.databaseName).filter((n): n is string => !!n)))], []);
    const schemaOptions = useMemo(() => ['All schemas', ...Array.from(new Set(databaseTablesData.map(t => t.schemaName)))], []);

    const filteredTables = useMemo(() => {
        return databaseTablesData.filter(table => {
            const matchesSearch = !searchQuery || 
                table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                table.schemaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                table.databaseName?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesDb = selectedDb === 'All databases' || table.databaseName === selectedDb;
            const matchesSchema = selectedSchema === 'All schemas' || table.schemaName === selectedSchema;

            return matchesSearch && matchesDb && matchesSchema;
        });
    }, [searchQuery, selectedDb, selectedSchema]);

    const aggregateMetrics = useMemo(() => {
        const totalActive = filteredTables.reduce((sum, t) => sum + t.activeSizeGB, 0);
        const totalTimeTravel = filteredTables.reduce((sum, t) => sum + t.timeTravelSizeGB, 0);
        const totalFailSafe = filteredTables.reduce((sum, t) => sum + t.failSafeSizeGB, 0);
        const totalSize = filteredTables.reduce((sum, t) => sum + t.totalSizeGB, 0);
        const uniqueDbs = new Set(filteredTables.map(t => t.databaseName)).size;

        return {
            totalActive,
            totalTimeTravel,
            totalFailSafe,
            totalSize,
            totalTables: filteredTables.length,
            totalDbs: uniqueDbs
        };
    }, [filteredTables]);

    return (
         <div className="flex flex-col h-full gap-4">
            {/* Aggregate Pills */}
            <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar flex-shrink-0">
                <KPILabel label="Databases" value={aggregateMetrics.totalDbs.toString()} />
                <KPILabel label="Tables" value={aggregateMetrics.totalTables.toString()} />
                <KPILabel label="Total size" value={`${aggregateMetrics.totalSize.toLocaleString()} GB`} />
                <KPILabel label="Active size" value={`${aggregateMetrics.totalActive.toLocaleString()} GB`} />
                <KPILabel label="Time travel" value={`${aggregateMetrics.totalTimeTravel.toLocaleString()} GB`} />
                <KPILabel label="Fail safe" value={`${aggregateMetrics.totalFailSafe.toLocaleString()} GB`} />
            </div>

            <div className="bg-white rounded-[12px] border border-border-light shadow-sm flex flex-col min-h-0">
                <div className="px-4 py-3 flex items-center border-b border-border-light bg-white rounded-t-[12px] relative z-20 overflow-visible flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-text-secondary">Database</span>
                            <div className="relative">
                                <select
                                    className="appearance-none pl-0 pr-6 py-1 bg-transparent text-xs font-bold text-text-strong focus:outline-none cursor-pointer"
                                    value={selectedDb}
                                    onChange={(e) => setSelectedDb(e.target.value)}
                                >
                                    {dbOptions.map(opt => <option key={opt} value={opt}>{opt === 'All databases' ? 'All' : opt}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                                    <IconChevronDown className="h-3 w-3 text-text-muted" />
                                </div>
                            </div>
                        </div>

                        <div className="h-4 w-[1px] bg-border-light" />

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-text-secondary">Schema</span>
                            <div className="relative">
                                <select
                                    className="appearance-none pl-0 pr-6 py-1 bg-transparent text-xs font-bold text-text-strong focus:outline-none cursor-pointer"
                                    value={selectedSchema}
                                    onChange={(e) => setSelectedSchema(e.target.value)}
                                >
                                    {schemaOptions.map(opt => <option key={opt} value={opt}>{opt === 'All schemas' ? 'All' : opt}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                                    <IconChevronDown className="h-3 w-3 text-text-muted" />
                                </div>
                            </div>
                        </div>

                        <div className="h-4 w-[1px] bg-border-light" />
                    </div>

                    <div className="relative flex-1 ml-4">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none pr-8 placeholder:text-text-muted w-full text-right"
                            placeholder="Search databases, schemas, or tables..."
                        />
                        <IconSearch className="w-4 h-4 text-text-muted absolute right-0 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[500px] no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#F8F9FA] sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light">Table name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light">Schema name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Total size (GB)</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Active size (GB)</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Fail safe (GB)</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Time travel (GB)</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Retention time</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-border-light">
                            {filteredTables.length > 0 ? (
                                filteredTables.map(table => {
                                    const db = databasesData.find(d => d.name === table.databaseName);
                                    return (
                                        <tr 
                                            key={table.id} 
                                            className="hover:bg-surface-nested transition-colors group" 
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-text-primary">
                                                    {table.name}
                                                </div>
                                                <div className="text-[11px] text-text-muted mt-0.5 font-medium">
                                                    Database: {table.databaseName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-text-secondary">{table.schemaName}</td>
                                            <td className="px-6 py-4 text-sm text-right font-black text-primary">{table.totalSizeGB.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-right font-medium text-text-strong">{table.activeSizeGB.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-right font-medium text-text-secondary">{table.failSafeSizeGB.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-right font-medium text-text-secondary">{table.timeTravelSizeGB.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-right font-medium text-text-muted">{table.retentionTimeDays}d</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-text-muted italic">
                                        No tables match your search criteria.
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

interface DatabasesViewProps {
    selectedDatabaseId: string | null;
    onSelectDatabase: (databaseId: string) => void;
    onBackToList: () => void;
}

const DatabasesView: React.FC<DatabasesViewProps> = ({ selectedDatabaseId, onSelectDatabase, onBackToList }) => {
    const selectedDatabase = useMemo(() => {
        if (!selectedDatabaseId) return null;
        return databasesData.find(db => db.id === selectedDatabaseId) || null;
    }, [selectedDatabaseId]);

    if (selectedDatabase) {
        return <DatabaseDetailView database={selectedDatabase} onBack={onBackToList} />;
    }

    return <DatabaseListView onSelectDatabase={onSelectDatabase} />;
};

export default DatabasesView;
