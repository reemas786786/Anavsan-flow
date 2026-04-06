import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Bot, 
  User, 
  Plus, 
  Search, 
  ChevronRight, 
  ArrowRight, 
  Database, 
  Zap, 
  CreditCard,
  AlertTriangle, 
  Trash2,
  Settings,
  Info,
  Clock,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface Policy {
  id: string;
  name: string;
  targetScope: string;
  governanceMode: 'Autonomous' | 'Guided';
  lastExecution: string;
  status: 'Active' | 'Paused';
}

const mockPolicies: Policy[] = [
  {
    id: 'p1',
    name: 'Eliminate Vampire Burn (Idle Warehouse)',
    targetScope: 'Dev Warehouses',
    governanceMode: 'Autonomous',
    lastExecution: '2 mins ago',
    status: 'Active'
  },
  {
    id: 'p2',
    name: 'Prevent Million Dollar Query',
    targetScope: 'Analyst Role',
    governanceMode: 'Autonomous',
    lastExecution: '15 mins ago',
    status: 'Active'
  },
  {
    id: 'p3',
    name: 'Surgical Rightsizing',
    targetScope: 'ETL Warehouses',
    governanceMode: 'Guided',
    lastExecution: '1 hour ago',
    status: 'Active'
  },
  {
    id: 'p4',
    name: 'Storage Lifecycle Cleanup',
    targetScope: 'Staging Tables',
    governanceMode: 'Guided',
    lastExecution: 'Daily at 08:00',
    status: 'Active'
  },
  {
    id: 'p5',
    name: 'Cortex Spend Guardrail',
    targetScope: 'Marketing Account',
    governanceMode: 'Guided',
    lastExecution: '30 mins ago',
    status: 'Active'
  }
];

const KPILabel: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-white px-5 py-2.5 rounded-full border border-border-light shadow-sm flex items-center gap-2 flex-shrink-0 transition-all hover:border-primary/30">
        <span className="text-[13px] text-text-secondary font-medium whitespace-nowrap">{label}:</span>
        <span className="text-[13px] font-black text-text-strong whitespace-nowrap">{value}</span>
    </div>
);

const ActivePolicies: React.FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wizardStep, setWizardStep] = useState<'gallery' | 'config'>('gallery');
  const [selectedBlueprint, setSelectedBlueprint] = useState<string | null>(null);
  const [governanceMode, setGovernanceMode] = useState<'Autonomous' | 'Guided'>('Autonomous');

  const blueprints = [
    {
      id: 'idle-guard',
      name: 'Warehouse Idle-Guard',
      description: 'Automatically suspend warehouses when they are not in use.',
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      roi: 'High',
      roiColor: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 'cost-cap',
      name: 'Query Cost Cap',
      description: 'Kill queries that exceed a specific credit threshold.',
      icon: <CreditCard className="w-6 h-6 text-blue-500" />,
      roi: 'Medium',
      roiColor: 'text-blue-600 bg-blue-50'
    },
    {
      id: 'janitor',
      name: 'Stale Data Janitor',
      description: 'Identify and archive tables that haven\'t been queried in 90 days.',
      icon: <Trash2 className="w-6 h-6 text-rose-500" />,
      roi: 'High',
      roiColor: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 'custom',
      name: 'Custom Policy',
      description: 'Build your own logic from scratch using the condition builder.',
      icon: <Settings className="w-6 h-6 text-text-muted" />,
      roi: 'Variable',
      roiColor: 'text-text-muted bg-surface-subtle'
    }
  ];

  const handleOpenSidePanel = () => {
    setWizardStep('gallery');
    setSelectedBlueprint(null);
    setIsSidePanelOpen(true);
  };

  const handleSelectBlueprint = (id: string) => {
    setSelectedBlueprint(id);
    setWizardStep('config');
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Active policies</h1>
          <p className="text-text-secondary mt-1 text-lg">
            Define autonomous rules to govern Snowflake efficiency.
          </p>
        </div>
        <button 
          onClick={handleOpenSidePanel}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6A38EB] hover:bg-[#582ed1] text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          <span>Create policy</span>
        </button>
      </div>

      {/* Top Pills */}
      <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar flex-shrink-0">
        <KPILabel label="Total Policies" value="12" />
        <KPILabel label="Autonomous" value="8" />
        <KPILabel label="Guided" value="4" />
        <KPILabel label="Total Actions Taken" value="1,284" />
      </div>

      {/* Table Section */}
      <div className="bg-surface rounded-2xl border border-border-light shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border-light flex justify-between items-center bg-surface-subtle">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text"
              placeholder="Search policies..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-surface-hover rounded-lg text-text-secondary transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border-light">
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Target scope</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Governance mode</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Last execution</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {mockPolicies.map((policy) => (
                <tr key={policy.id} className="hover:bg-surface-hover transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${policy.status === 'Active' ? 'bg-green-500' : 'bg-text-muted'}`} />
                      <span className="font-semibold text-text-primary">{policy.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-surface-subtle border border-border-light rounded-lg text-xs font-medium text-text-secondary">
                      {policy.targetScope}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {policy.governanceMode === 'Autonomous' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded border uppercase tracking-wider bg-amber-50 text-amber-800 border-amber-200">
                          <Bot className="w-3 h-3" />
                          Autonomous
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded border uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-200">
                          <User className="w-3 h-3" />
                          Guided
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <Clock className="w-4 h-4" />
                      {policy.lastExecution}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Policy Sidepanel */}
      <AnimatePresence>
        {isSidePanelOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidePanelOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[540px] bg-surface shadow-2xl z-[70] flex flex-col border-l border-border-light"
            >
              <div className="p-6 border-b border-border-light flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {wizardStep === 'config' && (
                    <button 
                      onClick={() => setWizardStep('gallery')}
                      className="p-2 hover:bg-surface-hover rounded-lg text-text-secondary transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-text-primary tracking-tight">
                      {wizardStep === 'gallery' ? 'Select a blueprint' : 'Configure policy'}
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {wizardStep === 'gallery' ? 'Choose a template to get started quickly.' : 'Refine the logic for your new policy.'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSidePanelOpen(false)}
                  className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45 text-text-muted" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {wizardStep === 'gallery' ? (
                  <div className="grid grid-cols-2 gap-4">
                    {blueprints.map((bp) => (
                      <button
                        key={bp.id}
                        onClick={() => handleSelectBlueprint(bp.id)}
                        className="flex flex-col text-left p-5 bg-surface border border-border-light rounded-2xl hover:border-primary hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2.5 bg-surface-subtle rounded-xl group-hover:bg-primary/5 transition-colors">
                            {bp.icon}
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${bp.roiColor}`}>
                            ROI: {bp.roi}
                          </span>
                        </div>
                        <h3 className="font-bold text-text-primary mb-1">{bp.name}</h3>
                        <p className="text-xs text-text-secondary leading-relaxed">{bp.description}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Step 1: Logic */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                        <h3 className="font-bold text-text-primary">Policy Logic</h3>
                      </div>
                      <div className="pl-10 space-y-4">
                        <div className="p-5 bg-surface-subtle border border-border-light rounded-2xl space-y-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Suggested Logic</span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-text-primary leading-loose">
                            <span className="text-text-muted font-bold">IF</span>
                            <span className="px-2 py-1 bg-white border border-border-light rounded-lg font-bold shadow-sm">
                              {selectedBlueprint === 'idle-guard' ? 'Inactivity' : 
                               selectedBlueprint === 'cost-cap' ? 'Query Cost' : 
                               selectedBlueprint === 'janitor' ? 'Last Accessed' : 'Condition'}
                            </span>
                            <span className="text-text-muted font-bold">IS GREATER THAN</span>
                            <div className="relative inline-block">
                              <input 
                                type="text" 
                                defaultValue={selectedBlueprint === 'idle-guard' ? '60 seconds' : 
                                             selectedBlueprint === 'cost-cap' ? '$100' : 
                                             selectedBlueprint === 'janitor' ? '90 days' : ''}
                                className="w-28 px-3 py-1 bg-white border border-border-light rounded-lg text-center font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none shadow-sm"
                              />
                            </div>
                            <span className="text-text-muted font-bold">THEN</span>
                            <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg font-bold shadow-sm">
                              {selectedBlueprint === 'idle-guard' ? 'Execute Suspend' : 
                               selectedBlueprint === 'cost-cap' ? 'Abort Query' : 
                               selectedBlueprint === 'janitor' ? 'Archive Table' : 'Action'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Scope */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
                        <h3 className="font-bold text-text-primary">Target Scope</h3>
                      </div>
                      <div className="pl-10 space-y-3">
                        <p className="text-sm text-text-secondary">Select which resources this policy applies to.</p>
                        <div className="relative">
                          <select className="w-full pl-4 pr-10 py-3 bg-background border border-border-light rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                            <option>All warehouses</option>
                            <option>Smart group: Development</option>
                            <option>Smart group: Production</option>
                            <option>Specific warehouse: COMPUTE_WH</option>
                            <option>Specific warehouse: ANALYST_WH</option>
                          </select>
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted rotate-90" />
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Governance Mode */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">3</div>
                        <h3 className="font-bold text-text-primary">Governance Mode</h3>
                      </div>
                      <div className="pl-10 space-y-4">
                        <div className="flex p-1 bg-surface-subtle border border-border-light rounded-2xl">
                          <button 
                            onClick={() => setGovernanceMode('Autonomous')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${
                              governanceMode === 'Autonomous' 
                                ? 'bg-white shadow-sm text-primary border border-border-light' 
                                : 'text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            <Bot className={`w-4 h-4 ${governanceMode === 'Autonomous' ? 'text-primary' : ''}`} />
                            <span>Autonomous</span>
                          </button>
                          <button 
                            onClick={() => setGovernanceMode('Guided')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${
                              governanceMode === 'Guided' 
                                ? 'bg-white shadow-sm text-primary border border-border-light' 
                                : 'text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            <User className={`w-4 h-4 ${governanceMode === 'Guided' ? 'text-primary' : ''}`} />
                            <span>Guided</span>
                          </button>
                        </div>
                        
                        <AnimatePresence mode="wait">
                          <motion.div 
                            key={governanceMode}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className={`p-4 rounded-xl flex gap-3 border ${
                              governanceMode === 'Autonomous' 
                                ? 'bg-amber-50 border-amber-100' 
                                : 'bg-blue-50 border-blue-100'
                            }`}
                          >
                            {governanceMode === 'Autonomous' ? (
                              <>
                                <Bot className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 leading-relaxed">
                                  <span className="font-bold">Autonomous mode:</span> Anavsan will execute the SQL command automatically in Snowflake. Recommended for low-risk guardrails like auto-suspending idle dev warehouses.
                                </p>
                              </>
                            ) : (
                              <>
                                <User className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-800 leading-relaxed">
                                  <span className="font-bold">Guided mode:</span> Anavsan will create a task for an engineer to review and approve before any action is taken. Recommended for production-critical changes.
                                </p>
                              </>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border-light bg-surface-subtle flex gap-3">
                <button 
                  onClick={() => setIsSidePanelOpen(false)}
                  className="flex-1 py-3 border border-border-light rounded-xl font-bold text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={wizardStep === 'gallery'}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    wizardStep === 'gallery' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-[#6A38EB] hover:bg-[#582ed1] text-white shadow-lg shadow-primary/20'
                  }`}
                >
                  <span>Activate policy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivePolicies;
