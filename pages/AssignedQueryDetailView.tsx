
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AssignedQuery, User, AssignmentStatus, AssignmentPriority, CollaborationEntry, Recommendation } from '../types';
import { IconChevronLeft, IconChevronRight, IconClipboardCopy, IconCheck, IconAIAgent, IconUser, IconClock, IconRefresh, IconArrowUp, IconExclamationTriangle, IconChevronDown, IconLightbulb, IconDatabase, IconWand, IconInfo, IconEdit, IconDelete, IconDotsVertical } from '../constants';
import { RecommendationDetailView, SeverityBadge } from '../components/RecommendationDetailView';

interface AssignedQueryDetailViewProps {
    assignment: AssignedQuery;
    onBack: () => void;
    currentUser: User | null;
    onUpdateStatus: (id: string, status: AssignmentStatus, comment?: string) => void;
    onUpdatePriority: (id: string, priority: AssignmentPriority) => void;
    onAddComment: (id: string, comment: string) => void;
    onResolve: (id: string) => void;
    onSaveGeneratedPrompt?: (id: string, prompt: string) => void;
    onReassign: (queryId: string) => void;
    onNavigateToQuery?: (query: any) => void;
    onNavigateToWarehouse?: (warehouse: any) => void;
    recommendations?: Recommendation[];
}

const StatusBadge: React.FC<{ status: AssignmentStatus }> = ({ status }) => {
    const colorClasses: Record<AssignmentStatus, string> = {
        'Assigned': 'bg-blue-100 text-blue-700 border-blue-200',
        'In progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Optimized': 'bg-status-success-light text-status-success-dark border-status-success/20',
        'Cannot be optimized': 'bg-status-error-light text-status-error-dark border-status-error/20',
        'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
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
    onSaveGeneratedPrompt,
    onReassign,
    onNavigateToQuery,
    onNavigateToWarehouse,
    recommendations = []
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<AssignmentStatus | null>(null);
    const [statusDescription, setStatusDescription] = useState('');
    const [isPromptExpanded, setIsPromptExpanded] = useState(
        assignment.status !== 'Optimized' && assignment.status !== 'Resolved' && !!assignment.generatedPrompt
    );
    
    const isPromptGenerated = !!assignment.generatedPrompt;
    
    const actionsMenuRef = useRef<HTMLDivElement>(null);
    
    const isFinOps = currentUser?.role === 'FinOps' || currentUser?.role === 'Admin';
    const isEngineer = currentUser?.role === 'DataEngineer';

    useEffect(() => {
        if (assignment.status === 'Optimized' || assignment.status === 'Resolved') {
            setIsPromptExpanded(false);
        }
    }, [assignment.status]);

    const recommendation = recommendations.find(r => r.id === assignment.recommendationId);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
                setIsActionsMenuOpen(false);
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

    const handleStatusUpdateClick = (status?: AssignmentStatus) => {
        setPendingStatus(status || null);
        setShowStatusModal(true);
        setStatusDescription('');
    };

    const [showCortexPrompt, setShowCortexPrompt] = useState(false);
    const [isPromptCopied, setIsPromptCopied] = useState(false);

    const handleGeneratePrompt = () => {
        if (!recommendation) return;
        const prompt = recommendation ? `Optimize the following Snowflake query based on this recommendation: "${recommendation.message}". Suggestion: "${recommendation.suggestion}". \n\nQuery:\n${recommendation.metrics?.queryText || assignment.queryText.substring(0, 100) + '...'}` : `Optimize the following Snowflake query: \n\nQuery:\n${assignment.queryText.substring(0, 100) + '...'}`;
        onSaveGeneratedPrompt?.(assignment.id, prompt);
        setIsPromptExpanded(true);
    };

    const handleCopyPrompt = () => {
        if (!recommendation && !assignment.generatedPrompt) return;
        const prompt = assignment.generatedPrompt || (recommendation ? `Optimize the following Snowflake query based on this recommendation: "${recommendation.message}". Suggestion: "${recommendation.suggestion}". \n\nQuery:\n${recommendation.metrics?.queryText || assignment.queryText}` : assignment.queryText);
        navigator.clipboard.writeText(prompt);
        setIsPromptCopied(true);
        setTimeout(() => setIsPromptCopied(false), 2000);
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
            <header className="flex-shrink-0 bg-background border-b border-border-light px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-surface-hover rounded-full transition-colors">
                        <IconChevronLeft className="h-6 w-6 text-text-secondary" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                             <h1 className="text-lg font-black text-text-primary">TASK-{assignment.queryId.substring(0,8).toUpperCase()}</h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* FinOps Specific Actions */}
                    {isFinOps && (
                        <div className="flex items-center gap-2">
                            {assignment.status === 'Optimized' && (
                                <button 
                                    onClick={() => onResolve(assignment.id)}
                                    className="bg-status-success text-white font-bold text-sm px-5 py-2 rounded-full hover:bg-status-success-dark shadow-sm transition-all flex items-center gap-2"
                                >
                                    <IconCheck className="w-4 h-4" /> Resolve Task
                                </button>
                            )}
                            
                            <div className="relative" ref={actionsMenuRef}>
                                <button 
                                    onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                                    className="p-2 hover:bg-surface-hover rounded-full transition-colors text-text-secondary"
                                    title="More Actions"
                                >
                                    <IconEdit className="w-5 h-5" />
                                </button>
                                
                                {isActionsMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-border-color py-2 z-30 animate-in fade-in slide-in-from-top-1">
                                        <div className="px-4 py-2 border-b border-border-light mb-1">
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Update Priority</span>
                                        </div>
                                        {(['Low', 'Medium', 'High'] as AssignmentPriority[]).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => { onUpdatePriority(assignment.id, p); setIsActionsMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-surface-nested transition-colors flex items-center justify-between ${assignment.priority === p ? 'text-primary bg-primary/5' : 'text-text-secondary'}`}
                                            >
                                                {p}
                                                {assignment.priority === p && <IconCheck className="w-3 h-3" />}
                                            </button>
                                        ))}
                                        
                                        <div className="my-2 border-t border-border-light"></div>
                                        
                                        <button
                                            onClick={() => { onResolve(assignment.id); setIsActionsMenuOpen(false); }}
                                            className="w-full text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-status-error hover:bg-status-error-light/10 transition-colors flex items-center gap-2"
                                        >
                                            <IconDelete className="w-4 h-4" />
                                            Remove Assignment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs removed as per request */}
            </header>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Main Content Area: Unified View */}
                <div className="flex-1 overflow-y-auto p-4 bg-surface-nested no-scrollbar">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4">
                        {/* Left Column: Story of the Fix (Unified Large Card) */}
                        <div className="xl:col-span-8">
                            <div className="bg-white rounded-[32px] border border-border-light shadow-sm overflow-hidden">
                                <div className="p-4 relative">
                                    {/* The vertical line */}
                                    <div className="absolute left-[47px] top-12 bottom-12 w-0.5 bg-border-color z-0" />
                                    
                                    <div className="flex flex-col gap-0">
                                        {/* Step 1: AI Detection */}
                                        {recommendation && (
                                            <div className="flex gap-6 relative pb-8">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-sm">
                                                    <IconAIAgent className="w-4 h-4" />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-text-muted">Step 1: Anavsan AI Detection</h4>
                                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                                            {new Date(recommendation.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-purple-100 text-purple-700 border border-purple-200">
                                                                {recommendation.insightType}
                                                            </span>
                                                            <h5 className="text-sm font-black text-text-strong">AI Diagnostic</h5>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <p className="text-text-primary text-[15px] font-semibold leading-relaxed">
                                                                {recommendation.message}
                                                            </p>
                                                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                                                <p className="text-text-secondary text-[13px] font-medium leading-relaxed italic">
                                                                    <span className="text-primary font-black not-italic mr-1.5">Suggestion:</span>
                                                                    "{recommendation.suggestion || 'Implement recommended configuration changes to improve performance and reduce cost.'}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2: FinOps Assignment */}
                                        {assignment.message && (
                                            <div className="flex gap-6 relative pb-8">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-sm">
                                                    <IconUser className="w-4 h-4" />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-text-muted">Step 2: FinOps Assignment</h4>
                                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                                            {new Date(assignment.assignedOn).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <h5 className="text-sm font-black text-text-strong flex items-center gap-2">
                                                            Instructions from {assignment.assignedBy}
                                                        </h5>
                                                        <p className="text-text-primary text-[15px] font-medium leading-relaxed">
                                                            {assignment.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 3: Generate Prompt */}
                                        {( (isEngineer && assignment.status !== 'Optimized' && assignment.status !== 'Resolved') || isPromptGenerated ) && (
                                            <div className="flex gap-6 relative pb-8">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-sm">
                                                    <IconWand className="w-4 h-4" />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-text-muted">Step 3: Optimization Flow</h4>
                                                    </div>
                                                    
                                                    {!isPromptGenerated ? (
                                                        <div className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100/50 flex flex-col items-center justify-center gap-4">
                                                            <p className="text-sm text-indigo-900/60 font-medium text-center">
                                                                Generate a specialized prompt to optimize this query using Snowflake Cortex AI.
                                                            </p>
                                                            <button 
                                                                onClick={handleGeneratePrompt}
                                                                className="px-8 py-3 bg-indigo-600 text-white font-bold text-sm rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
                                                            >
                                                                <IconWand className="w-4 h-4" />
                                                                Generate Prompt
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {/* Prompt Ready Banner */}
                                                            <div className="bg-[#F3F0FF] border border-[#E9E2FF] rounded-xl p-4 flex items-center justify-between shadow-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                                                        <IconAIAgent className="w-4 h-4" />
                                                                    </div>
                                                                    <span className="text-[13px] font-bold text-indigo-900">
                                                                        Optimization blueprint generated via Snowflake Cortex.
                                                                    </span>
                                                                </div>
                                                                <button 
                                                                    onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                                                                    className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
                                                                >
                                                                    {isPromptExpanded ? 'Hide prompt' : 'View prompt'}
                                                                    {isPromptExpanded ? <IconArrowUp className="w-3.5 h-3.5" /> : <IconChevronDown className="w-3.5 h-3.5" />}
                                                                </button>
                                                            </div>

                                                            <AnimatePresence>
                                                                {isPromptExpanded && (
                                                                    <motion.div 
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-4 mt-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-2.5 text-indigo-700">
                                                                                    <IconWand className="w-3.5 h-3.5" />
                                                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Cortex AI Prompt</h4>
                                                                                </div>
                                                                                <button 
                                                                                    onClick={handleCopyPrompt}
                                                                                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[9px] font-black transition-all shadow-sm uppercase tracking-widest ${
                                                                                        isPromptCopied 
                                                                                        ? 'bg-emerald-500 text-white border-emerald-500' 
                                                                                        : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-600 hover:text-white'
                                                                                    }`}
                                                                                >
                                                                                    {isPromptCopied ? <IconCheck className="w-3 h-3" /> : <IconClipboardCopy className="w-3 h-3" />}
                                                                                    {isPromptCopied ? 'Copied' : 'Copy Prompt'}
                                                                                </button>
                                                                            </div>
                                                                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-indigo-100 text-xs text-indigo-900/70 leading-relaxed font-mono italic whitespace-pre-wrap">
                                                                                {assignment.generatedPrompt}
                                                                            </div>
                                                                            <div className="flex items-start gap-2 text-[9px] text-indigo-500 font-bold uppercase tracking-wider leading-tight">
                                                                                <IconInfo className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                                                                <span>Copy this prompt and paste it into Snowflake Cortex to generate optimized code instantly.</span>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>

                                                            {assignment.status !== 'Optimized' && assignment.status !== 'Resolved' && (
                                                                <div className="flex justify-end pt-2">
                                                                    <button 
                                                                        onClick={() => handleStatusUpdateClick('Optimized')}
                                                                        className="px-8 py-3 bg-emerald-600 text-white font-bold text-sm rounded-full hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 active:scale-95"
                                                                    >
                                                                        <IconCheck className="w-4 h-4" />
                                                                        Update task status
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 4: Engineer Response */}
                                        {assignment.engineerResponse && (
                                            <div className="flex gap-6 relative">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-sm">
                                                    <IconCheck className="w-4 h-4" />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-text-muted">Step 4: Engineer Response</h4>
                                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                                            {assignment.engineerResponseDate ? new Date(assignment.engineerResponseDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="bg-emerald-50/30 p-5 rounded-2xl relative overflow-hidden group border border-emerald-100">
                                                        <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                                            <IconUser className="w-16 h-16 text-emerald-700" />
                                                        </div>
                                                        <div className="flex flex-col gap-2 relative z-10">
                                                            <p className="text-emerald-900 text-[15px] font-semibold leading-relaxed italic">
                                                                "{assignment.engineerResponse}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!recommendation && !assignment.message && !assignment.engineerResponse && (
                                            <div className="py-8 text-center">
                                                <p className="text-text-muted font-medium">No activity history available for this task.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Column: Metadata & Assignment Info */}
                        <div className="xl:col-span-4 space-y-6">
                            {/* Assignment Info Card */}
                            <div className="bg-white p-4 rounded-[24px] border border-border-light shadow-sm space-y-4">
                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border-light pb-4">Assignment Info</h4>
                                
                                <div className="space-y-4">
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
                                        <div className="mt-1.5 flex items-center justify-between">
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
                                        <span className="text-sm font-black text-text-primary mt-1.5 leading-tight">{recommendation?.userName || 'mike_de'}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            Account
                                        </span>
                                        <span className="text-sm font-black text-text-primary mt-1.5 leading-tight">{recommendation?.accountName || 'Account B'}</span>
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
                                            <SeverityBadge severity={recommendation?.severity || 'High'} />
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            Resource Identifier
                                        </span>
                                        <button 
                                            onClick={() => onNavigateToQuery?.({ id: assignment.queryId })}
                                            className="text-sm font-black text-primary mt-1.5 leading-tight hover:underline text-left"
                                        >
                                            {assignment.queryId}
                                        </button>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                            Warehouse
                                        </span>
                                        <button 
                                            onClick={() => onNavigateToWarehouse?.({ name: assignment.warehouse })}
                                            className="text-sm font-black text-primary mt-1.5 leading-tight hover:underline text-left"
                                        >
                                            {assignment.warehouse}
                                        </button>
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
                            Select the new status for this task and provide details if required.
                        </p>
                        
                        <div className="space-y-6">
                            {/* Status Selection */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Select Status</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {(['In progress', 'Optimized', 'Cannot be optimized'] as AssignmentStatus[]).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setPendingStatus(status)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all ${
                                                pendingStatus === status 
                                                ? 'border-primary bg-primary/5 text-primary' 
                                                : 'border-border-color bg-surface-nested text-text-secondary hover:border-border-strong'
                                            }`}
                                        >
                                            <span className="text-sm font-bold">{status}</span>
                                            {pendingStatus === status && <IconCheck className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Conditional Message Input */}
                            {(pendingStatus === 'Optimized' || pendingStatus === 'Cannot be optimized') && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 block">Update Message (Required)</label>
                                    <textarea 
                                        value={statusDescription}
                                        onChange={(e) => setStatusDescription(e.target.value)}
                                        placeholder={pendingStatus === 'Optimized' ? "Describe the optimizations implemented..." : "Explain why this query cannot be optimized..."}
                                        className="w-full bg-surface-nested border border-border-color rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[120px] no-scrollbar"
                                    />
                                </div>
                            )}
                            
                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setShowStatusModal(false)}
                                    className="flex-1 px-6 py-3 bg-white text-text-secondary border border-border-color font-bold text-sm rounded-full hover:bg-surface-hover transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmStatusUpdate}
                                    disabled={!pendingStatus || ((pendingStatus === 'Optimized' || pendingStatus === 'Cannot be optimized') && !statusDescription.trim())}
                                    className="flex-1 px-6 py-3 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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
