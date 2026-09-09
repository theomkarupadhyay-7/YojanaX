import { useState } from 'react';

export default function SignIn({ onBack }) {
  const [isSignUp, setIsSignUp] = useState(false);

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[90vh] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 md:grid-cols-2">

          {/* Left Branding Panel */}
          <div className="relative hidden min-h-[650px] overflow-hidden bg-navy-900 p-10 text-white md:flex md:flex-col md:justify-between">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

            <div className="relative z-10">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">
                YOJANAX
              </p>

              <h2 className="mt-6 text-4xl font-extrabold leading-tight">
                Empowering
                <br />
                Entrepreneurs.
              </h2>

              <p className="mt-5 max-w-sm text-base leading-7 text-slate-300">
                Discover government-backed schemes and financial assistance
                designed to help you take your entrepreneurial journey forward.
              </p>
            </div>

            <div className="relative z-10">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold text-orange-200">
                  Smart Scheme Discovery
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Find suitable financial support based on your profile,
                  requirements, and eligibility.
                </p>
              </div>
            </div>
          </div>

          {/* Right Authentication Panel */}
          <div className="min-h-[650px] p-7 sm:p-10">
            <button
              type="button"
              onClick={onBack}
              className="mb-8 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
            >
              ← Back
            </button>

            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-wider text-orange-600">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-900">
                {isSignUp ? 'Join Yojanax' : 'Sign In'}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isSignUp
                  ? 'Create your account to get started with Yojanax.'
                  : 'Sign in to continue to your Yojanax account.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Sign Up Fields */}
              {isSignUp && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={signUpData.name}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={isSignUp ? signUpData.email : signInData.email}
                  onChange={(e) =>
                    isSignUp
                      ? setSignUpData({
                          ...signUpData,
                          email: e.target.value,
                        })
                      : setSignInData({
                          ...signInData,
                          email: e.target.value,
                        })
                  }
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={isSignUp ? signUpData.password : signInData.password}
                  onChange={(e) =>
                    isSignUp
                      ? setSignUpData({
                          ...signUpData,
                          password: e.target.value,
                        })
                      : setSignInData({
                          ...signInData,
                          password: e.target.value,
                        })
                  }
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Confirm Password */}
              {isSignUp && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={signUpData.confirmPassword}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-navy-900 px-4 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {/* Switch Mode */}
            <div className="mt-8 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                {isSignUp
                  ? 'Already have an account?'
                  : "Don't have an account?"}
              </p>

              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="mt-2 text-sm font-bold text-orange-600 transition hover:text-orange-700"
              >
                {isSignUp ? 'Sign In Instead' : 'Create an Account'}
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">

            </p>
          </div>
        </div>
      </div>
    </div>
  );
}