import React, { useState } from 'react';
import { IconSparkles, IconArrowRight } from '../constants';
import { CollaborationWorkflow } from './SignupPage';

const IconEye: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconEyeOff: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

const IconGoogle: React.FC = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.568,44,31.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const IconGithub: React.FC = () => (
    <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
    </svg>
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

interface LoginPageProps {
    onLogin: (email: string) => void;
    onSSOLogin: () => void;
    onShowSignup: () => void;
    onShowForgotPassword: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSSOLogin, onShowSignup, onShowForgotPassword }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('finops@mail.com');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onLogin(email);
    };

    return (
        <div className="h-screen flex bg-white font-sans text-text-strong overflow-hidden selection:bg-primary/20">
            {/* Left Panel - Form */}
            <div className="w-full lg:w-[42%] flex flex-col h-full bg-white p-8 md:p-12">
                <div className="flex-shrink-0">
                    <AnavsanLogo />
                </div>
                
                <div className="mx-auto w-full max-w-[400px] flex-grow flex flex-col justify-center">
                    <h1 className="text-[32px] font-black text-[#161616] tracking-tight">Sign in to <strong className="font-black">Anavsan</strong></h1>
                    <p className="mt-2 text-[#5A5A72] text-sm font-medium">
                        Don't have an account?{' '}
                        <button type="button" onClick={onShowSignup} className="font-bold text-[#6932D5] hover:underline">
                            Sign up
                        </button>
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-[11px] font-black text-[#5A5A72] ml-1 uppercase tracking-wider">
                                Work email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="w-full px-5 py-3.5 bg-[#F2F4F7] border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-[#9A9AB2] font-semibold"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label htmlFor="password" className="block text-[11px] font-black text-[#5A5A72] uppercase tracking-wider">
                                    Password
                                </label>
                                <button type="button" onClick={onShowForgotPassword} className="text-[11px] font-bold text-[#6932D5] hover:underline uppercase tracking-wider">
                                    Forgot?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value="••••••••••••"
                                    readOnly
                                    placeholder="Enter your password"
                                    className="w-full px-5 py-3.5 bg-[#F2F4F7] border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-semibold"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-[#9A9AB2] hover:text-[#6932D5]">
                                    {showPassword ? <IconEyeOff /> : <IconEye />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" defaultChecked className="h-4 w-4 text-[#6932D5] rounded border-gray-300 focus:ring-primary" />
                            <label htmlFor="remember-me" className="ml-2 block text-xs text-[#5A5A72] font-bold uppercase tracking-wider">
                                Remember me
                            </label>
                        </div>

                        <div className="pt-2">
                            <button type="submit" className="w-full flex justify-center items-center gap-3 py-4 h-[56px] bg-[#6932D5] text-white font-black rounded-full hover:bg-[#5A28BE] active:scale-[0.98] transition-all shadow-xl shadow-[#6A38EB]/20 text-base group">
                                <span>Sign in</span>
                                <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 bg-[#F9F7FE] p-4 rounded-2xl border border-[#6932D5]/10">
                        <p className="text-[10px] text-[#9A9AB2] mb-3 font-black uppercase tracking-widest text-center">Quick Demo Login</p>
                        <div className="flex gap-2">
                            {/* Updated from handleLogin to onLogin to fix undefined variable error */}
                            <button type="button" onClick={() => onLogin('finops@mail.com')} className="text-xs bg-white px-3 py-2.5 rounded-xl border border-[#EAE6F2] hover:border-primary hover:text-primary transition-all shadow-sm font-bold flex-1">FinOps</button>
                            <button type="button" onClick={() => onLogin('dataengineer@mail.com')} className="text-xs bg-white px-3 py-2.5 rounded-xl border border-[#EAE6F2] hover:border-primary hover:text-primary transition-all shadow-sm font-bold flex-1">Data Eng</button>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#EAE6F2]"></div></div>
                        <span className="relative bg-white px-5 text-[11px] text-[#9A9AB2] font-black uppercase tracking-widest">Or continue with</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={onSSOLogin} className="flex items-center justify-center gap-3 py-3.5 bg-white border border-border-light rounded-full hover:bg-[#F2F4F7] transition-all text-[#161616] font-bold text-sm shadow-sm">
                           <IconGoogle />
                           <span>Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-3 py-3.5 bg-white border border-border-light rounded-full hover:bg-[#F2F4F7] transition-all text-[#161616] font-bold text-sm shadow-sm">
                            <IconGithub />
                            <span>GitHub</span>
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

            {/* Right Panel - Illustration */}
            <div className="hidden lg:flex w-[58%] relative bg-gradient-to-br from-[#2D1B69] via-[#1A0B3F] to-[#150A2B] flex-col justify-center items-center px-16 xl:px-24 overflow-hidden">
                <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-[480px] h-[480px] bg-pink-500/10 rounded-full blur-[120px]"></div>

                <div className="max-w-4xl relative z-10 space-y-10">
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

export default LoginPage;