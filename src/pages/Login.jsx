/**
 * Login.jsx
 * Production practices applied:
 * 1. Validates credentials via AuthContext (not raw localStorage)
 * 2. Shows inline server-level error (wrong credentials) separately from
 *    field-level validation errors (empty fields) — clear UX distinction
 * 3. Disables submit button while processing to prevent double-submit
 * 4. Autocomplete attributes for browser password manager compatibility
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Activity, AlertCircle } from 'lucide-react';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(null);

  const onSubmit = (data) => {
    setAuthError(null);
    const result = login(data.username, data.password);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setAuthError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg border border-gray-100 space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Activity size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Asset Guardian
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to manage your infrastructure
          </p>
        </div>

        {/* Auth-level error (wrong credentials) */}
        {authError && (
          <div
            role="alert"
            className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"
          >
            <AlertCircle size={16} className="shrink-0" />
            {authError}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="username"
                autoComplete="username"
                {...register('username', { required: 'Username is required' })}
                className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.username ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="admin"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password', { required: 'Password is required' })}
                className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Dev hint — only visible in development mode */}
        {import.meta.env.DEV && (
          <p className="text-center text-xs text-gray-400 border-t pt-4">
            Dev credentials: <code className="bg-gray-100 px-1 rounded">admin / admin123</code>
          </p>
        )}
      </div>
    </div>
  );
}
