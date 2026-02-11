
import React from 'react';
import { IconSparkles } from '../constants';

const IconArrowRight: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
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

const LoginGraphic: React.FC = () => (
    <div className="absolute inset-0">
        <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="coinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FBBF24' }} />
                    <stop offset="100%" style={{ stopColor: '#F59E0B' }} />
                </linearGradient>
            </defs>
            <rect width="800" height="800" fill="#433372" />
            <circle cx="550" cy="120" r="10" fill="#EF4444" opacity="0.4" />
            <circle cx="150" cy="650" r="8" fill="#14B8A6" opacity="0.5" />
            <path d="M-50 400 L150 400 L200 350 L700 350" stroke="#6932D5" strokeWidth="2" fill="none" opacity="0.3" />
            <path d="M850 500 L650 500 L600 550 L100 550" stroke="#6932D5" strokeWidth="2" fill="none" opacity="0.3" />
            <path d="M400 850 L400 600 L450 550 L450 250" stroke="#6932D5" strokeWidth="2" fill="none" opacity="0.3" />
            <path d="M250 -50 L250 200 L300 250 L600 250" stroke="#6932D5" strokeWidth="2" fill="none" opacity="0.3" />
            <path d="M-50 700 L200 700 L250 650 L250 500 L350 400" stroke="#6932D5" strokeWidth="2" fill="none" opacity="0.3" />
            <path d="M850 100 L600 100 L550 150 L550 350 L500 400" stroke="#6932D5" strokeWidth="2" fill="none" opacity="0.3" />
            <circle cx="150" cy="400" r="4" fill="#A78BFA" />
            <circle cx="700" cy="350" r="4" fill="#A78BFA" />
            <circle cx="100" cy="550" r="4" fill="#A78BFA" />
            <circle cx="400" cy="600" r="4" fill="#A78BFA" />
            <circle cx="450" cy="250" r="4" fill="#A78BFA" />
            <circle cx="250" cy="500" r="4" fill="#A78BFA" />
            <g transform="translate(350, 450) scale(1.5)">
                <path d="M 0 100 L 20 90 L 180 90 L 200 100 L 180 110 L 20 110 Z" fill="#C7D2FE" />
                <path d="M 20 90 L 20 110 L 180 110 L 180 90 Z" fill="#A5B4FC" />
                <path d="M 30 95 C 40 40, 160 40, 170 95 L 160 100 C 150 50, 50 50, 40 100 Z" fill="#F3F4F6" />
                <path d="M 40 60 L 160 60 M 40 65 L 140 65 M 40 70 L 160 70 M 40 75 L 120 75 M 40 80 L 160 80" stroke="#9CA3AF" strokeWidth="1" />
                <circle cx="180" cy="40" r="15" fill="url(#coinGradient)" />
                <ellipse cx="180" cy="40" rx="15" ry="5" fill="#FCD34D" opacity="0.5" />
                <text x="180" y="44" fontFamily="Arial" fontSize="10" fill="#CA8A04" textAnchor="middle" fontWeight="bold">$</text>
                <circle cx="20" cy="120" r="20" fill="url(#coinGradient)" />
                <ellipse cx="20" cy="120" rx="20" ry="7" fill="#FCD34D" opacity="0.5" />
                <text x="20" y="125" fontFamily="Arial" fontSize="14" fill="#CA8A04" textAnchor="middle" fontWeight="bold">$</text>
                <circle cx="100" cy="125" r="18" fill="url(#coinGradient)" />
                <ellipse cx="100" cy="125" rx="18" ry="6" fill="#FCD34D" opacity="0.5" />
                <text x="100" y="129" fontFamily="Arial" fontSize="12" fill="#CA8A04" textAnchor="middle" fontWeight="bold">$</text>
            </g>
        </svg>
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
        <div className="min-h-screen flex bg-white font-sans text-text-strong">
            {/* Left Panel - Form */}
            <div className="w-full lg:w-2/5 flex flex-col justify-center p-8 sm:p-12 overflow-y-auto">
                <div className="mx-auto w-full max-w-[400px]">
                    
                    {/* Standardized Optimization Banner */}
                    <div className="mb-10 bg-white p-6 rounded-[24px] border border-border-light shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <h2 className="text-base font-bold text-text-strong">End-to-End Snowflake Workload Optimization</h2>
                        <p className="text-xs text-text-secondary font-medium mt-1">Optimize Snowflake workloads. Simulate impact and collaborate.</p>
                    </div>

                    <h1 className="text-3xl font-normal">Sign up for <strong className="font-bold">Anavsan</strong></h1>
                    
                    <p className="mt-2 text-text-secondary text-sm font-medium">
                        Already have an account?{' '}
                        <button type="button" onClick={onShowLogin} className="font-bold text-primary hover:underline">
                            Sign in
                        </button>
                    </p>

                    <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label htmlFor="first-name" className="block text-sm font-medium text-text-secondary">First name</label>
                                <div className="mt-1.5">
                                    <input id="first-name" name="first-name" type="text" required defaultValue="Jane" className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                                </div>
                            </div>
                             <div className="w-1/2">
                                <label htmlFor="last-name" className="block text-sm font-medium text-text-secondary">Last name</label>
                                <div className="mt-1.5">
                                    <input id="last-name" name="last-name" type="text" required defaultValue="Doe" className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="work-email" className="block text-sm font-medium text-text-secondary">Work email address</label>
                            <div className="mt-1.5">
                                <input id="work-email" name="work-email" type="email" required defaultValue="jane.doe@acmeinc.com" className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="org-name" className="block text-sm font-medium text-text-secondary">Organization name</label>
                            <div className="mt-1.5">
                                <input id="org-name" name="org-name" type="text" required defaultValue="Acme Inc." className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                            </div>
                        </div>

                        <div>
                            <button type="submit" className="w-full flex justify-center items-center gap-2 px-4 py-3.5 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/20 transition-all">
                                <span>Sign up</span>
                                <IconArrowRight />
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 flex items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-4 text-xs text-gray-400 font-bold uppercase tracking-widest">Or continue with</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <div className="mt-8">
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-gray-50 rounded-lg text-text-secondary hover:bg-gray-100 transition-all border border-gray-200">
                           <IconGoogle />
                           <span className="ml-3 font-bold text-sm">Google</span>
                        </button>
                    </div>

                </div>
                <footer className="w-full max-w-[400px] mx-auto mt-12 text-[10px] font-bold text-text-muted text-center uppercase tracking-widest">
                    &copy; Anavsan Corp. All rights reserved.{' '}
                    <a href="#" className="text-primary hover:underline ml-1">
                        Privacy policy
                    </a>
                </footer>
            </div>

            {/* Right Panel - Graphic */}
            <div className="hidden lg:block w-3/5 relative overflow-hidden">
                <LoginGraphic />
            </div>
        </div>
    );
};

export default SignupPage;
