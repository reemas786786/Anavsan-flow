
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, Legend } from 'recharts';
import { 
    usageCreditsData, 
    resourceSnapshotData, 
    recommendationsData, 
    connectionsData, 
    warehousesData, 
    spendTrendsData,
} from '../data/dummyData';
import { Account, User, BigScreenWidget, Page, Recommendation } from '../types';
import { IconDotsVertical, IconChevronDown, IconAdd, IconList, IconInfo, IconSearch, IconCheck } from '../constants';
import InfoTooltip from '../components/InfoTooltip';

interface OverviewProps {
    onSelectAccount: (account: Account) => void;
    onSelectUser: (user: User) => void;
    accounts: Account[];
    users: User[];
    onSetBigScreenWidget: (widget: BigScreenWidget) => void;
    currentUser: User | null;
    onNavigate: (page: Page, subPage?: string, state?: any) => void;
    onAddAccountClick?: () => void;
}

const WidgetCard: React.FC<{ 
    children: React.ReactNode, 
    title: string, 
    hasMenu?: boolean, 
    infoText?: string, 
    headerActions?: React.ReactNode,
    onTableView?: () => void
}> = ({ children, title, hasMenu = true, infoText, headerActions, onTableView }) => (
    <div className="bg-surface p-4 rounded-[24px] shadow-sm flex flex-col border border-border-light">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-1.5">
                <h4 className="text-[14px] font-bold text-text-strong tracking-tight">{title}</h4>
                {infoText && <InfoTooltip text={infoText} />}
            </div>
            <div className="flex items-center gap-2">
                {headerActions}
                {onTableView && (
                    <button 
                        onClick={onTableView}
                        className="text-text-muted hover:text-primary transition-colors p-1"
                        title="View as table"
                    >
                        <IconList className="h-4 w-4" />
                    </button>
                )}
                {hasMenu && (
                    <button className="text-text-muted hover:text-text-primary transition-colors p-1">
                        <IconDotsVertical className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
        <div className="flex-grow">
            {children}
        </div>
    </div>
);

const SummaryMetricCard: React.FC<{ 
    label: string; 
    value: string; 
    subValue?: string; 
    onClick?: () => void 
}> = ({ label, value, subValue, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-surface-nested p-4 rounded-[16px] border border-border-light flex flex-col h-[90px] text-left hover:border-primary/40 hover:bg-surface-hover transition-all group shadow-sm w-full"
    >
        <p className="text-[10px] font-bold text-[#9A9AB2] group-hover:text-primary transition-colors uppercase tracking-widest">{label}</p>
        <div className="mt-auto">
            <p className="text-[18px] font-black text-[#161616] tracking-tight leading-none">{value}</p>
            {subValue && <p className="text-[10px] font-bold text-[#5A5A72] mt-1 tracking-tight">{subValue}</p>}
        </div>
    </button>
);

const DATE_RANGES = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 14 days', value: 14 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
];

const RecommendationItem: React.FC<{ rec: Recommendation }> = ({ rec }) => {
    const getTagStyles = (tag: string) => {
        switch(tag.toLowerCase()) {
            case 'warehouse': return 'bg-violet-100 text-violet-600';
            case 'query': return 'bg-cyan-100 text-cyan-600';
            case 'storage': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    };
    
    return (
        <div className="p-4 rounded-xl bg-surface-nested border border-border-light/50 space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-text-strong font-mono">{rec.insightType}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${getTagStyles(rec.resourceType)}`}>{rec.resourceType}</span>
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed">{rec.message}</p>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        if (payload.length === 1 && payload[0].dataKey === 'total') {
            const data = payload[0].payload;
            const items = [
                { name: 'Warehouse', value: data.warehouse, color: '#6932D5' },
                { name: 'Storage', value: data.storage, color: '#A78BFA' },
                { name: 'Cloud Service', value: data.cloud || 0, color: '#C4B5FD' }
            ];

            return (
                <div className="bg-surface p-3 rounded-lg shadow-xl border border-border-color min-w-[180px]">
                    <p className="text-xs font-bold text-text-strong mb-2 border-b border-border-light pb-1">{label}</p>
                    <div className="space-y-1.5 mb-2">
                        {items.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                    <span className="text-[11px] font-medium text-text-secondary">{entry.name}:</span>
                                </div>
                                <span className="text-[11px] font-black text-text-strong">{entry.value.toLocaleString()} cr</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-border-light pt-2 mt-2">
                        <span className="text-[11px] font-black text-text-muted uppercase tracking-tighter">Total Credits</span>
                        <span className="text-sm font-black text-primary">{data.total.toLocaleString()} cr</span>
                    </div>
                </div>
            );
        }

        const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
        return (
            <div className="bg-surface p-3 rounded-lg shadow-xl border border-border-color min-w-[180px]">
                <p className="text-xs font-bold text-text-strong mb-2 border-b border-border-light pb-1">{label}</p>
                <div className="space-y-1.5 mb-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                <span className="text-[10px] font-medium text-text-secondary">{entry.name}:</span>
                            </div>
                            <span className="text-[10px] font-black text-text-strong">{entry.value.toLocaleString()} cr</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between border-t border-border-light pt-1.5 mt-1.5">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Total Credits</span>
                    <span className="text-xs font-black text-primary">{total.toLocaleString()} cr</span>
                </div>
            </div>
        );
    }
    return null;
};

const CreditsTrendWidget: React.FC = () => {
    const [selectedRange, setSelectedRange] = useState(DATE_RANGES[1]);
    const [selectedAccount, setSelectedAccount] = useState('All accounts');
    const [isRangeOpen, setIsRangeOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    
    const rangeRef = useRef<HTMLDivElement>(null);
    const accountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (rangeRef.current && !rangeRef.current.contains(event.target as Node)) setIsRangeOpen(false);
            if (accountRef.current && !accountRef.current.contains(event.target as Node)) setIsAccountOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const trendData = useMemo(() => {
        return spendTrendsData.slice(-selectedRange.value);
    }, [selectedRange]);

    const accountOptions = ['All accounts', ...connectionsData.map(a => a.name)];

    return (
        <WidgetCard 
            title="Credits trend" 
            headerActions={
                <div className="flex items-center gap-3">
                    <div className="relative" ref={accountRef}>
                        <button 
                            onClick={() => setIsAccountOpen(!isAccountOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg text-[11px] text-text-primary font-bold border border-border-color shadow-sm min-w-[120px] justify-between"
                        >
                            <span className="truncate max-w-[100px]">{selectedAccount}</span>
                            <IconChevronDown className={`w-3 h-3 text-text-muted transition-transform flex-shrink-0 ${isAccountOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isAccountOpen && (
                            <div className="absolute right-0 mt-1 w-48 bg-surface rounded-lg shadow-xl z-50 border border-border-color overflow-hidden py-1 max-h-60 overflow-y-auto">
                                {accountOptions.map(acc => (
                                    <button 
                                        key={acc} 
                                        onClick={() => { setSelectedAccount(acc); setIsAccountOpen(false); }} 
                                        className={`w-full text-left px-3 py-2 text-[11px] font-medium hover:bg-primary/5 transition-colors ${selectedAccount === acc ? 'bg-primary/10 text-primary font-bold' : 'text-text-primary'}`}
                                    >
                                        {acc}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={rangeRef}>
                        <button 
                            onClick={() => setIsRangeOpen(!isRangeOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg text-[11px] text-text-primary font-bold border border-border-color shadow-sm min-w-[100px] justify-between"
                        >
                            {selectedRange.label}
                            <IconChevronDown className={`w-3 h-3 text-text-muted transition-transform flex-shrink-0 ${isRangeOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isRangeOpen && (
                            <div className="absolute right-0 mt-1 w-32 bg-surface rounded-lg shadow-xl z-50 border border-border-color overflow-hidden py-1">
                                {DATE_RANGES.map(r => (
                                    <button 
                                        key={r.label} 
                                        onClick={() => { setSelectedRange(r); setIsRangeOpen(false); }} 
                                        className={`w-full text-left px-2 py-1.5 text-[11px] font-medium hover:bg-primary/5 transition-colors ${selectedRange.value === r.value ? 'bg-primary/10 text-primary font-bold' : 'text-text-primary'}`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6932D5" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#6932D5" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2DDEB" opacity={0.5} />
                        <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#9A9AB2', fontWeight: 700}} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#9A9AB2', fontWeight: 700}} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6932D5', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area type="monotone" dataKey="total" stroke="#6932D5" strokeWidth={4} fillOpacity={1} fill="url(#colorTrend)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </WidgetCard>
    );
};

const WavyGridBackground = () => (
    <div className="absolute bottom-0 left-0 right-0 h-[600px] pointer-events-none opacity-40 z-0 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 1440 600" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 450 Q 360 250 720 450 T 1440 450" stroke="#6932D5" strokeWidth="0.5" strokeDasharray="5 5" opacity="0.3" />
            <path d="M0 480 Q 360 280 720 480 T 1440 480" stroke="#6932D5" strokeWidth="0.5" strokeDasharray="5 5" opacity="0.3" />
            <path d="M0 510 Q 360 310 720 510 T 1440 510" stroke="#6932D5" strokeWidth="0.5" strokeDasharray="5 5" opacity="0.3" />
            <path d="M0 540 Q 360 340 720 540 T 1440 540" stroke="#6932D5" strokeWidth="0.5" strokeDasharray="5 5" opacity="0.3" />
            <path d="M0 570 Q 360 370 720 570 T 1440 570" stroke="#6932D5" strokeWidth="0.5" strokeDasharray="5 5" opacity="0.3" />
             <path d="M0 600 Q 360 400 720 600 T 1440 600" stroke="#6932D5" strokeWidth="0.5" strokeDasharray="5 5" opacity="0.3" />
            {/* Grid lines vertical */}
            {Array.from({ length: 40 }).map((_, i) => (
                <line key={i} x1={i * 40} y1="0" x2={i * 40} y2="100%" stroke="#6932D5" strokeWidth="0.2" opacity="0.1" />
            ))}
        </svg>
    </div>
);

const WelcomeIllustration = () => (
    <div className="absolute top-10 right-10 w-[300px] h-[180px] pointer-events-none select-none animate-in fade-in zoom-in duration-1000">
        <svg viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cloud 1 */}
            <path d="M220 100c0-15 12-28 27-28 3 0 5 0 8 1 5-10 16-17 28-17 19 0 35 16 35 35 0 2-1 4-1 6 12 5 20 17 20 31 0 19-15 34-34 34H238c-10 0-18-8-18-18s8-18 18-18" fill="#E0E7FF" opacity="0.6"/>
            {/* Progress Circles */}
            <circle cx="210" cy="70" r="30" stroke="#3B82F6" strokeWidth="6" strokeDasharray="140 50" opacity="0.8"/>
            <circle cx="245" cy="45" r="25" stroke="#6366F1" strokeWidth="5" strokeDasharray="100 60" opacity="0.6"/>
            <circle cx="270" cy="85" r="20" stroke="#A78BFA" strokeWidth="4" strokeDasharray="80 40" opacity="0.4"/>
            {/* Cloud 2 */}
            <path d="M160 140c0-10 8-18 18-18 2 0 4 0 6 1 3-7 11-12 19-12 13 0 23 10 23 23 0 1-1 3-1 4 8 3 14 11 14 20 0 13-10 23-23 23H173c-7 0-13-6-13-13z" fill="#DBEAFE" opacity="0.8"/>
        </svg>
    </div>
);

const CustomYAxisTick = (props: any) => {
    const { x, y, payload, onSelect } = props;
    const account = connectionsData.find(acc => acc.name === payload.value);

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={-10}
                y={0}
                dy={4}
                textAnchor="end"
                fill="#5A5A72"
                fontSize={10}
                fontWeight={700}
                style={{ cursor: 'pointer', outline: 'none' }}
                className="hover:fill-primary transition-colors"
                onClick={() => account && onSelect(account)}
            >
                {payload.value.length > 12 ? `${payload.value.substring(0, 12)}...` : payload.value}
            </text>
        </g>
    );
};

const ScopeItem: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
    <div className="flex gap-4 items-start">
        <div className="w-6 h-6 rounded-full bg-[#EEF4FF] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#6366F1]/10">
            <IconCheck className="w-4 h-4 text-[#6366F1]" />
        </div>
        <div className="space-y-1">
            <h4 className="text-sm font-bold text-text-strong">{title}</h4>
            <p className="text-xs text-text-secondary leading-relaxed font-medium">{desc}</p>
        </div>
    </div>
);

const Overview: React.FC<OverviewProps> = ({ accounts, onSelectAccount, onSelectUser, onAddAccountClick, onNavigate }) => {
    const topAccountsData = useMemo(() => connectionsData.map(acc => {
        const total = acc.tokens / 1000;
        return {
            name: acc.name,
            warehouse: total * 0.82,
            storage: total * 0.12,
            cloud: total * 0.06
        };
    }), []);

    if (accounts.length === 0) {
        return (
            <div className="relative h-full w-full bg-white overflow-hidden flex flex-col p-10 md:p-16">
                <WavyGridBackground />
                <WelcomeIllustration />
                
                <div className="relative z-10 max-w-7xl w-full">
                    <div className="space-y-2 mb-20">
                        <h1 className="text-[48px] font-normal text-[#161616] tracking-tight">Welcome to <strong className="font-black text-primary">Anavsan</strong></h1>
                        <p className="text-xl text-[#5A5A72] font-medium">Your smart advisor for Snowflake cost optimization.</p>
                    </div>

                    <div className="max-w-5xl animate-in slide-in-from-bottom-8 fade-in duration-700">
                        <div className="bg-white border border-[#E2DDEB] rounded-[32px] overflow-hidden shadow-2xl shadow-[#6932D5]/5 flex flex-col md:flex-row">
                            {/* Left Side: Get Started */}
                            <div className="p-12 flex-1 space-y-8 flex flex-col">
                                <div>
                                    <h2 className="text-[28px] font-black text-[#161616] tracking-tight">Get started with Snowflake</h2>
                                    <p className="text-[15px] text-[#5A5A72] mt-4 leading-relaxed font-medium">
                                        Anavsan helps you optimize Snowflake. Connect your account to see detailed analysis of your query spend, warehouse usage, and performance.
                                    </p>
                                </div>
                                <div className="mt-auto pt-10">
                                    <button 
                                        onClick={onAddAccountClick}
                                        className="bg-primary hover:bg-primary-hover text-white font-black py-4 px-10 rounded-full shadow-xl shadow-primary/20 flex items-center gap-3 transition-all active:scale-[0.98] group"
                                    >
                                        <span className="text-sm uppercase tracking-widest">Connect account</span>
                                        <IconAdd className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* Right Side: Optimization Scope */}
                            <div className="bg-[#F8F9FA] p-12 w-full md:w-[420px] flex flex-col border-l border-border-light">
                                <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-8">Optimization Scope</h3>
                                <div className="space-y-8 flex-grow">
                                    <ScopeItem 
                                        title="Metadata only" 
                                        desc="Analyzes account and organization usage" 
                                    />
                                    <ScopeItem 
                                        title="Zero data access" 
                                        desc="Raw table data is never read or stored" 
                                    />
                                    <ScopeItem 
                                        title="Non-Intrusive" 
                                        desc="No production query execution" 
                                    />
                                    <ScopeItem 
                                        title="Resource efficient" 
                                        desc="Runs on an X-SMALL warehouse" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background gap-4 p-4 pb-20 max-w-[1440px] mx-auto overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[28px] font-bold text-text-strong tracking-tight">AI data cloud overview</h1>
                    <p className="text-sm text-text-secondary font-medium mt-1">Snapshot of your organization's Snowflake consumption.</p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="bg-white rounded-[24px] border border-border-light shadow-sm p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-[14px] font-semibold text-text-primary tracking-tight">Resource summary</h2>
                            <IconInfo className="w-4 h-4 text-[#9A9AB2]" />
                        </div>
                        <button className="p-1 rounded-full hover:bg-surface-nested transition-colors text-[#9A9AB2]">
                            <IconDotsVertical className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <SummaryMetricCard 
                            label="Accounts" 
                            value="8" 
                            subValue="48.5K Credits" 
                            onClick={() => onNavigate('Resource summary', undefined, { tab: 'Accounts' })} 
                        />
                        <SummaryMetricCard 
                            label="Compute" 
                            value="44.25K" 
                            subValue="Credits"
                            onClick={() => onNavigate('Resource summary', undefined, { tab: 'Compute' })} 
                        />
                        <SummaryMetricCard 
                            label="Storage" 
                            value="36 TB" 
                            subValue="2.1K Credits" 
                            onClick={() => onNavigate('Resource summary', undefined, { tab: 'Storage' })} 
                        />
                        <SummaryMetricCard 
                            label="Workloads" 
                            value="52" 
                            subValue="168K Credits" 
                            onClick={() => onNavigate('Resource summary', undefined, { tab: 'Workloads' })} 
                        />
                        <SummaryMetricCard 
                            label="Services" 
                            value="7" 
                            subValue="6.8K Credits" 
                            onClick={() => onNavigate('Resource summary', undefined, { tab: 'Services' })} 
                        />
                        <SummaryMetricCard 
                            label="Cortex" 
                            value="1.5K" 
                            subValue="Credits" 
                            onClick={() => onNavigate('Resource summary', undefined, { tab: 'Cortex' })} 
                        />
                        <SummaryMetricCard 
                            label="Users" 
                            value="43" 
                            onClick={() => onNavigate('Resource summary', undefined, { tab: 'User' })} 
                        />
                        <SummaryMetricCard 
                            label="Queries" 
                            value="950" 
                            onClick={() => onNavigate('Resource summary', undefined, { tab: 'High-impact queries' })} 
                        />
                    </div>
                </div>

                <WidgetCard 
                    title="Recommendations" 
                    headerActions={<button onClick={() => onNavigate('Recommendations')} className="text-[11px] font-bold text-link hover:underline">View all</button>}
                >
                    <div className="flex flex-col gap-4">
                        {recommendationsData.slice(0, 3).map(rec => <RecommendationItem key={rec.id} rec={rec} />)}
                    </div>
                </WidgetCard>

                <WidgetCard 
                    title="Top accounts by credits" 
                    headerActions={<button onClick={() => onNavigate('Resource summary', undefined, { tab: 'Accounts' })} className="text-[11px] font-bold text-link hover:underline">View all</button>}
                >
                    <div className="h-[350px] flex flex-col">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart chartValue="totalCredits" layout="vertical" data={topAccountsData} margin={{ left: 50, right: 30, top: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2DDEB" opacity={0.5} />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9A9AB2' }} />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    width={120} 
                                    tick={<CustomYAxisTick onSelect={onSelectAccount} />}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    align="center" 
                                    iconType="circle"
                                    wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="warehouse" name="Warehouse" stackId="a" fill="#6932D5" barSize={16} />
                                <Bar dataKey="storage" name="Storage" stackId="a" fill="#A78BFA" barSize={16} />
                                <Bar dataKey="cloud" name="Cloud Service" stackId="a" fill="#C4B5FD" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </WidgetCard>

                <CreditsTrendWidget />
            </div>
        </div>
    );
};

export default Overview;
