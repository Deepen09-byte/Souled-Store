import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth.js';

export default function Login() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ background: 'var(--color-background)', fontFamily: 'var(--font-sans)' }}
    >
      {/* ── Left: Fashion Image ── */}
      <div className="hidden lg:block lg:w-[52%] relative overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Souled Store fashion"
          className="w-full h-full object-cover object-center"
          style={{ minHeight: '100vh' }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 p-12"
          style={{ background: 'linear-gradient(to top, rgba(20,15,10,0.65) 0%, transparent 100%)' }}
        >
          <p className="text-white text-5xl leading-tight" style={{ fontFamily: 'var(--font-serif)', fontWeight: 300 }}>
            Welcome<br /><em>back.</em>
          </p>
          <p className="text-white/70 text-sm mt-3 font-light max-w-xs leading-relaxed">
            Step back into your world of curated fashion and exclusive collections.
          </p>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div
        className="flex-1 flex flex-col min-h-screen overflow-y-auto"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 md:px-14 h-16 border-b" style={{ borderColor: 'var(--color-outline-variant)' }}>
          <Link to="/" className="no-underline tracking-widest uppercase font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-on-surface)' }}>
            Souled Store Atelier
          </Link>
          <Link to="/register" className="label-caps no-underline" style={{ color: 'var(--color-on-surface-variant)' }}>
            Sign Up
          </Link>
        </header>

        {/* Form area */}
        <main className="flex-1 flex flex-col justify-center px-8 md:px-14 py-12 max-w-[480px] w-full self-center lg:self-start lg:ml-0">

          {/* Headline */}
          <div className="mb-10">
            <p className="label-caps mb-3" style={{ color: 'var(--color-secondary)' }}>Welcome to Souled Store Atelier</p>
            <h1 className="text-4xl md:text-5xl leading-tight" style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--color-on-surface)' }}>
              Sign In
            </h1>
          </div>

          <form
            className="space-y-7"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoginError('');
              try {
                const user = await handleLogin({
                  email: e.currentTarget.elements.namedItem('email').value,
                  password: e.currentTarget.elements.namedItem('password').value,
                });
                navigate(user.role === "seller" ? '/seller/dashboard' : '/');
              } catch (error) {
                console.error('Login failed:', error);
                setLoginError(error.message || 'Invalid credentials. Please try again.');
              }
            }}
          >
            {/* Email */}
            <div>
              <label className="label-caps block mb-2" htmlFor="email_address">Email Address</label>
              <input
                className="field-underline"
                id="email_address"
                name="email"
                placeholder="hello@example.com"
                required
                type="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-caps" htmlFor="user_password">Password</label>
                <Link to="/forgot-password" className="text-xs no-underline" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  className="field-underline pr-8"
                  id="user_password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-outline)', background: 'none', border: 'none', cursor: 'pointer' }}
                  aria-label="Toggle password"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* CTA */}
            <button
              type="submit"
              className="btn-dark w-full py-4 rounded-none tracking-widest"
            >
              Sign In
            </button>
            {loginError && (
              <p className="text-sm" role="alert" style={{ color: 'var(--color-error)' }}>{loginError}</p>
            )}
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 divider" />
            <span className="label-caps" style={{ color: 'var(--color-outline)' }}>or</span>
            <div className="flex-1 divider" />
          </div>

          {/* Google */}
          <a
            href="http://localhost:3000/api/auth/google"
            className="w-full flex items-center justify-center gap-3 py-3.5 transition-all duration-150"
            style={{
              border: '1px solid var(--color-outline-variant)',
              color: 'var(--color-on-surface)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              background: 'transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-container)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            Continue with Google
          </a>

          <p className="mt-10 text-sm text-center" style={{ color: 'var(--color-on-surface-variant)' }}>
            New to Souled Store Atelier?{' '}
            <Link to="/register" className="no-underline font-semibold" style={{ color: 'var(--color-on-surface)' }}>
              Create an account
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
