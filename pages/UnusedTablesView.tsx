
import React, { useState, useMemo } from 'react';
import { unusedTablesData } from '../data/dummyData';
import { formatStorageSize } from '../utils/storageMetrics';
import { IconSearch, IconInfo, IconChevronDown, IconSparkles } from '../constants';
import InfoTooltip from '../components/InfoTooltip';

const KPILabel: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-white px-5 py-2.5 rounded-full border border-border-light shadow-sm flex items-center gap-2 flex-shrink-0 transition-all hover:border-primary/30">
        <span className="text-[13px] text-text-secondary font-medium whitespace-nowrap">{label}:</span>
        <span className="text-[13px] font-black text-text-strong whitespace-nowrap">{value}</span>
    </div>
);

interface UnusedTablesViewProps {
    onNavigateToRecommendations?: (filters: { search?: string; account?: string }) => void;
    initialTableTypeFilter?: string | null;
}

const UnusedTablesView: React.FC<UnusedTablesViewProps> = ({ 
    onNavigateToRecommendations,
    initialTableTypeFilter
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDb, setSelectedDb] = useState('All databases');
    const [selectedSchema, setSelectedSchema] = useState('All schemas');
    const [selectedTableType, setSelectedTableType] = useState(initialTableTypeFilter || 'All types');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'sizeGB', direction: 'desc' });

    const dbOptions = useMemo(() => {
        const dbs = Array.from(new Set(unusedTablesData.map(t => t.database)));
        return ['All databases', ...dbs.sort()];
    }, []);

    const schemaOptions = useMemo(() => {
        const filteredByDb = selectedDb === 'All databases' 
            ? unusedTablesData 
            : unusedTablesData.filter(t => t.database === selectedDb);
        const schemas = Array.from(new Set(filteredByDb.map(t => t.schema)));
        return ['All schemas', ...schemas.sort()];
    }, [selectedDb]);

    const tableTypeOptions = ['All types', 'Permanent', 'Transient', 'Temporary', 'Hybrid', 'Dynamic'];

    const filteredAndSortedData = useMemo(() => {
        let result = [...unusedTablesData].filter(table => {
            const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                table.database.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                table.schema.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDb = selectedDb === 'All databases' || table.database === selectedDb;
            const matchesSchema = selectedSchema === 'All schemas' || table.schema === selectedSchema;
            const matchesType = selectedTableType === 'All types' || table.tableType === selectedTableType;
            
            return matchesSearch && matchesDb && matchesSchema && matchesType;
        });

        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof typeof a];
                const bValue = b[sortConfig.key as keyof typeof b];
                
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [searchTerm, selectedDb, selectedSchema, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig(prev => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'desc' };
        });
    };

    const totalPotentialSavings = unusedTablesData.reduce((sum, table) => sum + table.potentialSavings, 0);
    const totalUnusedStorage = unusedTablesData.reduce((sum, table) => sum + table.sizeGB, 0);

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <IconSparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-text-strong">Anavsan has identified tables inactive for over 15 days.</p>
                    <p className="text-xs text-text-secondary mt-0.5">Optimizing or deleting them can help reduce your storage usage and costs.</p>
                </div>
                <button 
                    onClick={() => onNavigateToRecommendations?.({ search: 'unused' })}
                    className="px-4 py-2 bg-primary text-white text-xs font-black rounded-full hover:bg-primary-hover transition-all shadow-sm"
                >
                    VIEW RECOMMENDATIONS
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar flex-shrink-0">
                <KPILabel label="Unused tables" value={unusedTablesData.length.toString()} />
                <KPILabel label="Total unused storage" value={formatStorageSize(totalUnusedStorage)} />
                <KPILabel label="Est. monthly savings" value={`$${totalPotentialSavings.toLocaleString()}`} />
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
                                    onChange={(e) => {
                                        setSelectedDb(e.target.value);
                                        setSelectedSchema('All schemas');
                                    }}
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

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-text-secondary">Type</span>
                            <div className="relative">
                                <select
                                    className="appearance-none pl-0 pr-6 py-1 bg-transparent text-xs font-bold text-text-strong focus:outline-none cursor-pointer"
                                    value={selectedTableType}
                                    onChange={(e) => setSelectedTableType(e.target.value)}
                                >
                                    {tableTypeOptions.map(opt => <option key={opt} value={opt}>{opt === 'All types' ? 'All' : opt}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                                    <IconChevronDown className="h-3 w-3 text-text-muted" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex-1 ml-4">
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none pr-8 placeholder:text-text-muted w-full text-right"
                            placeholder="Search tables..."
                        />
                        <IconSearch className="w-4 h-4 text-text-muted absolute right-0 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[500px] no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#F8F9FA] sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('name')}>Table name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('database')}>Database</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('schema')}>Schema</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('tableType')}>Table type</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light cursor-pointer hover:text-primary transition-colors text-right" onClick={() => handleSort('sizeGB')}>Size</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light cursor-pointer hover:text-primary transition-colors text-right" onClick={() => handleSort('rows')}>Rows</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light cursor-pointer hover:text-primary transition-colors text-right" onClick={() => handleSort('lastAccessed')}>Last used</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-text-muted border-b border-border-light cursor-pointer hover:text-primary transition-colors text-right" onClick={() => handleSort('unusedDays')}>Unused days</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-border-light">
                            {filteredAndSortedData.map((table) => (
                                <tr key={table.id} className="hover:bg-surface-nested transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-text-strong">{table.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-text-secondary">{table.database}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-text-primary">{table.schema}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-text-secondary">{table.tableType || 'Permanent'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-sm font-bold text-text-strong">
                                        {formatStorageSize(table.sizeGB)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-sm font-medium text-text-secondary">
                                        {table.rows.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium text-text-secondary">
                                        {new Date(table.lastAccessed).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-black text-primary">
                                        {table.unusedDays}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UnusedTablesView;
