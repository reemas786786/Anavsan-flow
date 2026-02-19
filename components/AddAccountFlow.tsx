import React, { useState } from 'react';
import { IconClose, IconClipboardCopy, IconCheck, IconHelpCircle, IconAdd, IconSparkles, IconUser, IconAdjustments, IconDatabase, IconRefresh, IconInfo, IconChevronRight, IconLockClosed, IconCheckCircle } from '../constants';

interface AddAccountFlowProps {
    onCancel: () => void;
    onAddAccount: (data: { name: string }) => void;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group bg-[#0D1117] border border-white/5 rounded-2xl p-6 text-left shadow-2xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-status-success shadow-[0_0_8px_rgba(22,163,74,0.5)]"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Snowflake Worksheet</span>
                </div>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-tighter"
                >
                    {copied ? <IconCheck className="w-3.5 h-3.5 text-status-success" /> : <IconClipboardCopy className="w-3.5 h-3.5" />}
                    {copied ? 'Copy SQL' : 'Copy SQL'}
                </button>
            </div>
            <pre className="text-[12px] font-mono text-gray-300 leading-relaxed overflow-x-auto whitespace-pre custom-scrollbar flex-grow">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const AddAccountFlow: React.FC<AddAccountFlowProps> = ({ onCancel, onAddAccount }) => {
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        identifier: '',
        username: '',
        anavsanUsername: 'anavsan_user',
        password: '',
        role: 'anavsan_role',
        warehouse: 'anavsan_wh'
    });

    const handleConnect = () => {
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            onAddAccount({ name: formData.name });
        }, 3000);
    };

    const setupScript = `-- Consolidated Setup Script for Anavsan
-- Run this in a Snowflake worksheet as ACCOUNTADMIN

-- 1. Create dedicated user
CREATE OR REPLACE USER anavsan_user
  PASSWORD = '<StrongPassword>'
  MUST_CHANGE_PASSWORD = FALSE;

-- 2. Create optimized role
CREATE OR REPLACE ROLE anavsan_role;
GRANT ROLE anavsan_role TO USER anavsan_user;

-- 3. Grant metadata access
GRANT IMPORTED PRIVILEGES ON DATABASE SNOWFLAKE 
  TO ROLE anavsan_role;
GRANT MONITOR USAGE ON ACCOUNT TO ROLE anavsan_role;

-- 4. Create resource-efficient warehouse
CREATE OR REPLACE WAREHOUSE anavsan_wh
  WAREHOUSE_SIZE = XSMALL
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  INITIALLY_SUSPENDED = TRUE;

GRANT USAGE ON WAREHOUSE anavsan_wh TO ROLE anavsan_role;
ALTER USER anavsan_user SET DEFAULT_WAREHOUSE = anavsan_wh;
ALTER USER anavsan_user SET DEFAULT_ROLE = anavsan_role;`;

    const isFormValid = formData.name && formData.identifier && formData.username && formData.password;

    return (
        <div className="flex h-full bg-white relative">
            {/* Main Content Area */}
            <div className="flex-grow flex flex-col min-w-0">
                {/* Fixed Header */}
                <div className="px-10 pt-10 pb-6 bg-white flex-shrink-0 border-b border-border-light">
                    <div className="flex justify-between items-center">
                        <div className="text-left">
                            <h1 className="text-[32px] font-black text-text-strong tracking-tight leading-tight">Connect your Snowflake account</h1>
                            <p className="text-base text-text-secondary font-medium mt-1">Initialize your optimization engine in one simple step.</p>
                        </div>
                        {!isGuideOpen && (
                            <button 
                                onClick={() => setIsGuideOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                            >
                                <IconHelpCircle className="w-4 h-4" />
                                Show guide
                            </button>
                        )}
                    </div>
                </div>

                {/* Unified Form area - Updated to Horizontal Layout for major components */}
                <div className="flex-grow overflow-y-auto bg-[#F8F9FB] no-scrollbar">
                    <div className="px-10 py-10 space-y-12 text-left max-w-[1600px] mx-auto">
                        
                        <div className="flex flex-col xl:flex-row gap-12 items-start">
                            
                            {/* Left Side: Forms Column */}
                            <div className="w-full xl:w-[420px] space-y-12 flex-shrink-0">
                                
                                {/* Column 1: Account Identification */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-8 h-8 rounded-lg bg-status-success/10 flex items-center justify-center text-status-success">
                                            <IconCheck className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-black text-text-strong uppercase tracking-widest">Account information</h3>
                                            <p className="text-[10px] text-text-muted font-bold uppercase mt-0.5 tracking-tight">Validate information for mapping</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Account display name <span className="text-status-error">*</span></label>
                                            <input 
                                                type="text" 
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full bg-white border border-border-light rounded-[20px] px-6 py-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all font-medium"
                                                placeholder="e.g. Production Data"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Snowflake account identifier <span className="text-status-error">*</span></label>
                                            <input 
                                                type="text" 
                                                value={formData.identifier}
                                                onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                                                className="w-full bg-white border border-border-light rounded-[20px] px-6 py-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all font-mono"
                                                placeholder="e.g. XY12345.us-east-1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Admin Snowflake username <span className="text-status-error">*</span></label>
                                            <input 
                                                type="text" 
                                                value={formData.username}
                                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                                className="w-full bg-white border border-border-light rounded-[20px] px-6 py-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all font-medium"
                                                placeholder="e.g. jdoe"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-border-light w-full"></div>

                                {/* Column 2: Create Anavsan User (Stacked vertically) */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">2</div>
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-black text-text-strong uppercase tracking-widest">Create Anavsan user</h3>
                                            <p className="text-[10px] text-text-muted font-bold uppercase mt-0.5 tracking-tight">Securely connect to your data platform</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Assigned Username</label>
                                            <input 
                                                type="text" 
                                                value={formData.anavsanUsername}
                                                readOnly
                                                className="w-full bg-surface-nested border border-border-light rounded-[16px] px-5 py-3.5 text-sm font-bold text-text-muted outline-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Password <span className="text-status-error">*</span></label>
                                            <input 
                                                type="password" 
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                className="w-full bg-white border border-border-light rounded-[16px] px-5 py-3.5 text-sm focus:ring-1 focus:ring-primary outline-none shadow-sm font-medium"
                                                placeholder="Enter password used in script"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Role Name</label>
                                            <input 
                                                type="text" 
                                                value={formData.role}
                                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                className="w-full bg-white border border-border-light rounded-[16px] px-5 py-3.5 text-sm focus:ring-1 focus:ring-primary outline-none shadow-sm font-mono"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Warehouse Name</label>
                                            <input 
                                                type="text" 
                                                value={formData.warehouse}
                                                onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
                                                className="w-full bg-white border border-border-light rounded-[16px] px-5 py-3.5 text-sm focus:ring-1 focus:ring-primary outline-none shadow-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3">
                                        <IconInfo className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-text-secondary font-medium leading-relaxed">
                                            Handshake verification typically takes 10-15 seconds.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Column 3: Consolidated Setup Script Area (PLACED HORIZONTALLY) */}
                            <div className="flex-grow space-y-6 w-full xl:w-auto h-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-sidebar-topbar text-white flex items-center justify-center">
                                        <IconAdjustments className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-text-strong tracking-tight">Consolidated Setup Script</h3>
                                        <p className="text-sm text-text-secondary font-medium">Run this script as <span className="font-bold text-text-strong underline decoration-primary/30 underline-offset-2">ACCOUNTADMIN</span> in Snowflake.</p>
                                    </div>
                                </div>
                                
                                <div className="h-[640px]">
                                    <CodeBlock code={setupScript} />
                                </div>

                                <div className="flex items-center gap-4 bg-white p-6 rounded-[24px] border border-border-light shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-status-success-light flex items-center justify-center flex-shrink-0">
                                        <IconCheckCircle className="w-6 h-6 text-status-success-dark" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-text-strong">Secure hand-shake</h4>
                                        <p className="text-xs text-text-secondary leading-relaxed font-medium">
                                            Anavsan performs a metadata-only audit. No production table data is accessed or stored.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-10 py-8 bg-white flex items-center justify-center flex-shrink-0 border-t border-border-light z-30">
                    <div className="flex items-center gap-6 w-full max-w-7xl">
                        <button 
                            onClick={onCancel} 
                            disabled={isVerifying}
                            className="px-8 py-3.5 rounded-2xl text-text-secondary font-black text-xs uppercase tracking-widest hover:bg-surface-nested active:scale-95 transition-all disabled:opacity-30"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConnect} 
                            disabled={!isFormValid || isVerifying}
                            className="ml-auto px-16 py-4 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-[24px] hover:bg-primary-hover active:scale-[0.98] transition-all shadow-2xl shadow-primary/20 flex items-center gap-4 disabled:bg-gray-300 disabled:shadow-none"
                        >
                            {isVerifying ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Verifying Handshake...</span>
                                </>
                            ) : (
                                <>
                                    <IconRefresh className="w-4 h-4" />
                                    <span>Verify & Connect Account</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Guide Sidebar */}
            {isGuideOpen && (
                <aside className="hidden xl:flex w-[380px] border-l border-border-light h-full bg-white flex-col flex-shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10 overflow-hidden">
                    <div className="p-8 border-b border-border-light flex justify-between items-center bg-surface-nested/50">
                        <div className="flex items-center gap-3">
                            <IconSparkles className="w-5 h-5 text-primary" />
                            <h3 className="text-sm font-black text-text-strong uppercase tracking-[0.15em]">Setup guide</h3>
                        </div>
                        <button 
                            onClick={() => setIsGuideOpen(false)}
                            className="text-text-muted hover:text-text-primary p-2 hover:bg-white rounded-xl transition-all shadow-sm"
                        >
                            <IconClose className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-8 scroll-smooth no-scrollbar space-y-10">
                        <div className="bg-white rounded-[24px] p-6 border border-border-light space-y-6 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="bg-[#D1FAE5] text-[#059669] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-[#059669]/10 shadow-sm">
                                    Safeguards
                                </span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#059669] mt-1.5 flex-shrink-0" />
                                    <p className="text-[13px] leading-relaxed">
                                        <strong className="text-text-strong">Limited Access:</strong> 
                                        <span className="text-text-secondary font-medium ml-1">Anavsan only reads optimization metadata, never your raw business data.</span>
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#059669] mt-1.5 flex-shrink-0" />
                                    <p className="text-[13px] leading-relaxed">
                                        <strong className="text-text-strong">Efficiency:</strong> 
                                        <span className="text-text-secondary font-medium ml-1">The setup script ensures Anavsan runs on an X-Small warehouse to minimize costs.</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                                <IconInfo className="w-4 h-4" />
                                <h4>Configuration steps</h4>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h5 className="text-[13px] font-bold text-text-strong">1. Run Setup Script</h5>
                                    <p className="text-xs text-text-secondary leading-relaxed font-medium">Run the SQL on the right in your Snowflake console as ACCOUNTADMIN to create a secure monitor account.</p>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="text-[13px] font-bold text-text-strong">2. Enter Credentials</h5>
                                    <p className="text-xs text-text-secondary leading-relaxed font-medium">Provide the password you set in the script. Anavsan will use these to log in and query metadata.</p>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="text-[13px] font-bold text-text-strong">3. Connect & Analyze</h5>
                                    <p className="text-xs text-text-secondary leading-relaxed font-medium">Once verified, we begin analyzing your last 30 days of metadata to generate initial cost-saving reports.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 pb-8">
                            <div className="p-5 bg-surface-nested rounded-3xl border border-border-light flex gap-4">
                                <IconCheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                <p className="text-[12px] text-text-secondary font-medium leading-relaxed">
                                    <span className="font-bold text-text-strong">Admin Required:</span> Contact your Snowflake administrator to execute the setup script if you don't have account-level privileges.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
};

export default AddAccountFlow;