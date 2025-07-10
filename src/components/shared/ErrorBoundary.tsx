import React from 'react';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Simple React Error Boundary so we don’t bomb out to a blank screen.
 * Usage:
 *   <ErrorBoundary>
 *     <Whatever />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // You could log to an external service here.
    // eslint-disable-next-line no-console
    console.error("Error info", info);
  }

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return (
        fallback || (
          <div className="p-6 text-center space-y-3">
            <h2 className="text-xl font-semibold text-destructive">Something went wrong.</h2>
            <p className="text-muted-foreground">Try refreshing the page or returning later.</p>
          </div>
        )
      );
    }

    return children;
  }
}
