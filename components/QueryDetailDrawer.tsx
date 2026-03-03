import React from 'react';
import { QueryListItem } from '../types';
import { IconClose, IconClipboardCopy, IconCheck, IconDatabase, IconUser, IconClock, IconTrendingUp, IconBolt } from '../constants';

interface QueryDetailDrawerProps {
    query: QueryListItem | null;
    isOpen: boolean;
    onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex items-center justify-between py-3 border-b border-border-light last:border-0">
        <div className="flex items-center gap-2 text-text-muted">
            {icon && <span className="text-text-muted">{icon}</span>}
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-sm font-black text-text-strong">{value}</div>
    </div>
);

const QueryDetailDrawer: React.FC<QueryDetailDrawerProps> = ({ query, isOpen, onClose }) => {
    const [isCopied, setIsCopied] = React.useState(false);

    if (!query) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(query.queryText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const formatTime = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString([], { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            
            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-surface-nested">
                    <div>
                        <h2 className="text-lg font-black text-text-strong">Query Details</h2>
                        <p className="text-xs font-mono text-text-muted mt-0.5">{query.id}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-surface-hover text-text-secondary transition-colors"
                    >
                        <IconClose className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-8">
                    {/* Credit Breakdown */}
                    <section>
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Credit Consumption</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-surface-nested p-4 rounded-2xl border border-border-light">
                                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Compute</p>
                                <p className="text-xl font-black text-text-strong">{(query.computeCredits || query.costCredits).toFixed(3)}</p>
                            </div>
                            <div className="bg-surface-nested p-4 rounded-2xl border border-border-light">
                                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">QAS</p>
                                <p className="text-xl font-black text-text-strong">{(query.qasCredits || 0).toFixed(3)}</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20">
                                <p className="text-[10px] font-bold text-primary uppercase mb-1">Total</p>
                                <p className="text-xl font-black text-primary">{query.costCredits.toFixed(3)}</p>
                            </div>
                        </div>
                    </section>

                    {/* Execution Details */}
                    <section>
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Execution Details</h3>
                        <div className="bg-white rounded-2xl">
                            <DetailRow 
                                label="Type" 
                                value={query.queryType || 'SELECT'} 
                            />
                            <DetailRow 
                                label="Warehouse" 
                                value={query.warehouse} 
                                icon={<IconDatabase className="w-4 h-4" />} 
                            />
                            <DetailRow 
                                label="User" 
                                value={query.user} 
                                icon={<IconUser className="w-4 h-4" />} 
                            />
                            <DetailRow 
                                label="Duration" 
                                value={query.duration} 
                                icon={<IconClock className="w-4 h-4" />} 
                            />
                            <DetailRow 
                                label="Start Time" 
                                value={formatTime(query.startTime || query.timestamp)} 
                            />
                            <DetailRow 
                                label="End Time" 
                                value={formatTime(query.endTime)} 
                            />
                        </div>
                    </section>

                    {/* SQL Source */}
                    <section className="flex flex-col flex-grow min-h-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">SQL Source</h3>
                            <button 
                                onClick={handleCopy}
                                className="flex items-center gap-2 text-[10px] font-black text-primary uppercase hover:text-primary-hover transition-colors"
                            >
                                {isCopied ? <IconCheck className="w-3 h-3" /> : <IconClipboardCopy className="w-3 h-3" />}
                                {isCopied ? 'Copied' : 'Copy SQL'}
                            </button>
                        </div>
                        <div className="bg-surface-nested p-5 rounded-2xl border border-border-light flex-grow overflow-y-auto no-scrollbar">
                            <pre className="text-xs font-mono text-text-strong leading-relaxed whitespace-pre-wrap break-all">
                                <code>{query.queryText}</code>
                            </pre>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-border-light bg-surface-nested flex gap-3">
                    <button className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-hover transition-all shadow-sm">
                        Analyze Query
                    </button>
                    <button className="flex-1 bg-white border border-border-color text-text-strong font-bold py-3 rounded-xl hover:bg-surface-hover transition-all">
                        Optimize Query
                    </button>
                </div>
            </div>
        </>
    );
};

export default QueryDetailDrawer;
