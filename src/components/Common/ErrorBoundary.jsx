import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-6">
          <div className="max-w-xl text-center">
            <h1 className="text-3xl font-semibold mb-4">Something went wrong</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Please refresh the page or contact support if the issue persists.</p>
            <button
              className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              onClick={() => window.location.reload()}
            >
              Reload chat
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
