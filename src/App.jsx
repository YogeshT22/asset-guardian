/**
 * App.jsx
 * Production practices applied:
 * 1. ErrorBoundary wraps the whole app — no blank white screen on crashes
 * 2. Lazy loading (React.lazy + Suspense) — pages are code-split into separate
 *    JS chunks. The browser only downloads the code for the page being visited.
 * 3. ProtectedRoute redirects preserve the intended destination (redirect after login)
 * 4. 404 catch-all route — unknown URLs get a proper "Not Found" page
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// ── Lazy-loaded pages (each becomes a separate JS chunk in the build) ─────────
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// ── Loading fallback shown during lazy chunk download ─────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── 404 page ──────────────────────────────────────────────────────────────────
const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
    <p className="text-7xl font-black text-gray-200">404</p>
    <h1 className="text-2xl font-bold text-gray-700 mt-2">Page Not Found</h1>
    <p className="text-gray-400 mt-1 text-sm">The route you requested does not exist.</p>
    <a href="/dashboard" className="mt-6 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
      Back to Dashboard
    </a>
  </div>
);

// ── Protected Route — redirects to /login and remembers where you wanted to go ─
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// ── Public Route — redirect already-authenticated users away from login ────────
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

              {/* Protected */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
