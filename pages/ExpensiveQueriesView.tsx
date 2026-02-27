
import React, { useState, useMemo } from 'react';
import { queryListData } from '../data/dummyData';
import { QueryListItem } from '../types';
import { IconSearch, IconChevronDown, IconChevronLeft, IconChevronRight } from '../constants';

interface ExpensiveQueriesViewProps {
    onSelectQuery: (query: QueryListItem) => void;
}

const ExpensiveQueriesView: React.FC<ExpensiveQueriesViewProps> = ({ onSelectQuery }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const filteredData = useMemo(() => {
        return [...queryListData]
            .filter(q => 
                q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.queryText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => b.costCredits - a.costCredits);
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="flex flex-col h-full bg-background space-y-4 px-4 pt-4 pb-12">
            <div className="flex-shrink-0">
                <h1 className="text-[28px] font-bold text-text-strong tracking-tight">Expensive Queries</h1>
                <p className="text-sm text-text-secondary font-medium mt-1">Individual query executions ranked by credit consumption.</p>
            </div>

            <div className="bg-white rounded-2xl flex flex-col flex-grow min-h-0 shadow-sm border border-border-light overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b border-border-light bg-white">
                    <div className="relative flex-1 max-w-md">
                        <IconSearch className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-surface-nested border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Search by ID, SQL, user or warehouse..."
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-grow min-h-0 no-scrollbar">
                    <table className="w-full text-[13px] border-separate border-spacing-0">
                        <thead className="text-[11px] text-text-secondary uppercase font-bold sticky top-0 z-10 bg-white border-b border-border-light">
                            <tr>
                                <th className="px-6 py-4 text-left border-b border-border-light">Query ID</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">SQL Text</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">User</th>
                                <th className="px-6 py-4 text-left border-b border-border-light">Warehouse</th>
                                <th className="px-6 py-4 text-right border-b border-border-light">Credits</th>
                                <th className="px-6 py-4 text-right border-b border-border-light">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {paginatedData.map((query) => (
                                <tr key={query.id} className="group hover:bg-surface-hover transition-colors">
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => onSelectQuery(query)}
                                            className="text-link font-mono font-bold hover:underline"
                                        >
                                            {query.id}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 max-w-[300px]">
                                        <div className="truncate font-mono text-[11px] text-text-secondary" title={query.queryText}>
                                            {query.queryText}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary font-medium">{query.user}</td>
                                    <td className="px-6 py-4 text-text-secondary font-medium">{query.warehouse}</td>
                                    <td className="px-6 py-4 text-right font-black text-primary">{query.costCredits.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-text-muted font-medium">{query.duration}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-3 flex items-center justify-between bg-white border-t border-border-light text-[11px] font-medium text-text-secondary">
                    <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} queries</span>
                    <div className="flex items-center gap-4">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-1 rounded hover:bg-surface-hover disabled:opacity-30"
                        >
                            <IconChevronLeft className="w-4 h-4" />
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-1 rounded hover:bg-surface-hover disabled:opacity-30"
                        >
                            <IconChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpensiveQueriesView;
