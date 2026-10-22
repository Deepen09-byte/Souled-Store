import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth.js';

export default function Register() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const navigate = useNavigate();
  const { handleRegister } = useAuth();

  const getPasswordScore = (val) => {
    if (!val || val.length === 0) return 0;
    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 8 && /[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const score = getPasswordScore(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const strengthColor = ['', '#B91C1C', '#D97706', '#166534', '#166534'][score];

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
        {/* Overlay text at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 p-12"
          style={{
            background: 'linear-gradient(to top, rgba(20,15,10,0.65) 0%, transparent 100%)',
          }}
        >
          <p className="text-white text-5xl leading-tight" style={{ fontFamily: 'var(--font-serif)', fontWeight: 300 }}>
            Define your<br /><em>aesthetic.</em>
          </p>
          <p className="text-white/70 text-sm mt-3 font-light max-w-xs leading-relaxed">
            Join the exclusive movement of creators and brands redefining modern fashion.
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
          <Link to="/" className="no-underline" style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: '1.25rem', color: 'var(--color-on-surface)', letterSpacing: '-0.01em' }}>
            Souled Store
          </Link>
          <Link to="/login" className="label-caps no-underline" style={{ color: 'var(--color-on-surface-variant)' }}>
            Sign In
          </Link>
        </header>

        {/* Form area */}
        <main className="flex-1 flex flex-col justify-center px-8 md:px-14 py-12 max-w-[480px] w-full self-center lg:self-start lg:ml-0">

          {/* Headline */}
          <div className="mb-10">
            <p className="label-caps mb-3" style={{ color: 'var(--color-secondary)' }}>Welcome to Souled Store</p>
            <h1 className="text-4xl md:text-5xl leading-tight" style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--color-on-surface)' }}>
              Elevate Your Style
            </h1>
          </div>

          <form
            className="space-y-7"
            onSubmit={async (e) => {
              e.preventDefault();
              setRegistrationError('');
              try {
                const result = await handleRegister({
                  email: e.currentTarget.elements.namedItem('email').value,
                  contact: e.currentTarget.elements.namedItem('phone').value,
                  password: e.currentTarget.elements.namedItem('password').value,
                  fullName: e.currentTarget.elements.namedItem('fullName').value,
                  isSeller: e.currentTarget.elements.namedItem('is_seller').checked,
                });

                if (result?.success === false) {
                  setRegistrationError(result.message || 'Unable to register. Please try again.');
                  return;
                }

                navigate('/');
              } catch (error) {
                console.error('Registration failed:', error);
                setRegistrationError(error.message || 'Unable to register. Please try again.');
              }
            }}
          >
            {/* Full Name */}
            <div>
              <label className="label-caps block mb-2" htmlFor="full_name">Full Name</label>
              <input className="field-underline" id="full_name" name="fullName" placeholder="e.g. John Doe" required type="text" />
            </div>

            {/* Contact Number */}
            <div>
              <label className="label-caps block mb-2" htmlFor="phone_number">Contact Number</label>
              <input className="field-underline" id="phone_number" name="phone" placeholder="+91 98765 43210" required type="tel" />
            </div>

            {/* Email */}
            <div>
              <label className="label-caps block mb-2" htmlFor="email_address">Email Address</label>
              <input className="field-underline" id="email_address" name="email" placeholder="hello@example.com" required type="email" />
            </div>

            {/* Password */}
            <div>
              <label className="label-caps block mb-2" htmlFor="user_password">Password</label>
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
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-0.5 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= score ? strengthColor : 'var(--color-outline-variant)' }}
                      />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: strengthColor, fontFamily: 'var(--font-sans)' }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Seller toggle */}
            <label className="flex items-center gap-3 cursor-pointer" htmlFor="isSeller">
              <input
                className="w-4 h-4 rounded-sm cursor-pointer"
                id="isSeller"
                name="is_seller"
                type="checkbox"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span className="label-caps" style={{ color: 'var(--color-on-surface)' }}>Register as Seller</span>
            </label>

            {/* CTA */}
            <button
              type="submit"
              className="btn-dark w-full py-4 rounded-none tracking-widest"
            >
              Sign Up
            </button>
            {registrationError && (
              <p className="text-sm text-red-700" role="alert">{registrationError}</p>
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
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-none transition-all duration-150"
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
            Already have an account?{' '}
            <Link to="/login" className="no-underline font-semibold" style={{ color: 'var(--color-on-surface)' }}>
              Sign in
            </Link>
          </p>

          <p className="mt-6 text-xs text-center leading-relaxed" style={{ color: 'var(--color-outline)' }}>
            By continuing, you agree to Souled Store's{' '}
            <Link to="/terms" className="underline no-underline-override" style={{ color: 'var(--color-outline)' }}>Terms</Link>
            {' '}&amp;{' '}
            <Link to="/privacy" className="underline" style={{ color: 'var(--color-outline)' }}>Privacy Policy</Link>.
          </p>
        </main>
      </div>
    </div>
  );
}
