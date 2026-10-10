import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useauth';

export default function Login() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const { handleLogin } = useAuth();

    return (
        <div className="bg-surface text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col lg:flex-row relative overflow-hidden">

            {/* Left Column: Form */}
            <div className="w-full lg:w-1/2 flex flex-col h-screen overflow-y-auto relative z-10 scrollbar-none [&::-webkit-scrollbar]:hidden">
                {/* Ambient Golden Radiance in Background for Mobile/Tablet */}
                <div className="absolute inset-0 ambient-glow pointer-events-none z-0 lg:hidden"></div>

                {/* Top Navigation Shell */}
                <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 dark:border-outline-variant/20 w-full">
                    <div className="flex justify-between items-center w-full px-6 h-16">
                        {/* <Link to="/" aria-label="Go back" className="text-primary dark:text-primary p-2 -ml-2 rounded-lg hover:bg-surface-container hover:text-primary-container transition-colors active:scale-95 duration-150 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </Link> */}
                        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight lg:hidden">
                            Snitch
                        </h1>
                        <Link to="/register" className="font-label-lg text-label-lg text-primary dark:text-primary font-semibold hover:text-primary-container transition-colors active:scale-95 duration-150">
                            Sign Up
                        </Link>
                    </div>
                </header>

                {/* Main Canvas Section */}
                <main className="relative z-10 w-full max-w-[480px] mx-auto px-6 py-6 lg:py-8 flex-1 flex flex-col justify-start">
                    {/* Header Description / Identity Lead */}
                    <div className="mb-10 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 mb-6 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">Welcome Back</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-3">
                            Sign In to Snitch
                        </h2>
                        <p className="text-base text-on-surface-variant font-medium">
                            Enter your email and password to access your account.
                        </p>
                    </div>

                    {/* Login Form */}
                    <form
                        className="space-y-5"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const user = await handleLogin({
                                    email: e.target.email.value,
                                    password: e.target.password.value,
                                })

                                if (user.isSeller) {
                                    navigate("/seller/dashboard")
                                } else {
                                    navigate("/")
                                }
                            } catch (error) {
                                console.error("Login failed:", error)
                            }
                        }}
                    >
                        {/* Email Address Field */}
                        <div className="space-y-2">
                            <label className="block font-label-md text-label-md font-semibold text-on-surface-variant" htmlFor="email_address">
                                Email Address
                            </label>
                            <div className="input-focus-glow relative flex items-center bg-surface-container-low rounded-xl border border-outline-variant/40 hover:border-outline-variant/80 transition-all duration-200 focus-within:border-primary/50 focus-within:bg-surface shadow-sm">
                                <span className="material-symbols-outlined text-outline pl-4 pr-2 text-[22px] pointer-events-none select-none">mail</span>
                                <input className="w-full bg-transparent border-0 focus:ring-0 text-on-surface placeholder:text-outline/50 font-body-lg text-body-lg py-3.5 pr-4 pl-1 outline-none rounded-xl" id="email_address" name="email" placeholder="julian.vance@executive.io" required type="email" />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block font-label-md text-label-md font-semibold text-on-surface-variant" htmlFor="user_password">
                                    Password
                                </label>
                                <Link to="/forgot-password" className="font-label-sm text-label-sm text-primary hover:text-primary-container font-medium transition-colors">Forgot Password?</Link>
                            </div>
                            <div className="input-focus-glow relative flex items-center bg-surface-container-low rounded-xl border border-outline-variant/40 hover:border-outline-variant/80 transition-all duration-200 focus-within:border-primary/50 focus-within:bg-surface shadow-sm">
                                <span className="material-symbols-outlined text-outline pl-4 pr-2 text-[22px] pointer-events-none select-none">lock</span>
                                <input
                                    className="w-full bg-transparent border-0 focus:ring-0 text-on-surface placeholder:text-outline/50 font-body-lg text-body-lg py-3.5 pr-12 pl-1 outline-none rounded-xl"
                                    id="user_password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                    type={showPassword ? "text" : "password"}
                                />
                                <button aria-label="Toggle password visibility" className="absolute right-3 text-outline hover:text-primary transition-colors flex items-center justify-center p-2 rounded-lg hover:bg-surface-container-highest" type="button" onClick={() => setShowPassword(!showPassword)}>
                                    <span className="material-symbols-outlined text-[22px]">{showPassword ? "visibility_off" : "visibility"}</span>
                                </button>
                            </div>
                        </div>

                        {/* Primary Action Button */}
                        <div className="pt-3">
                            <button className="w-full h-14 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:from-[#fcd34d] hover:to-[#fbbf24] active:scale-[0.98] text-[#09090b] text-lg font-bold text-center transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(245,158,11,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(245,158,11,0.5)] flex items-center justify-center gap-3 group" type="submit">
                                <span>Sign In</span>
                                <span className="material-symbols-outlined text-[22px] group-hover:translate-x-1.5 transition-transform font-bold">arrow_forward</span>
                            </button>
                        </div>
                    </form>

                    {/* Social Authentication */}
                    <div className="mt-10">
                        <div className="relative flex py-3 items-center">
                            <div className="flex-grow border-t border-outline-variant/30"></div>
                            <span className="flex-shrink mx-4 text-xs font-bold text-outline/70 uppercase tracking-widest">Or continue with</span>
                            <div className="flex-grow border-t border-outline-variant/30"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-5">
                            <button className="h-12 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-outline-variant/80 hover:bg-surface-container text-on-surface font-semibold flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 shadow-sm" type="button">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
                                </svg>
                                <span>Google</span>
                            </button>
                            <button className="h-12 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-outline-variant/80 hover:bg-surface-container text-on-surface font-semibold flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 shadow-sm" type="button">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.45c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.02.62-2.67 1.37-.58.66-1.1 1.73-.96 2.76 1.03.08 2.09-.53 2.71-1.28z"></path>
                                </svg>
                                <span>Apple</span>
                            </button>
                        </div>
                    </div>

                    {/* Secondary Navigation */}
                    <div className="mt-10 mb-6 text-center">
                        <p className="text-base text-on-surface-variant font-medium">
                            Don't have an account?
                            <Link className="text-primary font-bold hover:text-primary-container transition-colors inline-flex items-center gap-1 active:scale-95 ml-2" to="/register">
                                <span>Sign Up</span>
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </Link>
                        </p>
                    </div>
                </main>
            </div>

            {/* Right Column: Aesthetic Visual (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container-high overflow-hidden items-center justify-center border-l border-outline-variant/10 shadow-2xl">
                {/* Deep ambient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high via-surface-container to-surface opacity-90"></div>

                {/* Abstract decorative elements */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#fbbf24] rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#f59e0b] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

                {/* Dynamic geometric accents */}
                <div className="absolute top-10 right-10 w-32 h-32 border border-[#fbbf24]/20 rounded-full"></div>
                <div className="absolute bottom-20 left-20 w-64 h-64 border border-[#f59e0b]/10 rounded-full"></div>

                {/* Content */}
                <div className="relative z-10 p-12 max-w-lg text-center flex flex-col items-center">
                    <div className="w-24 h-24 mb-10 rounded-2xl bg-gradient-to-br from-[#fbbf24] to-[#d97706] shadow-[0_0_50px_rgba(245,158,11,0.5)] flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-500">
                        <span className="material-symbols-outlined text-[48px] text-[#09090b]">diamond</span>
                    </div>

                    <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-on-surface mb-6 leading-tight">
                        Welcome Back to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]">Snitch.</span>
                    </h2>

                    <p className="text-lg xl:text-xl text-on-surface-variant font-medium leading-relaxed mb-12 max-w-md">
                        Sign in to access your personalized shopping experience, track your orders, and explore premium collections.
                    </p>

                    <div className="flex items-center gap-5 bg-surface-container/50 backdrop-blur-sm py-3 px-6 rounded-full border border-outline-variant/20 shadow-lg">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-2 border-surface-container-high bg-surface-container flex items-center justify-center overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 10}&backgroundColor=transparent`} alt="User" className="w-full h-full object-cover opacity-80" />
                                </div>
                            ))}
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-1 text-[#fbbf24] mb-0.5">
                                {[1, 2, 3, 4, 5].map(star => <span key={star} className="material-symbols-outlined text-[14px] fill-current">star</span>)}
                            </div>
                            <p className="text-sm text-on-surface-variant font-semibold">Join <span className="text-on-surface">100k+</span> fashion enthusiasts</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
