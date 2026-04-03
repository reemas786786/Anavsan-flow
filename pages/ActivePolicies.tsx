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
  AlertTriangle, 
  Trash2,
  Settings,
  Info,
  Clock
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

const ActivePolicies: React.FC = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Active policies</h1>
          <p className="text-text-secondary mt-1 text-lg">
            Define autonomous rules to govern Snowflake efficiency.
          </p>
        </div>
        <button 
          onClick={() => setIsSidePanelOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6A38EB] hover:bg-[#582ed1] text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          <span>Create policy</span>
        </button>
      </div>

      {/* Top Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-border-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Total policies</p>
            <p className="text-2xl font-bold text-text-primary">12</p>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <div className="flex -space-x-2">
              <Bot className="w-5 h-5" />
              <User className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Autonomous vs guided</p>
            <p className="text-2xl font-bold text-text-primary">8 / 4</p>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Total actions taken</p>
            <p className="text-2xl font-bold text-text-primary">1,284</p>
          </div>
        </div>
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
                        <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                          <Bot className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-tight">Autonomous</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-primary bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                          <User className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-tight">Guided</span>
                        </div>
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
              className="fixed top-0 right-0 bottom-0 w-[500px] bg-surface shadow-2xl z-[70] flex flex-col border-l border-border-light"
            >
              <div className="p-6 border-b border-border-light flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">Create new policy</h2>
                  <p className="text-sm text-text-secondary">Design a logic-based rule for Snowflake.</p>
                </div>
                <button 
                  onClick={() => setIsSidePanelOpen(false)}
                  className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45 text-text-muted" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Section 1: Scope */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                    <h3 className="font-bold text-text-primary">Target scope</h3>
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

                {/* Logic Connector */}
                <div className="pl-10 flex justify-center">
                  <div className="w-0.5 h-8 bg-border-light relative">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-border-light" />
                  </div>
                </div>

                {/* Section 2: Condition */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
                    <h3 className="font-bold text-text-primary">Condition builder</h3>
                  </div>
                  <div className="pl-10 space-y-4">
                    <div className="p-4 bg-surface-subtle border border-border-light rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                        <span>If</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <select className="px-3 py-2 bg-background border border-border-light rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option>Inactivity</option>
                          <option>Est. query cost</option>
                          <option>Avg. utilization</option>
                          <option>Table size</option>
                          <option>Cortex credits</option>
                        </select>
                        <select className="px-3 py-2 bg-background border border-border-light rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option>Is greater than</option>
                          <option>Is less than</option>
                          <option>Equals</option>
                          <option>Contains</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Value"
                          className="px-3 py-2 bg-background border border-border-light rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <button className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        <span>Add AND condition</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logic Connector */}
                <div className="pl-10 flex justify-center">
                  <div className="w-0.5 h-8 bg-border-light relative">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-border-light" />
                  </div>
                </div>

                {/* Section 3: Action */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">3</div>
                    <h3 className="font-bold text-text-primary">Action</h3>
                  </div>
                  <div className="pl-10 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {['Suspend', 'Resize', 'Archive', 'Alert'].map((action) => (
                        <button 
                          key={action}
                          className="flex items-center justify-between p-3 border border-border-light rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                          <span className="text-sm font-medium text-text-secondary group-hover:text-primary">{action}</span>
                          <div className="w-4 h-4 rounded-full border border-border-light group-hover:border-primary" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Logic Connector */}
                <div className="pl-10 flex justify-center">
                  <div className="w-0.5 h-8 bg-border-light relative">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-border-light" />
                  </div>
                </div>

                {/* Section 4: Execution Mode */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">4</div>
                    <h3 className="font-bold text-text-primary">Execution mode</h3>
                  </div>
                  <div className="pl-10 space-y-4">
                    <div className="flex p-1 bg-surface-subtle border border-border-light rounded-xl">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface shadow-sm rounded-lg text-primary font-bold text-sm border border-border-light">
                        <Bot className="w-4 h-4" />
                        <span>Autonomous</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-text-secondary font-medium text-sm">
                        <User className="w-4 h-4" />
                        <span>Guided</span>
                      </button>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        <span className="font-bold">Autonomous mode</span> will execute the action automatically without human intervention. Recommended for low-risk guardrails like auto-suspending idle dev warehouses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border-light bg-surface-subtle flex gap-3">
                <button 
                  onClick={() => setIsSidePanelOpen(false)}
                  className="flex-1 py-3 border border-border-light rounded-xl font-bold text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-[#6A38EB] hover:bg-[#582ed1] text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
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
