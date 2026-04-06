
import React, { useState } from 'react';
import { Recommendation, SeverityImpact, RecommendationStatus, User, QueryListItem, Warehouse } from '../types';
import { IconChevronLeft, IconWand, IconUser, IconDatabase, IconClock, IconClipboardCopy, IconCheck, IconInfo } from '../constants';

export const SeverityBadge: React.FC<{ severity: SeverityImpact }> = ({ severity }) => {
    const colorClasses: Record<SeverityImpact, string> = {
        'High': 'bg-red-50 text-red-700 border-red-200',
        'High Cost': 'bg-red-50 text-red-700 border-red-200',
        'Medium': 'bg-amber-50 text-amber-800 border-amber-200',
        'Low': 'bg-slate-50 text-slate-700 border-slate-200',
        'Cost Saving': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Performance Boost': 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider ${colorClasses[severity] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
            {severity}
        </span>
    );
};

export const StatusBadge: React.FC<{ status: RecommendationStatus }> = ({ status }) => {
    const colorClasses: Record<RecommendationStatus, string> = {
        'New': 'bg-blue-50 text-blue-700 border-blue-200',
        'Read': 'bg-slate-50 text-slate-600 border-slate-200',
        'In Progress': 'bg-amber-50 text-amber-800 border-amber-200',
        'Pending': 'bg-orange-50 text-orange-700 border-orange-200',
        'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-300',
        'Archived': 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider ${colorClasses[status]}`}>
            {status}
        </span>
    );
};

export const QueryCodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const lines = code.split('\n');
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-white p-6 rounded-[24px] border border-border-light shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-text-strong">Query text</h4>
            </div>
            <div className="bg-[#F8F9FB] rounded-2xl border border-border-light overflow-hidden relative group">
                <button 
                    onClick={handleCopy}
                    className="absolute top-4 right-4 px-3 py-1.5 bg-white border border-border-light rounded-lg text-xs font-bold text-text-secondary hover:text-primary transition-all shadow-sm z-20"
                    title="Copy to clipboard"
                >
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
                <div className="flex">
                    <div className="bg-slate-50/50 border-r border-border-light px-4 py-6 text-right select-none min-w-[50px]">
                        {lines.map((_, i) => (
                            <div key={i} className="text-[12px] font-mono text-text-muted leading-6">
                                {i + 1}
                            </div>
                        ))}
                    </div>
                    <div className="p-6 overflow-x-auto flex-grow max-h-[600px]">
                        <pre className="text-[14px] font-mono text-text-primary leading-relaxed whitespace-pre">
                            <code>{code}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface RecommendationDetailViewProps {
    recommendation: Recommendation;
    onBack?: () => void;
    onUpdateStatus?: (id: string, status: RecommendationStatus) => void;
    onAssign?: (rec: Recommendation) => void;
    onOptimize?: (rec: Recommendation) => void;
    onNavigateToQuery?: (query: Partial<QueryListItem>) => void;
    onNavigateToWarehouse?: (warehouse: Partial<Warehouse>) => void;
    currentUser: User | null;
    onBackToSource?: () => void;
    returnContext?: any;
    hideHeader?: boolean;
    hideMetadata?: boolean;
    hideWarehouse?: boolean;
    hideWorkflowStatus?: boolean;
}

export const RecommendationDetailView: React.FC<RecommendationDetailViewProps> = ({ 
    recommendation, 
    onBack, 
    onUpdateStatus,
    onAssign,
    onOptimize,
    onNavigateToQuery,
    onNavigateToWarehouse,
    currentUser,
    onBackToSource,
    returnContext,
    hideHeader = false,
    hideMetadata = false,
    hideWarehouse = false,
    hideWorkflowStatus = false
}) => {
    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        });
    };

    const StatusOption: React.FC<{ status: RecommendationStatus }> = ({ status }) => (
        <button 
            onClick={() => onUpdateStatus?.(recommendation.id, status)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                recommendation.status === status 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'bg-white text-text-secondary border-border-color hover:border-primary hover:text-primary'
            }`}
            disabled={!onUpdateStatus}
        >
            {status}
        </button>
    );

    const DetailItem = ({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon?: any }) => (
        <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </span>
            <span className="text-sm font-black text-text-primary mt-1.5 leading-tight">{value}</span>
        </div>
    );

    const isEngineer = currentUser?.role === 'DataEngineer';

    const [isPromptCopied, setIsPromptCopied] = useState(false);

    const handleCopyPrompt = () => {
        const prompt = `Optimize the following Snowflake query based on this recommendation: "${recommendation.message}". Suggestion: "${recommendation.suggestion}". \n\nQuery:\n${recommendation.metrics?.queryText || ''}`;
        navigator.clipboard.writeText(prompt);
        setIsPromptCopied(true);
        setTimeout(() => setIsPromptCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-background gap-4">
            {!hideHeader && (
                <header className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {onBack && (
                                <button 
                                    onClick={onBack}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-text-secondary border border-border-light hover:bg-surface-hover transition-all shadow-sm flex-shrink-0"
                                >
                                    <IconChevronLeft className="h-6 w-6" />
                                </button>
                            )}
                            <div>
                                <div className="flex items-center gap-4">
                                    <h1 className="text-[28px] font-bold text-text-strong tracking-tight">Recommendations</h1>
                                    {returnContext && onBackToSource && (
                                        <button 
                                            onClick={onBackToSource}
                                            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-border-light rounded-lg text-xs font-bold text-primary hover:bg-surface-hover transition-all shadow-sm"
                                        >
                                            <IconChevronLeft className="w-3.5 h-3.5" />
                                            Back to {returnContext.warehouse?.name || returnContext.page}
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-text-secondary mt-0.5">Ref: {recommendation.id}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {isEngineer ? (
                                onOptimize && recommendation.resourceType === 'Query' && (
                                    <button 
                                        onClick={() => onOptimize(recommendation)}
                                        className="px-8 py-2.5 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
                                    >
                                        <IconWand className="w-4 h-4" />
                                        Optimize Now
                                    </button>
                                )
                            ) : (
                                <>
                                    {onOptimize && recommendation.resourceType === 'Query' && (
                                        <button 
                                            onClick={() => onOptimize(recommendation)}
                                            className="px-6 py-2.5 bg-white text-primary border-2 border-primary font-bold text-sm rounded-full hover:bg-primary/5 transition-all flex items-center gap-2 active:scale-95"
                                        >
                                            <IconWand className="w-4 h-4" />
                                            Optimize
                                        </button>
                                    )}
                                    {onAssign && (
                                        <button 
                                            onClick={() => onAssign(recommendation)}
                                            className="px-8 py-2.5 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
                                        >
                                            <IconUser className="w-4 h-4" />
                                            Assign Task
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </header>
            )}

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${!hideHeader ? 'overflow-y-auto no-scrollbar pb-12' : ''}`}>
                <div className={`${hideMetadata ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-4`}>
                    <div className="bg-white p-4 rounded-[24px] border border-border-light shadow-sm space-y-6">
                        {!hideWorkflowStatus && (
                            <div>
                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Workflow Status</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(['New', 'Read', 'In Progress', 'Resolved', 'Archived'] as RecommendationStatus[]).map(s => (
                                        <StatusOption key={s} status={s} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={`grid grid-cols-1 ${hideWarehouse ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-6`}>
                             <DetailItem label="Insight Type" value={<span className="text-primary">{recommendation.insightType}</span>} />
                             {!hideWarehouse && <DetailItem icon={IconDatabase} label="Warehouse" value={recommendation.warehouseName || 'SYSTEM'} />}
                        </div>

                        <div className="space-y-4">
                            <div className="bg-surface-nested p-4 rounded-[20px] border border-border-light">
                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Message</h4>
                                <p className="text-text-primary text-[15px] font-semibold leading-relaxed">{recommendation.message}</p>
                            </div>
                            
                            <div className="bg-primary/5 p-4 rounded-[20px] border border-primary/10">
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Suggestion</h4>
                                <p className="text-text-primary text-[15px] font-semibold leading-relaxed italic">
                                    "{recommendation.suggestion || 'Implement recommended configuration changes to improve performance and reduce cost.'}"
                                </p>
                            </div>
                        </div>

                        {/* Cortex AI Prompt Section */}
                        <div className="bg-indigo-50/50 p-6 rounded-[24px] border border-indigo-100 space-y-4 relative group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-indigo-700">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <IconWand className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Cortex AI Prompt</h4>
                                </div>
                                <button 
                                    onClick={handleCopyPrompt}
                                    className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-[10px] font-black transition-all shadow-sm uppercase tracking-widest ${
                                        isPromptCopied 
                                        ? 'bg-emerald-500 text-white border-emerald-500' 
                                        : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-600 hover:text-white'
                                    }`}
                                >
                                    {isPromptCopied ? <IconCheck className="w-3.5 h-3.5" /> : <IconClipboardCopy className="w-3.5 h-3.5" />}
                                    {isPromptCopied ? 'Copied' : 'Copy Prompt'}
                                </button>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-indigo-100 text-sm text-indigo-900/70 leading-relaxed font-medium italic">
                                {`Optimize the following Snowflake query based on this recommendation: "${recommendation.message}". Suggestion: "${recommendation.suggestion}". \n\nQuery:\n${recommendation.metrics?.queryText || '...'}`}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-indigo-500 font-bold uppercase tracking-wider">
                                <IconInfo className="w-3 h-3" />
                                Copy this prompt and paste it into Snowflake Cortex to generate optimized code instantly.
                            </div>
                        </div>

                        {recommendation.detailedExplanation && (
                            <div className="bg-[#F8FAFC] p-4 rounded-[20px] border border-border-light">
                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Detailed Explanation</h4>
                                <p className="text-text-secondary text-sm leading-relaxed">{recommendation.detailedExplanation}</p>
                            </div>
                        )}
                    </div>

                    {recommendation.metrics?.queryText && (
                        <QueryCodeBlock code={recommendation.metrics.queryText} />
                    )}
                </div>

                {!hideMetadata && (
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white p-4 rounded-[24px] border border-border-light shadow-sm space-y-6">
                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border-light pb-4">Metadata</h4>
                            <div className="space-y-6">
                                <DetailItem icon={IconUser} label="User" value={recommendation.userName || 'Unknown'} />
                                <DetailItem label="Account" value={recommendation.accountName} />
                                <DetailItem label="Resource Type" value={recommendation.resourceType} />
                                <DetailItem label="Severity" value={<SeverityBadge severity={recommendation.severity} />} />
                                <DetailItem icon={IconClock} label="Detected At" value={formatTimestamp(recommendation.timestamp)} />
                                <DetailItem label="Resource Identifier" value={<span className="font-mono text-xs">{recommendation.affectedResource}</span>} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
