
import React, { useState, useRef, useEffect } from 'react';
import { AssignedQuery, User, AssignmentStatus, AssignmentPriority, CollaborationEntry } from '../types';
import { IconChevronLeft, IconChevronRight, IconClipboardCopy, IconCheck, IconAIAgent, IconUser, IconClock, IconRefresh, IconArrowUp, IconExclamationTriangle, IconChevronDown } from '../constants';

interface AssignedQueryDetailViewProps {
    assignment: AssignedQuery;
    onBack: () => void;
    currentUser: User | null;
    onUpdateStatus: (id: string, status: AssignmentStatus, comment?: string) => void;
    onUpdatePriority: (id: string, priority: AssignmentPriority) => void;
    onAddComment: (id: string, comment: string) => void;
    onResolve: (id: string) => void;
    onReassign: (queryId: string) => void;
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
    onReassign 
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const [commentInput, setCommentInput] = useState('');
    const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
    const feedEndRef = useRef<HTMLDivElement>(null);
    const priorityMenuRef = useRef<HTMLDivElement>(null);
    
    const isFinOps = currentUser?.role === 'FinOps' || currentUser?.role === 'Admin';
    const isEngineer = currentUser?.role === 'DataEngineer';

    useEffect(() => {
        feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [assignment.history]);

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

    const handleSendComment = () => {
        if (!commentInput.trim()) return;
        onAddComment(assignment.id, commentInput);
        setCommentInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendComment();
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
                            onClick={() => onUpdateStatus(assignment.id, 'In progress')}
                            className="bg-primary text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-primary-hover shadow-sm transition-all flex items-center gap-2"
                        >
                            <IconRefresh className="w-4 h-4" /> Start Optimization
                        </button>
                    )}
                    {isEngineer && assignment.status === 'In progress' && (
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => onUpdateStatus(assignment.id, 'Optimized')}
                                className="bg-status-success text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-status-success-dark shadow-sm transition-all"
                            >
                                Mark Optimized
                            </button>
                            <button 
                                onClick={() => onUpdateStatus(assignment.id, 'Cannot be optimized')}
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
            </header>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Left Panel: Collaboration Chat */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scroll-smooth no-scrollbar bg-surface-nested">
                        <div className="max-w-3xl mx-auto space-y-10 relative">
                             {/* Context Banner */}
                            <div className="bg-white p-6 rounded-[20px] border border-border-light shadow-sm italic">
                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-2 not-italic">Initial Context</h4>
                                <p className="text-sm text-text-primary leading-relaxed">
                                    "{assignment.message}"
                                </p>
                            </div>

                            {/* Line connector */}
                             <div className="absolute left-3 top-24 bottom-4 w-px bg-border-light z-0"></div>

                            {assignment.history.map((entry) => {
                                const isOwnComment = entry.author === currentUser?.name;
                                if (entry.type === 'system') {
                                    return (
                                        <div key={entry.id} className="relative z-10 flex justify-center">
                                            <span className="px-4 py-1.5 bg-white rounded-full border border-border-light text-[10px] font-black text-text-muted uppercase tracking-widest shadow-sm">
                                                {entry.content}
                                            </span>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={entry.id} className={`flex gap-4 relative z-10 ${isOwnComment ? 'flex-row-reverse' : ''}`}>
                                        <UserAvatar name={entry.author} />
                                        <div className={`flex flex-col max-w-[80%] ${isOwnComment ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                <span className="text-[11px] font-black text-text-strong uppercase tracking-tight">{entry.author}</span>
                                                <span className="text-[9px] font-bold text-text-muted">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm border ${
                                                isOwnComment 
                                                ? 'bg-primary text-white border-primary rounded-tr-none' 
                                                : 'bg-white text-text-primary border-border-color rounded-tl-none'
                                            }`}>
                                                {entry.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={feedEndRef} />
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="flex-shrink-0 p-6 bg-white border-t border-border-light">
                        <div className="max-w-3xl mx-auto flex items-center gap-4 bg-surface-nested border border-border-color p-2 rounded-[32px] focus-within:ring-2 focus-within:ring-primary transition-all">
                            <textarea 
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={isEngineer ? "Message FinOps team..." : "Message the Data Engineer..."}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-4 resize-none h-[48px] max-h-[120px] no-scrollbar"
                                rows={1}
                            />
                            <button 
                                onClick={handleSendComment}
                                disabled={!commentInput.trim()}
                                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover disabled:bg-gray-200 disabled:text-text-muted transition-all"
                            >
                                <IconArrowUp className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Task Details & Resource Metadata */}
                <aside className="w-full lg:w-[480px] flex-shrink-0 bg-white border-l border-border-light overflow-y-auto p-8 space-y-8 no-scrollbar">
                    {/* SQL View */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black text-text-strong uppercase tracking-widest">Query Source</h3>
                            <button onClick={handleCopy} className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-tighter">
                                {isCopied ? <IconCheck className="w-3 h-3" /> : <IconClipboardCopy className="w-3 h-3" />}
                                {isCopied ? 'COPIED' : 'COPY SQL'}
                            </button>
                        </div>
                        <div className="bg-[#0D1117] p-6 rounded-[24px] border border-white/5 shadow-2xl overflow-hidden">
                            <pre className="text-[12px] font-mono text-gray-300 leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                                <code>{assignment.queryText}</code>
                            </pre>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-y-8 pt-8 border-t border-border-light">
                        <div>
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Warehouse</p>
                             <p className="text-sm font-black text-text-primary mt-1.5">{assignment.warehouse}</p>
                        </div>
                        <div>
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Current Spend</p>
                             <p className="text-sm font-black text-text-primary mt-1.5">{assignment.credits.toFixed(2)} cr</p>
                        </div>
                        <div>
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Assigned To</p>
                             <p className="text-sm font-black text-text-primary mt-1.5">{assignment.assignedTo}</p>
                        </div>
                        <div>
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Estimated Effort</p>
                             <p className="text-sm font-black text-text-primary mt-1.5">~30 mins</p>
                        </div>
                    </div>

                    {/* AI Optimization Suggestions - Visual Boost */}
                    <div className="bg-primary/5 border border-primary/10 p-6 rounded-[32px] space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <IconAIAgent className="w-5 h-5" />
                            <h4 className="text-[11px] font-black uppercase tracking-[0.15em]">AI Optimization Roadmap</h4>
                        </div>
                        <ul className="space-y-4">
                            <li className="text-[13px] text-text-primary font-medium flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 shadow-sm">1</div>
                                <span>Inject <strong>PARTITION_BY</strong> filters into the innermost CTE to eliminate redundant data scans.</span>
                            </li>
                            <li className="text-[13px] text-text-primary font-medium flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 shadow-sm">2</div>
                                <span>Convert high-cardinality <strong>COUNT(DISTINCT)</strong> into <strong>APPROX_COUNT_DISTINCT</strong> for 90% faster estimation.</span>
                            </li>
                            <li className="text-[13px] text-text-primary font-medium flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 shadow-sm">3</div>
                                <span>Refactor nested subqueries to use <strong>WINDOW</strong> functions to prevent multiple passes over table storage.</span>
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AssignedQueryDetailView;
