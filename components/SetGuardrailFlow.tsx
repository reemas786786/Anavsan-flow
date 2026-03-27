
import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Bell, 
  Zap, 
  TrendingUp,
  ChevronDown,
  Search,
  Info,
  Layers,
  Layout,
  CloudDownload,
  Settings,
  Filter,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Database,
  Cpu,
  Globe,
  Check,
  Activity
} from 'lucide-react';
import { Account, Application } from '../types';

interface SetGuardrailFlowProps {
  accounts: Account[];
  applications: Application[];
  onClose: () => void;
  onSuccess: (data: any) => void;
  initialStep?: FlowStep;
}

type FlowStep = 'choice' | 'import' | 'custom' | 'config';

const snowflakeMonitors = [
  { id: 'mon-1', name: 'PROD_COMPUTE_LIMIT', limit: '$5,000', scope: 'Warehouse: PROD_WH', account: 'Finance Prod' },
  { id: 'mon-2', name: 'DEV_SANDBOX_MONITOR', limit: '$1,200', scope: 'Account: Sandbox', account: 'Account B' },
  { id: 'mon-3', name: 'MARKETING_BI_CAP', limit: '$2,500', scope: 'User: BI_USER', account: 'Account C' },
];

const MOCK_WAREHOUSES = ['COMPUTE_WH', 'LOAD_WH', 'ANALYTICS_WH', 'DATA_SCIENCE_WH', 'REPORTING_WH', 'ETL_WH', 'BI_WH'];
const MOCK_DATABASES = ['PROD_DB', 'DEV_DB', 'STAGING_DB', 'MARKETING_DB', 'SALES_DB', 'RAW_DATA_DB', 'ANALYTICS_DB'];
const MOCK_CORTEX_SERVICES = ['Text-to-SQL', 'Sentiment Analysis', 'Translation', 'Summarization', 'Document AI'];

const SetGuardrailFlow: React.FC<SetGuardrailFlowProps> = ({ accounts, applications, onClose, onSuccess, initialStep = 'choice' }) => {
  const [step, setStep] = useState<FlowStep>(initialStep);
  const [scope, setScope] = useState('Global Organization');
  
  // Smart Group Multi-Select State
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
  const [selectedDatabases, setSelectedDatabases] = useState<string[]>([]);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [selectedCortex, setSelectedCortex] = useState<string[]>([]);
  
  // Dynamic Rules State
  const [dynamicRules, setDynamicRules] = useState([
    { id: 1, type: 'Warehouse', condition: 'Starts with', value: '' }
  ]);

  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');
  
  // AI Suggestion State
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Import State
  const [selectedMonitorId, setSelectedMonitorId] = useState<string | null>(null);

  // Common Config State
  const [budget, setBudget] = useState('10000');
  const [period, setPeriod] = useState('Monthly');
  const [thresholds, setThresholds] = useState([
    { id: 1, percentage: '50', channel: 'Slack Channel', email: 'admin@company.com' },
    { id: 2, percentage: '80', channel: 'Slack Channel', email: 'admin@company.com' },
    { id: 3, percentage: '100', channel: 'Slack Channel', email: 'admin@company.com' }
  ]);
  const [autoAssign, setAutoAssign] = useState(false);
  const [burnVelocity, setBurnVelocity] = useState(true);
  const [burnVelocityThreshold, setBurnVelocityThreshold] = useState('300');
  const [predictive, setPredictive] = useState(true);

  const addDynamicRule = () => {
    setDynamicRules([...dynamicRules, { 
      id: Date.now(), 
      type: 'Warehouse', 
      condition: 'Starts with', 
      value: '' 
    }]);
  };

  const removeDynamicRule = (id: number) => {
    setDynamicRules(dynamicRules.filter(r => r.id !== id));
  };

  const updateDynamicRule = (id: number, field: string, value: string) => {
    setDynamicRules(dynamicRules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const toggleSelection = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAiScopeSuggestion = () => {
    setIsSuggesting(true);
    // Simulate AI analysis
    setTimeout(() => {
      setSelectedWarehouses(prev => [...new Set([...prev, 'ANALYTICS_WH', 'BI_WH'])]);
      setSelectedDatabases(prev => [...new Set([...prev, 'ANALYTICS_DB'])]);
      setDynamicRules(prev => [...prev, { id: Date.now(), type: 'Database', condition: 'Tag is', value: 'Project:Alpha' }]);
      setIsSuggesting(false);
    }, 1500);
  };

  const addThreshold = () => {
    setThresholds([...thresholds, { 
      id: Date.now(), 
      percentage: '90', 
      channel: 'Slack Channel', 
      email: 'admin@company.com' 
    }]);
  };

  const removeThreshold = (id: number) => {
    setThresholds(thresholds.filter(t => t.id !== id));
  };

  const handleImportSelect = (monitor: typeof snowflakeMonitors[0]) => {
    setSelectedMonitorId(monitor.id);
    setBudget(monitor.limit.replace('$', '').replace(',', ''));
    setStep('config');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      type: step === 'custom' ? 'custom' : 'import',
      scope,
      smartGroup: scope === 'Smart Group' ? {
        accounts: selectedAccounts,
        warehouses: selectedWarehouses,
        databases: selectedDatabases,
        applications: selectedApplications,
        cortex: selectedCortex,
        dynamicRules
      } : null,
      tagKey,
      tagValue,
      importedMonitor: step === 'import' ? snowflakeMonitors.find(m => m.id === selectedMonitorId) : null,
      budget,
      period,
      thresholds,
      autoAssign,
      burnVelocity,
      burnVelocityThreshold,
      predictive
    });
  };

  const renderChoice = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-text-primary">How would you like to start?</h3>
        <p className="text-sm text-text-secondary">Choose a method to initialize your financial guardrail.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => setStep('import')}
          className="flex items-start gap-4 p-6 bg-surface border border-border-light rounded-2xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <CloudDownload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors">Import from Snowflake</h4>
            <p className="text-sm text-text-secondary mt-1">Sync existing Resource Monitors and upgrade them with AI forecasting.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-text-muted ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-all" />
        </button>

        <button 
          onClick={() => setStep('custom')}
          className="flex items-start gap-4 p-6 bg-surface border border-border-light rounded-2xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors">Custom guardrail</h4>
            <p className="text-sm text-text-secondary mt-1">Build a new rule from scratch using Smart Groups and advanced filters.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-text-muted ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-all" />
        </button>
      </div>
    </div>
  );

  const renderImport = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-end">
        <span className="text-[10px] font-black tracking-widest text-text-muted">Step 1 of 2: Select monitor</span>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search Snowflake monitors..."
            className="w-full bg-surface border border-border-light rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-text-muted tracking-wider ml-1">Detected Snowflake monitors</p>
          {snowflakeMonitors.map(monitor => (
            <div 
              key={monitor.id}
              className="p-4 bg-surface border border-border-light rounded-2xl hover:border-primary transition-all group cursor-pointer"
              onClick={() => handleImportSelect(monitor)}
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-bold text-text-primary group-hover:text-primary transition-colors">{monitor.name}</h5>
                <span className="text-sm font-bold text-text-primary">{monitor.limit}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {monitor.scope}
                </span>
                <span className="flex items-center gap-1">
                  <Layout className="w-3 h-3" />
                  {monitor.account}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-border-light/50">
                <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Ready to enhance
                </span>
                <button className="text-xs font-bold text-primary flex items-center gap-1">
                  Import & enhance
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0" />
          <p className="text-xs text-text-secondary leading-relaxed">
            Anavsan will now apply <span className="font-bold text-text-primary">Predictive alerts</span> and <span className="font-bold text-text-primary">Task assignment</span> to this existing limit.
          </p>
        </div>
      </div>
    </div>
  );

  const renderCustom = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center justify-end">
        <span className="text-[10px] font-black tracking-widest text-text-muted">Step 1 of 2: Define scope</span>
      </div>

      {/* SECTION 1: MONITORING SCOPE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <label className="text-sm font-bold text-text-primary tracking-wider">Monitoring scope</label>
          </div>
          {scope === 'Smart Group' && (
            <button 
              onClick={handleAiScopeSuggestion}
              disabled={isSuggesting}
              className="text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded-lg flex items-center gap-1 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3 h-3 ${isSuggesting ? 'animate-pulse' : ''}`} />
              {isSuggesting ? 'Analyzing...' : 'AI scope suggestion'}
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <select 
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full bg-surface border border-border-light rounded-xl px-4 py-3 text-sm font-medium text-text-primary appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            >
              <option>Global Organization</option>
              <option>Smart Group</option>
              <option>Resource Tags</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>

          {scope === 'Smart Group' && (
            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-text-primary">Define smart group scope</h4>
                <p className="text-xs text-text-secondary">Add multiple assets across categories to create a unified monitoring boundary.</p>
              </div>

              {/* Multi-Entity Selection */}
              <div className="space-y-6">
                {/* Accounts */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted tracking-widest">
                    <Layers className="w-3 h-3" />
                    Accounts
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {accounts.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => toggleSelection(selectedAccounts, setSelectedAccounts, acc.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                          selectedAccounts.includes(acc.name) 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-surface border-border-light text-text-secondary hover:border-text-muted'
                        }`}
                      >
                        {selectedAccounts.includes(acc.name) && <Check className="w-3 h-3" />}
                        {acc.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warehouses */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted tracking-widest">
                    <Cpu className="w-3 h-3" />
                    Warehouses
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_WAREHOUSES.map(wh => (
                      <button
                        key={wh}
                        onClick={() => toggleSelection(selectedWarehouses, setSelectedWarehouses, wh)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                          selectedWarehouses.includes(wh) 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-surface border-border-light text-text-secondary hover:border-text-muted'
                        }`}
                      >
                        {selectedWarehouses.includes(wh) && <Check className="w-3 h-3" />}
                        {wh}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Databases */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted tracking-widest">
                    <Database className="w-3 h-3" />
                    Databases
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_DATABASES.map(db => (
                      <button
                        key={db}
                        onClick={() => toggleSelection(selectedDatabases, setSelectedDatabases, db)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                          selectedDatabases.includes(db) 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-surface border-border-light text-text-secondary hover:border-text-muted'
                        }`}
                      >
                        {selectedDatabases.includes(db) && <Check className="w-3 h-3" />}
                        {db}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Applications */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted tracking-widest">
                    <Layout className="w-3 h-3" />
                    Applications
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Tableau-Prod', 'dbt-Transform', 'Looker-BI', 'Airflow-Orchestrator'].map(app => (
                      <button
                        key={app}
                        onClick={() => toggleSelection(selectedApplications, setSelectedApplications, app)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                          selectedApplications.includes(app) 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-surface border-border-light text-text-secondary hover:border-text-muted'
                        }`}
                      >
                        {selectedApplications.includes(app) && <Check className="w-3 h-3" />}
                        {app}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cortex Services */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted tracking-widest">
                    <Activity className="w-3 h-3" />
                    Cortex services
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_CORTEX_SERVICES.map(service => (
                      <button
                        key={service}
                        onClick={() => toggleSelection(selectedCortex, setSelectedCortex, service)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                          selectedCortex.includes(service) 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-surface border-border-light text-text-secondary hover:border-text-muted'
                        }`}
                      >
                        {selectedCortex.includes(service) && <Check className="w-3 h-3" />}
                        {service}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Inclusion Rules */}
              <div className="p-6 bg-surface border border-border-light rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-text-primary tracking-wider">Dynamic inclusion rules</span>
                  </div>
                  <button 
                    type="button"
                    onClick={addDynamicRule}
                    className="text-primary hover:bg-primary/5 p-1 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-xs font-medium text-text-secondary italic">"Automatically include any new resources where..."</p>
                  
                  <div className="space-y-3">
                    {dynamicRules.map((rule, idx) => (
                      <div key={rule.id} className="relative p-4 bg-surface-hover/30 rounded-xl border border-border-light/50 space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <select 
                                value={rule.type}
                                onChange={(e) => updateDynamicRule(rule.id, 'type', e.target.value)}
                                className="w-full bg-surface border border-border-light rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                              >
                                <option>Warehouse</option>
                                <option>Database</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
                            </div>
                            <div className="relative flex-1">
                              <select 
                                value={rule.condition}
                                onChange={(e) => updateDynamicRule(rule.id, 'condition', e.target.value)}
                                className="w-full bg-surface border border-border-light rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                              >
                                <option>Name starts with</option>
                                <option>Tag is</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
                            </div>
                            <input 
                              type="text"
                              placeholder="e.g. DEV_"
                              value={rule.value}
                              onChange={(e) => updateDynamicRule(rule.id, 'value', e.target.value)}
                              className="flex-[1.5] bg-surface border border-border-light rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            {dynamicRules.length > 1 && (
                              <button 
                                type="button"
                                onClick={() => removeDynamicRule(rule.id)}
                                className="p-2 text-text-muted hover:text-red-500 rounded-lg transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logic Chain UI */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {dynamicRules.filter(r => r.value).map(rule => (
                    <div key={rule.id} className="px-2 py-1 bg-primary/5 border border-primary/20 rounded-md text-[10px] font-bold text-primary flex items-center gap-1.5">
                      <span className="opacity-60">{rule.type}</span>
                      <span>{rule.condition === 'Name starts with' ? '^' : '#'}{rule.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Inventory Preview */}
              <div className="p-4 bg-surface-hover/50 rounded-2xl border border-border-light flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">Live inventory preview</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">
                      Scope contains: {selectedAccounts.length} Accounts, {selectedWarehouses.length} Warehouses, {selectedApplications.length} Apps, and {selectedCortex.length} Cortex functions.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-text-primary">{selectedAccounts.length + selectedWarehouses.length + selectedDatabases.length + selectedApplications.length + selectedCortex.length}</p>
                  <p className="text-[10px] text-text-muted font-bold">Total assets</p>
                </div>
              </div>
            </div>
          )}

          {scope === 'Resource Tags' && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted ml-1">Key</label>
                <input 
                  type="text"
                  placeholder="e.g. Department"
                  value={tagKey}
                  onChange={(e) => setTagKey(e.target.value)}
                  className="w-full bg-surface border border-border-light rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted ml-1">Value</label>
                <input 
                  type="text"
                  placeholder="e.g. Marketing"
                  value={tagValue}
                  onChange={(e) => setTagValue(e.target.value)}
                  className="w-full bg-surface border border-border-light rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <button 
        onClick={() => setStep('config')}
        className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
      >
        Continue to configuration
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderConfig = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center justify-end">
        <span className="text-[10px] font-black tracking-widest text-text-muted">Step 2 of 2: Configuration</span>
      </div>

      {/* SECTION 2: BUDGET & FREQUENCY */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <label className="text-sm font-bold text-text-primary tracking-wider">Budget limit</label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">$</div>
            <input 
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-surface border border-border-light rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="relative">
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-surface border border-border-light rounded-xl px-4 py-3 text-sm font-medium text-text-primary appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            >
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>
      </section>

      {/* SECTION 3: ESCALATION TIERS */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <label className="text-sm font-bold text-text-primary tracking-wider">Alert tiers</label>
          </div>
          <button 
            type="button"
            onClick={addThreshold}
            className="text-primary hover:bg-primary/5 p-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {thresholds.map((t, idx) => (
            <div key={t.id} className="flex items-center gap-3 p-4 bg-surface-hover/30 rounded-2xl border border-border-light/50 animate-in slide-in-from-right-2 duration-300">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-text-muted">At</span>
                <div className="relative w-16">
                  <input 
                    type="number" 
                    defaultValue={t.percentage}
                    className="w-full bg-surface border border-border-light rounded-lg px-2 py-1.5 text-xs font-bold text-center focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">%</span>
                </div>
              </div>
              <div className="h-4 w-px bg-border-light mx-1" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-text-muted shrink-0">Notify</span>
                  <input 
                    type="text" 
                    defaultValue={t.channel}
                    className="flex-1 bg-surface border border-border-light rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-text-muted shrink-0">And</span>
                  <input 
                    type="email" 
                    defaultValue={t.email}
                    className="flex-1 bg-surface border border-border-light rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
              {thresholds.length > 1 && (
                <button 
                  type="button"
                  onClick={() => removeThreshold(t.id)}
                  className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <label className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 cursor-pointer group transition-all hover:bg-primary/10">
          <div className="relative flex items-center">
            <input 
              type="checkbox"
              checked={autoAssign}
              onChange={(e) => setAutoAssign(e.target.checked)}
              className="w-5 h-5 rounded border-border-light text-primary focus:ring-primary/20 cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">Auto-assign optimization task</p>
            <p className="text-xs text-text-secondary">Assign optimization task to owner automatically for the final tier.</p>
          </div>
        </label>
      </section>

      {/* SECTION 4: PROACTIVE PROTECTION */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <label className="text-sm font-bold text-text-primary tracking-wider">Proactive guardrails</label>
        </div>

        <div className="space-y-4">
          <div className={`flex flex-col gap-4 p-4 rounded-2xl border transition-all ${burnVelocity ? 'border-primary/20 bg-primary/5' : 'border-border-light'}`}>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-text-primary">Burn velocity alert</h4>
                <p className="text-xs text-text-secondary mt-1">Alert immediately if spend speed increases significantly in any 1-hour window.</p>
              </div>
              <button 
                type="button"
                onClick={() => setBurnVelocity(!burnVelocity)}
                className={`w-12 h-6 rounded-full transition-all relative ${burnVelocity ? 'bg-primary' : 'bg-surface-hover'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${burnVelocity ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            
            {burnVelocity && (
              <div className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 pt-2 border-t border-primary/10">
                <span className="text-xs font-bold text-text-muted">Threshold</span>
                <div className="relative w-24">
                  <input 
                    type="number"
                    value={burnVelocityThreshold}
                    onChange={(e) => setBurnVelocityThreshold(e.target.value)}
                    className="w-full bg-surface border border-border-light rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">%</span>
                </div>
                <span className="text-xs text-text-secondary italic">increase in 1 hour</span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl border border-border-light hover:border-primary/20 transition-all">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-text-primary">AI forecast alert</h4>
              <p className="text-xs text-text-secondary mt-1">Alert if AI predicts the budget will be exceeded before the end of the period.</p>
            </div>
            <button 
              type="button"
              onClick={() => setPredictive(!predictive)}
              className={`w-12 h-6 rounded-full transition-all relative ${predictive ? 'bg-primary' : 'bg-surface-hover'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${predictive ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
        <p className="text-sm text-text-secondary -mt-4 mb-8">
          Configure automated monitoring and escalation rules for your environment.
        </p>
        
        {step === 'choice' && renderChoice()}
        {step === 'import' && renderImport()}
        {step === 'custom' && renderCustom()}
        {step === 'config' && renderConfig()}
      </div>

      {/* Footer - Only shown in config step */}
      {step === 'config' && (
        <div className="px-6 py-6 border-t border-border-light bg-surface-hover/20 flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-text-secondary bg-surface border border-border-light hover:bg-surface-hover transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-[2] px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#6A38EB] hover:bg-[#5A2ED1] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            Initialize guardrail
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SetGuardrailFlow;
