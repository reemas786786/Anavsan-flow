
import React, { useState, useRef, useEffect } from 'react';
import { AssignedQuery, User, AssignmentStatus, AssignmentPriority, CollaborationEntry, Recommendation } from '../types';
import { IconChevronLeft, IconChevronRight, IconClipboardCopy, IconCheck, IconAIAgent, IconUser, IconClock, IconRefresh, IconArrowUp, IconExclamationTriangle, IconChevronDown, IconLightbulb, IconDatabase } from '../constants';
import { RecommendationDetailView, SeverityBadge } from '../components/RecommendationDetailView';

interface AssignedQueryDetailViewProps {
    assignment: AssignedQuery;
    onBack: () => void;
    currentUser: User | null;
    onUpdateStatus: (id: string, status: AssignmentStatus, comment?: string) => void;
    onUpdatePriority: (id: string, priority: AssignmentPriority) => void;
    onAddComment: (id: string, comment: string) => void;
    onResolve: (id: string) => void;
    onReassign: (queryId: string) => void;
    recommendations?: Recommendation[];
}

const StatusBadge: React.FC<{ status: AssignmentStatus }> = ({ status }) => {
    const colorClasses: Record<AssignmentStatus, string> = {
        'Assigned': 'bg-blue-100 text-blue-700 border-blue-200',
        'In progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Optimized': 'bg-status-success-light text-status-success-dark border-status-success/20',
        'Cannot be optimized': 'bg-status-error-light text-status-error-dark border-status-error/20',
        'Needs clarification': 'bg-purple-100 text-purple-700 border-purple-200',
    };
     return <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-tight ${colorClasses[status]}`}>{status}</span>;
};

const UserAvatar: React.FC<{ name: string; size?: 'sm' | 'md' }> = ({ name, size = 'sm' }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-10 h-10 text-xs';
    return (
        <div className={`${sizeClasses} rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center flex-shrink-0 shadow-inner border border-white/50`}>
            {initials}
        </div>
    );
};

const AssignedQueryDetailView: React.FC<AssignedQueryDetailViewProps> = ({ 
    assignment, 
    onBack, 
    currentUser, 
    onUpdateStatus, 
    onUpdatePriority,
    onAddComment, 
    onResolve, 
    onReassign,
    recommendations = []
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<AssignmentStatus | null>(null);
    const [statusDescription, setStatusDescription] = useState('');
    
    const priorityMenuRef = useRef<HTMLDivElement>(null);
    
    const isFinOps = currentUser?.role === 'FinOps' || currentUser?.role === 'Admin';
    const isEngineer = currentUser?.role === 'DataEngineer';

    const recommendation = recommendations.find(r => r.id === assignment.recommendationId);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (priorityMenuRef.current && !priorityMenuRef.current.contains(event.target as Node)) {
                setIsPriorityMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(assignment.queryText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleStatusUpdateClick = (status: AssignmentStatus) => {
        if (status === 'Optimized' || status === 'Cannot be optimized' || status === 'Needs clarification') {
            setPendingStatus(status);
            setShowStatusModal(true);
        } else {
            onUpdateStatus(assignment.id, status);
        }
    };

    const handleConfirmStatusUpdate = () => {
        if (pendingStatus) {
            onUpdateStatus(assignment.id, pendingStatus, statusDescription);
            setShowStatusModal(false);
            setPendingStatus(null);
            setStatusDescription('');
        }
    };

    const priorityColors = {
        Low: 'bg-status-info-light text-status-info-dark border-status-info/20',
        Medium: 'bg-status-warning-light text-status-warning-dark border-status-warning/20',
        High: 'bg-status-error-light text-status-error-dark border-status-error/20',
    };

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">
            {/* Header */}
            <header className="flex-shrink-0 bg-white border-b border-border-light px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-surface-hover rounded-full transition-colors">
                        <IconChevronLeft className="h-6 w-6 text-text-secondary" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                             <h1 className="text-lg font-black text-text-primary">TASK-{assignment.queryId.substring(0,8).toUpperCase()}</h1>
                             <StatusBadge status={assignment.status} />
                             
                             {/* Priority Selector for FinOps, Static for Engineer */}
                             <div className="relative" ref={priorityMenuRef}>
                                <button 
                                    disabled={!isFinOps}
                                    onClick={() => setIsPriorityMenuOpen(!isPriorityMenuOpen)}
                                    className={`inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-tight transition-all ${priorityColors[assignment.priority]} ${isFinOps ? 'hover:ring-2 hover:ring-primary/20' : ''}`}
                                >
                                    {assignment.priority} Priority
                                    {isFinOps && <IconChevronDown className={`w-3 h-3 transition-transform ${isPriorityMenuOpen ? 'rotate-180' : ''}`} />}
                                </button>
                                {isPriorityMenuOpen && isFinOps && (
                                    <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-border-color py-1 z-30 animate-in fade-in slide-in-from-top-1">
                                        {(['Low', 'Medium', 'High'] as AssignmentPriority[]).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => { onUpdatePriority(assignment.id, p); setIsPriorityMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-surface-nested transition-colors ${assignment.priority === p ? 'text-primary' : 'text-text-secondary'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                             </div>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">Assigned by <span className="font-bold text-text-primary">{assignment.assignedBy}</span> • {new Date(assignment.assignedOn).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Engineer Specific Actions */}
                    {isEngineer && (assignment.status === 'Assigned' || assignment.status === 'Needs clarification') && (
                        <button 
                            onClick={() => handleStatusUpdateClick('In progress')}
                            className="bg-primary text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-primary-hover shadow-sm transition-all flex items-center gap-2"
                        >
                            <IconRefresh className="w-4 h-4" /> Start Optimization
                        </button>
                    )}
                    {isEngineer && assignment.status === 'In progress' && (
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => handleStatusUpdateClick('Optimized')}
                                className="bg-status-success text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-status-success-dark shadow-sm transition-all"
                            >
                                Mark Optimized
                            </button>
                            <button 
                                onClick={() => handleStatusUpdateClick('Cannot be optimized')}
                                className="bg-white text-text-secondary border border-border-color font-bold text-sm px-5 py-2 rounded-full hover:bg-surface-hover transition-all"
                            >
                                Cannot Optimize
                            </button>
                        </div>
                    )}
                    
                    {/* FinOps Specific Actions */}
                    {isFinOps && assignment.status === 'Optimized' && (
                        <button 
                            onClick={() => onResolve(assignment.id)}
                            className="bg-status-success text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-status-success-dark shadow-sm transition-all flex items-center gap-2"
                        >
                            <IconCheck className="w-4 h-4" /> Resolve Task
                        </button>
                    )}
                </div>

                {/* Tabs removed as per request */}
            </header>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Main Content Area: Unified View */}
                <div className="flex-1 overflow-y-auto p-8 bg-surface-nested no-scrollbar">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Left Column: Insight Details & Responses */}
                        <div className="xl:col-span-8 space-y-8">
                            {/* FinOps Instructions / Task Message */}
                            {assignment.message && (
                                <div className="bg-white p-8 rounded-[32px] border border-border-light shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <IconLightbulb className="w-16 h-16" />
                                    </div>
                                    <div className="flex items-center gap-3 text-primary mb-4">
                                        <IconUser className="w-5 h-5" />
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">FinOps Instructions</h4>
                                    </div>
                                    <p className="text-text-primary text-lg font-medium leading-relaxed relative z-10">
                                        {assignment.message}
                                    </p>
                                </div>
                            )}

                            {/* Engineer's Response (if it exists) */}
                            {assignment.engineerResponse && (
                                <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[32px] shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-700">
                                        <IconCheck className="w-16 h-16" />
                                    </div>
                                    <div className="flex items-center gap-3 text-indigo-700 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <IconUser className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Engineer's Response</h4>
                                    </div>
                                    <p className="text-indigo-900 text-[15px] font-semibold leading-relaxed italic relative z-10">
                                        "{assignment.engineerResponse}"
                                    </p>
                                </div>
                            )}

                            {/* Recommendation Details */}
                            {recommendation && (
                                <div className="bg-white rounded-[32px] border border-border-light shadow-sm overflow-hidden">
                                    <RecommendationDetailView 
                                        recommendation={recommendation} 
                                        currentUser={currentUser}
                                        hideHeader={true}
                                        hideMetadata={true}
                                        hideWarehouse={true}
                                        hideWorkflowStatus={true}
                                    />
                                </div>
                            )}

                            {/* SQL View - Removed as per request */}

                            {!recommendation && !assignment.message && (
                                <div className="bg-white p-8 rounded-[32px] border border-border-light shadow-sm">
                                    <div className="flex items-center gap-3 text-primary mb-4">
                                        <IconLightbulb className="w-5 h-5" />
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">Task Details</h4>
                                    </div>
                                    <p className="text-text-primary text-lg font-medium leading-relaxed">
                                        No additional recommendation details available for this task.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Middle Column: Metadata & Assignment Info */}
                        <div className="xl:col-span-4 space-y-6">
                            {/* Assignment Info Card */}
                            <div className="bg-white p-8 rounded-[32px] border border-border-light shadow-sm space-y-8">
                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border-light pb-4">Assignment Info</h4>
                                
                                <div className="space-y-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            Assigned To
                                        </span>
                                        <span className="text-sm font-black text-text-primary mt-1.5 leading-tight">{assignment.assignedTo}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            <IconClock className="w-3 h-3" />
                                            Assigned On
                                        </span>
                                        <span className="text-sm font-black text-text-primary mt-1.5 leading-tight">
                                            {new Date(assignment.assignedOn).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            Priority
                                        </span>
                                        <div className="mt-1.5">
                                            <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-tight ${priorityColors[assignment.priority]}`}>
                                                {assignment.priority} Priority
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            Status
                                        </span>
                                        <div className="mt-1.5">
                                            <StatusBadge status={assignment.status} />
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            Current Spend
                                        </span>
                                        <span className="text-sm font-black text-text-primary mt-1.5 leading-tight">{assignment.credits.toFixed(2)} cr</span>
                                    </div>
                                </div>
                            </div>

                            {/* Resource Metadata Card */}
                            <div className="bg-white p-8 rounded-[32px] border border-border-light shadow-sm space-y-8">
                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border-light pb-4">Resource Metadata</h4>
                                
                                <div className="space-y-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            <IconUser className="w-3 h-3" />
                                            User
                                        </span>
                                        <span className="text-sm font-black text-text-primary mt-1.5 leading-tight">{recommendation?.userName || 'jane_doe'}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            Account
                                        </span>
                                        <span className="text-sm font-black text-text-primary mt-1.5 leading-tight">{recommendation?.accountName || 'Finance Prod'}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            Resource Type
                                        </span>
                                        <span className="text-sm font-black text-text-primary mt-1.5 leading-tight">{recommendation?.resourceType || 'Query'}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            Severity
                                        </span>
                                        <div className="mt-1.5">
                                            <SeverityBadge severity={recommendation?.severity || 'High Cost'} />
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            Resource Identifier
                                        </span>
                                        <span className="text-xs font-mono font-bold text-text-primary mt-1.5 leading-tight break-all">{assignment.queryId}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            Warehouse
                                        </span>
                                        <span className="text-sm font-black text-text-primary mt-1.5 leading-tight">{assignment.warehouse}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            Estimated Effort
                                        </span>
                                        <span className="text-sm font-black text-text-primary mt-1.5 leading-tight">~30 mins</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl border border-border-light animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-text-strong tracking-tight mb-2">Update Task Status</h3>
                        <p className="text-sm text-text-secondary mb-6 font-medium">
                            You are marking this task as <span className="font-bold text-primary uppercase tracking-tight">{pendingStatus}</span>. 
                            Add an optional description for the FinOps team.
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Description (Optional)</label>
                                <textarea 
                                    value={statusDescription}
                                    onChange={(e) => setStatusDescription(e.target.value)}
                                    placeholder="e.g., Optimized query by adding filters and reducing scan size..."
                                    className="w-full bg-surface-nested border border-border-color rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[120px] no-scrollbar"
                                />
                            </div>
                            
                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setShowStatusModal(false)}
                                    className="flex-1 px-6 py-3 bg-white text-text-secondary border border-border-color font-bold text-sm rounded-full hover:bg-surface-hover transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmStatusUpdate}
                                    className="flex-1 px-6 py-3 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
                                >
                                    Confirm Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignedQueryDetailView;
