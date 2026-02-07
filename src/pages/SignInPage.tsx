import React from 'react';
import { SignIn, ClerkLoaded, ClerkLoading } from '@clerk/clerk-react';
import { SignInSkeleton } from '@/components/skeletons/SignInSkeleton';

const SignInPage: React.FC = () => {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* Left Side: Image (Desktop only) */}
            <div className="hidden lg:block relative overflow-hidden">
                <img
                    src="/Signin page BG.jpg"
                    alt="Vasantham Electricals Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-brand-950/20 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/60 to-transparent" />

                <div className="absolute bottom-0 left-0 p-12 w-full max-w-xl">
                    <img
                        src="/Vasantham Enterprises Full Logo.svg"
                        alt="Vasantham Enterprises"
                        className="h-16 mb-8 brightness-0 invert"
                    />
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
                        Quality Management for Quality Electricals
                    </h1>
                    <p className="text-lg text-slate-200 font-medium leading-relaxed">
                        The ultimate inventory and sales tracking portal for Vasantham Electricals. Managed, Secured, and Optimized.
                    </p>
                </div>
            </div>

            {/* Right Side: Sign In Form */}
            <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-brand-100/40 relative overflow-hidden min-h-screen">
                {/* Background Decorations */}
                <div className="absolute inset-0 opacity-[0.1] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#B8863F 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }} />

                <div className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] bg-[#B8863F]/15 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-[#B8863F]/10 blur-[80px] rounded-full" />

                {/* Mobile Logo Only */}
                <div className="lg:hidden mb-8 animate-fadeIn relative z-10 text-center">
                    <img
                        src="/Vasantham Enterprises Full Logo.svg"
                        alt="Vasantham Enterprises"
                        className="h-10 sm:h-14 mx-auto"
                    />
                </div>

                <div className="w-full max-w-[440px] animate-fadeIn relative z-10 flex-1 flex flex-col justify-center">
                    <div className="mb-6 sm:mb-10 text-center lg:text-left">
                        <div className="inline-flex px-3 py-1 rounded-full bg-brand-50 border border-brand-100/50 text-brand-600 text-[10px] font-black uppercase tracking-widest mb-4">
                            Authorized Personnel Only
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">
                            Welcome!
                        </h2>
                        <p className="text-slate-500 font-medium text-sm sm:text-base">
                            Enter your credentials to manage the inventory
                        </p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] p-2 shadow-2xl shadow-slate-200/50 border border-white/50">
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-2 pb-6 border border-slate-100/50">
                            <ClerkLoading>
                                <SignInSkeleton />
                            </ClerkLoading>
                            <ClerkLoaded>
                                <SignIn
                                    routing="path"
                                    path="/sign-in"
                                    signUpUrl="/sign-up"
                                    appearance={{
                                        elements: {
                                            formButtonPrimary: 'h-10 sm:h-12 bg-brand-600 hover:bg-brand-700 text-sm font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-brand-500/25 transition-all duration-300 normal-case w-full',
                                            card: 'shadow-none bg-transparent w-full',
                                            header: 'hidden',
                                            formFieldLabel: 'text-slate-700 font-bold mb-1.5 ml-1 text-[10px] sm:text-[11px] uppercase tracking-wider',
                                            formFieldInput: 'h-10 sm:h-12 border-slate-200 bg-slate-50/50 rounded-xl sm:rounded-2xl px-4 focus:bg-white focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all duration-200 font-medium text-slate-900',
                                            footerActionText: 'text-slate-500 font-medium text-xs sm:text-sm',
                                            footerActionLink: 'text-brand-600 hover:text-brand-700 font-bold ml-1 text-xs sm:text-sm',
                                            socialButtonsBlockButton: 'hidden',
                                            dividerRow: 'hidden',
                                            formFieldLabelRow: 'mb-0',
                                            identityPreviewText: 'text-slate-900 font-bold',
                                            identityPreviewEditButton: 'text-brand-600 font-bold',
                                            headerTitle: 'hidden',
                                            headerSubtitle: 'hidden',
                                        }
                                    }}
                                />
                            </ClerkLoaded>
                        </div>
                    </div>
                </div>

                {/* Footer simple credit */}
                <div className="mt-8 text-center text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase transition-opacity hover:opacity-100 opacity-80 relative z-10 w-full">
                    &copy; {new Date().getFullYear()} Vasantham Enterprises • Erode
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
