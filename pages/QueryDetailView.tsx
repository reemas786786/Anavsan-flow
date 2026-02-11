
import React from 'react';
import { QueryListItem, AssignedQuery, User, AssignmentStatus } from '../types';
import { IconChevronLeft, IconClipboardCopy, IconCheck, IconAIAgent } from '../constants';

interface QueryDetailViewProps {
    query: QueryListItem;
    onBack: () => void;
    onAnalyzeQuery: (query: QueryListItem, source: string) => void;
    onOptimizeQuery: (query: QueryListItem, source: string) => void;
    onSimulateQuery: (query: QueryListItem, source: string) => void;
    sourcePage: string;
    assignment?: AssignedQuery;
    currentUser: User | null;
    onUpdateAssignmentStatus: (assignmentId: string, status: AssignmentStatus) => void;
    onAssignToEngineer: (query: QueryListItem) => void;
    onResolveAssignment: (assignmentId: string) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</p>
        <div className="text-sm font-black text-text-primary mt-1">{value}</div>
    </div>
);

const QueryDetailView: React.FC<QueryDetailViewProps> = ({ 
    query, 
    onBack, 
    onAnalyzeQuery, 
    onOptimizeQuery, 
    onSimulateQuery, 
    sourcePage,
    assignment,
    currentUser,
    onUpdateAssignmentStatus,
    onAssignToEngineer,
    onResolveAssignment
}) => {
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(query.queryText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const startTime = new Date(query.timestamp).toLocaleString();
    
    const isEngineer = currentUser?.role === 'DataEngineer';
    const isFinOps = currentUser?.role === 'FinOps' || currentUser?.role === 'Admin';
    const hasAssignment = !!assignment;

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-text-secondary hover:text-primary transition-all shadow-sm border border-border-light flex-shrink-0">
                        <IconChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-text-primary">Query Details</h1>
                        <div className="flex items-center gap-2 overflow-hidden">
                            <h2 className="text-xs font-bold text-text-muted truncate font-mono" title={query.id}>{query.id}</h2>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* FinOps specific actions */}
                    {isFinOps && !hasAssignment && (
                        <button 
                            onClick={() => onAssignToEngineer(query)}
                            className="text-sm font-bold text-white bg-primary hover:bg-primary-hover px-6 py-2.5 rounded-full shadow-sm transition-all"
                        >
                            Assign to engineer
                        </button>
                    )}

                    {isFinOps && hasAssignment && assignment.status === 'Optimized' && (
                         <button 
                            onClick={() => onResolveAssignment(assignment.id)}
                            className="text-sm font-bold text-white bg-status-success hover:bg-status-success-dark px-6 py-2.5 rounded-full shadow-sm transition-all"
                        >
                            Resolve query
                        </button>
                    )}

                    {isFinOps && hasAssignment && (assignment.status === 'Cannot be optimized' || assignment.status === 'Needs clarification') && (
                        <button 
                            onClick={() => onAssignToEngineer(query)}
                            className="text-sm font-bold text-text-primary bg-white border border-border-color hover:bg-surface-hover px-6 py-2.5 rounded-full shadow-sm transition-all"
                        >
                            Reassign
                        </button>
                    )}
                    
                    {/* Data Engineer specific actions */}
                    {isEngineer && hasAssignment && assignment.status === 'Assigned' && (
                        <button 
                            onClick={() => onUpdateAssignmentStatus(assignment.id, 'In progress')}
                            className="text-sm font-bold text-white bg-primary hover:bg-primary-hover px-6 py-2.5 rounded-full shadow-sm transition-all"
                        >
                            Start optimization
                        </button>
                    )}

                    {isEngineer && hasAssignment && assignment.status === 'In progress' && (
                        <div className="flex gap-2">
                             <button 
                                onClick={() => onUpdateAssignmentStatus(assignment.id, 'Optimized')}
                                className="text-sm font-bold text-white bg-status-success hover:bg-status-success-dark px-4 py-2.5 rounded-full shadow-sm"
                            >
                                Mark as optimized
                            </button>
                            <button 
                                onClick={() => onUpdateAssignmentStatus(assignment.id, 'Cannot be optimized')}
                                className="text-sm font-bold text-text-secondary bg-white border border-border-color hover:bg-surface-hover px-4 py-2.5 rounded-full shadow-sm"
                            >
                                Cannot be optimized
                            </button>
                             <button 
                                onClick={() => onUpdateAssignmentStatus(assignment.id, 'Needs clarification')}
                                className="text-sm font-bold text-text-secondary bg-white border border-border-color hover:bg-surface-hover px-4 py-2.5 rounded-full shadow-sm"
                            >
                                Needs clarification
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mandatory Assignment Banner - Hidden for FinOps/Admin roles as they are the assigners */}
            {hasAssignment && !isFinOps && (
                <div className="bg-primary/5 border border-primary/20 px-4 py-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <IconAIAgent className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold text-text-strong">
                            This query was assigned by <span className="text-primary">{assignment.assignedBy}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Assignment status</span>
                            <span className="text-xs font-black text-primary uppercase">{assignment.status}</span>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
                        <h3 className="text-xs font-bold text-text-strong uppercase tracking-widest mb-6">Performance analysis</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8">
                            <DetailItem label="Duration" value={query.duration} />
                            <DetailItem label="Credits" value={query.costCredits.toFixed(3)} />
                            <DetailItem label="Data Scanned" value={formatBytes(query.bytesScanned)} />
                            <DetailItem label="Data Written" value={formatBytes(query.bytesWritten)} />
                            <DetailItem label="Warehouse" value={query.warehouse} />
                            <DetailItem label="Executed on" value={startTime} />
                            <DetailItem label="User" value={query.user} />
                            {/* Updated severity display to handle 'Critical' */}
                            <DetailItem label="Severity" value={<span className={`text-[11px] font-black uppercase ${query.severity === 'High' || query.severity === 'Critical' ? 'text-status-error' : 'text-status-warning'}`}>{query.severity}</span>} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm flex flex-col min-h-[300px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-text-strong uppercase tracking-widest">SQL Source</h3>
                            <button onClick={handleCopy} className="text-text-secondary hover:text-primary flex items-center gap-2 text-xs font-bold">
                                {isCopied ? <IconCheck className="h-4 w-4 text-status-success" /> : <IconClipboardCopy className="h-4 w-4" />}
                                {isCopied ? 'Copied' : 'Copy SQL'}
                            </button>
                        </div>
                        <div className="flex-grow bg-surface-nested p-4 rounded-xl border border-border-light">
                             <pre className="text-[12px] font-mono text-text-primary leading-relaxed whitespace-pre-wrap">
                                <code>{query.queryText}</code>
                            </pre>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                     {hasAssignment && assignment.message && (
                        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
                            <h3 className="text-xs font-bold text-text-strong uppercase tracking-widest mb-4">Instructions</h3>
                            <p className="text-sm text-text-secondary italic leading-relaxed">
                                "{assignment.message}"
                            </p>
                        </div>
                    )}
                    
                    {hasAssignment && assignment.engineerResponse && (
                        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
                            <h3 className="text-xs font-bold text-text-strong uppercase tracking-widest mb-4">Engineer response</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {assignment.engineerResponse}
                            </p>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm space-y-4">
                         <h3 className="text-xs font-bold text-text-strong uppercase tracking-widest mb-2">Tools</h3>
                         <button onClick={() => onAnalyzeQuery(query, sourcePage)} className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-surface-nested transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <IconAIAgent className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-text-primary">Analyzer</span>
                         </button>
                         <button onClick={() => onOptimizeQuery(query, sourcePage)} className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-surface-nested transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <IconAIAgent className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-text-primary">Optimizer</span>
                         </button>
                         <button onClick={() => onSimulateQuery(query, sourcePage)} className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-surface-nested transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <IconAIAgent className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-text-primary">Simulator</span>
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueryDetailView;
