'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's an abort error - we can ignore these
    if (error.name === 'AbortError' || 
        error.message?.includes('aborted') ||
        error.message?.includes('AbortError')) {
      // Don't show abort errors in UI
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Ignore abort errors
    if (error.name === 'AbortError' || 
        error.message?.includes('aborted') ||
        error.message?.includes('AbortError')) {
      return;
    }
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Only show non-abort errors
      if (this.state.error.name === 'AbortError') {
        return this.props.children;
      }
      
      return (
        <div className="min-h-screen bg-netflix-black flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-4">{this.state.error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-netflix-red text-white px-6 py-2 rounded font-semibold hover:bg-opacity-80 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

