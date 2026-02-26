
import React, { useState, useMemo } from 'react';
import { databaseTablesData } from '../data/dummyData';
import { formatStorageSize } from '../utils/storageMetrics';
import { IconSearch } from '../constants';

const KPILabel: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-white px-5 py-2.5 rounded-full border border-border-light shadow-sm flex items-center gap-2 flex-shrink-0 transition-all hover:border-primary/30">
        <span className="text-[13px] text-text-secondary font-medium whitespace-nowrap">{label}:</span>
        <span className="text-[13px] font-black text-text-strong whitespace-nowrap">{value}</span>
    </div>
);

const TablesView: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTables = useMemo(() => {
        return databaseTablesData.filter(table => {
            const matchesSearch = !searchQuery || 
                table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                table.schemaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                table.databaseName?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [searchQuery]);

    const aggregateMetrics = useMemo(() => {
        const totalSize = filteredTables.reduce((sum, t) => sum + t.totalSizeGB, 0);
        const totalRows = filteredTables.reduce((sum, t) => sum + t.rows, 0);

        return {
            totalSize,
            totalRows,
            totalTables: filteredTables.length,
        };
    }, [filteredTables]);

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar flex-shrink-0">
                <KPILabel label="Tables" value={aggregateMetrics.totalTables.toString()} />
                <KPILabel label="Total size" value={formatStorageSize(aggregateMetrics.totalSize)} />
                <KPILabel label="Total rows" value={aggregateMetrics.totalRows.toLocaleString()} />
            </div>

            <div className="bg-white rounded-[12px] border border-border-light shadow-sm flex flex-col min-h-0">
                <div className="px-4 py-3 flex items-center border-b border-border-light bg-white rounded-t-[12px] relative z-20 overflow-visible flex-shrink-0">
                    <h3 className="text-sm font-bold text-text-strong">Tables</h3>
                    <div className="relative flex-1 ml-4">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none pr-8 placeholder:text-text-muted w-full text-right"
                            placeholder="Search tables, schemas, or databases..."
                        />
                        <IconSearch className="w-4 h-4 text-text-muted absolute right-0 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[500px] no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#F8F9FA] sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light">Tables</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light">Databases</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light">Schemas</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light">Table types</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Size (GB)</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Time Travel</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Failsafe</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Retention days</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light text-right">Rows</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-border-light">
                            {filteredTables.length > 0 ? (
                                filteredTables.map((table, idx) => (
                                    <tr key={idx} className="hover:bg-surface-nested transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                                                {table.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-text-secondary">{table.databaseName}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-text-secondary">{table.schemaName}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-text-secondary">Permanent</td>
                                        <td className="px-6 py-4 text-sm text-right font-black text-primary">{formatStorageSize(table.totalSizeGB)}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-text-secondary">{formatStorageSize(table.timeTravelSizeGB)}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-text-secondary">{formatStorageSize(table.failSafeSizeGB)}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-text-muted">{table.retentionTimeDays}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium text-text-muted">{table.rows.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-text-muted italic">
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

export default TablesView;
