
import React, { useState, useMemo } from 'react';
import { Database, DatabaseTable, User } from '../types';
import { databasesData, databaseTablesData, usersData } from '../data/dummyData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { IconChevronLeft } from '../constants';

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
    <div className="bg-white px-4 py-1.5 rounded-full border border-border-light shadow-sm flex items-center gap-2 flex-shrink-0 transition-all hover:border-primary/30">
        <span className="text-[11px] text-text-secondary font-bold whitespace-nowrap">{label}:</span>
        <span className="text-[11px] font-black text-text-strong whitespace-nowrap">{value}</span>
    </div>
);

const DatabaseDetailView: React.FC<{ database: Database, onBack: () => void }> = ({ database, onBack }) => {
    const users = useMemo(() => database.users.map(u => usersData.find(ud => ud.id === u.id)).filter((u): u is User => !!u), [database.users]);

    const tablesWithUsers = useMemo(() => {
        // Use all available data instead of an empty slice
        const tables = databaseTablesData.length > 0 ? databaseTablesData : [];
        if (users.length === 0) {
            return tables.map(table => ({...table, user: null}));
        }
        return tables.map(table => ({
            ...table,
            user: users[Math.floor(Math.random() * users.length)]
        }));
    }, [database.id, users]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onBack} 
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-text-secondary border border-border-light hover:bg-surface-nested transition-all shadow-sm flex-shrink-0"
                    aria-label="Back to databases list"
                >
                    <IconChevronLeft className="h-6 w-6" />
                </button>
                <h1 className="text-3xl font-black text-text-strong tracking-tight">{database.name}</h1>
            </div>

            {/* Pill Section for Database Level Metrics */}
            <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                <KPILabel label="Total size" value={`${database.sizeGB.toLocaleString()} GB`} />
                <KPILabel label="Est. cost" value={`$${database.cost.toLocaleString()}`} />
                <KPILabel label="Tables" value={database.tableCount.toString()} />
                <KPILabel label="Users" value={database.userCount.toString()} />
            </div>
            
            <WidgetCard title="Table storage analysis" className="shadow-sm border border-border-light">
                 <div className="overflow-auto max-h-[calc(100vh-400px)]">
                    <table className="w-full text-sm">
                        <thead className="text-left text-[11px] text-text-muted font-bold sticky top-0 bg-table-header-bg z-10 border-b border-border-color">
                            <tr>
                                <th className="py-3 px-4">User</th>
                                <th className="py-3 px-4">Table name</th>
                                <th className="py-3 px-4 text-right">Size (GB)</th>
                                <th className="py-3 px-4 text-right">Rows</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light bg-white">
                            {tablesWithUsers.length > 0 ? (
                                tablesWithUsers.map(table => (
                                    <tr key={table.id} className="hover:bg-surface-nested transition-colors">
                                        <td className="py-4 px-4">
                                            {table.user ? (
                                                <div className="flex items-center gap-2.5">
                                                    <UserAvatar name={table.user.name} />
                                                    <span className="text-xs font-bold text-text-primary whitespace-nowrap">{table.user.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">?</div>
                                                    <span className="text-xs text-text-muted italic">System Account</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 font-mono text-xs font-medium text-text-primary">{table.name}</td>
                                        <td className="py-4 px-4 text-right font-black text-text-strong">{table.sizeGB.toLocaleString()}</td>
                                        <td className="py-4 px-4 text-right text-text-secondary font-medium">{table.rows.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-text-muted italic">
                                        No table data found for this database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </WidgetCard>
        </div>
    );
}

const DatabaseListView: React.FC<{ onSelectDatabase: (databaseId: string) => void }> = ({ onSelectDatabase }) => {
    const totalStorage = useMemo(() => databasesData.reduce((sum, db) => sum + db.sizeGB, 0), []);
    
    return (
         <div className="space-y-4">
            <WidgetCard className="shadow-sm border border-border-light">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary border-separate border-spacing-0">
                        <thead className="bg-table-header-bg text-[10px] text-text-muted font-bold sticky top-0 z-10 border-b border-border-color">
                            <tr>
                                <th scope="col" className="px-6 py-4 border-b border-border-color">Database name</th>
                                <th scope="col" className="px-6 py-4 border-b border-border-color">Storage credits</th>
                                <th scope="col" className="px-6 py-4 border-b border-border-color">Size (GB)</th>
                                <th scope="col" className="px-6 py-4 border-b border-border-color">% of Total</th>
                                <th scope="col" className="px-6 py-4 border-b border-border-color">Cost ($)</th>
                                <th scope="col" className="px-6 py-4 border-b border-border-color"># Tables</th>
                                <th scope="col" className="px-6 py-4 border-b border-border-color"># Users</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-border-light">
                            {databasesData.map(db => (
                                <tr key={db.id} className="hover:bg-surface-nested cursor-pointer transition-colors group" onClick={() => onSelectDatabase(db.id)}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-bold text-link group-hover:underline">
                                            {db.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-black text-primary">{db.credits?.toLocaleString() || '0'} cr</td>
                                    <td className="px-6 py-4 font-black text-text-strong">{db.sizeGB.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-medium text-text-muted">{totalStorage > 0 ? ((db.sizeGB / totalStorage) * 100).toFixed(1) : 0}%</td>
                                    <td className="px-6 py-4 font-black text-text-strong">${db.cost.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-medium">{db.tableCount}</td>
                                    <td className="px-6 py-4 font-medium">{db.userCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </WidgetCard>
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
