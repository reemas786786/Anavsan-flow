
import React, { useState } from 'react';
import { IconClose, IconClipboardCopy, IconCheck, IconPhoto, IconFileText, IconHelpCircle, IconAdd, IconChevronDown, IconSparkles, IconUser, IconAdjustments, IconDatabase, IconRefresh, IconInfo } from '../constants';

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
        <div className="relative group bg-surface-nested border border-border-color rounded-lg p-4 mt-2 text-left">
            <button 
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-white border border-border-color text-text-muted hover:text-primary transition-colors shadow-sm z-10"
                title="Copy code"
            >
                {copied ? <IconCheck className="w-3.5 h-3.5 text-status-success" /> : <IconClipboardCopy className="w-3.5 h-3.5" />}
            </button>
            <pre className="text-[11px] font-mono text-text-primary leading-relaxed overflow-x-auto whitespace-pre custom-scrollbar">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const OptimizationScope: React.FC = () => (
    <div className="bg-white rounded-[24px] p-6 border border-border-light mb-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2">
            <span className="bg-[#D1FAE5] text-[#059669] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-[#059669]/10 shadow-sm">
                Optimization scope
            </span>
        </div>
        <div className="space-y-5">
            <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#059669] mt-1.5 flex-shrink-0" />
                <p className="text-[13px] leading-relaxed">
                    <strong className="text-text-strong">Metadata access only:</strong> 
                    <span className="text-text-secondary font-medium ml-1">We only access ACCOUNT_USAGE and ORGANIZATION_USAGE.</span>
                </p>
            </div>
            <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#059669] mt-1.5 flex-shrink-0" />
                <p className="text-[13px] leading-relaxed">
                    <strong className="text-text-strong">Zero data access:</strong> 
                    <span className="text-text-secondary font-medium ml-1">Anavsan does not read or store your actual table data.</span>
                </p>
            </div>
            <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#059669] mt-1.5 flex-shrink-0" />
                <p className="text-[13px] leading-relaxed">
                    <strong className="text-text-strong">Non-Intrusive:</strong> 
                    <span className="text-text-secondary font-medium ml-1">We do not execute production queries or modify your environment.</span>
                </p>
            </div>
            <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#059669] mt-1.5 flex-shrink-0" />
                <p className="text-[13px] leading-relaxed">
                    <strong className="text-text-strong">Resource efficient:</strong> 
                    <span className="text-text-secondary font-medium ml-1">Runs on an X-SMALL warehouse with auto-suspend to keep your costs low.</span>
                </p>
            </div>
        </div>
    </div>
);

const QuickGuideContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => (
    <div className="space-y-8 text-left pb-12">
        <OptimizationScope />
        
        <div className="h-px bg-border-light w-full"></div>

        {/* Consolidated Code Snippet */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <IconClipboardCopy className="w-4 h-4" />
                <h4>Consolidated setup script</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
                Copy and run this single script in a Snowflake worksheet to perform all the necessary setup steps at once.
            </p>
            <CodeBlock code={`-- 1. Create User
CREATE OR REPLACE USER anavsan_user
PASSWORD = '<StrongPassword>'
MUST_CHANGE_PASSWORD = FALSE;

-- 2. Create Role & Grant Permissions
CREATE OR REPLACE ROLE anavsan_role;
GRANT ROLE anavsan_role TO USER anavsan_user;
GRANT IMPORTED PRIVILEGES ON DATABASE SNOWFLAKE TO ROLE anavsan_role;
GRANT MONITOR USAGE ON ACCOUNT TO ROLE anavsan_role;

-- 3. Create Warehouse & Assign Defaults
CREATE OR REPLACE WAREHOUSE anavsan_wh
WAREHOUSE_SIZE = XSMALL
AUTO_SUSPEND = 300
AUTO_RESUME = TRUE
INITIALLY_SUSPENDED = TRUE;

ALTER USER anavsan_user SET DEFAULT_WAREHOUSE = anavsan_wh;
GRANT USAGE ON WAREHOUSE anavsan_wh TO ROLE anavsan_role;

-- 4. Network Policy (Optional)
-- CREATE OR REPLACE NETWORK POLICY anavsan_network_policy
-- ALLOWED_IP_LIST = ('3.130.165.248');
-- ALTER USER anavsan_user SET NETWORK_POLICY = anavsan_network_policy;`} />
        </section>

        <div className="h-px bg-border-light w-full"></div>

        <section className="space-y-3">
            <div className="flex items-center gap-2 text-text-strong font-bold text-sm">
                <IconUser className="w-4 h-4" />
                <h4>Create a Snowflake user</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
                Anavsan connects to Snowflake using a dedicated user. The script above creates a secure user named <span className="font-mono text-text-primary">anavsan_user</span>.
            </p>
            <ul className="list-disc pl-5 text-xs text-text-secondary space-y-2 leading-relaxed">
                <li>Ensure you are logged in with a role that has user creation privileges (like ACCOUNTADMIN).</li>
                <li>Remember to replace <span className="font-mono text-text-primary font-bold">&lt;StrongPassword&gt;</span> with your actual password.</li>
            </ul>
        </section>

        <section className="space-y-3">
            <div className="flex items-center gap-2 text-text-strong font-bold text-sm">
                <IconAdjustments className="w-4 h-4" />
                <h4>Create or choose a role</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
                The script creates <span className="font-mono text-text-primary">anavsan_role</span> and grants it necessary permissions to monitor account usage and performance.
            </p>
            <ul className="list-disc pl-5 text-xs text-text-secondary space-y-2 leading-relaxed">
                <li>Creating a dedicated role keeps your permissions cleaner and more secure.</li>
                <li>Anavsan requires imported privileges on the Snowflake database to read shared metadata.</li>
            </ul>
        </section>

        <section className="space-y-3">
            <div className="flex items-center gap-2 text-text-strong font-bold text-sm">
                <IconDatabase className="w-4 h-4" />
                <h4>Create a warehouse</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
                A warehouse is required for Anavsan to run background tasks like fetching metadata and generating performance insights.
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
                The script creates an <span className="font-mono text-text-primary">XSMALL</span> warehouse named <span className="font-mono text-text-primary">anavsan_wh</span> with an efficient 5-minute auto-suspend policy.
            </p>
        </section>

        <section className="space-y-3">
            <div className="flex items-center gap-2 text-text-strong font-bold text-sm">
                <IconRefresh className="w-4 h-4" />
                <h4>Update network policies</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
                If your account restricts access by IP address, you must allow Anavsan's static IP to ensure a successful connection.
            </p>
        </section>

        <section className="space-y-4">
            <div className="p-4 bg-surface-nested rounded-xl border border-border-light">
                <p className="text-xs text-text-secondary leading-relaxed mb-3">
                    Use the user, role, and warehouse from the script above to fill out the form and securely connect your account.
                </p>
                <div className="flex items-start gap-2">
                    <IconInfo className="w-3.5 h-3.5 text-text-strong mt-0.5" />
                    <p className="text-xs text-text-secondary leading-relaxed">
                        <span className="font-bold text-text-strong">Best practice:</span> Always use dedicated service credentials for third-party integrations to maintain robust security audits.
                    </p>
                </div>
            </div>
        </section>
    </div>
);

const AddAccountFlow: React.FC<AddAccountFlowProps> = ({ onCancel, onAddAccount }) => {
    const [step, setStep] = useState(1);
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        identifier: '',
        username: '',
        anavsanUsername: 'rengalakshmanan@anavsan.com',
        password: '',
        authMethod: 'password',
        role: '',
        warehouse: ''
    });

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleAdd = () => {
        onAddAccount({ name: formData.name });
    };

    return (
        <div className="flex h-full bg-white relative">
            {/* Main Content Area */}
            <div className="flex-grow flex flex-col min-w-0">
                {/* Fixed Header */}
                <div className="px-10 pt-8 pb-4 bg-white flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="text-left">
                            <h1 className="text-2xl font-bold text-text-strong">Connect your Snowflake account</h1>
                        </div>
                        {!isGuideOpen && (
                            <button 
                                onClick={() => setIsGuideOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                            >
                                <IconHelpCircle className="w-4 h-4" />
                                Show guide
                            </button>
                        )}
                    </div>
                    
                    {/* Stepped Progress */}
                    <div className="mt-8 flex items-center gap-12 border-b border-border-light relative overflow-x-auto no-scrollbar">
                        <div className={`pb-4 flex items-center gap-2 border-b-2 transition-colors relative z-10 flex-shrink-0 ${step === 1 ? 'border-primary' : 'border-transparent opacity-60'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 1 ? 'bg-primary text-white' : 'bg-status-success text-white'}`}>
                                {step > 1 ? <IconCheck className="w-3 h-3" /> : '1'}
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-text-strong tracking-wide">Account information</p>
                                <p className="text-[10px] text-text-muted font-medium">Validate information for mapping and optimization.</p>
                            </div>
                        </div>
                        <div className={`pb-4 flex items-center gap-2 border-b-2 transition-colors relative z-10 flex-shrink-0 ${step === 2 ? 'border-primary' : 'border-transparent opacity-60'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${step === 2 ? 'bg-primary border-primary text-white' : 'border-border-color text-text-muted'}`}>
                                2
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-text-strong tracking-wide">Create Anavsan user</p>
                                <p className="text-[10px] text-text-muted font-medium">Securely connect to your data platform.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form area */}
                <div className="flex-grow overflow-y-auto bg-[#F8F9FB]">
                    <div className="px-10 py-8 space-y-8 text-left">
                        
                        {isGuideOpen && (
                            <div className="lg:hidden mb-8 bg-white border border-border-light rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="px-6 py-4 bg-background border-b border-border-light flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-text-strong">Quick guide</h3>
                                    <button 
                                        onClick={() => setIsGuideOpen(false)}
                                        className="text-text-muted hover:text-text-primary p-1 hover:bg-surface-nested rounded"
                                    >
                                        <IconClose className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <QuickGuideContent />
                                </div>
                            </div>
                        )}

                        <div className="max-w-xl space-y-8">
                            {step === 1 ? (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-text-primary">Account display name <span className="text-status-error">*</span></label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-white border border-border-color rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all"
                                            placeholder="E.g. Marketing team"
                                        />
                                        <p className="text-[11px] text-text-muted font-medium ml-1">A label to identify this account inside Anavsan.</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-text-primary">Snowflake account identifier <span className="text-status-error">*</span></label>
                                        <input 
                                            type="text" 
                                            value={formData.identifier}
                                            onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                                            className="w-full bg-white border border-border-color rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all"
                                            placeholder="E.g. PSYOLHN-NM24806"
                                        />
                                        <p className="text-[11px] text-text-muted font-medium ml-1">Your Snowflake account’s unique locator.</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-text-primary">Snowflake username <span className="text-status-error">*</span></label>
                                        <input 
                                            type="text" 
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            className="w-full bg-white border border-border-color rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all"
                                            placeholder="E.g. John.doe"
                                        />
                                        <p className="text-[11px] text-text-muted font-medium ml-1">The login username for your Snowflake account.</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-text-primary">Anavsan username <span className="text-status-error">*</span></label>
                                        <input 
                                            type="text" 
                                            value={formData.anavsanUsername}
                                            readOnly
                                            className="w-full bg-white border border-border-color rounded-2xl px-5 py-3.5 text-sm outline-none shadow-sm transition-all text-text-primary font-medium"
                                        />
                                        <p className="text-[11px] text-text-muted font-medium ml-1">The dedicated Snowflake user created for Anavsan (anavsan_user)</p>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-text-primary">Authentication method</label>
                                        <div className="flex gap-8">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    type="radio" 
                                                    name="auth" 
                                                    checked={formData.authMethod === 'password'} 
                                                    onChange={() => setFormData({...formData, authMethod: 'password'})}
                                                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                                />
                                                <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">Password</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    type="radio" 
                                                    name="auth" 
                                                    checked={formData.authMethod === 'keypair'} 
                                                    onChange={() => setFormData({...formData, authMethod: 'keypair'})}
                                                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                                />
                                                <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">Key pair</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-text-primary">Password <span className="text-status-error">*</span></label>
                                        <div className="relative group">
                                            <input 
                                                type="password" 
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                className="w-full bg-white border border-border-color rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all"
                                                placeholder="••••••••••••"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-surface-nested rounded-lg text-text-muted cursor-pointer">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-text-muted font-medium ml-1">The password created for the dedicated Anavsan Snowflake user.</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-text-primary">Role <span className="text-status-error">*</span></label>
                                        <input 
                                            type="text" 
                                            value={formData.role}
                                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                                            className="w-full bg-white border border-border-color rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all"
                                            placeholder="E.g. ACCOUNTADMIN"
                                        />
                                        <p className="text-[11px] text-text-muted font-medium ml-1">Snowflake role assigned to the Anavsan user (anavsan_role).</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-text-primary">Warehouse name <span className="text-status-error">*</span></label>
                                        <input 
                                            type="text" 
                                            value={formData.warehouse}
                                            onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
                                            className="w-full bg-white border border-border-color rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all"
                                            placeholder="E.g. anavsan_wh"
                                        />
                                        <p className="text-[11px] text-text-muted font-medium ml-1">Warehouse used by Anavsan for metadata and insights.</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-10 py-6 bg-white flex items-center justify-start flex-shrink-0 border-t border-border-light">
                    <div className="flex items-center gap-4">
                        {step === 1 ? (
                            <>
                                <button 
                                    onClick={onCancel} 
                                    className="px-8 py-2.5 rounded-xl bg-gray-100 text-text-primary font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleNext} 
                                    disabled={!formData.name || !formData.identifier || !formData.username}
                                    className="px-10 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:bg-gray-300 disabled:shadow-none"
                                >
                                    Next
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={handleBack} 
                                    className="px-8 py-2.5 rounded-xl bg-gray-100 text-text-primary font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all shadow-sm"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={handleAdd} 
                                    disabled={!formData.password || !formData.role || !formData.warehouse}
                                    className="px-10 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:bg-gray-300 disabled:shadow-none"
                                >
                                    <span>Connect</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Guide Sidebar */}
            {isGuideOpen && (
                <aside className="hidden lg:flex w-[340px] border-l border-border-light h-full bg-white flex-col flex-shrink-0 shadow-[-4px_0_12px_rgba(0,0,0,0.02)] z-10">
                    <div className="p-6 border-b border-border-light flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <IconSparkles className="w-5 h-5 text-primary" />
                            <h3 className="text-base font-bold text-text-strong">Quick guide</h3>
                        </div>
                        <button 
                            onClick={() => setIsGuideOpen(false)}
                            className="text-text-muted hover:text-text-primary p-1 hover:bg-surface-nested rounded"
                        >
                            <IconClose className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-6 scroll-smooth no-scrollbar">
                        <QuickGuideContent />
                    </div>
                </aside>
            )}
        </div>
    );
};

export default AddAccountFlow;
