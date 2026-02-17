import React from 'react';
import { IconArrowRight, IconCheck, IconCode } from '../constants';

const IconShieldCheck: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const IconBuilding: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
);

const IconUsersCollaborate: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M18.5 15H21.5C22.2956 15 23.0587 15.3161 23.6213 15.8787C24.1839 16.4413 24.5 17.2044 24.5 18V20M8.5 11C10.9853 11 13 8.98528 13 6.5C13 4.01472 10.9853 2 8.5 2C6.01472 2 4 4.01472 4 6.5C4 8.98528 6.01472 11 8.5 11ZM18.5 11C20.433 11 22 9.433 22 7.5C22 5.567 20.433 4 18.5 4C16.567 4 15 5.567 15 7.5C15 9.433 16.567 11 18.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const FeatureCheckItem: React.FC<{ label: string }> = ({ label }) => (
    <div className="flex items-center gap-2 text-white/90">
        <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center flex-shrink-0">
            <IconCheck className="w-2.5 h-2.5" />
        </div>
        <span className="text-sm font-medium tracking-tight whitespace-nowrap">{label}</span>
    </div>
);

const AnavsanLogo: React.FC = () => (
    <div className="flex items-center" title="Anavsan">
        <h1 className="text-xl font-bold flex items-center text-sidebar-topbar uppercase tracking-[0.1em]">
             <span style={{fontFamily: 'serif', background: 'linear-gradient(to bottom right, #A78BFA, #6A38EB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}} className="text-4xl -mr-1">
                A
            </span>
            <span className="text-[#150A2B]">NAVSAN</span>
        </h1>
    </div>
);

const IconGoogle: React.FC = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.568,44,31.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

export const CollaborationWorkflow: React.FC = () => (
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[48px] p-10 lg:p-12 shadow-2xl flex flex-col items-center min-h-[440px] justify-center overflow-hidden w-full max-w-4xl">
        <h3 className="text-[22px] font-black text-white mb-16 tracking-widest uppercase text-center w-full z-10">Collaboration workflow</h3>
        
        <div className="relative flex items-center justify-between w-full h-full">
            {/* Overlapping Circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className="w-[380px] h-[380px] rounded-full bg-white/10 -translate-x-[25%] border border-white/10 blur-[1px]"></div>
                <div className="w-[380px] h-[380px] rounded-full bg-white/10 translate-x-[25%] border border-white/10 blur-[1px]"></div>
            </div>

            {/* FinOps side */}
            <div className="relative z-20 flex flex-col items-center text-center flex-1 pr-8">
                <div className="flex flex-col items-center">
                    <IconBuilding className="w-14 h-14 text-white/90 mb-6" />
                    <h4 className="text-[20px] font-black text-white mb-6">FinOps team</h4>
                    <div className="space-y-3.5 text-left w-fit mx-auto">
                        <FeatureCheckItem label="Cost visibility" />
                        <FeatureCheckItem label="Budget control" />
                        <FeatureCheckItem label="Credit forecasts" />
                    </div>
                </div>
            </div>

            {/* Central Card */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="bg-white rounded-[28px] p-8 shadow-2xl transform rotate-[-8deg] transition-all hover:rotate-0 duration-500 hover:scale-110 flex items-center justify-center">
                    <IconUsersCollaborate className="w-14 h-14 text-[#6932D5]" />
                </div>
            </div>

            {/* Data Engineers side */}
            <div className="relative z-20 flex flex-col items-center text-center flex-1 pl-8">
                <div className="flex flex-col items-center">
                    <div className="w-14 h-14 text-white/90 mb-6 flex items-center justify-center">
                        <IconCode className="w-12 h-12" />
                    </div>
                    <h4 className="text-[20px] font-black text-white mb-6">Data engineers</h4>
                    <div className="space-y-3.5 text-left w-fit mx-auto">
                        <FeatureCheckItem label="Query speed" />
                        <FeatureCheckItem label="Auto-scaling" />
                        <FeatureCheckItem label="Warehouse tuning" />
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Pill */}
        <div className="mt-12 bg-white px-8 py-2.5 rounded-full shadow-2xl transition-transform hover:scale-105 duration-300 z-20">
            <span className="text-[12px] font-black text-[#6932D5] uppercase tracking-widest">Cost + Performance</span>
        </div>
    </div>
);

interface SignupPageProps {
    onSignup: () => void;
    onShowLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onShowLogin }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSignup();
    };

    return (
        <div className="h-screen flex bg-white font-sans text-text-strong overflow-hidden selection:bg-primary/20">
            {/* LEFT PANEL */}
            <div className="w-full lg:w-[42%] flex flex-col h-full relative z-10 bg-white p-8 md:p-12">
                <div className="flex-shrink-0">
                    <AnavsanLogo />
                </div>

                <div className="flex-grow flex flex-col justify-center max-w-[440px] mx-auto w-full">
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <header className="mb-6 text-left">
                            <h2 className="text-[36px] font-black text-[#161616] tracking-tight leading-tight">Start your 14-day free trial</h2>
                            <p className="mt-3 text-[#5A5A72] text-lg font-medium opacity-90 leading-tight">Set up your optimization workspace in less than 2 minutes.</p>
                        </header>

                        <p className="mb-5 text-sm text-[#5A5A72] font-medium">
                            Already have an account?{' '}
                            <button onClick={onShowLogin} className="font-bold text-[#6932D5] hover:underline">
                                Sign in
                            </button>
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="first-name" className="block text-[11px] font-bold text-[#5A5A72] ml-1 uppercase tracking-wider">First name</label>
                                    <input id="first-name" type="text" required placeholder="e.g., Jane" className="w-full px-5 py-3.5 bg-[#F2F4F7] border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-[#9A9AB2] font-semibold" />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="last-name" className="block text-[11px] font-bold text-[#5A5A72] ml-1 uppercase tracking-wider">Last name</label>
                                    <input id="last-name" type="text" required placeholder="e.g., Doe" className="w-full px-5 py-3.5 bg-[#F2F4F7] border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-[#9A9AB2] font-semibold" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="work-email" className="block text-[11px] font-bold text-[#5A5A72] ml-1 uppercase tracking-wider">Work email address</label>
                                <input id="work-email" type="email" required placeholder="Name@companyname.com" className="w-full px-5 py-3.5 bg-[#F2F4F7] border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-[#9A9AB2] font-semibold" />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="org-name" className="block text-[11px] font-bold text-[#5A5A72] ml-1 uppercase tracking-wider">Organization</label>
                                <input id="org-name" type="text" required placeholder="e.g., Acme Corp" className="w-full px-5 py-3.5 bg-[#F2F4F7] border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-[#9A9AB2] font-semibold" />
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full py-4.5 bg-[#6932D5] text-white font-black rounded-full hover:bg-[#5A28BE] active:scale-[0.98] transition-all shadow-xl shadow-[#6A38EB]/30 text-base flex items-center justify-center gap-3 group h-[56px]">
                                    <span className="tracking-tight">Sign up</span>
                                    <IconArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                                </button>
                                <div className="mt-4 flex items-start justify-center gap-2.5 text-[10px] font-bold text-[#059669] uppercase tracking-tight leading-tight">
                                    <IconShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
                                    <span className="text-center">Read-only metadata access. Zero impact on production.</span>
                                </div>
                            </div>
                        </form>

                        <div className="relative flex items-center justify-center my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#EAE6F2]"></div></div>
                            <span className="relative bg-white px-5 text-[11px] text-[#9A9AB2] font-black uppercase tracking-widest">Or continue with</span>
                        </div>

                        <button className="w-full flex items-center justify-center gap-4 py-3.5 bg-white border border-border-light rounded-full hover:bg-[#F2F4F7] transition-all text-[#161616] font-bold text-sm shadow-sm">
                            <IconGoogle />
                            <span>Google</span>
                        </button>
                    </div>
                </div>

                <footer className="flex-shrink-0 pt-6">
                    <p className="text-[11px] text-[#9A9AB2] font-bold uppercase tracking-widest text-center">
                        © 2026 Anavsan, Inc. All rights reserved.{' '}
                        <a href="#" className="text-[#6932D5] hover:underline ml-1">privacy policy</a>
                    </p>
                </footer>
            </div>

            {/* RIGHT PANEL */}
            <div className="hidden lg:flex w-[58%] relative bg-gradient-to-br from-[#2D1B69] via-[#1A0B3F] to-[#150A2B] flex-col justify-center items-center px-16 xl:px-24 overflow-hidden">
                <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-[480px] h-[480px] bg-pink-500/10 rounded-full blur-[120px]"></div>

                <div className="max-w-4xl relative z-10 space-y-8">
                    <div className="space-y-4 text-left animate-in fade-in slide-in-from-top-6 duration-1000">
                        <h2 className="text-5xl xl:text-[68px] font-black text-white leading-[0.95] tracking-tighter">Stop wasting your <br />Snowflake budget</h2>
                        <p className="text-base xl:text-lg text-[#DDD6FE] font-medium leading-relaxed opacity-90 max-w-2xl">
                            Your human in the loop AI partner, collaboratively turns expensive queries into cost optimized performance queries in seconds
                        </p>
                    </div>

                    <CollaborationWorkflow />
                </div>
            </div>
        </div>
    );
};

export default SignupPage;