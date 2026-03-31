import React, { useState, useEffect, useMemo } from 'react';
import { IconClose, IconClipboardCopy, IconCheck, IconHelpCircle, IconAdd, IconSparkles, IconUser, IconAdjustments, IconDatabase, IconRefresh, IconInfo, IconChevronRight, IconLockClosed, IconCheckCircle, IconXCircle } from '../constants';
import Toast from './Toast';

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

// Persist last connection time across component remounts for simulation purposes
let globalLastConnectionTime: number | null = null;

const AddAccountFlow: React.FC<AddAccountFlowProps> = ({ onCancel, onAddAccount }) => {
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [status, setStatus] = useState<'idle' | 'verifying' | 'error'>('idle');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        identifier: ''
    });

    const handleConnect = () => {
        setIsVerifying(true);
        setStatus('verifying');
        
        const now = Date.now();
        // Simulate an error if another connection is attempted within 30 seconds for demo purposes
        const isRateLimited = globalLastConnectionTime && (now - globalLastConnectionTime < 30000);

        setTimeout(() => {
            setIsVerifying(false);
            
            if (isRateLimited) {
                setStatus('error');
                setToast({ 
                    message: "Connection failed: Handshake timeout. Please wait a moment before trying again.", 
                    type: 'error' 
                });
            } else {
                setStatus('idle');
                setToast({ 
                    message: "Successfully connected to Snowflake account!", 
                    type: 'success' 
                });
                globalLastConnectionTime = now;
                
                // Delay closing the flow so user can see the success toast
                setTimeout(() => {
                    onAddAccount({ name: formData.name });
                }, 2000);
            }
        }, 2000);
    };

    const handleRetry = () => {
        setStatus('idle');
        setToast(null);
    };

    const setupScript = useMemo(() => {
        return `-- Consolidated Setup Script for Anavsan
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
    }, []);

    const handleCopyAndGo = () => {
        navigator.clipboard.writeText(setupScript);
        setToast({ message: "Script copied to clipboard!", type: 'success' });
        window.open("https://app.snowflake.com", "_blank");
    };

    const isFormValid = useMemo(() => {
        return formData.name && formData.identifier;
    }, [formData]);

    return (
        <div className="flex h-full bg-white relative">
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
            {/* Main Content Area */}
            <div className="flex-grow flex flex-col min-w-0">
                {/* Fixed Header */}
                <div className="px-8 pt-6 pb-2 bg-white flex-shrink-0">
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

                {/* Error Banner */}
                {status === 'error' && (
                    <div className="px-8 py-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="bg-status-error/5 border border-status-error/20 rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                            <div className="flex items-center gap-5 text-left">
                                <div className="w-12 h-12 bg-status-error/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <IconXCircle className="w-6 h-6 text-status-error" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-black text-status-error tracking-tight">Connection Failed</h3>
                                    <p className="text-sm text-text-secondary font-medium leading-relaxed">
                                        We couldn't verify your Snowflake account. Please run the required verification script in your Snowflake environment and try again.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <button 
                                    onClick={handleRetry}
                                    className="px-6 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/10"
                                >
                                    Retry Connection
                                </button>
                                <button 
                                    onClick={onCancel}
                                    className="px-6 py-3 bg-white border border-border-light text-text-secondary font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-surface-hover active:scale-95 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Unified Form area - Updated to Vertical Layout for better flow and reduced space */}
                <div className="flex-grow overflow-y-auto bg-[#F8F9FB] no-scrollbar relative">
                    <div className="px-8 py-6 space-y-6 text-left max-w-3xl">
                            
                            <div className="space-y-8">
                            
                            {/* Section 1: Account Information */}
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 gap-y-8">
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Account display name <span className="text-status-error">*</span></label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full max-w-sm bg-white border border-border-light rounded-[20px] px-6 py-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all font-medium"
                                            placeholder="E.g. Marketing team"
                                        />
                                        <p className="text-[11px] text-text-muted font-medium ml-1">A label to identify this account inside Anavsan.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Snowflake account identifier <span className="text-status-error">*</span></label>
                                        <input 
                                            type="text" 
                                            value={formData.identifier}
                                            onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                                            className="w-full max-w-sm bg-white border border-border-light rounded-[20px] px-6 py-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all font-mono"
                                            placeholder="E.g. PSYOLHN-NM24806"
                                        />
                                        <p className="text-[11px] text-text-muted font-medium ml-1">Your Snowflake account’s unique locator.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Setup Script */}
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                                <div className="space-y-8">
                                    {/* Consolidated Setup Script Area */}
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 space-y-6 pt-4">
                                        <div className="flex items-center justify-end">
                                            <button 
                                                onClick={handleCopyAndGo}
                                                className="flex items-center gap-3 px-6 py-3 bg-white border border-border-light rounded-[20px] text-sm font-black text-text-strong hover:bg-surface-hover transition-all shadow-sm active:scale-95"
                                            >
                                                <IconDatabase className="w-5 h-5 text-primary" />
                                                Copy & go to Snowflake
                                            </button>
                                        </div>
                                        
                                        <div className="h-[400px]">
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
                    </div>
                </div>

                {/* Footer Actions */}
                {status !== 'error' && (
                    <div className="px-8 py-6 bg-white flex items-center justify-center flex-shrink-0 border-t border-border-light z-30">
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
                )}
            </div>

            {/* Quick Guide Sidebar */}
            {isGuideOpen && (
                <aside className="hidden xl:flex w-[380px] border-l border-border-light h-full bg-white flex-col flex-shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10 overflow-hidden">
                    <div className="px-8 py-3 flex justify-between items-center bg-surface-nested/50">
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
                                    <h5 className="text-[13px] font-bold text-text-strong">2. Connect & Analyze</h5>
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
