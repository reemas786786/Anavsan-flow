
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatabasesView from './DatabasesView';
import SchemasView from './SchemasView';
import TablesView from './TablesView';

interface ExplorerViewProps {
    onNavigate: (page: string, filters?: any) => void;
    filters?: any;
}

const ExplorerView: React.FC<ExplorerViewProps> = ({ 
    onNavigate,
    filters
}) => {
    const tabs = ['Databases', 'Schemas', 'Tables', 'Materialized Views', 'Tasks'] as const;
    type TabType = typeof tabs[number];
    
    // Determine initial tab based on filters
    const getInitialTab = (): TabType => {
        if (filters?.tableType) return 'Tables';
        if (filters?.schema) return 'Schemas';
        if (filters?.database) return 'Databases';
        return 'Databases';
    };

    const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
    const [selectedDb, setSelectedDb] = useState<string | null>(filters?.database || null);
    const [selectedSchema, setSelectedSchema] = useState<string | null>(filters?.schema || null);
    const [selectedTableType, setSelectedTableType] = useState<string | null>(filters?.tableType || null);

    // Sync state with filters prop changes
    React.useEffect(() => {
        if (filters) {
            if (filters.tableType) {
                setSelectedTableType(filters.tableType);
                setActiveTab('Tables');
            }
            if (filters.database) setSelectedDb(filters.database);
            if (filters.schema) setSelectedSchema(filters.schema);
            
            // If we have specific filters, we might want to switch tabs
            if (filters.schema) setActiveTab('Tables');
            else if (filters.database && !filters.tableType) setActiveTab('Schemas');
        }
    }, [filters]);

    // Reset filters when tab changes manually? 
    // Actually, maybe we want to keep them if they are relevant.
    
    const handleNavigateToSchemas = (dbName: string) => {
        setSelectedDb(dbName);
        setActiveTab('Schemas');
    };

    const handleNavigateToTables = (dbName: string, schemaName: string) => {
        setSelectedDb(dbName);
        setSelectedSchema(schemaName);
        setActiveTab('Tables');
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-surface-nested p-1 rounded-xl border border-border-light w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all relative ${
                            activeTab === tab 
                                ? 'text-primary' 
                                : 'text-text-muted hover:text-text-strong'
                        }`}
                    >
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeExplorerTab"
                                className="absolute inset-0 bg-white shadow-sm rounded-lg border border-border-light"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{tab}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 min-h-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {activeTab === 'Databases' && (
                            <DatabasesView onNavigateToSchemas={handleNavigateToSchemas} />
                        )}
                        {activeTab === 'Schemas' && (
                            <SchemasView 
                                initialDatabaseFilter={selectedDb} 
                                onNavigateToTables={handleNavigateToTables}
                            />
                        )}
                        {activeTab === 'Tables' && (
                            <TablesView 
                                initialTableTypeFilter={selectedTableType || "All types"}
                                initialDatabaseFilter={selectedDb || undefined}
                                initialSchemaFilter={selectedSchema || undefined}
                                forceTab="Tables"
                            />
                        )}
                        {activeTab === 'Materialized Views' && (
                            <TablesView 
                                initialDatabaseFilter={selectedDb || undefined}
                                forceTab="Materialized Views"
                            />
                        )}
                        {activeTab === 'Tasks' && (
                            <TablesView 
                                initialDatabaseFilter={selectedDb || undefined}
                                forceTab="Tasks"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ExplorerView;
