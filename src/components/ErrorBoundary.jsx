/**
 * ErrorBoundary.jsx
 * Production practice: Always wrap your app in an Error Boundary.
 * Without this, any runtime render error will show a blank white screen to the user.
 * This catches it and shows a friendly recovery UI instead.
 *
 * NOTE: Error Boundaries must be CLASS components — React does not support
 * functional error boundaries yet. This is a known, intentional exception.
 */
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production: send to an error tracking service (Sentry, Datadog, etc.)
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle size={40} className="text-red-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Something went wrong</h1>
              <p className="mt-2 text-sm text-gray-500">
                An unexpected error occurred. You can try refreshing the page.
              </p>
              {import.meta.env.DEV && (
                <pre className="mt-4 text-left bg-gray-900 text-red-400 text-xs p-4 rounded-lg overflow-auto max-h-48">
                  {this.state.error?.toString()}
                </pre>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={15} /> Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
